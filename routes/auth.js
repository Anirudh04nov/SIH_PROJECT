const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTP, verifyOTP } = require('../utils/emailService');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Send OTP for registration
router.post('/send-registration-otp', async (req, res) => {
  try {
    const { email, name, age, areaOfInterest, parentEmail } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to database
    await OTP.create({
      email,
      otp: otpCode,
      type: 'registration'
    });

    // Send OTP via email
    await sendOTP(email, otpCode, 'registration');

    // Store user data temporarily (in production, use Redis or session)
    res.json({ 
      message: 'OTP sent successfully',
      tempData: { email, name, age, areaOfInterest, parentEmail }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP and register user
router.post('/verify-registration-otp', async (req, res) => {
  try {
    const { email, otp, name, age, areaOfInterest, parentEmail } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'registration',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      age,
      areaOfInterest,
      parentEmail
    });

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        areaOfInterest: user.areaOfInterest,
        coins: user.coins,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Send OTP for login
router.post('/send-login-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to database
    await OTP.create({
      email,
      otp: otpCode,
      type: 'login'
    });

    // Send OTP via email
    await sendOTP(email, otpCode, 'login');

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send login OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP and login
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'login',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Get user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        areaOfInterest: user.areaOfInterest,
        coins: user.coins,
        level: user.level,
        totalScore: user.totalScore
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
