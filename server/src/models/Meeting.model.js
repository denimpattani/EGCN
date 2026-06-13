import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60, // in minutes
    },
    type: {
      type: String,
      required: true,
      enum: ['video', 'site_visit'],
      default: 'video',
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    meetingLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

meetingSchema.index({ roomId: 1, scheduledAt: 1 });
meetingSchema.index({ clientId: 1, status: 1 });
meetingSchema.index({ expertId: 1, status: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
