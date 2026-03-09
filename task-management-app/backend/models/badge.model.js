const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  milestone: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'lifetime'],
    default: 'lifetime'
  },
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  dateEarned: {
    type: Date,
    default: Date.now
  }
});

// Add a unique compound index to prevent duplicates
badgeSchema.index({ userId: 1, milestone: 1 }, { unique: true });

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;