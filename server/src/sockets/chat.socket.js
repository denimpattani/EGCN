import jwt from 'jsonwebtoken';
import Message from '../models/Message.model.js';

let ioInstance;

export const initChatSocket = (io) => {
  ioInstance = io;
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token is required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access_secret');
      socket.user = decoded; // { id, role, username }
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 Client connected: ${socket.user.username} (ID: ${userId}) on socket ${socket.id}`);
    
    // Automatically join the user's private room to receive direct notifications/calls on any page
    socket.join(userId);
    console.log(`👤 User ${socket.user.username} (ID: ${userId}) joined private room`);

    // Join room event
    socket.on('join_room', ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`👤 User ${socket.user.username} joined room: ${roomId}`);
    });

    // Leave room event
    socket.on('leave_room', ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      console.log(`👤 User ${socket.user.username} left room: ${roomId}`);
    });

    // Message delivery relay
    socket.on('send_message', async (payload) => {
      const { roomId, receiverId, type, content, fileUrl, fileName, fileSize } = payload;

      if (!roomId || !receiverId) return;

      try {
        // Save to DB
        const message = await Message.create({
          roomId,
          senderId: userId,
          receiverId,
          type: type || 'text',
          content,
          fileUrl,
          fileName,
          fileSize,
        });

        // Broadcast to both sender and receiver in the room
        io.to(roomId).emit('receive_message', message);
      } catch (err) {
        console.error('Error saving socket message:', err);
        socket.emit('message_error', { message: 'Failed to deliver message' });
      }
    });

    // Typing alerts
    socket.on('typing', ({ roomId, isTyping }) => {
      if (!roomId) return;
      // Relay typing indicator to other users in the room
      socket.to(roomId).emit('user_typing', {
        userId,
        username: socket.user.username,
        isTyping,
      });
    });

    // Seen ticks propagation
    socket.on('seen', async ({ messageId, roomId }) => {
      if (!messageId || !roomId) return;

      try {
        const message = await Message.findById(messageId);
        if (message && message.receiverId.toString() === userId) {
          message.seenAt = new Date();
          await message.save();

          // Broadcast that message has been read
          io.to(roomId).emit('message_seen', {
            messageId,
            seenAt: message.seenAt,
          });
        }
      } catch (err) {
        console.error('Error marking seen in socket:', err);
      }
    });

    // --- WebRTC PeerJS Calling Signals ---

    // 1. Call Init (Relays call invite to room)
    socket.on('call_init', async ({ roomId, peerId, receiverId, callType }) => {
      if (!roomId || !peerId) return;
      console.log(`📞 Call initiated in room ${roomId} by ${socket.user.username} with PeerID: ${peerId}`);

      try {
        const User = (await import('../models/User.model.js')).default;
        const Expert = (await import('../models/Expert.model.js')).default;

        // Try searching in User model first, then Expert model
        let caller = await User.findById(userId);
        if (!caller) {
          caller = await Expert.findById(userId);
        }
        const callerName = caller ? (caller.businessName || caller.fullName || caller.username || 'Client') : 'Someone';

        const callPayload = {
          from: callerName,
          fromId: userId,
          peerId,
          callType: callType || 'video',
          roomId,
        };

        // Notify other members of room of incoming call
        socket.to(roomId).emit('call_incoming', callPayload);

        // Also emit directly to the receiver's private room to ensure they receive it on any page
        if (receiverId) {
          socket.to(receiverId).emit('call_incoming', callPayload);
        }

        // Email fallback if expert is not connected
        if (receiverId) {
          const { sendInstantCallEmail } = await import('../utils/email.js');
          let receiver = await Expert.findById(receiverId);
          if (!receiver) {
            receiver = await User.findById(receiverId);
          }

          if (receiver && receiver.email) {
            await sendInstantCallEmail(
              receiver.email,
              receiver.businessName || receiver.fullName || receiver.username || 'Expert',
              callerName
            );
          }
        }
      } catch (err) {
        console.error('Failed to process call_init event:', err);
      }
    });

    // 2. Call Accepted
    socket.on('call_accepted', ({ roomId, peerId }) => {
      if (!roomId || !peerId) return;
      console.log(`✅ Call accepted in room ${roomId} by PeerID: ${peerId}`);
      socket.to(roomId).emit('call_started', { peerId });
    });

    // 3. Call Ended
    socket.on('call_ended', ({ roomId }) => {
      if (!roomId) return;
      console.log(`❌ Call ended in room ${roomId}`);
      socket.to(roomId).emit('call_terminated');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.user.username} (${userId})`);
    });
  });
};

export const getChatIo = () => ioInstance;
