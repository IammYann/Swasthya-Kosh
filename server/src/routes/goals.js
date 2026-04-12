import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateLifeScore, getLatestLifeScore } from '../services/lifeScore.js';
import { getCorrelations, generateMonthlyNarrative } from '../services/insights.js';

const router = express.Router();

const goalSchema = z.object({
  type: z.string().min(1), // fitness, wealth, nutrition etc
  targetValue: z.number().positive(),
  currentValue: z.number().default(0),
  deadline: z.string().datetime(),
  status: z.enum(['active', 'completed', 'paused']).default('active')
});

// Get goals
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { deadline: 'asc' }
    });
    
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

// Create goal
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = goalSchema.parse(req.body);
    
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId,
        type: data.type,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        deadline: new Date(data.deadline),
        status: data.status
      }
    });
    
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
});

// Update goal
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const updated = await prisma.goal.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
