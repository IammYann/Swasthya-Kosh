#!/bin/bash

echo "🏔️  Swasthya Kosh - Setup Guide"
echo "================================"
echo ""

# Check Node version
echo "1️⃣  Checking Node.js version..."
node --version
echo ""

# Install root dependencies
echo "2️⃣  Installing root dependencies..."
npm install
echo ""

# Setup server
echo "3️⃣  Setting up server..."
cd server

echo "Installing server dependencies..."
npm install

echo "Creating .env file..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/swasthya_kosh"
JWT_SECRET="your-super-secret-key-change-in-production"
NODE_ENV="development"
PORT=3000
CLIENT_URL="http://localhost:5173"
CLAUDE_API_KEY="sk-ant-..."
REDIS_URL="redis://localhost:6379"
EOF

echo "Running Prisma migrations..."
npx prisma migrate deploy
npx prisma generate

cd ..
echo ""

# Setup client
echo "4️⃣  Setting up client..."
cd client

echo "Installing client dependencies..."
npm install

echo "Client setup complete!"
cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env files with your actual credentials"
echo "2. Create PostgreSQL database 'swasthya_kosh'"
echo "3. Run: npm run server (in terminal 1)"
echo "4. Run: npm run client (in terminal 2)"
echo ""
echo "🌐 Access the app at:"
echo "   Landing: http://localhost:5173"
echo "   API: http://localhost:3000/api"
