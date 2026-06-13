import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  getTestimonials,
  getServices,
  subscribeNewsletter,
} from '../controllers/public.controller.js'

const router = Router()

// Rate limiter: 20 req / min per IP for public routes
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

// Apply publicLimiter only to specific routes
router.get('/testimonials', publicLimiter, getTestimonials)
router.get('/services', publicLimiter, getServices)
router.post('/newsletter', publicLimiter, subscribeNewsletter)

export default router
