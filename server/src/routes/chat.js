import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

const SYSTEM_PROMPT = `You are Swasthya Kosh AI — a bilingual (Nepali + English) personal health and wealth coach built specifically for Nepali users. You have access to aggregated data about the user's financial health and fitness activities.

Your personality: warm, encouraging, like a knowledgeable Nepali दाजु/दिदी (elder sibling). Use a mix of Nepali and English (Nepali script preferred for emotional/encouraging messages, English for technical details). Use NPR (रु) for all currency.

Your capabilities:
1. Answer questions about the user's financial summary and health activities
2. Identify patterns in their behavior ("You've been consistent with workouts this week!")
3. Give personalized advice based on trends
4. Calculate and explain the Life Score
5. Set goals and suggest tracking progress
6. Send motivational nudges in Nepali

Keep responses brief (2–4 sentences unless detailed info requested). Be data-driven and warm, never preachy.
Always provide actionable advice. Reference Nepali context naturally (dal bhat, chai breaks, Dakshain spending patterns, etc).`;

// Post message to chat
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // Get user's recent data for context
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: { gte: thirtyDaysAgo }
      }
    });
    
    const workouts = await prisma.workoutLog.count({
      where: {
        userId: req.userId,
        date: { gte: thirtyDaysAgo }
      }
    });
    
    const stepLogs = await prisma.stepLog.findMany({
      where: {
        userId: req.userId,
        date: { gte: thirtyDaysAgo }
      }
    });
    
    const avgSteps = stepLogs.length > 0
      ? (stepLogs.reduce((sum, log) => sum + log.steps, 0) / stepLogs.length).toFixed(0)
      : 0;
    
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    const userContext = `User "${user.name}" (age ${user.age}, weight ${user.weight}kg). Last 30 days: ${workouts} workouts, avg ${avgSteps} steps/day, earned रु ${income}, spent रु ${expense}.`;
    
    // Set response header for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    
    // Stream response from Claude
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${userContext}\n\nUser message: ${message}`
        }
      ],
      system: SYSTEM_PROMPT
    });
    
    // Send tokens as they arrive
    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ token: text })}\n\n`);
    });
    
    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      res.end();
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    next(err);
  }
});

export default router;
