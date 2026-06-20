const mongoose = require('mongoose');
const { CAMPAIGN_CATEGORIES, CAMPAIGN_STATUSES } = require('../utils/validators');

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
      trim: true,
      minlength: 10,
      maxlength: 4000
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: [true, 'NGO ID is required'],
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be greater than 0']
    },
    collectedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Collected amount cannot be negative']
    },
    category: {
      type: String,
      enum: CAMPAIGN_CATEGORIES,
      required: [true, 'Campaign category is required'],
      index: true
    },
    status: {
      type: String,
      enum: CAMPAIGN_STATUSES,
      default: 'Active',
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator(value) {
          return !this.startDate || value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    image: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

campaignSchema.virtual('progressPercentage').get(function progressPercentage() {
  if (!this.targetAmount) return 0;
  return Math.min(Math.round((this.collectedAmount / this.targetAmount) * 1000) / 10, 100);
});

campaignSchema.index({ title: 'text', description: 'text' });
campaignSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
