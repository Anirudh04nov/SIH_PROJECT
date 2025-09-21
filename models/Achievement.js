const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Learning', 'Streak', 'Score', 'Special']
  },
  world: {
    type: String,
    enum: ['Science', 'Math', 'History', 'Life Skills', 'All']
  },
  requirement: {
    type: {
      type: String,
      enum: ['lessons_completed', 'coins_earned', 'streak_days', 'score_threshold', 'special']
    },
    value: Number,
    description: String
  },
  coinsReward: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);
