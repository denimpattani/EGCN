import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createOrder,
  verifyPayment,
  webhookHandler,
  getHistory,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Secured Routes
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/history', authenticate, getHistory);

// Public Webhook listener (Razorpay Server-to-Server callbacks)
router.post('/webhook', webhookHandler);

export default router;
