@echo off
REM Swasthya Kosh - Windows Setup Guide

echo 🏔️  Swasthya Kosh - Setup Guide
echo ================================
echo.

REM Check Node version
echo 1️⃣  Checking Node.js version...
node --version
echo.

REM Install root dependencies
echo 2️⃣  Installing root dependencies...
call npm install
echo.

REM Setup server
echo 3️⃣  Setting up server...
cd server

echo Installing server dependencies...
call npm install

echo Creating .env file...
(
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/swasthya_kosh"
echo JWT_SECRET="your-super-secret-key-change-in-production"
echo NODE_ENV="development"
echo PORT=3000
echo CLIENT_URL="http://localhost:5173"
echo CLAUDE_API_KEY="sk-ant-..."
echo REDIS_URL="redis://localhost:6379"
) > .env

echo Running Prisma migrations...
call npx prisma migrate deploy
call npx prisma generate

cd ..
echo.

REM Setup client
echo 4️⃣  Setting up client...
cd client

echo Installing client dependencies...
call npm install

echo Client setup complete!
cd ..
echo.

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update .env files with your actual credentials
echo 2. Create PostgreSQL database 'swasthya_kosh'
echo 3. Run: npm run server (in terminal 1)
echo 4. Run: npm run client (in terminal 2)
echo.
echo 🌐 Access the app at:
echo    Landing: http://localhost:5173
echo    API: http://localhost:3000/api
