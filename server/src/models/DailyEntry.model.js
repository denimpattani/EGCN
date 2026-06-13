import mongoose from 'mongoose';

const dailyEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  bills: {
    type: Number,
    required: true,
    default: 0
  },
  sales: {
    type: Number,
    required: true,
    default: 0
  },
  targetBills: {
    type: Number,
    required: false
  },
  targetSales: {
    type: Number,
    required: false
  },
  suggestion: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compute achieved percentage
dailyEntrySchema.virtual('achievedPct').get(function() {
  if (!this.targetSales || this.targetSales === 0) return 0;
  return Number(((this.sales / this.targetSales) * 100).toFixed(2));
});

// Ensure a user can only have one entry per day
dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyEntry = mongoose.model('DailyEntry', dailyEntrySchema);
export default DailyEntry;
