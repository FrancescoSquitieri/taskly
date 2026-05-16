import { pino } from 'pino';

import { env } from '@/config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: ['*.password', '*.passwordHash', 'headers.cookie'],
    censor: '[REDACTED]',
  },
});
