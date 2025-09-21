const express = require('express');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Achievement = require('../models/Achievement');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get lessons for a specific world and level
router.get('/lessons/:world/:level', authenticateToken, async (req, res) => {
  try {
    const { world, level } = req.params;
    const user = await User.findById(req.user._id);

    // Get lessons for the specified world and level
    const lessons = await Lesson.find({
      world: world.charAt(0).toUpperCase() + world.slice(1),
      level: parseInt(level),
      isActive: true
    }).select('title description coinsReward estimatedTime');

    // Check which lessons are completed
    const completedLessonIds = user.completedLessons.map(l => l.lessonId.toString());
    const lessonsWithStatus = lessons.map(lesson => ({
      ...lesson.toObject(),
      isCompleted: completedLessonIds.includes(lesson._id.toString())
    }));

    res.json({ lessons: lessonsWithStatus });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Failed to get lessons' });
  }
});

// Get specific lesson content
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Don't send correct answers to frontend
    const lessonContent = {
      ...lesson.toObject(),
      questions: lesson.questions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points
      }))
    };

    res.json({ lesson: lessonContent });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Failed to get lesson' });
  }
});

// Submit lesson quiz
router.post('/lesson/:lessonId/submit', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body; // Array of answer indices

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if already completed
    const user = await User.findById(req.user._id);
    const alreadyCompleted = user.completedLessons.some(
      l => l.lessonId.toString() === lessonId
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Lesson already completed' });
    }

    // Calculate score
    let score = 0;
    const results = lesson.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) {
        score += question.points;
      }
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    // Add coins and update user progress
    user.coins += lesson.coinsReward;
    user.totalScore += score;
    user.completedLessons.push({
      lessonId: lesson._id,
      world: lesson.world,
      score: score
    });

    // Check for level up
    const worldKey = lesson.world.toLowerCase().replace(' ', '');
    const currentLevel = user.level[worldKey];
    const newLevel = Math.floor(user.coins / 100) + 1;
    if (newLevel > currentLevel) {
      user.level[worldKey] = newLevel;
    }

    await user.save();

    res.json({
      message: 'Lesson completed successfully',
      score,
      totalScore: user.totalScore,
      coinsEarned: lesson.coinsReward,
      newCoins: user.coins,
      results,
      levelUp: newLevel > currentLevel,
      newLevel: user.level
    });
  } catch (error) {
    console.error('Submit lesson error:', error);
    res.status(500).json({ message: 'Failed to submit lesson' });
  }
});

// Get user's current level for each world
router.get('/levels', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ levels: user.level });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ message: 'Failed to get levels' });
  }
});

// Get available worlds
router.get('/worlds', authenticateToken, async (req, res) => {
  try {
    const worlds = [
      {
        id: 'science',
        name: 'Science World',
        description: 'Explore the wonders of science!',
        icon: '🔬',
        color: '#4CAF50'
      },
      {
        id: 'math',
        name: 'Math World',
        description: 'Master numbers and calculations!',
        icon: '🧮',
        color: '#2196F3'
      },
      {
        id: 'history',
        name: 'Indian History World',
        description: 'Discover India\'s rich heritage!',
        icon: '🏛️',
        color: '#FF9800'
      },
      {
        id: 'lifeSkills',
        name: 'Life Skills World',
        description: 'Learn essential life skills!',
        icon: '🌟',
        color: '#9C27B0'
      }
    ];

    res.json({ worlds });
  } catch (error) {
    console.error('Get worlds error:', error);
    res.status(500).json({ message: 'Failed to get worlds' });
  }
});

module.exports = router;
