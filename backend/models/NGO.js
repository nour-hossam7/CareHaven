const mongoose = require('mongoose');
const { NGO_STATUSES } = require('../utils/validators');

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      maxlength: 30
    },
    description: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: ''
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      maxlength: 80
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
    },
    status: {
      type: String,
      enum: NGO_STATUSES,
      default: 'Pending',
      index: true
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvalDate: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    documents: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    timestamps: true
  }
);

ngoSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('NGO', ngoSchema);
