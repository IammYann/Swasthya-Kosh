import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with improved connection settings
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

export let prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Track active queries - PROPERLY track ALL query types using middleware
let activeQueries = 0;
const queryTimeout = 3 * 60 * 1000; // 3 minutes for complex queries like Life Score calculation

// Use Prisma middleware to track ALL query types (findMany, create, update, etc)
prisma.$use(async (params, next) => {
  activeQueries++;
  const start = Date.now();
  
  try {
    const result = await next(params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      console.log(`Slow query (${duration}ms):`, {
        model: params.model,
        action: params.action,
        duration
      });
    }
    
    return result;
  } catch (err) {
    console.error(`Query error after ${Date.now() - start}ms:`, {
      model: params.model,
      action: params.action,
      error: err.message
    });
    throw err;
  } finally {
    activeQueries--;
  }
});

// Add event listeners for connection issues
prisma.$on('error', (e) => {
  console.error('Prisma error:', e.message);
  console.error('Active queries at error:', activeQueries);
});

// Reconnection handler
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 15;
const RECONNECT_DELAY = 4000;

async function reconnectDatabase() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached. Exiting...');
    process.exit(1);
  }

  reconnectAttempts++;
  console.log(
    `Attempting to reconnect to database (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
  );

  try {
    await prisma.$disconnect();
    console.log('Disconnected old Prisma client');
  } catch (err) {
    console.error('Error disconnecting during reconnect:', err.message);
  }

  await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));

  try {
    prisma = createPrismaClient();
    
    // Reapply middleware after reconnection
    prisma.$use(async (params, next) => {
      activeQueries++;
      try {
        return await next(params);
      } finally {
        activeQueries--;
      }
    });
    
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection test timeout')), 10000))
    ]);
    reconnectAttempts = 0;
    console.log('Database reconnected successfully');
    setupHealthCheck();
  } catch (err) {
    console.error('Reconnection failed:', err.message);
    await reconnectDatabase();
  }
}

// Health check with smart timing
let healthCheckInterval;
let lastHealthCheckTime = Date.now();

function setupHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  healthCheckInterval = setInterval(async () => {
    // Skip health check if there are active queries (let them finish)
    if (activeQueries > 0) {
      console.log(`Skipping health check: ${activeQueries} active queries`);
      return;
    }

    try {
      const startTime = Date.now();
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 5000))
      ]);
      const duration = Date.now() - startTime;
      lastHealthCheckTime = Date.now();
      console.log(`Health check passed (${duration}ms)`);
    } catch (err) {
      console.error('Connection health check failed:', err.message);
      console.error('Time since last successful check:', Date.now() - lastHealthCheckTime, 'ms');
      clearInterval(healthCheckInterval);
      await reconnectDatabase();
    }
  }, 30000); // Check every 30 seconds
}

setupHealthCheck();

// Handle graceful shutdown
async function disconnectPrisma() {
  try {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }
    console.log('Disconnecting Prisma. Active queries:', activeQueries);
    await prisma.$disconnect();
    console.log('Prisma disconnected gracefully');
  } catch (err) {
    console.error('Error during Prisma disconnect:', err);
    process.exit(1);
  }
}

process.on('SIGINT', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);
process.on('exit', disconnectPrisma);
