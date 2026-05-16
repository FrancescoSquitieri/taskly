import { Router } from 'express';

import { prisma } from '@/lib/prisma.js';
import { redis } from '@/lib/redis.js';
import { respondOk } from '@/lib/respond.js';
import { asyncHandler } from '@/middleware/async-handler.js';

const router: Router = Router();

router.get(
  '/healthz',
  asyncHandler(async (_req, res) => {
    return respondOk(res, { status: 'ok', uptime: process.uptime() });
  }),
);

router.get(
  '/readyz',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    return respondOk(res, { status: 'ready' });
  }),
);

export const healthRouter = router;
