import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler.js';
import { dbErrorHandler } from './middleware/dbErrorHandler.js';
import { prisma } from './lib/db.js';
import { startAllSchedulers, stopAllSchedulers } from './services/digestScheduler.js';

import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import accountRoutes from './routes/accounts.js';
import healthRoutes from './routes/health.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import insightRoutes from './routes/insights.js';
import chatRoutes from './routes/chat.js';
import reportRoutes from './routes/reports.js';
import diagnosticsRoutes from './routes/diagnostics.js';
import notificationsRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database error handler (before generic error handler)
app.use(dbErrorHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Initialize email digest schedulers
  if (process.env.ENABLE_EMAIL_SCHEDULER !== 'false') {
    startAllSchedulers();
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  stopAllSchedulers();
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  stopAllSchedulers();
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
