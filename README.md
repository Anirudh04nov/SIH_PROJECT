# Learning World - Gamified Education Platform

A comprehensive gamified educational platform designed for students aged 6-12, featuring interactive learning worlds, achievement systems, and parent monitoring tools.

## 🌟 Features

### Learning Worlds
- **Science World** 🔬 - Explore the wonders of science
- **Math World** 🧮 - Master numbers and calculations  
- **Indian History World** 🏛️ - Discover India's rich heritage
- **Life Skills World** 🌟 - Learn essential life skills

### Gamification Elements
- **Coin System** 🪙 - Earn coins for completing lessons and quizzes
- **Level Progression** 📈 - Advance through levels in each world
- **Achievement System** 🏆 - Unlock badges and rewards
- **Leaderboard** 🏅 - Compete with other learners globally and by world

### User Experience
- **OTP-based Authentication** 📧 - Secure email-based login system
- **Responsive Design** 📱 - Works on desktop, tablet, and mobile
- **Parent Corner** 👨‍👩‍👧‍👦 - Monitor child's progress and set controls
- **Real-time Progress Tracking** 📊 - Track learning analytics

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icons and visual elements

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### Authentication
- **JWT** - JSON Web Tokens for session management
- **Nodemailer** - Email OTP service
- **bcryptjs** - Password hashing (for future use)

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Gmail account for email OTP service

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SIH_project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/gamified-learning

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Gmail Setup for OTP
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### 5. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
node scripts/seedData.js
```

### 6. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 📱 Usage

### For Students
1. **Registration**: Enter name, age, email, and area of interest
2. **Email Verification**: Check email for OTP code
3. **Login**: Use email and OTP for secure access
4. **Learning**: Choose a world and start lessons
5. **Progress**: Track coins, levels, and achievements

### For Parents
1. **Access Parent Corner**: Monitor child's progress
2. **Set Screen Time Limits**: Control daily usage
3. **View Learning Reports**: Track completed lessons and time spent
4. **Safety Controls**: Enable safe mode and notifications

## 🎮 Learning Experience

### Lesson Structure
- **Interactive Content**: Engaging descriptions and explanations
- **Multiple Choice Questions**: Immediate feedback and explanations
- **Progressive Difficulty**: Levels increase with user advancement
- **Reward System**: Coins earned for correct answers

### Achievement System
- **Learning Achievements**: Complete lessons in each world
- **Streak Achievements**: Learn consecutively for multiple days
- **Score Achievements**: Reach coin and score milestones
- **Special Achievements**: Unique accomplishments

### Leaderboard Features
- **Global Rankings**: Compare with all users
- **World-specific Rankings**: Compete within subject areas
- **Personal Insights**: View your percentile and achievements
- **Real-time Updates**: Rankings update with new scores

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/send-registration-otp` - Send registration OTP
- `POST /api/auth/verify-registration-otp` - Verify registration
- `POST /api/auth/send-login-otp` - Send login OTP
- `POST /api/auth/verify-login-otp` - Verify login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/progress` - Get learning progress
- `POST /api/user/add-coins` - Add coins to user

### Learning
- `GET /api/learning/lessons/:world/:level` - Get lessons
- `GET /api/learning/lesson/:lessonId` - Get lesson content
- `POST /api/learning/lesson/:lessonId/submit` - Submit lesson
- `GET /api/learning/levels` - Get user levels
- `GET /api/learning/worlds` - Get available worlds

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/my-rank` - User's rank
- `GET /api/leaderboard/world/:world` - World leaderboard
- `GET /api/leaderboard/top-performers` - Top performers

## 🎨 UI/UX Features

### Design Principles
- **Child-friendly Interface**: Bright colors and engaging visuals
- **Intuitive Navigation**: Easy-to-understand icons and labels
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Clear fonts and high contrast

### Visual Elements
- **Gradient Backgrounds**: Modern and appealing design
- **Card-based Layout**: Organized content presentation
- **Smooth Animations**: Engaging transitions and hover effects
- **Progress Indicators**: Visual feedback for user actions

## 🔒 Security Features

- **OTP Authentication**: No password storage required
- **JWT Tokens**: Secure session management
- **Rate Limiting**: Prevent abuse of API endpoints
- **Input Validation**: Sanitize all user inputs
- **CORS Protection**: Configured for secure cross-origin requests

## 📊 Analytics & Monitoring

### User Analytics
- **Learning Time Tracking**: Monitor session duration
- **Progress Analytics**: Track completion rates
- **Engagement Metrics**: Measure user interaction
- **Performance Insights**: Identify learning patterns

### Parent Monitoring
- **Screen Time Reports**: Daily usage statistics
- **Learning Progress**: Completed lessons and achievements
- **Safety Controls**: Content filtering and time limits
- **Notification System**: Progress updates and alerts

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper email service
4. Set up SSL certificates
5. Use a process manager like PM2

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-secret
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-password
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- **Multi-language Support**: Add support for regional languages
- **Advanced Analytics**: Detailed learning insights
- **Social Features**: Friend system and group challenges
- **Mobile App**: Native iOS and Android applications
- **AI Tutoring**: Personalized learning recommendations
- **Voice Integration**: Speech recognition for accessibility

---

**Learning World** - Making education fun, engaging, and accessible for young learners! 🌟

