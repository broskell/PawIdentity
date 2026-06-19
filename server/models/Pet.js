import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    species: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dob: {
      type: Date,
    },
    weight: {
      type: Number, // in kg
    },
    color: {
      type: String,
    },
    microchipId: {
      type: String,
    },
    photo: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    qrTag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRTag',
    },
    isVaccinated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'missing'],
      default: 'active',
    },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        relation: { type: String },
        phone: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Pet = mongoose.model('Pet', petSchema);
