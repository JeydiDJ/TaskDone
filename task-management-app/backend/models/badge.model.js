// badge.model.js
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to your user collection
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
    type: String, // could be emoji or URL to an image
    required: true
  },
  dateEarned: {
    type: Date,
    default: Date.now
  }
});

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;