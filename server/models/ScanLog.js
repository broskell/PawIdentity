import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
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
    country: {
      type: String,
    },
    device: {
      type: String,
    },
    browser: {
      type: String,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ScanLog = mongoose.model('ScanLog', scanLogSchema);
