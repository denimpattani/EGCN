import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Video, Calendar, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import {
  fetchRoom,
  fetchMessages,
  fetchMeetings,
  resetWorkspaceState,
} from '../../../store/workspaceSlice';
import socketService from '../../../services/socket';
import ChatWindow from './ChatWindow';
import VideoCall from './VideoCall';
import WorkspaceCalendar from './Calendar';
import ExpertClientChat from '../../Expert/ClientChat.jsx';

export default function Workspace() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { room, activeCall, isLoading, error } = useSelector((state) => state.workspace);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'video' | 'calendar'

  const prevActiveCallRef = useRef(null);

  // Auto-switch to video tab when there is an incoming or active call
  useEffect(() => {
    if (activeCall && (activeCall.status === 'incoming' || activeCall.status === 'active' || activeCall.status === 'calling')) {
      setActiveTab('video');
    } else if (!activeCall && prevActiveCallRef.current) {
      setActiveTab('chat');
    }
    prevActiveCallRef.current = activeCall;
  }, [activeCall]);

  if (user?.role === 'expert') {
    return <ExpertClientChat />;
  }

  const isPremium = user && ['business', 'pro', 'vip'].includes(user.plan);

  useEffect(() => {
    if (!isPremium) return;

    // Fetch workspace room
    dispatch(fetchRoom())
      .unwrap()
      .then((roomData) => {
        // Connect to Socket.io
        const socket = socketService.connect();
        if (socket && roomData?.roomId) {
          socketService.emit('join_room', { roomId: roomData.roomId });

          // Ensure we rejoin room automatically on socket reconnection (e.g. after auth token refresh)
          socket.off('connect');
          socket.on('connect', () => {
            console.log('🔄 Socket reconnected! Rejoining room:', roomData.roomId);
            socketService.emit('join_room', { roomId: roomData.roomId });
          });
        }
        // Fetch message history and meetings list
        dispatch(fetchMessages({ roomId: roomData.roomId }));
        dispatch(fetchMeetings());
      })
      .catch((err) => {
        console.error('Failed to load workspace room:', err);
      });

    return () => {
      // Disconnect socket and reset state on unmount
      socketService.disconnect();
      dispatch(resetWorkspaceState());
    };
  }, [dispatch, isPremium]);

  // Plan Gate overlay page for free users
  if (!isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[calc(100vh-112px)] flex items-center justify-center p-4 md:p-8"
      >
        <div className="relative max-w-2xl w-full bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 md:p-12 text-center overflow-hidden shadow-2xl">
          {/* Subtle design grids */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Lock Icon Lockup */}
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-lg shadow-primary/5">
              <Lock className="w-10 h-10 animate-pulse" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-cream mb-4">
              Unlock the <span className="text-gradient bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Workspace</span>
            </h1>

            <p className="text-secondary max-w-md text-base leading-relaxed mb-8">
              Expert B2B advice is just a click away. Upgrade to a premium plan to gain direct, real-time access to assigned EGCN consulting professionals.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10 text-left">
              <div className="bg-[#1A1A1A] border border-[#252525] rounded-2xl p-5 hover:border-primary/30 transition-all duration-300">
                <MessageSquare className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-cream font-bold text-sm mb-1">Direct Chat</h3>
                <p className="text-xs text-secondary leading-normal">
                  Real-time text consultation and media sharing (PDFs, docs).
                </p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#252525] rounded-2xl p-5 hover:border-primary/30 transition-all duration-300">
                <Video className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-cream font-bold text-sm mb-1">Video Calls</h3>
                <p className="text-xs text-secondary leading-normal">
                  In-app WebRTC face-to-face sessions and screen sharing.
                </p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#252525] rounded-2xl p-5 hover:border-primary/30 transition-all duration-300">
                <Calendar className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-cream font-bold text-sm mb-1">Advisory Calendar</h3>
                <p className="text-xs text-secondary leading-normal">
                  Schedule face-to-face video reviews or site visits.
                </p>
              </div>
            </div>

            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard/plans')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-[#c13a31] text-cream px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-primary/20 group"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>Upgrade Plan Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#252525] text-[#8C8C8C] hover:text-cream border border-[#252525] px-8 py-4 rounded-xl font-bold transition-all duration-300"
              >
                Go Back
              </button>
            </div>

            {/* Assurance footer */}
            <div className="mt-8 flex items-center gap-2 text-xs text-secondary">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Razorpay encrypted billing • Dynamic cancellation anytime</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Active Tab Render
  const renderActiveTab = () => {
    return (
      <div className="flex-1 flex flex-col relative">
        <div className={activeTab === 'chat' ? 'flex-1 flex flex-col' : 'hidden'}>
          <ChatWindow />
        </div>
        <div className={activeTab === 'video' ? 'flex-1 flex flex-col' : 'hidden'}>
          <VideoCall />
        </div>
        <div className={activeTab === 'calendar' ? 'flex-1 flex flex-col' : 'hidden'}>
          <WorkspaceCalendar />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 min-h-[calc(100vh-112px)] flex flex-col"
    >
      {/* Header section with Dynamic Partner Label */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-cream">
            Consulting <span className="text-primary">Workspace</span>
          </h1>
          <p className="text-secondary text-sm mt-1">
            {room ? `Your room is connected to: ${room.partner.businessName} (${room.partner.username})` : 'Initializing consulting channel...'}
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-[#141414] border border-[#1F1F1F] rounded-xl p-1 gap-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'chat'
              ? 'bg-primary text-cream shadow-md shadow-primary/10'
              : 'text-secondary hover:text-cream hover:bg-[#1A1A1A]'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Advisory Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'video'
              ? 'bg-primary text-cream shadow-md shadow-primary/10'
              : 'text-secondary hover:text-cream hover:bg-[#1A1A1A]'
              }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Consultation</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'calendar'
              ? 'bg-primary text-cream shadow-md shadow-primary/10'
              : 'text-secondary hover:text-cream hover:bg-[#1A1A1A]'
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Main content viewport */}
      <div className="flex-1 bg-[#141414] border border-[#1F1F1F] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {isLoading && !room ? (
          <div className="absolute inset-0 bg-[#141414]/80 flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-secondary text-sm">Opening secure connection...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 bg-[#141414] flex flex-col items-center justify-center p-6 text-center z-30">
            <p className="text-primary text-lg font-bold mb-2">Connection Issue</p>
            <p className="text-secondary text-sm max-w-sm">{error}</p>
          </div>
        ) : null}

        <div className="flex-1 flex flex-col min-h-0">
          {room && renderActiveTab()}
        </div>
      </div>
    </motion.div>
  );
}
