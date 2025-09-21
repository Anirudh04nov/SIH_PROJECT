#!/bin/bash

echo "Starting Learning World Application..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed: $(node --version)"
echo

# Check if MongoDB is available
if ! command -v mongod &> /dev/null; then
    echo "WARNING: MongoDB might not be installed or not in PATH"
    echo "Please make sure MongoDB is running"
    echo "You can download MongoDB from https://www.mongodb.com/try/download/community"
    echo
fi

# Install dependencies
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "Dependencies installed successfully!"
echo

# Setup environment
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo
    echo "IMPORTANT: Please edit the .env file with your configuration:"
    echo "- Set your MongoDB connection string"
    echo "- Set your JWT secret"
    echo "- Set your Gmail credentials for OTP service"
    echo
    read -p "Press Enter to continue after editing .env file..."
fi

echo
echo "Seeding database with sample data..."
node scripts/seedData.js
if [ $? -ne 0 ]; then
    echo "WARNING: Failed to seed database. You may need to set up MongoDB first."
    echo
fi

echo
echo "Starting the application..."
echo "The application will be available at: http://localhost:3000"
echo
echo "Press Ctrl+C to stop the server"
echo

npm start
