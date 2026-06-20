import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Send,
  Paperclip,
  Image,
  FileText,
  ArrowLeft,
  Loader,
  PhoneCall,
  Video
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socketService from '../../services/socket';
import { fetchRoom, fetchMeetings } from '../../store/workspaceSlice';
import VideoCall from '../Dashboard/Workspace/VideoCall';

export default function ExpertClientChat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const expert = useSelector((state) => state.auth.user);
  const { activeCall } = useSelector((state) => state.workspace);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Chat States
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [roomId, setRoomId] = useState(null);

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);

  const messageEndRef = useRef(null);
  const prevActiveCallRef = useRef(null);

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'video'

  // Auto-switch to video tab when there is an incoming or active call
  useEffect(() => {
    if (activeCall && (activeCall.status === 'incoming' || activeCall.status === 'active' || activeCall.status === 'calling')) {
      setActiveTab('video');
    } else if (!activeCall && prevActiveCallRef.current) {
      setActiveTab('chat');
    }
    prevActiveCallRef.current = activeCall;
  }, [activeCall]);

  // Auto-select calling client from the roster on incoming call
  useEffect(() => {
    if (activeCall && activeCall.status === 'incoming' && activeCall.fromId) {
      const callingClient = clients.find(c => c._id === activeCall.fromId);
      if (callingClient && selectedClient?._id !== callingClient._id) {
        console.log(`📞 Auto-selecting calling client: ${callingClient.businessName}`);
        handleSelectClient(callingClient);
      }
    }
  }, [activeCall, clients, selectedClient]);

  useEffect(() => {
    const fetchClientsList = async () => {
      try {
        setIsLoadingClients(true);
        const response = await api.get('/expert/clients');
        setClients(response.data.data);
        if (response.data.data.length > 0) {
          handleSelectClient(response.data.data[0]);
        }
      } catch (err) {
        console.error('Failed to load expert client directory:', err);
      } finally {
        setIsLoadingClients(false);
      }
    };
    fetchClientsList();
  }, []);

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setIsLoadingMessages(true);
    setActiveTab('chat');

    // Room naming scheme clientID_expertID
    const targetRoomId = `${client._id}_${expert.id}`;
    setRoomId(targetRoomId);

    try {
      // Fetch workspace room into Redux so VideoCall can use it
      await dispatch(fetchRoom(client._id));
      await dispatch(fetchMeetings());

      // Fetch message logs
      const response = await api.get(`/workspace/messages/${targetRoomId}`);
      setMessages(response.data.data || []);

      // Connect and join Socket room
      const socket = socketService.connect();
      if (socket) {
        socketService.emit('join_room', { roomId: targetRoomId });

        // Ensure we rejoin room automatically on socket reconnection (e.g. after auth token refresh)
        socket.off('connect');
        socket.on('connect', () => {
          console.log('🔄 Socket reconnected! Rejoining room:', targetRoomId);
          socketService.emit('join_room', { roomId: targetRoomId });
        });

        // Remove old message listeners and bind new ones
        socket.off('receive_message');
        socket.on('receive_message', (message) => {
          if (message.roomId === targetRoomId) {
            setMessages((prev) => [...prev, message]);
          }
        });
      }
    } catch (error) {
      console.error('Failed to open client chat room:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !roomId) return;

    const messagePayload = {
      roomId,
      senderId: expert.id,
      receiverId: selectedClient._id,
      type: 'text',
      content: inputText,
    };

    socketService.emit('send_message', messagePayload);
    setInputText('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !roomId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('senderId', expert.id);
    formData.append('receiverId', selectedClient._id);

    try {
      setIsUploading(true);
      const response = await api.post('/workspace/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Emitting to sync chat socket
      socketService.emit('send_message', response.data.data);
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-[calc(100vh-112px)] flex flex-col md:flex-row gap-6 p-4"
    >
      {/* Left sidebar: Clients list */}
      <div className="w-full md:w-80 bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl p-5 flex flex-col h-full shrink-0 shadow-xl">
        <div className="flex items-center gap-3 border-b border-[#1A1A1A] pb-4 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-cream hover:bg-[#1A1A1A]"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-cream">Consulting Roster</h3>
            <p className="text-[10px] text-[#8C8C8C]">{clients.length} assigned clients</p>
          </div>
        </div>

        {isLoadingClients ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {clients.map((client) => {
              const isSelected = selectedClient?._id === client._id;
              return (
                <button
                  key={client._id}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${isSelected
                    ? 'bg-primary/10 border-primary text-cream'
                    : 'bg-[#111]/30 border-[#1A1A1A] hover:bg-[#111] text-[#8C8C8C] hover:text-cream'
                    }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate capitalize">{client.businessName}</h4>
                    <p className="text-[9px] text-[#8C8C8C] mt-0.5 truncate uppercase font-mono">{client.plan} Tier</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right chat panel */}
      <div className="flex-1 bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl h-full flex flex-col overflow-hidden shadow-xl">
        {selectedClient ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 bg-[#111]/30 border-b border-[#1A1A1A] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-cream capitalize">{selectedClient.businessName} Workspace</h3>
                <p className="text-[10px] text-[#8C8C8C] mt-0.5">Assigned Consultant Chatroom</p>
              </div>

              {/* Video call quick trigger */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(activeTab === 'chat' ? 'video' : 'chat')}
                  className={`p-2.5 hover:bg-[#222] border border-[#222] rounded-xl transition-colors cursor-pointer ${activeTab === 'video' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-[#111] text-[#8C8C8C] hover:text-cream'
                    }`}
                  title={activeTab === 'video' ? "Back to Chat" : "Call Client"}
                >
                  {activeTab === 'video' ? <MessageSquare className="w-4.5 h-4.5" /> : <Video className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Video Call Interface */}
            <div className={activeTab === 'video' ? 'flex-1 bg-[#141414] overflow-hidden relative' : 'hidden'}>
              <VideoCall />
            </div>

            {/* Chat Interface */}
            <div className={activeTab === 'chat' ? 'flex-1 flex flex-col min-h-0' : 'hidden'}>
              {/* Chat stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center text-[#555] mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-[#8C8C8C]">No messages logged yet. Send a greeting to start consultation.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwnMessage = msg.senderId === expert.id;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3.5 rounded-2xl border text-xs leading-relaxed shadow-lg ${isOwnMessage
                            ? 'bg-primary text-cream border-primary/10 rounded-tr-none'
                            : 'bg-[#111] border-[#1C1C1C] text-cream rounded-tl-none'
                            }`}
                        >
                          {/* Text Message */}
                          {msg.type === 'text' && <p>{msg.content}</p>}

                          {/* Document Media Message */}
                          {msg.type !== 'text' && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-black/25 flex items-center justify-center text-cream shrink-0">
                                {msg.type === 'image' ? <Image className="w-4.5 h-4.5" /> : <FileText className="w-4.5 h-4.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-cream font-bold truncate">{msg.fileName || 'Attachment'}</p>
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] text-[#60A5FA] font-bold hover:underline block mt-0.5"
                                >
                                  View / Download Attachment
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Input bar */}
              <div className="px-6 py-4 border-t border-[#1a1a1a] bg-[#0c0c0c] flex items-center gap-3">
                {/* File Attachment Upload */}
                <label className="p-3 bg-[#111] hover:bg-[#222] border border-[#222] text-[#8C8C8C] hover:text-cream rounded-xl transition-colors cursor-pointer shrink-0">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading ? <Loader className="w-4 h-4 animate-spin text-primary" /> : <Paperclip className="w-4 h-4" />}
                </label>

                <form onSubmit={handleSendMessage} className="flex-1 flex gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Provide advisory recommendations..."
                    className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-cream outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3.5 bg-primary hover:bg-[#1A1A1A] border border-primary text-cream rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-default"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-[#8C8C8C]">
            <MessageSquare className="w-10 h-10 mb-3" />
            <p className="text-xs">Select a business client from your active roster to start consultation.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
