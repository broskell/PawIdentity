import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    qrTag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRTag',
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    city: {
      type: String,
    },
    browser: {
      type: String,
    },
    device: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    ownerNotified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ScanLog = mongoose.models.ScanLog || mongoose.model('ScanLog', scanLogSchema);
