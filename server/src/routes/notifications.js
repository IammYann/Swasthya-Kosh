import express from 'express';
import { prisma } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  checkBudgetAlerts, 
  checkGoalAchievements, 
  createDailyDigest, 
  createWeeklyDigest 
} from '../services/notificationService.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';
import { retryQuery } from '../utils/queryRetry.js';

const router = express.Router();

// PUBLIC: Send welcome email (no authentication required)
router.post('/send-welcome-email', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    // Send welcome email
    const { htmlContent, textContent } = emailTemplates.welcome(email);
    await sendEmail(email, 'Welcome to Svasthya Kosh - Start Your Health & Wealth Journey', htmlContent, textContent);

    res.json({
      success: true,
      message: `Welcome email sent successfully to ${email}`,
      email: email
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    res.status(400).json({
      error: 'Failed to send welcome email',
      details: error.message
    });
  }
});

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

// Send test email to user's account
router.post('/send-test-email', authMiddleware, async (req, res, next) => {
  try {
    const user = await retryQuery(() =>
      prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, email: true, name: true }
      })
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4caf50; margin-bottom: 20px;">✓ Test Email</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi <strong>${user.name}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            This is a test email to verify that your email notifications are working correctly.
          </p>
          
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #2e7d32; font-size: 16px;">
              ✓ Email system is functioning properly!
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You will now receive notifications for:
          </p>
          
          <ul style="color: #666; font-size: 15px; line-height: 1.8;">
            <li>Budget alerts when spending approaches your limits</li>
            <li>Goal achievement notifications</li>
            <li>Daily and weekly digest summaries</li>
          </ul>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            You can manage your email preferences in your account settings.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            This is an automated test email from Svasthya Kosh. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
    `;

    const textContent = `
Test Email

Hi ${user.name},

This is a test email to verify that your email notifications are working correctly.

✓ Email system is functioning properly!

You will now receive notifications for:
- Budget alerts when spending approaches your limits
- Goal achievement notifications
- Daily and weekly digest summaries

You can manage your email preferences in your account settings.
    `;

    await sendEmail(user.email, 'Test Email - Svasthya Kosh', htmlContent, textContent);

    res.json({
      success: true,
      message: `Test email sent successfully to ${user.email}`,
      email: user.email
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    res.status(400).json({
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

export default router;
