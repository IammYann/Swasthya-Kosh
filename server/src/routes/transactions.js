import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { retryQuery } from '../utils/queryRetry.js';
import { checkBudgetAlerts } from '../services/notificationService.js';

const router = express.Router();

// Transaction validation schema
const transactionSchema = z.object({
  accountId: z.string().optional(),
  amount: z.number().positive(),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  note: z.string().optional(),
  date: z.string().datetime()
});

// Get all transactions for user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      include: { account: true },
      orderBy: { date: 'desc' }
    });
    
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

// Get transactions summary (last 30 days)
router.get('/summary/:period', authMiddleware, async (req, res, next) => {
  try {
    const { period } = req.params;
    
    let daysBack = 30;
    if (period === 'week') daysBack = 7;
    if (period === 'month') daysBack = 30;
    if (period === 'year') daysBack = 365;
    
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: { gte: since }
      }
    });
    
    // Group by category
    const byCategory = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { income: 0, expense: 0 };
      }
      byCategory[t.category][t.type] += t.amount;
    });
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      period,
      income,
      expense,
      net: income - expense,
      byCategory,
      transactionCount: transactions.length
    });
  } catch (err) {
    next(err);
  }
});

// Create transaction
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = transactionSchema.parse(req.body);
    
    let accountId = data.accountId;
    
    // If no account provided, use or create default "Cash" account
    if (!accountId) {
      let account = await retryQuery(() =>
        prisma.account.findFirst({
          where: {
            userId: req.userId,
            name: 'Cash'
          }
        })
      );
      
      if (!account) {
        account = await retryQuery(() =>
          prisma.account.create({
            data: {
              userId: req.userId,
              name: 'Cash',
              type: 'cash',
              balance: 0
            }
          })
        );
      }
      accountId = account.id;
    }
    
    // Verify account belongs to user
    const account = await retryQuery(() =>
      prisma.account.findFirst({
        where: {
          id: accountId,
          userId: req.userId
        }
      })
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Create transaction
    const transaction = await retryQuery(() =>
      prisma.transaction.create({
        data: {
          userId: req.userId,
          accountId: accountId,
          amount: data.amount,
          category: data.category,
          type: data.type,
          note: data.note,
          date: new Date(data.date)
        },
        include: { account: true }
      })
    );
    
    // Update account balance
    const newBalance = data.type === 'income' 
      ? account.balance + data.amount
      : account.balance - data.amount;
    
    await retryQuery(() =>
      prisma.account.update({
        where: { id: accountId },
        data: { balance: newBalance }
      })
    );
    
    res.status(201).json(transaction);
    
    // Check for budget alerts in background (don't wait for response)
    if (data.type === 'expense') {
      setImmediate(() => {
        checkBudgetAlerts(req.userId).catch(err => {
          console.error('Error checking budget alerts:', err);
        });
      });
    }
  } catch (err) {
    next(err);
  }
});

// Delete transaction
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const transaction = await retryQuery(() =>
      prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          userId: req.userId
        }
      })
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Revert account balance
    const account = await retryQuery(() =>
      prisma.account.findUnique({
        where: { id: transaction.accountId }
      })
    );
    
    const revertedBalance = transaction.type === 'income'
      ? account.balance - transaction.amount
      : account.balance + transaction.amount;
    
    await retryQuery(() =>
      prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: revertedBalance }
      })
    );
    
    // Delete transaction
    await prisma.transaction.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
