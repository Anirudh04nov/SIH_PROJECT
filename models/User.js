const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 6,
    max: 12
  },
  areaOfInterest: {
    type: String,
    required: true,
    enum: ['Science', 'Math', 'History', 'Life Skills', 'All']
  },
  coins: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  level: {
    science: { type: Number, default: 1 },
    math: { type: Number, default: 1 },
    history: { type: Number, default: 1 },
    lifeSkills: { type: Number, default: 1 }
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  completedLessons: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    world: String,
    completedAt: { type: Date, default: Date.now },
    score: Number
  }],
  parentEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  screenTimeLimit: {
    type: Number,
    default: 20 // minutes
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
userSchema.index({ totalScore: -1 });
userSchema.index({ coins: -1 });

module.exports = mongoose.model('User', userSchema);
