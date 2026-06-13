import mongoose from 'mongoose';

const expertSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Prevent returning in queries by default
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    expertise: {
      type: String,
      required: true,
      enum: ['Marketing', 'Finance', 'CashFlow', 'General Growth'],
      default: 'General Growth',
    },
    bio: {
      type: String,
      required: true,
    },
    assignedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Expert = mongoose.model('Expert', expertSchema);

export default Expert;
