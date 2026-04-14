import express from 'express';
import { prisma } from '../lib/db.js';

const router = express.Router();

/**
 * GET /api/diagnostics/health
 * Check database and system health
 */
router.get('/health', async (req, res, next) => {
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      error: 'Database connection failed',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/diagnostics/db-info
 * Get database connection information
 */
router.get('/db-info', async (req, res, next) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        datname as database,
        usename as user,
        application_name,
        state,
        query_start,
        backend_start
      FROM pg_stat_activity
      WHERE datname = current_database()
      ORDER BY backend_start DESC
    `;

    res.json({
      connections: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
