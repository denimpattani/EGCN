import { io } from 'socket.io-client';
import { store } from '../store';

class SocketService {
  socket = null;

  constructor() {
    // Self-healing subscription to Redux store changes to handle silent token refresh and logout
    store.subscribe(() => {
      const token = store.getState().auth.accessToken;
      if (this.socket) {
        if (!token) {
          console.log('🔌 SocketService: No access token (logout), disconnecting socket...');
          this.socket.disconnect();
        } else {
          const currentToken = this.socket.auth?.token || this.socket.io?.opts?.query?.token;
          if (currentToken !== token) {
            console.log('🔄 SocketService: Access token updated in Redux, updating socket auth...');
            this.socket.auth = { token };
            if (this.socket.io?.opts) {
              this.socket.io.opts.query = { token };
            }
            // Disconnect and reconnect to establish new authenticated session
            this.socket.disconnect();
            this.socket.connect();
          }
        }
      }
    });
  }

  connect() {
    const token = store.getState().auth.accessToken;
    if (!token) {
      console.warn('⚠️ No auth token found. Socket connection skipped.');
      return null;
    }

    // Reuse existing socket instance to preserve registered event listeners
    if (this.socket) {
      this.socket.auth = { token };
      if (this.socket.io?.opts) {
        this.socket.io.opts.query = { token };
      }
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    let serverUrl;
    if (import.meta.env.VITE_API_URL) {
      serverUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    } else {
      // Dev fallback: point to the current active hostname on server port 5000
      serverUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    }

    console.log('🔌 Creating new Socket.io client instance pointing to:', serverUrl);
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
