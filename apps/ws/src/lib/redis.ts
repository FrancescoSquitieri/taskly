import { Redis } from 'ioredis';

import { env } from '@/config/env.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: false,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
});

export const pubClient = redis.duplicate();
export const subClient = redis.duplicate();
