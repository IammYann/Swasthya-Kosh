import cron from 'node-cron';
import { prisma } from '../lib/db.js';
import { createDailyDigest, createWeeklyDigest } from './notificationService.js';
import { retryQuery } from '../utils/queryRetry.js';

let scheduledJobs = {};

/**
 * Schedule daily digests for all users (runs at 9 AM daily)
 */
export function scheduleDailyDigests() {
  // Run every day at 9:00 AM
  const job = cron.schedule('0 9 * * *', async () => {
    console.log('[DIGEST] Starting daily digest scheduler...');
    
    try {
      // Get all users with daily digest enabled
      const users = await retryQuery(() =>
        prisma.user.findMany({
          where: {
            emailNotificationsEnabled: true,
            digestEmailFrequency: 'daily'
          },
          select: { id: true }
        })
      );

      console.log(`[DIGEST] Sending daily digests to ${users.length} users...`);

      for (const user of users) {
        try {
          await createDailyDigest(user.id);
          console.log(`[DIGEST] Daily digest sent to user ${user.id}`);
        } catch (err) {
          console.error(`[DIGEST] Failed to send daily digest to user ${user.id}:`, err);
        }
      }

      console.log('[DIGEST] Daily digest scheduler completed');
    } catch (err) {
      console.error('[DIGEST] Error in daily digest scheduler:', err);
    }
  });

  scheduledJobs.dailyDigests = job;
  console.log('[DIGEST] Daily digest scheduler initialized (runs daily at 9:00 AM)');
}

/**
 * Schedule weekly digests for all users (runs every Sunday at 10 AM)
 */
export function scheduleWeeklyDigests() {
  // Run every Sunday at 10:00 AM
  const job = cron.schedule('0 10 * * 0', async () => {
    console.log('[DIGEST] Starting weekly digest scheduler...');
    
    try {
      // Get all users with weekly digest enabled
      const users = await retryQuery(() =>
        prisma.user.findMany({
          where: {
            emailNotificationsEnabled: true,
            digestEmailFrequency: 'weekly'
          },
          select: { id: true }
        })
      );

      console.log(`[DIGEST] Sending weekly digests to ${users.length} users...`);

      for (const user of users) {
        try {
          await createWeeklyDigest(user.id);
          console.log(`[DIGEST] Weekly digest sent to user ${user.id}`);
        } catch (err) {
          console.error(`[DIGEST] Failed to send weekly digest to user ${user.id}:`, err);
        }
      }

      console.log('[DIGEST] Weekly digest scheduler completed');
    } catch (err) {
      console.error('[DIGEST] Error in weekly digest scheduler:', err);
    }
  });

  scheduledJobs.weeklyDigests = job;
  console.log('[DIGEST] Weekly digest scheduler initialized (runs every Sunday at 10:00 AM)');
}

/**
 * Start all schedulers
 */
export function startAllSchedulers() {
  console.log('[DIGEST] Initializing email digest schedulers...');
  scheduleDailyDigests();
  scheduleWeeklyDigests();
  console.log('[DIGEST] All schedulers initialized');
}

/**
 * Stop all schedulers (for graceful shutdown)
 */
export function stopAllSchedulers() {
  console.log('[DIGEST] Stopping all schedulers...');
  
  for (const [name, job] of Object.entries(scheduledJobs)) {
    if (job) {
      job.stop();
      job.destroy();
      console.log(`[DIGEST] Stopped scheduler: ${name}`);
    }
  }
  
  scheduledJobs = {};
  console.log('[DIGEST] All schedulers stopped');
}
