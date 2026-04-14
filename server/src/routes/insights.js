import express from 'express';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateLifeScore, getLatestLifeScore } from '../services/lifeScore.js';
import { getCorrelations, generateMonthlyNarrative } from '../services/insights.js';
import { retryQuery } from '../utils/queryRetry.js';

const router = express.Router();

// Get latest life score
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const lifeScore = await getLatestLifeScore(req.userId);
    
    if (!lifeScore) {
      // Calculate if doesn't exist
      const calculated = await calculateLifeScore(req.userId);
      return res.json(calculated);
    }
    
    res.json(lifeScore);
  } catch (err) {
    next(err);
  }
});

// Recalculate life score
router.post('/recalculate', authMiddleware, async (req, res, next) => {
  try {
    const lifeScore = await calculateLifeScore(req.userId);
    res.json(lifeScore);
  } catch (err) {
    next(err);
  }
});

// Get life score history
router.get('/history/:days', authMiddleware, async (req, res, next) => {
  try {
    const { days } = req.params;
    const daysBack = parseInt(days) || 30;
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    
    const history = await retryQuery(() =>
      prisma.lifeScore.findMany({
        where: {
          userId: req.userId,
          date: { gte: since }
        },
        orderBy: { date: 'asc' }
      })
    );
    
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// Get correlations/insights
router.get('/correlations', authMiddleware, async (req, res, next) => {
  try {
    const correlations = await getCorrelations(req.userId);
    const narrative = await generateMonthlyNarrative(req.userId);
    
    res.json({
      narrative,
      insights: correlations
    });
  } catch (err) {
    next(err);
  }
});

export default router;
