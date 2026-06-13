import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import Subscription from '../models/Subscription.model.js';
import User from '../models/User.model.js';
import { generateAndUploadInvoice } from '../utils/invoice.js';
import { sendPlanUpgradeEmail } from '../utils/email.js';

// Plan pricing map in INR
const PLAN_PRICES = {
  business: 799,
  pro: 1499,
  vip: 2999,
};

// Create a new Razorpay payment order
export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
    }

    const amountInPaise = PLAN_PRICES[plan] * 100;
    const receiptId = `receipt_${userId.substring(18)}_${Date.now().toString().substring(8)}`;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    };

    // Call Razorpay API to generate transaction order
    const order = await razorpay.orders.create(options);

    // Save initial subscription entry in Mongoose
    await Subscription.create({
      userId,
      plan,
      razorpayOrderId: order.id,
      amount: amountInPaise,
      status: 'created',
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// Cryptographically verify Razorpay signature and activate subscription
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPayId, razorpaySignature } = req.body;
    const userId = req.user.id;

    if (!razorpayOrderId || !razorpayPayId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing payment signature details' });
    }

    // 1. Verify HMAC-SHA256 Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const text = `${razorpayOrderId}|${razorpayPayId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpaySignature;

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: 'Payment signature validation failed' });
    }

    // 2. Fetch local subscription record
    const subscription = await Subscription.findOne({ razorpayOrderId });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription record not found' });
    }

    // Prevent duplicate processing
    if (subscription.status === 'paid') {
      const user = await User.findById(userId).select('-password');
      return res.status(200).json({ success: true, message: 'Payment already processed successfully', data: { user } });
    }

    // 3. Update subscription details
    subscription.status = 'paid';
    subscription.razorpayPayId = razorpayPayId;
    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day active cycle
    await subscription.save();

    // 4. Update the User's active subscription plan
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        plan: subscription.plan,
        planExpiry: subscription.endDate
      },
      { new: true }
    ).select('-password');

    // 5. Generate and Upload Billing PDF Invoice asynchronously
    try {
      const invoiceUrl = await generateAndUploadInvoice(user, subscription);
      subscription.invoiceUrl = invoiceUrl;
      await subscription.save();
      console.log(`✅ Billing PDF invoice uploaded: ${invoiceUrl}`);
    } catch (invErr) {
      console.error('⚠️ Invoice PDF generation failed. Continuing success callback:', invErr.message);
    }

    // 6. Send Plan Upgrade Email
    await sendPlanUpgradeEmail(
      user.email,
      user.businessName || user.username,
      subscription.plan.toUpperCase(),
      subscription.amount / 100
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified and plan activated successfully!',
      data: {
        user,
        subscription,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during verification' });
  }
};

// Listen to async webhooks from Razorpay for recovery
export const webhookHandler = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    console.log(`✉️ Razorpay Webhook Event Received: ${event}`);

    // Standard recovery for async capturing
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const payId = paymentEntity.id;

      const subscription = await Subscription.findOne({ razorpayOrderId: orderId });
      if (subscription && subscription.status !== 'paid') {
        subscription.status = 'paid';
        subscription.razorpayPayId = payId;
        subscription.startDate = new Date();
        subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await subscription.save();

        const user = await User.findByIdAndUpdate(
          subscription.userId,
          { 
            plan: subscription.plan,
            planExpiry: subscription.endDate
          },
          { new: true }
        );

        // Generate invoice if not present
        if (user && !subscription.invoiceUrl) {
          try {
            const invoiceUrl = await generateAndUploadInvoice(user, subscription);
            subscription.invoiceUrl = invoiceUrl;
            await subscription.save();
          } catch (e) {
            console.error('Webhook invoice creation failed:', e.message);
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};

// Get the user's historical payment logs
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await Subscription.find({ userId, status: 'paid' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
