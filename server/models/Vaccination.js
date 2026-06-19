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
    dateAdministered: {
      type: Date,
      required: true,
    },
    nextDueDate: {
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

export const Vaccination = mongoose.models.Vaccination || mongoose.model('Vaccination', vaccinationSchema);
