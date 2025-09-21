const mongoose = require('mongoose');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Achievement = require('../models/Achievement');
require('dotenv').config();

// Connect to MongoDB
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Additional options for MongoDB Atlas
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  ssl: true,
  tlsAllowInvalidCertificates: true,
  authSource: 'admin',
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-learning', mongoOptions);

// Sample lessons data
const sampleLessons = [
  // Science World Lessons
  {
    title: "Introduction to Plants",
    description: "Learn about different types of plants and how they grow!",
    world: "Science",
    level: 1,
    content: "Plants are living things that grow in soil. They need water, sunlight, and air to survive.",
    questions: [
      {
        question: "What do plants need to grow?",
        options: ["Water only", "Sunlight only", "Water, sunlight, and air", "Just soil"],
        correctAnswer: 2,
        explanation: "Plants need water, sunlight, and air to grow properly.",
        points: 10
      },
      {
        question: "Where do most plants grow?",
        options: ["In water", "In soil", "In air", "In rocks"],
        correctAnswer: 1,
        explanation: "Most plants grow in soil, which provides them with nutrients.",
        points: 10
      }
    ],
    coinsReward: 5,
    estimatedTime: 10
  },
  {
    title: "The Solar System",
    description: "Explore the planets in our solar system!",
    world: "Science",
    level: 2,
    content: "Our solar system has 8 planets that orbit around the Sun.",
    questions: [
      {
        question: "How many planets are in our solar system?",
        options: ["7", "8", "9", "10"],
        correctAnswer: 1,
        explanation: "There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.",
        points: 10
      },
      {
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Earth", "Mercury", "Mars"],
        correctAnswer: 2,
        explanation: "Mercury is the closest planet to the Sun.",
        points: 10
      }
    ],
    coinsReward: 8,
    estimatedTime: 15
  },

  // Math World Lessons
  {
    title: "Basic Addition",
    description: "Learn to add numbers from 1 to 10!",
    world: "Math",
    level: 1,
    content: "Addition means putting numbers together to find the total.",
    questions: [
      {
        question: "What is 3 + 4?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 1,
        explanation: "3 + 4 = 7. We count 3 and then add 4 more to get 7.",
        points: 10
      },
      {
        question: "What is 5 + 2?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 1,
        explanation: "5 + 2 = 7. We count 5 and then add 2 more to get 7.",
        points: 10
      }
    ],
    coinsReward: 5,
    estimatedTime: 10
  },
  {
    title: "Basic Subtraction",
    description: "Learn to subtract numbers from 1 to 10!",
    world: "Math",
    level: 2,
    content: "Subtraction means taking away numbers to find the difference.",
    questions: [
      {
        question: "What is 8 - 3?",
        options: ["4", "5", "6", "7"],
        correctAnswer: 1,
        explanation: "8 - 3 = 5. We start with 8 and take away 3 to get 5.",
        points: 10
      },
      {
        question: "What is 10 - 4?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 1,
        explanation: "10 - 4 = 6. We start with 10 and take away 4 to get 6.",
        points: 10
      }
    ],
    coinsReward: 8,
    estimatedTime: 12
  },

  // History World Lessons
  {
    title: "Introduction to Indian History",
    description: "Learn about ancient India and its rich culture!",
    world: "History",
    level: 1,
    content: "India has a very old and rich history with many great civilizations.",
    questions: [
      {
        question: "Which river is considered sacred in India?",
        options: ["Ganges", "Thames", "Nile", "Amazon"],
        correctAnswer: 0,
        explanation: "The Ganges river is considered sacred in India and is worshipped by Hindus.",
        points: 10
      },
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        correctAnswer: 1,
        explanation: "New Delhi is the capital of India.",
        points: 10
      }
    ],
    coinsReward: 5,
    estimatedTime: 10
  },
  {
    title: "The Indus Valley Civilization",
    description: "Discover one of the world's oldest civilizations!",
    world: "History",
    level: 2,
    content: "The Indus Valley Civilization was one of the world's first great civilizations.",
    questions: [
      {
        question: "Which cities were part of the Indus Valley Civilization?",
        options: ["Harappa and Mohenjo-daro", "Delhi and Mumbai", "Kolkata and Chennai", "Bangalore and Hyderabad"],
        correctAnswer: 0,
        explanation: "Harappa and Mohenjo-daro were the major cities of the Indus Valley Civilization.",
        points: 10
      }
    ],
    coinsReward: 8,
    estimatedTime: 15
  },

  // Life Skills World Lessons
  {
    title: "Personal Hygiene",
    description: "Learn how to keep yourself clean and healthy!",
    world: "Life Skills",
    level: 1,
    content: "Good personal hygiene helps us stay healthy and feel good about ourselves.",
    questions: [
      {
        question: "How often should you brush your teeth?",
        options: ["Once a day", "Twice a day", "Three times a day", "Only when needed"],
        correctAnswer: 1,
        explanation: "You should brush your teeth twice a day - once in the morning and once at night.",
        points: 10
      },
      {
        question: "When should you wash your hands?",
        options: ["Before eating", "After using the bathroom", "Both A and B", "Only when they look dirty"],
        correctAnswer: 2,
        explanation: "You should wash your hands before eating and after using the bathroom to prevent germs.",
        points: 10
      }
    ],
    coinsReward: 5,
    estimatedTime: 10
  },
  {
    title: "Time Management",
    description: "Learn how to manage your time effectively!",
    world: "Life Skills",
    level: 2,
    content: "Good time management helps us complete tasks and have time for fun activities.",
    questions: [
      {
        question: "What is the first step in time management?",
        options: ["Make a to-do list", "Set alarms", "Ask for help", "Start working immediately"],
        correctAnswer: 0,
        explanation: "Making a to-do list helps you organize your tasks and plan your time.",
        points: 10
      }
    ],
    coinsReward: 8,
    estimatedTime: 12
  }
];

// Sample achievements data
const sampleAchievements = [
  {
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    category: "Learning",
    world: "All",
    requirement: {
      type: "lessons_completed",
      value: 1,
      description: "Complete 1 lesson"
    },
    coinsReward: 10
  },
  {
    title: "Science Explorer",
    description: "Complete 5 Science lessons",
    icon: "🔬",
    category: "Learning",
    world: "Science",
    requirement: {
      type: "lessons_completed",
      value: 5,
      description: "Complete 5 Science lessons"
    },
    coinsReward: 25
  },
  {
    title: "Math Wizard",
    description: "Complete 5 Math lessons",
    icon: "🧮",
    category: "Learning",
    world: "Math",
    requirement: {
      type: "lessons_completed",
      value: 5,
      description: "Complete 5 Math lessons"
    },
    coinsReward: 25
  },
  {
    title: "History Buff",
    description: "Complete 5 History lessons",
    icon: "🏛️",
    category: "Learning",
    world: "History",
    requirement: {
      type: "lessons_completed",
      value: 5,
      description: "Complete 5 History lessons"
    },
    coinsReward: 25
  },
  {
    title: "Life Skills Master",
    description: "Complete 5 Life Skills lessons",
    icon: "🌟",
    category: "Learning",
    world: "Life Skills",
    requirement: {
      type: "lessons_completed",
      value: 5,
      description: "Complete 5 Life Skills lessons"
    },
    coinsReward: 25
  },
  {
    title: "Coin Collector",
    description: "Earn 100 coins",
    icon: "🪙",
    category: "Score",
    world: "All",
    requirement: {
      type: "coins_earned",
      value: 100,
      description: "Earn 100 coins"
    },
    coinsReward: 50
  },
  {
    title: "Learning Streak",
    description: "Learn for 7 days in a row",
    icon: "🔥",
    category: "Streak",
    world: "All",
    requirement: {
      type: "streak_days",
      value: 7,
      description: "Learn for 7 consecutive days"
    },
    coinsReward: 100
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    console.log('Connecting to MongoDB...');

    // Wait for connection
    await new Promise((resolve, reject) => {
      mongoose.connection.once('open', resolve);
      mongoose.connection.on('error', reject);
    });

    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Lesson.deleteMany({});
    await Achievement.deleteMany({});

    console.log('Cleared existing data');

    // Insert lessons
    const lessons = await Lesson.insertMany(sampleLessons);
    console.log(`Inserted ${lessons.length} lessons`);

    // Insert achievements
    const achievements = await Achievement.insertMany(sampleAchievements);
    console.log(`Inserted ${achievements.length} achievements`);

    // Create a sample user
    const sampleUser = new User({
      name: "Demo Student",
      email: "demo@learningworld.com",
      age: 8,
      areaOfInterest: "All",
      coins: 50,
      totalScore: 100,
      level: {
        science: 1,
        math: 1,
        history: 1,
        lifeSkills: 1
      },
      parentEmail: "parent@example.com"
    });

    await sampleUser.save();
    console.log('Created sample user');

    console.log('Database seeding completed successfully!');
    console.log('\nSample user credentials:');
    console.log('Email: demo@learningworld.com');
    console.log('Use the OTP system to login');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run seeding
seedDatabase();
