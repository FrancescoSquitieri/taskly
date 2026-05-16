import http from 'node:http';

import { env } from '@/config/env.js';
import { logger } from '@/lib/logger.js';
import { redis } from '@/lib/redis.js';
import { createSocketServer } from '@/realtime/socket-server.js';

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ ok: true, service: 'ws' }));
});

const io = createSocketServer(server);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'WS server listening');
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Shutting down WS server');
  await io.close();
  server.close();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
