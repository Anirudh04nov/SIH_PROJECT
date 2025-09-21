const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database connection
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Additional options for MongoDB Atlas
  serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // SSL/TLS options for Atlas
  ssl: true,
  tlsAllowInvalidCertificates: true, // Allow invalid certificates for development
  authSource: 'admin', // Use admin database for authentication
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain a minimum of 5 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-learning', mongoOptions)
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('\n🔧 MongoDB Atlas Troubleshooting:');
  console.log('1. Check your connection string format');
  console.log('2. Verify your IP is whitelisted in Atlas');
  console.log('3. Check your username/password');
  console.log('4. Ensure your cluster is running');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access locally: http://localhost:${PORT}`);
  console.log(`Access from network: http://10.12.133.242:${PORT}`);
  console.log(`Access from network: http://192.168.137.1:${PORT}`);
});
