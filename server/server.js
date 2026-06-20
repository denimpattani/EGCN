import 'dotenv/config'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { ExpressPeerServer } from 'peer'
import { EventEmitter } from 'events'
import { app, connectDB } from './src/app.js'
import { initChatSocket } from './src/sockets/chat.socket.js'
import { initCrons } from './src/crons/index.js'
import { seedDatabase } from './src/utils/seed.js'

const PORT = process.env.PORT || 5000
const httpServer = createServer(app)

// 1. Initialize Socket.io with dynamic CORS origin for development/network testing
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

// ... existing imports stay the same, but we will rewrite the Socket and PeerJS init section
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  destroyUpgrade: false, // PREVENT Socket.io from destroying PeerJS sockets!
})

// 2. Initialize PeerJS Server Middleware securely via dummy server to prevent Socket.io collision
const dummyServer = new EventEmitter();
const peerServer = ExpressPeerServer(dummyServer, {
  debug: true,
  path: '/peer',
  allow_discovery: false,
})

// Mount HTTP routes without stripping prefix
app.use(peerServer)

// Manual WebSocket Upgrade Router to isolate PeerJS
httpServer.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/peer')) {
    dummyServer.emit('upgrade', req, socket, head);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' })
})

// 3. Initialize Chat Socket logic
initChatSocket(io)

// 4. Initialize Cron Jobs
initCrons(io)

async function start() {
  await connectDB()
  await seedDatabase()
  httpServer.listen(PORT, () => {
    console.log(`🚀 EGCN Server + Socket.io + PeerJS running on http://localhost:${PORT}`)
  })
}

start().catch(console.error)
