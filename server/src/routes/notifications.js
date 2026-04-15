import express from 'express';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  checkBudgetAlerts, 
  checkGoalAchievements, 
  createDailyDigest, 
  createWeeklyDigest 
} from '../services/notificationService.js';
import { retryQuery } from '../utils/queryRetry.js';

const router = express.Router();

// Get all notifications for user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { read } = req.query;
    
    const where = { userId: req.userId };
    if (read === 'true' || read === 'false') {
      where.read = read === 'true';
    }
    
    const notifications = await retryQuery(() =>
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    );
    
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// Get unread notification count
router.get('/count/unread', authMiddleware, async (req, res, next) => {
  try {
    const count = await retryQuery(() =>
      prisma.notification.count({
        where: {
          userId: req.userId,
          read: false
        }
      })
    );
    
    res.json({ unreadCount: count });
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const notification = await retryQuery(() =>
      prisma.notification.findFirst({
        where: {
          id: req.params.id,
          userId: req.userId
        }
      })
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const updated = await retryQuery(() =>
      prisma.notification.update({
        where: { id: req.params.id },
        data: { read: true }
      })
    );
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
router.patch('/read/all', authMiddleware, async (req, res, next) => {
  try {
    await retryQuery(() =>
      prisma.notification.updateMany({
        where: {
          userId: req.userId,
          read: false
        },
        data: { read: true }
      })
    );
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const notification = await retryQuery(() =>
      prisma.notification.findFirst({
        where: {
          id: req.params.id,
          userId: req.userId
        }
      })
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    await retryQuery(() =>
      prisma.notification.delete({
        where: { id: req.params.id }
      })
    );
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Get email preferences
router.get('/preferences/email', authMiddleware, async (req, res, next) => {
  try {
    const user = await retryQuery(() =>
      prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          emailNotificationsEnabled: true,
          budgetAlertsEnabled: true,
          goalsNotificationsEnabled: true,
          digestEmailFrequency: true,
          lastDigestEmailSentAt: true
        }
      })
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update email preferences
router.patch('/preferences/email', authMiddleware, async (req, res, next) => {
  try {
    const {
      emailNotificationsEnabled,
      budgetAlertsEnabled,
      goalsNotificationsEnabled,
      digestEmailFrequency
    } = req.body;
    
    const updateData = {};
    
    if (emailNotificationsEnabled !== undefined) {
      updateData.emailNotificationsEnabled = emailNotificationsEnabled;
    }
    if (budgetAlertsEnabled !== undefined) {
      updateData.budgetAlertsEnabled = budgetAlertsEnabled;
    }
    if (goalsNotificationsEnabled !== undefined) {
      updateData.goalsNotificationsEnabled = goalsNotificationsEnabled;
    }
    if (digestEmailFrequency !== undefined) {
      if (!['daily', 'weekly', 'none'].includes(digestEmailFrequency)) {
        return res.status(400).json({ error: 'Invalid digestEmailFrequency' });
      }
      updateData.digestEmailFrequency = digestEmailFrequency;
    }
    
    const updated = await retryQuery(() =>
      prisma.user.update({
        where: { id: req.userId },
        data: updateData,
        select: {
          emailNotificationsEnabled: true,
          budgetAlertsEnabled: true,
          goalsNotificationsEnabled: true,
          digestEmailFrequency: true
        }
      })
    );
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Manual trigger: Check budget alerts (for current transaction context)
router.post('/check/budget-alerts', authMiddleware, async (req, res, next) => {
  try {
    const alerts = await checkBudgetAlerts(req.userId);
    res.json({ alerts: alerts || [], count: alerts?.length || 0 });
  } catch (err) {
    next(err);
  }
});

// Manual trigger: Check goal achievements (for current transaction context)
router.post('/check/goal-achievements', authMiddleware, async (req, res, next) => {
  try {
    const achievements = await checkGoalAchievements(req.userId);
    res.json({ achievements: achievements || [], count: achievements?.length || 0 });
  } catch (err) {
    next(err);
  }
});

// Manual trigger: Send daily digest (for testing)
router.post('/digest/daily', authMiddleware, async (req, res, next) => {
  try {
    const data = await createDailyDigest(req.userId);
    res.json({
      success: true,
      message: 'Daily digest email sent',
      data
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Manual trigger: Send weekly digest (for testing)
router.post('/digest/weekly', authMiddleware, async (req, res, next) => {
  try {
    const data = await createWeeklyDigest(req.userId);
    res.json({
      success: true,
      message: 'Weekly digest email sent',
      data
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
