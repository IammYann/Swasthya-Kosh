# Swasthya Kosh - Complete Setup Guide

## 🏔️ Welcome to Swasthya Kosh

Personalized Health & Wealth Tracker for Nepali people with AI-powered insights and an immersive 3D marketing website.

## 📋 Prerequisites

- **Node.js 18+** and **npm 9+**
- **PostgreSQL 12+** (or PostgreSQL cloud service)
- **Anthropic API Key** (Claude access) - [Get it here](https://console.anthropic.com)
- **Git**

## 🚀 Quick Start (5 Minutes)

### 1. Clone & Navigate

```bash
cd "d:\Code\Health Wealth App"
```

### 2. Install All Dependencies

```bash
npm install
```

### 3. Configure Environment

**Create `server/.env`:**

```bash
cd server
```

Create file `.env` with:

```
DATABASE_URL="postgresql://user:password@localhost:5432/swasthya_kosh"
JWT_SECRET="your-very-secret-key-min-32-chars-change-in-production"
NODE_ENV="development"
PORT=3000
CLIENT_URL="http://localhost:5173"
CLAUDE_API_KEY="sk-ant-YOUR_ACTUAL_KEY_HERE"
REDIS_URL="redis://localhost:6379"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef"
```

**Create `client/.env`:**

```bash
cd ../client
```

Create file `.env` with:

```
VITE_API_URL="http://localhost:3000/api"
```

### 4. Setup Database

#### Option A: Local PostgreSQL

```bash
# Windows: Use PostgreSQL installer
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb swasthya_kosh
```

#### Option B: Cloud PostgreSQL

Use **Render**, **Supabase**, or **Railway** - copy connection URL to `DATABASE_URL`

### 5. Run Migrations

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### 6. Start Development Servers

**Terminal 1 - Backend:**

```bash
npm run server
# Server running on http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
npm run client
# Frontend running on http://localhost:5173
```

## 📖 Project Structure

```
swasthya-kosh/
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── index.js                # Main server file
│   │   ├── routes/                 # API endpoints
│   │   │   ├── auth.js             # Auth (register/login)
│   │   │   ├── transactions.js     # Finance endpoints
│   │   │   ├── health.js           # Fitness & Health logging
│   │   │   ├── budgets.js          # Budget management
│   │   │   ├── insights.js         # AI correlations
│   │   │   └── chat.js             # Claude chatbot API
│   │   ├── middleware/             # Auth & error handling
│   │   ├── services/               # Business logic
│   │   │   ├── lifeScore.js        # Life Score calculation
│   │   │   └── insights.js         # Correlation engine
│   │   ├── lib/
│   │   │   └── db.js               # Prisma client
│   │   └── utils/                  # JWT, encryption utilities
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/             # DB migrations
│   └── package.json
│
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Router & layout
│   │   ├── pages/                  # Page components
│   │   │   ├── Landing.jsx         # 3D marketing site
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx       # Main app dashboard
│   │   │   ├── Finance.jsx         # Finance & transactions
│   │   │   ├── Health.jsx          # Fitness & health
│   │   │   ├── Insights.jsx        # AI insights
│   │   │   └── Profile.jsx         # User settings
│   │   ├── components/             # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Chatbot.jsx         # AI chatbot FAB
│   │   │   ├── Layout.jsx          # Protected layout
│   │   │   └── 3D/                 # Three.js components
│   │   ├── stores/                 # Zustand state management
│   │   ├── lib/                    # API client, utilities
│   │   ├── i18n/                   # Nepali + English translations
│   │   └── index.css               # Tailwind styles
│   ├── index.html
│   └── package.json
│
├── package.json                     # Root monorepo
└── README.md
```

## 🎯 Key Features

### ✅ Authentication

- JWT-based auth (15 min access token + 7 day refresh token)
- bcrypt password hashing
- Token refresh endpoint

### ✅ Finance Tracking

- Multi-account support (cash, bank, eSewa, Khalti)
- Transaction logging (income/expense)
- Budget management with alerts
- Category-based tracking using Nepali categories

### ✅ Health Tracking

- Workout logging (type, duration, calories)
- Daily step tracking
- Body metrics (weight, BMI, body fat)
- Nutrition logging (calories, macros)

### ✅ Life Score

- Unified metric (0–100) combining:
  - **Fitness Score**: Workouts + Steps + Nutrition
  - **Wealth Score**: Savings Rate + Budget Adherence + Net Worth Growth

### ✅ AI Chatbot

- Claude Sonnet 4 powered
- Bilingual (Nepali + English)
- Streams responses in real-time
- Context-aware (accesses user's aggregated data)
- Floating FAB button

### ✅ Correlations & Insights

- Automatic pattern detection
- Health ↔ Wealth correlations
- Discipline patterns
- AI-generated narrative summaries

### ✅ 3D Landing Page

- Particle animations
- Scroll-triggered effects
- Mountain silhouette
- Responsive design

### ✅ Nepali Localization

- Full i18n (i18next)
- Nepali script support
- NPR currency formatting
- Nepali expense categories

## 🔐 Security Features

- **Passwords**: bcrypt with saltRounds=12
- **Auth**: JWT with httpOnly cookies
- **Data**: AES-256 encryption for sensitive fields
- **API**: Rate limiting, Helmet.js, CORS whitelist
- **Input**: Zod validation on all endpoints

## 📊 Database Schema

13 tables with proper indexing:

- User, Account, Transaction
- Budget, WorkoutLog, BodyMetric
- StepLog, NutritionLog, Goal
- LifeScore, Notification

## 🔌 API Endpoints

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
```

### Finance

```
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/summary/:period
GET    /api/accounts
POST   /api/accounts
GET    /api/budgets
POST   /api/budgets
PATCH  /api/budgets/:id
```

### Health

```
GET    /api/health/workouts
POST   /api/health/workouts
GET    /api/health/steps
POST   /api/health/steps
GET    /api/health/body-metrics
POST   /api/health/body-metrics
GET    /api/health/nutrition
POST   /api/health/nutrition
```

### Insights

```
GET    /api/insights
POST   /api/insights/recalculate
GET    /api/insights/history/:days
GET    /api/insights/correlations
```

### Chat

```
POST   /api/chat  (Server-sent events stream)
```

## 🧠 AI System Prompt

The chatbot uses this system prompt:

```
You are Swasthya Kosh AI — a bilingual (Nepali + English) personal health
and wealth coach built specifically for Nepali users.

Your personality: warm, encouraging, like a knowledgeable Nepali दाजु/दिदी.
Use a mix of Nepali and English (Nepali script for emotional messages).

Capabilities:
1. Answer questions about user's financial and health data
2. Identify correlations and patterns
3. Give personalized advice based on trends
4. Explain the Life Score
5. Set goals and track progress
6. Send motivational nudges

Keep responses brief (2–4 sentences). Be data-driven and warm.
```

## 🚢 Deployment

### Backend (Render/Railway/Heroku)

```bash
# Ensure Procfile exists:
web: node src/index.js

# Deploy:
git push heroku main
prisma migrate deploy
```

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Register and login works
- [ ] Dashboard loads with correct data
- [ ] Add transaction (expense/income)
- [ ] Log workout
- [ ] Log steps
- [ ] AI chatbot responds
- [ ] Language toggle (English ↔ Nepali)
- [ ] Life Score calculates
- [ ] Insights appear
- [ ] Logout works

## 📚 Environment Variables Reference

### Server (.env)

| Variable         | Description                    | Example                                             |
| ---------------- | ------------------------------ | --------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection          | `postgresql://user:pw@localhost:5432/swasthya_kosh` |
| `JWT_SECRET`     | JWT signing key (min 32 chars) | `your-secret-key-...`                               |
| `CLAUDE_API_KEY` | Anthropic API key              | `sk-ant-...`                                        |
| `NODE_ENV`       | Environment                    | `development`                                       |
| `PORT`           | Server port                    | `3000`                                              |
| `CLIENT_URL`     | Frontend URL (for CORS)        | `http://localhost:5173`                             |
| `ENCRYPTION_KEY` | AES-256 key (32 hex chars)     | `0123456...`                                        |

### Client (.env)

| Variable       | Description     | Example                     |
| -------------- | --------------- | --------------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

## 🐛 Troubleshooting

### "Database connection failed"

- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Run: `npx prisma db push`

### "CLAUDE_API_KEY not found"

- Add to server/.env
- Restart server: `npm run server`

### "Chatbot returns empty"

- Verify CLAUDE_API_KEY is valid
- Check API usage/quota on console.anthropic.com

### "CORS errors on chat"

- Ensure ClientURL in server/.env matches frontend URL
- Clear browser cache

## 📞 Support

- 📖 [Prisma Docs](https://www.prisma.io/docs/)
- 🤖 [Claude API Docs](https://docs.anthropic.com/)
- ⚛️ [React Docs](https://react.dev/)
- 🎨 [Tailwind Docs](https://tailwindcss.com/)

## 📄 License

MIT - Built for the Nepali community

---

**Happy tracking! स्वास्थ्य कोष को साथ आपले आफ्नो जीवन अनुगमन गर्न सक्नुहुन्छ।** 🏔️
