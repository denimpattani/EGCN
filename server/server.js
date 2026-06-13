import 'dotenv/config'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { ExpressPeerServer } from 'peer'
import { app, connectDB } from './src/app.js'
import { initChatSocket } from './src/sockets/chat.socket.js'
import { initCrons } from './src/crons/index.js'
import { seedDatabase } from './src/utils/seed.js'

const PORT = process.env.PORT || 5000
const httpServer = createServer(app)

// 1. Initialize Socket.io with dynamic CORS origin for development/network testing
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

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
})

// 2. Initialize PeerJS Server Middleware
const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
  path: '/peerjs',
  allow_discovery: false,
})

// Mount PeerJS path
app.use('/peer', peerServer)

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
