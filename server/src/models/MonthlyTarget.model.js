import mongoose from 'mongoose';

const monthlyTargetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    targetBills: {
      type: Number,
      required: true,
      min: 1,
    },
    targetSales: {
      type: Number,
      required: true,
      min: 1,
    },
    workingDays: {
      type: Number,
      required: true,
      default: 26,
      min: 1,
      max: 31,
    },
    requiredDaily: {
      bills: {
        type: Number,
        default: 0,
      },
      sales: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user only has one target per month per year
monthlyTargetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Pre-save hook to calculate requiredDaily targets
monthlyTargetSchema.pre('save', function (next) {
  if (this.isModified('targetBills') || this.isModified('targetSales') || this.isModified('workingDays')) {
    this.requiredDaily = {
      bills: Math.ceil((this.targetBills / this.workingDays) * 100) / 100, // round to 2 decimal places
      sales: Math.ceil((this.targetSales / this.workingDays) * 100) / 100,
    };
  }
  next();
});

const MonthlyTarget = mongoose.model('MonthlyTarget', monthlyTargetSchema);

export default MonthlyTarget;
