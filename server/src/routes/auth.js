import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().optional(),
  weight: z.number().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        age: data.age,
        weight: data.weight
      }
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight
      }
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const passwordMatch = await bcrypt.compare(data.password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        weight: true,
        currency: true,
        profilePicture: true,
        createdAt: true
      }
    });
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update profile
router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, age, weight, profilePicture } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(age !== undefined && { age: age ? parseInt(age) : null }),
        ...(weight !== undefined && { weight: weight ? parseInt(weight) : null }),
        ...(profilePicture !== undefined && { profilePicture })
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        weight: true,
        currency: true,
        profilePicture: true,
        createdAt: true
      }
    });
    
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  const decoded = verifyAccessToken(refreshToken);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  const newAccessToken = generateAccessToken(decoded.userId);
  
  res.json({ accessToken: newAccessToken });
});

export default router;
