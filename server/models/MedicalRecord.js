import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['vaccine', 'surgery', 'allergy', 'disease', 'prescription', 'report'],
      required: true,
    },
    description: {
      type: String,
    },
    attachments: [
      {
        type: String,
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
