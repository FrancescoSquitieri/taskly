import { Redis } from 'ioredis';

import { env } from '@/config/env.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: false,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
});

export const redisQueueConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const redisKeys = {
  session: (sessionId: string): string => `session:${sessionId}`,
  rateLimit: (bucket: string, identifier: string): string => `rl:${bucket}:${identifier}`,
  cache: (tenantId: string, resource: string, id: string): string =>
    `cache:${tenantId}:${resource}:${id}`,
} as const;
