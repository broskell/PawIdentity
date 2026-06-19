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
    reward: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    lastSeenCity: {
      type: String,
      required: true,
    },
    lastSeenLocation: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['missing', 'found', 'closed'],
      default: 'missing',
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
