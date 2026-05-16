import { Router } from 'express';

import { authController } from '@/features/auth/auth.controller.js';
import { loginBodySchema, registerBodySchema } from '@/features/auth/auth.validation.js';
import { asyncHandler } from '@/middleware/async-handler.js';
import { loginRateLimiter } from '@/middleware/rate-limit.js';
import { validate } from '@/middleware/validate.js';
import { verifyAuth } from '@/middleware/verify-auth.js';

const router: Router = Router();

router.post(
  '/register',
  validate({ body: registerBodySchema }),
  asyncHandler(authController.register),
);

router.post(
  '/login',
  loginRateLimiter,
  validate({ body: loginBodySchema }),
  asyncHandler(authController.login),
);

router.post('/logout', asyncHandler(authController.logout));
router.get('/me', verifyAuth, asyncHandler(authController.me));

export const authRouter = router;
