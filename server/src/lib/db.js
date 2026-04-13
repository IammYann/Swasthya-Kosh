import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with improved connection settings
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add event listeners for connection issues
prisma.$on('error', (e) => {
  console.error('Prisma error:', e.message);
});

// Handle graceful shutdown
async function disconnectPrisma() {
  try {
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
