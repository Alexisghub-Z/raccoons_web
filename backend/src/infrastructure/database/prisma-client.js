import { PrismaClient } from '@prisma/client';
import logger from '../../shared/logger/index.js';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' }
  ]
});

prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query}`, { duration: `${e.duration}ms` });
});

prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma warning:', e);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
