import session from 'express-session';
import { RedisStore } from 'connect-redis';

import { env } from '@/config/env.js';
import { redis } from '@/lib/redis.js';

export const sessionMiddleware = session({
  store: new RedisStore({ client: redis, prefix: 'session:' }),
  name: 'taskly.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
});
