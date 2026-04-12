import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const budgetSchema = z.object({
  category: z.string().min(1),
  limitAmount: z.number().positive(),
  period: z.enum(['daily', 'weekly', 'monthly'])
});

// Get all budgets for user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId }
    });
    
    res.json(budgets);
  } catch (err) {
    next(err);
  }
});

// Create budget
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = budgetSchema.parse(req.body);
    
    const budget = await prisma.budget.create({
      data: {
        userId: req.userId,
        category: data.category,
        limitAmount: data.limitAmount,
        period: data.period
      }
    });
    
    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
});

// Update budget
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    const updated = await prisma.budget.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete budget
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    await prisma.budget.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
