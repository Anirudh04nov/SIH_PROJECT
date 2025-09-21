# Learning World - Setup Guide

## Quick Start (Windows)

### Option 1: Automated Setup
1. Double-click `start.bat` to run the automated setup script
2. Follow the prompts to configure your environment
3. The application will start automatically

### Option 2: Manual Setup

#### Step 1: Install Prerequisites
- **Node.js**: Download from https://nodejs.org/ (LTS version recommended)
- **MongoDB**: Download from https://www.mongodb.com/try/download/community
- **Gmail Account**: For OTP email service

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment
1. Copy `env.example` to `.env`
2. Edit `.env` file with your settings:
```env
MONGODB_URI=mongodb://localhost:27017/gamified-learning
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3000
NODE_ENV=development
```

#### Step 4: Gmail Setup for OTP
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate an app password for "Mail"
4. Use this password in the `EMAIL_PASS` field

#### Step 5: Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

#### Step 6: Seed Database
```bash
node scripts/seedData.js
```

#### Step 7: Start Application
```bash
npm start
```

## Testing the Application

### Sample User Account
After seeding the database, you can use:
- **Email**: demo@learningworld.com
- **Login**: Use the OTP system with this email

### Test Features
1. **Registration**: Create a new account with your email
2. **Login**: Use OTP authentication
3. **Learning Worlds**: Explore all 4 worlds
4. **Lessons**: Complete sample lessons
5. **Leaderboard**: Check rankings
6. **Parent Corner**: Monitor progress

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
- Windows: Start MongoDB service or run `mongod`
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

#### Email OTP Not Working
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution**: 
1. Enable 2-factor authentication on Gmail
2. Generate an app password (not your regular password)
3. Use the app password in `EMAIL_PASS`

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: 
1. Change the port in `.env` file
2. Or kill the process using port 3000

#### Dependencies Installation Failed
```
npm ERR! peer dep missing
```
**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` folder
3. Run `npm install` again

### Development Tips

#### Hot Reload
For development with auto-restart:
```bash
npm run dev
```

#### Database Reset
To reset the database with fresh data:
```bash
node scripts/seedData.js
```

#### View Logs
Check console output for detailed error messages and debugging information.

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-secret-key
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-app-password
PORT=3000
```

### Security Checklist
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Use environment variables for secrets
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Use a production MongoDB instance

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Test email configuration with a simple test
5. Check network connectivity

## Features Overview

### ✅ Implemented Features
- OTP-based authentication system
- 4 learning worlds (Science, Math, History, Life Skills)
- Interactive lessons with quizzes
- Coin and scoring system
- Level progression
- Global and world-specific leaderboards
- Parent corner with monitoring
- Responsive design for all devices
- Achievement system
- Progress tracking

### 🎯 Key Benefits
- **Secure**: No password storage, OTP-based auth
- **Engaging**: Gamified learning experience
- **Educational**: Age-appropriate content for 6-12 years
- **Parent-friendly**: Monitoring and control features
- **Scalable**: Built with modern web technologies

---

**Ready to start learning? Run the setup and begin your educational adventure!** 🌟



