const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  world: {
    type: String,
    required: true,
    enum: ['Science', 'Math', 'History', 'Life Skills']
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  content: {
    type: String,
    required: true
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
    points: { type: Number, default: 10 }
  }],
  coinsReward: {
    type: Number,
    default: 5
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 10
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
lessonSchema.index({ world: 1, level: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
