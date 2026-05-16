import { logger } from '@/lib/logger.js';
import { emailWorker } from '@/jobs/workers/email.worker.js';

logger.info('Starting BullMQ workers');

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Shutting down workers');
  await emailWorker.close();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
