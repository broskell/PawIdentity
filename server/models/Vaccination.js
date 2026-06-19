import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    vaccineName: {
      type: String,
      required: true,
    },
    dateGiven: {
      type: Date,
      required: true,
    },
    nextDue: {
      type: Date,
    },
    batchNumber: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Vaccination = mongoose.model('Vaccination', vaccinationSchema);
