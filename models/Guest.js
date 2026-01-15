import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => 'GO-' + Math.random().toString(36).substr(2, 6).toUpperCase()
    },
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending'
    },
    plusOne: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour améliorer les performances
guestSchema.index({ email: 1 });
guestSchema.index({ status: 1 });
guestSchema.index({ invitedAt: -1 });

const Guest = mongoose.model('Guest', guestSchema);

export default Guest;




