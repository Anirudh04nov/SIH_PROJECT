@echo off
echo Starting Learning World Application...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

echo Checking if MongoDB is running...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: MongoDB might not be installed or not in PATH
    echo Please make sure MongoDB is running
    echo You can download MongoDB from https://www.mongodb.com/try/download/community
    echo.
)

echo Installing dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.

echo Setting up environment...
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo.
    echo IMPORTANT: Please edit the .env file with your configuration:
    echo - Set your MongoDB connection string
    echo - Set your JWT secret
    echo - Set your Gmail credentials for OTP service
    echo.
    echo Press any key to continue after editing .env file...
    pause
)

echo.
echo Seeding database with sample data...
node scripts/seedData.js
if errorlevel 1 (
    echo WARNING: Failed to seed database. You may need to set up MongoDB first.
    echo.
)

echo.
echo Starting the application...
echo The application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
