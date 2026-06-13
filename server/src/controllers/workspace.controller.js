import User from '../models/User.model.js';
import Message from '../models/Message.model.js';
import Meeting from '../models/Meeting.model.js';
import { sendMeetingScheduledEmail } from '../utils/email.js';

// Get or create room details for client-expert pair
export const getRoom = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'client') {
      // Find an expert in the system
      let expert = await User.findOne({ role: 'expert' });

      // Auto-create a default expert if none exists in dev database
      if (!expert) {
        expert = await User.create({
          email: 'expert@egcn.com',
          username: 'expert_param',
          password: 'hashed_password_placeholder', // Dummy password
          businessName: 'EGCN Advisory Team',
          businessType: 'Service',
          businessScale: '15L+',
          address: 'EGCN Headquarters',
          city: 'Mumbai',
          state: 'Maharashtra',
          phone: '9876543210',
          role: 'expert',
          plan: 'pro',
          isVerified: true,
        });
        console.log('✅ Default expert auto-created for development: expert@egcn.com');
      }

      const roomId = `${id}_${expert._id}`;
      return res.status(200).json({
        success: true,
        data: {
          roomId,
          partner: {
            _id: expert._id,
            businessName: expert.businessName,
            username: expert.username,
            email: expert.email,
            role: expert.role,
          },
        },
      });
    } else if (role === 'expert') {
      // Expert must pass clientId to get a specific room
      const { clientId } = req.query;

      if (!clientId) {
        // If no client specified, just return a list of active clients the expert can chat with
        const clients = await User.find({ role: 'client' }).select('-password');
        return res.status(200).json({
          success: true,
          clients,
          message: 'Specify a clientId query parameter to retrieve a specific room.'
        });
      }

      const client = await User.findById(clientId);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }

      const roomId = `${client._id}_${id}`;
      return res.status(200).json({
        success: true,
        data: {
          roomId,
          partner: {
            _id: client._id,
            businessName: client.businessName,
            username: client.username,
            email: client.email,
            role: client.role,
          },
        },
      });
    } else {
      // Admin
      return res.status(403).json({ success: false, message: 'Admins do not have personal chat rooms' });
    }
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Retrieve paginated message history in a room
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // date cursor for infinite scrolling

    let query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    // Reverse to chronological order
    messages.reverse();

    // Check if there are more messages left to paginate
    let hasMore = false;
    if (messages.length > 0) {
      const oldestMessage = messages[0];
      const count = await Message.countDocuments({
        roomId,
        createdAt: { $lt: oldestMessage.createdAt },
      });
      hasMore = count > 0;
    }

    res.status(200).json({
      success: true,
      data: messages,
      hasMore,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Save a new message via REST (fallback / standard routing)
export const sendMessage = async (req, res) => {
  try {
    const { roomId, receiverId, type, content, fileUrl, fileName, fileSize } = req.body;
    const senderId = req.user.id;

    if (!roomId || !receiverId) {
      return res.status(400).json({ success: false, message: 'roomId and receiverId are required' });
    }

    const message = await Message.create({
      roomId,
      senderId,
      receiverId,
      type: type || 'text',
      content,
      fileUrl,
      fileName,
      fileSize,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Handle file/media uploads to Cloudinary
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or invalid file format' });
    }

    const { roomId, receiverId } = req.body;
    const senderId = req.user.id;

    if (!roomId || !receiverId) {
      return res.status(400).json({ success: false, message: 'roomId and receiverId are required' });
    }

    // Determine type based on MIME
    let type = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      type = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      type = 'video';
    }

    const message = await Message.create({
      roomId,
      senderId,
      receiverId,
      type,
      fileUrl: req.file.path, // Cloudinary URL
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark a specific message as seen
export const markSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Only receiver can mark as seen
    if (message.receiverId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    message.seenAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Mark seen error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Retrieve aggregate count of unread messages
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      receiverId: userId,
      seenAt: null,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Retrieve user meetings
export const getMeetings = async (req, res) => {
  try {
    const { id, role } = req.user;
    let query = {};

    if (role === 'client') {
      query.clientId = id;
    } else if (role === 'expert') {
      query.expertId = id;
    }

    const meetings = await Meeting.find(query)
      .populate('clientId', 'businessName username email')
      .populate('expertId', 'businessName username email')
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Schedule a new meeting
export const createMeeting = async (req, res) => {
  try {
    const { roomId, partnerId, title, description, scheduledAt, duration, type } = req.body;
    const { id, role } = req.user;

    if (!roomId || !partnerId || !title || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'roomId, partnerId, title, and scheduledAt are required' });
    }

    let clientId, expertId;
    if (role === 'client') {
      clientId = id;
      expertId = partnerId;
    } else {
      clientId = partnerId;
      expertId = id;
    }

    // Free users should be blocked on backend as well
    const user = await User.findById(clientId);
    if (user && user.plan === 'free') {
      return res.status(403).json({ success: false, message: 'Scheduling is only allowed on premium plans' });
    }

    // Pro / VIP checks for site visits
    if (type === 'site_visit' && user && !['pro', 'vip'].includes(user.plan)) {
      return res.status(403).json({ success: false, message: 'Site visits are only available on Pro & VIP plans' });
    }

    const meeting = await Meeting.create({
      roomId,
      clientId,
      expertId,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      type: type || 'video',
      status: 'scheduled',
      meetingLink: type === 'video' ? `meeting-${Date.now()}` : undefined,
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('clientId', 'businessName username email')
      .populate('expertId', 'businessName username email');

    // Send email to client if expert created it
    if (role === 'expert') {
      const expertName = populatedMeeting.expertId.businessName || populatedMeeting.expertId.username;
      const clientName = populatedMeeting.clientId.businessName || populatedMeeting.clientId.username;
      const meetingTimeStr = populatedMeeting.scheduledAt.toLocaleString();
      await sendMeetingScheduledEmail(populatedMeeting.clientId.email, clientName, expertName, populatedMeeting.title, meetingTimeStr);
    }

    res.status(201).json({
      success: true,
      data: populatedMeeting,
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update meeting details or cancel status
export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, scheduledAt, duration } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (status) meeting.status = status;
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt);
    if (duration) meeting.duration = duration;

    await meeting.save();

    const populated = await Meeting.findById(meeting._id)
      .populate('clientId', 'businessName username email')
      .populate('expertId', 'businessName username email');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Retrieve meetings for calendar rendering inside a specific month/year window
export const getCalendar = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { start, end } = req.query; // date ISO strings

    let query = {};
    if (role === 'client') {
      query.clientId = id;
    } else if (role === 'expert') {
      query.expertId = id;
    }

    if (start && end) {
      query.scheduledAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const meetings = await Meeting.find(query)
      .populate('clientId', 'businessName username email')
      .populate('expertId', 'businessName username email');

    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
