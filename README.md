# Swasthya Kosh (स्वास्थ्य कोष)

Personalized Health & Wealth Tracker for Nepali people with AI-powered insights and immersive 3D marketing website.

## Project Structure

```
swasthya-kosh/
├── client/          # React Vite frontend
├── server/          # Node.js Express backend
├── package.json     # Monorepo workspace config
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Anthropic API key for Claude

### Environment Setup

Create `.env` files in both `server/` and `client/`:

**server/.env**

```
DATABASE_URL="postgresql://user:password@localhost:5432/swasthya_kosh"
JWT_SECRET="your-secret-key"
CLAUDE_API_KEY="your-anthropic-api-key"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
PORT=3000
CLIENT_URL="http://localhost:5173"
```

**client/.env**

```
VITE_API_URL="http://localhost:3000/api"
```

### Installation & Running

```bash
# Install all dependencies
npm install

# Run both client and server in parallel
npm run dev

# Or run them individually
npm run server  # Terminal 1
npm run client  # Terminal 2
```

Visit `http://localhost:5173` for the app and `http://localhost:3000` for the API.

## Features

- **Dashboard**: Real-time health & wealth metrics
- **Transaction Tracking**: Expense management with Nepali categories
- **Fitness Logging**: Steps, workouts, body metrics
- **AI Chatbot**: Claude-powered bilingual insights
- **Life Score**: Unified metric combining health & wealth
- **3D Marketing Site**: Immersive scroll-based animations
- **Nepali Localization**: Full i18n support with Bikram Sambat calendar

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, Three.js, Framer Motion
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL, Redis
- AI: Claude API
- Auth: JWT + bcrypt
