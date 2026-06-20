const mongoose = require('mongoose');
const { DONATION_PAYMENT_METHODS } = require('../utils/validators');

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    donorName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ''
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Donation amount must be greater than 0']
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: DONATION_PAYMENT_METHODS,
      required: true
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
      default: 'Completed',
      index: true
    }
  },
  {
    timestamps: true
  }
);

donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ campaignId: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
