import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const accountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['cash', 'bank', 'esewa', 'khalti', 'other']),
  balance: z.number().default(0)
});

// Get all accounts
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId }
    });
    
    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

// Create account
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = accountSchema.parse(req.body);
    
    const account = await prisma.account.create({
      data: {
        userId: req.userId,
        name: data.name,
        type: data.type,
        balance: data.balance
      }
    });
    
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
});

// Update account
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const updated = await prisma.account.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete account
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    await prisma.account.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
