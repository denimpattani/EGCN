import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Paperclip, Loader, Check, CheckCheck, FileText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { addMessage, fetchMessages, setTyping, markMessageSeen } from '../../../store/workspaceSlice';
import socketService from '../../../services/socket';
import api from '../../../services/api';

export default function ChatWindow() {
  const dispatch = useDispatch();
  const listRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const user = useSelector((state) => state.auth.user);
  const { room, messages, hasMore, typingUsers } = useSelector((state) => state.workspace);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  // Scroll to bottom on initial room load
  useEffect(() => {
    scrollToBottom('auto');
  }, [room?.roomId]);

  // Handle incoming socket events
  useEffect(() => {
    const socket = socketService.connect();
    if (!socket || !room?.roomId) return;

    // 1. Receive new message
    socketService.on('receive_message', (message) => {
      dispatch(addMessage(message));
      
      // If we are active in this room and received a message, mark as seen
      if (message.senderId !== user._id) {
        socketService.emit('seen', { messageId: message._id, roomId: room.roomId });
        api.patch(`/workspace/messages/${message._id}/seen`).catch(console.error);
      }

      // Scroll down
      setTimeout(() => scrollToBottom(), 50);
    });

    // 2. Typing indicator relay
    socketService.on('user_typing', ({ userId, username, isTyping }) => {
      if (userId !== user._id) {
        dispatch(setTyping({ userId, username, isTyping }));
      }
    });

    // 3. Message seen tick sync
    socketService.on('message_seen', ({ messageId, seenAt }) => {
      dispatch(markMessageSeen({ messageId, seenAt }));
    });

    return () => {
      socketService.off('receive_message');
      socketService.off('user_typing');
      socketService.off('message_seen');
    };
  }, [room?.roomId, dispatch, user._id]);

  // Handle typing event triggers
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socketService.emit('typing', { roomId: room.roomId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emit('typing', { roomId: room.roomId, isTyping: false });
    }, 2000);
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const payload = {
      roomId: room.roomId,
      receiverId: room.partner._id,
      type: 'text',
      content: inputText.trim(),
    };

    // Emit over socket for real-time delivery
    socketService.emit('send_message', payload);
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socketService.emit('typing', { roomId: room.roomId, isTyping: false });
    }

    setInputText('');
    setTimeout(() => scrollToBottom(), 50);
  };

  // Handle Infinite Scroll Pagination (top-scroll)
  const handleScroll = async (e) => {
    const element = e.target;
    if (element.scrollTop === 0 && hasMore && !isLoadingMore && messages.length > 0) {
      setIsLoadingMore(true);
      const oldestMessage = messages[0];
      const scrollHeightBefore = element.scrollHeight;
      
      await dispatch(fetchMessages({ roomId: room.roomId, before: oldestMessage.createdAt }));
      
      // Preserve scroll location
      setIsLoadingMore(false);
      setTimeout(() => {
        if (element) {
          element.scrollTop = element.scrollHeight - scrollHeightBefore;
        }
      }, 20);
    }
  };

  // Handle files click trigger
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Handle media file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds the premium 25MB limit!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', room.roomId);
    formData.append('receiverId', room.partner._id);

    try {
      setUploadProgress(0);

      const response = await api.post('/workspace/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      // Clear progress
      setUploadProgress(null);
      
      // Add message to Redux store
      dispatch(addMessage(response.data.data));

      // Emit new upload event over socket so other users receive it
      socketService.emit('send_message', {
        roomId: room.roomId,
        receiverId: room.partner._id,
        type: response.data.data.type,
        fileUrl: response.data.data.fileUrl,
        fileName: response.data.data.fileName,
        fileSize: response.data.data.fileSize,
      });

      setTimeout(() => scrollToBottom(), 50);
    } catch (err) {
      console.error('File upload failure:', err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
      setUploadProgress(null);
    }
  };

  // Format bytes helper
  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0F0F0F] relative">
      {/* Header bar */}
      <div className="h-16 border-b border-[#1F1F1F] bg-[#141414] px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
              {room.partner.businessName?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full" />
          </div>
          <div>
            <h3 className="text-cream text-sm font-bold">{room.partner.businessName}</h3>
            <p className="text-xs text-secondary capitalize">{room.partner.role} Advisor</p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide"
      >
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader className="w-4 h-4 text-primary animate-spin" />
            <p className="text-xs text-secondary">Loading earlier messages...</p>
          </div>
        )}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <MessageSquareIcon className="w-12 h-12 text-[#1F1F1F] mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-cream">No Messages Yet</p>
            <p className="text-xs text-secondary mt-1 max-w-[240px]">
              Start the consultation by sending a text message or a PDF target sheet.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === user._id;
          return (
            <div
              key={msg._id || index}
              className={`flex flex-col max-w-[70%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  isMe
                    ? 'bg-primary text-cream rounded-tr-none'
                    : 'bg-[#1A1A1A] border border-[#252525] text-cream rounded-tl-none'
                }`}
              >
                {/* 1. Text Message */}
                {msg.type === 'text' && <p>{msg.content}</p>}

                {/* 2. Image Message */}
                {msg.type === 'image' && (
                  <div className="space-y-2">
                    <img
                      src={msg.fileUrl}
                      alt={msg.fileName}
                      className="max-w-xs md:max-w-sm rounded-lg object-cover cursor-zoom-in hover:brightness-95 transition-all"
                      onClick={() => window.open(msg.fileUrl, '_blank')}
                    />
                    {msg.fileName && (
                      <p className="text-xs opacity-80 truncate max-w-xs">{msg.fileName}</p>
                    )}
                  </div>
                )}

                {/* 3. Video Message */}
                {msg.type === 'video' && (
                  <div className="space-y-2">
                    <video
                      src={msg.fileUrl}
                      controls
                      className="max-w-xs md:max-w-sm rounded-lg"
                    />
                    {msg.fileName && (
                      <p className="text-xs opacity-80 truncate max-w-xs">{msg.fileName}</p>
                    )}
                  </div>
                )}

                {/* 4. PDF/Doc Message */}
                {msg.type === 'document' && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-[#0F0F0F]/50 hover:bg-[#0F0F0F]/80 p-2.5 rounded-xl border border-white/5 transition-all text-cream text-xs group"
                  >
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold truncate max-w-[150px] md:max-w-[220px]">
                        {msg.fileName || 'document.pdf'}
                      </p>
                      <p className="text-[10px] text-secondary mt-0.5">
                        {formatBytes(msg.fileSize)}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* Timestamp and Seen status ticks */}
              <div className="flex items-center gap-1.5 mt-1 px-1">
                <span className="text-[10px] text-secondary">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && (
                  <span>
                    {msg.seenAt ? (
                      <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#8C8C8C]" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Dynamic Typing indicators */}
        {typingUsers.map((u) => (
          <div key={u.userId} className="flex items-center gap-2 text-xs text-secondary pl-1">
            <span className="font-semibold text-primary">{u.username}</span> is typing
            <div className="flex gap-1 items-center mt-0.5">
              <span className="w-1 h-1 bg-[#8C8C8C] rounded-full animate-bounce delay-0" />
              <span className="w-1 h-1 bg-[#8C8C8C] rounded-full animate-bounce delay-150" />
              <span className="w-1 h-1 bg-[#8C8C8C] rounded-full animate-bounce delay-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Direct upload progress indicator */}
      {uploadProgress !== null && (
        <div className="bg-[#141414] border-t border-[#1F1F1F] px-6 py-2 flex items-center gap-4">
          <Loader className="w-4 h-4 text-primary animate-spin" />
          <div className="flex-1 h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-xs text-cream font-bold">{uploadProgress}%</span>
        </div>
      )}

      {/* Text Form Input Bar */}
      <form
        onSubmit={handleSend}
        className="h-20 border-t border-[#1F1F1F] bg-[#141414] px-6 flex items-center gap-4"
      >
        <button
          type="button"
          onClick={handleAttachClick}
          className="w-11 h-11 bg-[#1A1A1A] hover:bg-[#252525] border border-[#252525] rounded-xl flex items-center justify-center text-secondary hover:text-cream transition-all shrink-0 shadow-md active:scale-95"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.mp4,.doc,.docx,.xls,.xlsx"
        />

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Ask your EGCN expert a question..."
          className="flex-1 bg-[#1A1A1A] border border-[#252525] hover:border-[#353535] focus:border-primary/50 text-cream placeholder-[#5C5C5C] px-5 h-11 rounded-xl text-sm focus:outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-11 h-11 bg-primary disabled:bg-[#1A1A1A] disabled:border-[#252525] disabled:text-secondary text-cream rounded-xl flex items-center justify-center shadow-lg hover:bg-[#c13a31] transition-all shrink-0 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// Custom simple fallback icons to ensure zero package failures
function MessageSquareIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
