const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    fileType: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ''
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1
    },
    fileData: {
      type: String,
      select: false,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ campaignId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
