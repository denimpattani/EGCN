import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // e.g. 'business', 'pro', 'vip'
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true, // e.g. 'Business Enhancement'
    },
    price: {
      type: Number,
      required: true, // in INR
    },
    description: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    durationDays: {
      type: Number,
      default: 30,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    accentHex: {
      type: String,
      default: '#d74339',
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
