import http from 'node:http';

import { createApp } from '@/app.js';
import { env } from '@/config/env.js';
import { logger } from '@/lib/logger.js';
import { prisma } from '@/lib/prisma.js';
import { redis } from '@/lib/redis.js';

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'API listening');
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Shutting down API');
  server.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
