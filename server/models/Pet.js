import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    photo: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'missing', 'found'],
      default: 'active',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isVaccinated: {
      type: Boolean,
      default: false,
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
