import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, User, Loader2 } from 'lucide-react';
import Peer from 'peerjs';
import socketService from '../../../services/socket';
import { setActiveCall, clearActiveCall } from '../../../store/workspaceSlice';

export default function VideoCall() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { room, activeCall } = useSelector((state) => state.workspace);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);
  const ringTimeoutRef = useRef(null);

  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'incoming' | 'active'
  const [incomingCallData, setIncomingCallData] = useState(null);

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize PeerJS client co-hosted with Express backend
  const initPeer = () => {
    if (peerRef.current) return;

    setIsInitializing(true);

    // Parse backend connection settings dynamically
    let peerHost = window.location.hostname;
    let isSecure = window.location.protocol === 'https:';
    let peerPort = isSecure ? 443 : 5000;

    if (import.meta.env.VITE_API_URL) {
      try {
        const urlObj = new URL(import.meta.env.VITE_API_URL);
        peerHost = urlObj.hostname;
        isSecure = urlObj.protocol === 'https:';
        peerPort = urlObj.port ? parseInt(urlObj.port) : (isSecure ? 443 : 80);
      } catch (e) {
        console.error('Invalid VITE_API_URL, falling back to window location.');
      }
    }

    console.log(`🔌 Initializing PeerJS client pointing to: ${peerHost}:${peerPort}/peer/peerjs`);

    const peerId = user._id || user.id;
    const peer = new Peer(peerId, {
      host: peerHost,
      port: peerPort,
      path: '/peer',
      secure: isSecure,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      },
      debug: 3 // Verbose PeerJS logs in console for debugging WebRTC signaling
    });

    peer.on('open', (id) => {
      console.log(`✅ PeerJS connected. My Peer ID is: ${id}`);
      peerRef.current = peer;
      setIsInitializing(false);
    });

    peer.on('error', (err) => {
      console.error('❌ PeerJS error:', err);
      setIsInitializing(false);
    });

    // Handle Incoming WebRTC Call Stream
    peer.on('call', async (call) => {
      console.log(`📞 PeerJS: Incoming call stream from remote peer: ${call.peer}`);
      currentCallRef.current = call;

      const stream = await acquireLocalStream();
      if (stream) {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log('📞 PeerJS: Answering call with local stream...');
        call.answer(stream);
      } else {
        console.log('📞 PeerJS: Answering call without local stream...');
        call.answer();
      }

      call.on('stream', (remoteStream) => {
        console.log('✅ PeerJS: Received remote video stream from caller.');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallState('active');
      });

      call.on('close', () => {
        console.log('❌ PeerJS: Call connection closed.');
        handleHangUp();
      });
    });
  };

  // Helper to request getUserMedia with a timeout to prevent browser hangs (common with blocked/locked cameras)
  const getUserMediaWithTimeout = (constraints, timeoutMs = 4000) => {
    return Promise.race([
      navigator.mediaDevices.getUserMedia(constraints),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MediaDeviceTimeout')), timeoutMs)
      ),
    ]);
  };

  const acquireLocalStream = async () => {
    try {
      console.log('🎥 PeerJS: Requesting local media devices (video+audio)...');
      const stream = await getUserMediaWithTimeout({ video: true, audio: true }, 4000);
      console.log('✅ PeerJS: Local media stream acquired successfully.');
      return stream;
    } catch (err) {
      console.warn('⚠️ PeerJS: Video+Audio access failed or timed out, trying audio-only fallback...', err.message || err);
      try {
        const stream = await getUserMediaWithTimeout({ video: false, audio: true }, 3000);
        console.log('✅ PeerJS: Local media stream acquired (audio-only fallback).');
        return stream;
      } catch (err2) {
        console.error('❌ PeerJS: Media devices blocked or timed out completely.', err2.message || err2);
        return null;
      }
    }
  };

  // Sync local callState and incomingCallData with Redux activeCall state
  useEffect(() => {
    if (activeCall) {
      setCallState(activeCall.status);
      if (activeCall.status === 'incoming') {
        setIncomingCallData({
          from: activeCall.partnerName,
          fromId: activeCall.fromId,
          peerId: activeCall.peerId,
          callType: activeCall.callType,
          roomId: activeCall.roomId
        });
      }
    } else {
      if (callState !== 'idle') {
        console.log('📞 VideoCall: activeCall cleared in Redux, cleaning up streams...');
        cleanupCallStreams();
        setCallState('idle');
        setIncomingCallData(null);
      }
    }
  }, [activeCall]);

  useEffect(() => {
    initPeer();

    // Hook socket receivers for calling triggers (call_incoming is handled globally now)
    socketService.on('call_started', ({ peerId }) => {
      console.log('Call accepted socket event received. Handshaking WebRTC stream...');
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      setCallState('active'); // Transition to active immediately so the caller's UI updates
      startCallConnection(peerId);
    });

    socketService.on('call_terminated', () => {
      console.log('Call terminated socket event received.');
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      cleanupCallStreams();
      setCallState('idle');
    });

    return () => {
      socketService.off('call_started');
      socketService.off('call_terminated');
      cleanupCallStreams();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [dispatch]);

  // Connect & stream WebRTC to remote peer ID
  const startCallConnection = async (remotePeerId) => {
    console.log('🎥 PeerJS: Requesting local media devices for outgoing call handshake...');
    const stream = await acquireLocalStream();
    if (stream) {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }

    console.log(`📞 PeerJS: Dialing remote peer ID: ${remotePeerId}...`);
    const call = peerRef.current.call(remotePeerId, stream || new MediaStream());
    currentCallRef.current = call;

    call.on('stream', (remoteStream) => {
      console.log('✅ PeerJS: Received remote stream inside initiated call connection.');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setCallState('active');
    });

    call.on('close', () => {
      console.log('❌ PeerJS: Call connection closed by remote peer.');
      handleHangUp();
    });
  };

  // Initiate call trigger (caller side)
  const handleStartCall = () => {
    if (!peerRef.current) {
      alert('Signaling client is not ready. Reconnecting...');
      initPeer();
      return;
    }
    setCallState('calling');
    const peerId = user._id || user.id;
    const partnerName = room.partner.businessName || room.partner.username || 'Partner';
    dispatch(setActiveCall({ peerId, callType: 'video', status: 'calling', partnerName }));

    // Auto-hangup if not answered in 30 seconds
    ringTimeoutRef.current = setTimeout(() => {
      alert(user.role === 'expert' ? 'Client is currently unavailable.' : 'Expert is currently unavailable.');
      handleHangUp();
    }, 30000);

    const receiverId = room.partner._id || room.partner.id;

    socketService.emit('call_init', {
      roomId: room.roomId,
      peerId,
      receiverId, // Add receiverId for backend routing
      callType: 'video'
    });
  };

  // Accept incoming call trigger (receiver side)
  const handleAcceptCall = () => {
    if (!incomingCallData) return;
    console.log('Accepting call stream. Emitting call_accepted...');
    const peerId = user._id || user.id;
    socketService.emit('call_accepted', {
      roomId: room.roomId,
      peerId
    });
    setCallState('active');
    dispatch(setActiveCall({ ...activeCall, status: 'active' }));
  };

  // Decline/Reject incoming call
  const handleDeclineCall = () => {
    const activeRoomId = incomingCallData?.roomId || room?.roomId;
    if (activeRoomId) {
      socketService.emit('call_ended', { roomId: activeRoomId });
    }
    cleanupCallStreams();
    setCallState('idle');
  };

  // Hangup call
  const handleHangUp = () => {
    const activeRoomId = incomingCallData?.roomId || room?.roomId;
    if (activeRoomId) {
      socketService.emit('call_ended', { roomId: activeRoomId });
    }
    cleanupCallStreams();
    setCallState('idle');
  };

  const cleanupCallStreams = () => {
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    if (currentCallRef.current) {
      try {
        currentCallRef.current.close();
      } catch (e) {}
      currentCallRef.current = null;
    }
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (activeCall) {
      dispatch(clearActiveCall());
    }
    setScreenSharing(false);
  };

  // Audio mute control
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  // Video enable control
  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCamEnabled(videoTrack.enabled);
      }
    }
  };

  // Screen share control
  const toggleScreenShare = async () => {
    if (screenSharing) {
      // Revert back to camera stream
      cleanupCallStreams();
      const partnerId = room.partner._id || room.partner.id;
      startCallConnection(partnerId);
      setScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Replace video tracks on active connection
        const videoTrack = stream.getVideoTracks()[0];
        if (currentCallRef.current?.peerConnection) {
          const senders = currentCallRef.current.peerConnection.getSenders();
          const sender = senders.find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }

        videoTrack.onended = () => {
          toggleScreenShare(); // Revert when user stops sharing via browser bar
        };

        setScreenSharing(true);
      } catch (err) {
        console.error('Screen sharing failure:', err);
      }
    }
  };

  if (!room || !room.partner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0F0F0F] relative min-h-[480px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-secondary text-sm">Connecting securely...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0F0F0F] relative min-h-[480px] p-6 text-center">
      {/* 1. Idle Call View */}
      {callState === 'idle' && (
        <div className="max-w-md w-full p-8 bg-[#141414] border border-[#1F1F1F] rounded-3xl shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 animate-pulse">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-cream">
            {user.role === 'expert' ? `Consultation with ${room.partner.businessName}` : 'Direct Advisor Consultation'}
          </h2>
          <p className="text-xs text-secondary mt-2 mb-6 max-w-xs leading-relaxed">
            Connect face-to-face with your dedicated consulting agent. Initiate an instant high-definition video call session with screen sharing support.
          </p>

          <button
            onClick={handleStartCall}
            disabled={isInitializing}
            className="flex items-center gap-2 bg-primary hover:bg-[#c13a31] disabled:bg-[#1A1A1A] disabled:text-secondary text-cream px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 fill-current" />
                <span>{user.role === 'expert' ? 'Call Client' : 'Call EGCN Expert'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. Calling View (Outgoing Call) */}
      {callState === 'calling' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative animate-bounce">
            <User className="w-12 h-12" />
            <div className="absolute inset-0 border-2 border-primary/40 rounded-full animate-ping" />
          </div>
          <h3 className="text-cream text-lg font-bold">Calling {room.partner.businessName}...</h3>
          <p className="text-xs text-secondary animate-pulse">Waiting for {user.role === 'expert' ? 'client' : 'expert'} to accept stream...</p>

          <button
            onClick={handleHangUp}
            className="mt-6 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-cream px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <PhoneOff className="w-4 h-4 fill-current" />
            <span>Cancel Call</span>
          </button>
        </div>
      )}

      {/* 3. Incoming Call View */}
      {callState === 'incoming' && (
        <div className="max-w-md w-full p-8 bg-[#141414] border border-[#1F1F1F] rounded-3xl shadow-xl flex flex-col items-center animate-bounce">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mb-5 relative">
            <Phone className="w-8 h-8 fill-current" />
            <div className="absolute inset-0 border-2 border-green-500/40 rounded-full animate-ping" />
          </div>
          <h2 className="text-xl font-bold text-cream">Incoming {user.role === 'expert' ? 'Client' : 'Expert'} Call</h2>
          <p className="text-xs text-secondary mt-2 mb-6">
            Advisory agent <span className="font-bold text-primary">{incomingCallData?.from}</span> is calling you.
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleAcceptCall}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-cream px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Accept</span>
            </button>
            <button
              onClick={handleDeclineCall}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-cream px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4 fill-current" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Active WebRTC Call View */}
      {callState === 'active' && (
        <div className="w-full h-full flex flex-col flex-1 min-h-[480px] justify-between relative overflow-hidden rounded-3xl">
          {/* Main Remote Video */}
          <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Fallback if remote video hasn't loaded */}
            {!remoteVideoRef.current?.srcObject && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-secondary">Securing peer streams...</p>
              </div>
            )}
          </div>

          {/* Draggable/Floating Local Video Overlay */}
          <div className="absolute bottom-24 right-6 w-32 md:w-44 h-24 md:h-32 rounded-2xl overflow-hidden border-2 border-primary bg-[#141414] shadow-2xl z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overlay Deck Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#141414]/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/5 flex items-center gap-4 z-20 shadow-2xl">
            <button
              onClick={toggleMic}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${micEnabled ? 'bg-[#1A1A1A] hover:bg-[#252525] text-cream' : 'bg-red-600 hover:bg-red-700 text-cream'
                }`}
            >
              {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCam}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${camEnabled ? 'bg-[#1A1A1A] hover:bg-[#252525] text-cream' : 'bg-red-600 hover:bg-red-700 text-cream'
                }`}
            >
              {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${screenSharing ? 'bg-primary text-cream' : 'bg-[#1A1A1A] hover:bg-[#252525] text-[#8C8C8C] hover:text-cream'
                }`}
            >
              {screenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>

            <div className="w-[1px] h-6 bg-[#1F1F1F]" />

            <button
              onClick={handleHangUp}
              className="w-11 h-11 bg-red-600 hover:bg-red-700 text-cream rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95"
            >
              <PhoneOff className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
