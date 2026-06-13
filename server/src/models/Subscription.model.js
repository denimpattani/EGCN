import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      required: true,
      default: 'free',
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPayId: {
      type: String,
      trim: true,
    },
    razorpaySubId: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number, // in paise
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['created', 'paid', 'failed', 'cancelled'],
      default: 'created',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    invoiceUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
