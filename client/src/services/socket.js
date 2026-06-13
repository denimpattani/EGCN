import { io } from 'socket.io-client';
import { store } from '../store';

class SocketService {
  socket = null;

  connect() {
    if (this.socket?.connected) return this.socket;

    const token = store.getState().auth.accessToken;
    if (!token) {
      console.warn('⚠️ No auth token found. Socket connection skipped.');
      return null;
    }

    let serverUrl;
    if (import.meta.env.VITE_API_URL) {
      serverUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    } else {
      // Dev fallback: point to the current active hostname on server port 5000
      serverUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    }

    this.socket = io(serverUrl, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Real-time Socket.io connection established successfully');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket connection closed manually');
    }
  }

  emit(event, data) {
    if (!this.socket) this.connect();
    this.socket?.emit(event, data);
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

const socketService = new SocketService();
export default socketService;
