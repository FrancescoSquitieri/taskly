import rateLimit from 'express-rate-limit';
import RedisStore, { type RedisReply } from 'rate-limit-redis';
import { RATE_LIMITS } from '@repo/constants/limits';

import { redis } from '@/lib/redis.js';

const sendCommand = (...args: string[]): Promise<RedisReply> => {
  const [command = 'PING', ...rest] = args;
  return redis.call(command, ...rest) as Promise<RedisReply>;
};

export const globalRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: RATE_LIMITS.GLOBAL_PER_MINUTE,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({ sendCommand, prefix: 'rl:global:' }),
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: RATE_LIMITS.LOGIN_PER_15_MIN,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({ sendCommand, prefix: 'rl:login:' }),
});
