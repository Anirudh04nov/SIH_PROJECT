const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('achievements')
      .select('-__v');
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, areaOfInterest, parentEmail, screenTimeLimit } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (areaOfInterest) updateData.areaOfInterest = areaOfInterest;
    if (parentEmail) updateData.parentEmail = parentEmail;
    if (screenTimeLimit) updateData.screenTimeLimit = screenTimeLimit;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, select: '-__v' }
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('completedLessons.lessonId', 'title world level')
      .select('level coins totalScore completedLessons');

    // Calculate progress for each world
    const progress = {
      science: {
        level: user.level.science,
        completedLessons: user.completedLessons.filter(l => l.world === 'Science').length,
        coins: user.coins
      },
      math: {
        level: user.level.math,
        completedLessons: user.completedLessons.filter(l => l.world === 'Math').length,
        coins: user.coins
      },
      history: {
        level: user.level.history,
        completedLessons: user.completedLessons.filter(l => l.world === 'History').length,
        coins: user.coins
      },
      lifeSkills: {
        level: user.level.lifeSkills,
        completedLessons: user.completedLessons.filter(l => l.world === 'Life Skills').length,
        coins: user.coins
      }
    };

    res.json({ progress, totalScore: user.totalScore });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Failed to get progress' });
  }
});

// Add coins to user
router.post('/add-coins', authenticateToken, async (req, res) => {
  try {
    const { coins, world } = req.body;
    
    if (!coins || coins <= 0) {
      return res.status(400).json({ message: 'Invalid coin amount' });
    }

    const user = await User.findById(req.user._id);
    user.coins += coins;
    user.totalScore += coins;
    
    // Update level based on coins (simple progression)
    if (world) {
      const worldLevel = user.level[world.toLowerCase().replace(' ', '')];
      const newLevel = Math.floor(user.coins / 100) + 1;
      if (newLevel > worldLevel) {
        user.level[world.toLowerCase().replace(' ', '')] = newLevel;
      }
    }

    await user.save();

    res.json({ 
      message: 'Coins added successfully',
      newCoins: user.coins,
      newLevel: user.level
    });
  } catch (error) {
    console.error('Add coins error:', error);
    res.status(500).json({ message: 'Failed to add coins' });
  }
});

module.exports = router;
