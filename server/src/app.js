import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { createRequire } from 'module'
import publicRoutes from './routes/public.routes.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import targetRoutes from './routes/target.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import insightsRoutes from './routes/insights.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import adminRoutes from './routes/admin.routes.js'
import expertRoutes from './routes/expert.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import { connectDB } from './config/db.js'

const app = express()

// Trust proxies (required for express-rate-limit behind Render)
app.set('trust proxy', 1)

// CORS - Dynamically allow origins in development for hotspot/network testing
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
)

// Body parsing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// HTTP logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Routes
app.use('/api', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/target', targetRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/insights', insightsRoutes)
app.use('/api/workspace', workspaceRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/expert', expertRoutes)
app.use('/api/notifications', notificationRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' })
})

export { app, connectDB }
