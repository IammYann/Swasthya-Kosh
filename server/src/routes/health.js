import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Workout validation schema
const workoutSchema = z.object({
  type: z.string().min(1), // running, cycling, gym, yoga, sports etc
  durationMinutes: z.number().positive(),
  caloriesBurned: z.number().optional(),
  note: z.string().optional(),
  date: z.string().datetime()
});

// Get workouts
router.get('/workouts', authMiddleware, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    const where = { userId: req.userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    
    const workouts = await prisma.workoutLog.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    
    res.json(workouts);
  } catch (err) {
    next(err);
  }
});

// Create workout
router.post('/workouts', authMiddleware, async (req, res, next) => {
  try {
    const data = workoutSchema.parse(req.body);
    
    const workout = await prisma.workoutLog.create({
      data: {
        userId: req.userId,
        type: data.type,
        durationMinutes: data.durationMinutes,
        caloriesBurned: data.caloriesBurned,
        note: data.note,
        date: new Date(data.date)
      }
    });
    
    res.status(201).json(workout);
  } catch (err) {
    next(err);
  }
});

// Get steps
router.get('/steps', authMiddleware, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    const where = { userId: req.userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    
    const steps = await prisma.stepLog.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    
    res.json(steps);
  } catch (err) {
    next(err);
  }
});

// Log steps
router.post('/steps', authMiddleware, async (req, res, next) => {
  try {
    const { steps, date } = req.body;
    
    if (!steps || !date) {
      return res.status(400).json({ error: 'Steps and date required' });
    }
    
    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);
    
    // Check if already exists for this date
    const existing = await prisma.stepLog.findFirst({
      where: {
        userId: req.userId,
        date: parsedDate
      }
    });
    
    if (existing) {
      const updated = await prisma.stepLog.update({
        where: { id: existing.id },
        data: { steps }
      });
      return res.json(updated);
    }
    
    const stepLog = await prisma.stepLog.create({
      data: {
        userId: req.userId,
        steps,
        date: parsedDate
      }
    });
    
    res.status(201).json(stepLog);
  } catch (err) {
    next(err);
  }
});

// Get body metrics
router.get('/body-metrics', authMiddleware, async (req, res, next) => {
  try {
    const metrics = await prisma.bodyMetric.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

// Log body metric
router.post('/body-metrics', authMiddleware, async (req, res, next) => {
  try {
    const { weight, bmi, bodyFat, date } = req.body;
    
    if (!weight || !date) {
      return res.status(400).json({ error: 'Weight and date required' });
    }
    
    const metric = await prisma.bodyMetric.create({
      data: {
        userId: req.userId,
        weight,
        bmi,
        bodyFat,
        date: new Date(date)
      }
    });
    
    res.status(201).json(metric);
  } catch (err) {
    next(err);
  }
});

// Get nutrition logs
router.get('/nutrition', authMiddleware, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    const where = { userId: req.userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    
    const nutrition = await prisma.nutritionLog.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    
    res.json(nutrition);
  } catch (err) {
    next(err);
  }
});

// Log nutrition
router.post('/nutrition', authMiddleware, async (req, res, next) => {
  try {
    const { calories, protein, carbs, fat, mealName, date } = req.body;
    
    if (!calories || !date) {
      return res.status(400).json({ error: 'Calories and date required' });
    }
    
    const nutrition = await prisma.nutritionLog.create({
      data: {
        userId: req.userId,
        calories,
        protein,
        carbs,
        fat,
        mealName,
        date: new Date(date)
      }
    });
    
    res.status(201).json(nutrition);
  } catch (err) {
    next(err);
  }
});

export default router;
