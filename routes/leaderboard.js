const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get global leaderboard
router.get('/global', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('name coins totalScore level')
      .sort({ totalScore: -1, coins: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments({ isActive: true });

    res.json({
      leaderboard: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
});

// Get user's rank
router.get('/my-rank', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Count users with higher score
    const rank = await User.countDocuments({
      $or: [
        { totalScore: { $gt: user.totalScore } },
        { 
          totalScore: user.totalScore,
          coins: { $gt: user.coins }
        }
      ],
      isActive: true
    }) + 1;

    res.json({ rank, userScore: user.totalScore, userCoins: user.coins });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ message: 'Failed to get rank' });
  }
});

// Get leaderboard for specific world
router.get('/world/:world', async (req, res) => {
  try {
    const { world } = req.params;
    const { limit = 20 } = req.query;

    // Get users who have completed lessons in this world
    const users = await User.find({
      isActive: true,
      'completedLessons.world': world.charAt(0).toUpperCase() + world.slice(1)
    })
    .select('name coins totalScore level')
    .sort({ totalScore: -1, coins: -1 })
    .limit(parseInt(limit));

    res.json({ leaderboard: users, world });
  } catch (error) {
    console.error('Get world leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get world leaderboard' });
  }
});

// Get top performers (for homepage)
router.get('/top-performers', async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: true })
      .select('name coins totalScore')
      .sort({ totalScore: -1 })
      .limit(10);

    res.json({ topPerformers: topUsers });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ message: 'Failed to get top performers' });
  }
});

module.exports = router;
