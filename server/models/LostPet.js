import mongoose from 'mongoose';

const lostPetSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    missingSince: {
      type: Date,
      required: true,
    },
    lastSeen: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    reward: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['missing', 'found'],
      default: 'missing',
    },
    finderName: {
      type: String,
    },
    finderPhone: {
      type: String,
    },
    finderMessage: {
      type: String,
    },
    foundAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const LostPet = mongoose.model('LostPet', lostPetSchema);
