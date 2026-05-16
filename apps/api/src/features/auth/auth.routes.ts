import { Router } from 'express';

import { authController } from '@/features/auth/auth.controller.js';
import {
  acceptInviteBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  switchTenantBodySchema,
} from '@/features/auth/auth.validation.js';
import { asyncHandler } from '@/middleware/async-handler.js';
import {
  forgotPasswordRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
} from '@/middleware/rate-limit.js';
import { validate } from '@/middleware/validate.js';
import { verifyAuth } from '@/middleware/verify-auth.js';

const router: Router = Router();

router.post(
  '/register',
  registerRateLimiter,
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

router.post(
  '/forgot-password',
  forgotPasswordRateLimiter,
  validate({ body: forgotPasswordBodySchema }),
  asyncHandler(authController.forgotPassword),
);

router.post(
  '/reset-password',
  validate({ body: resetPasswordBodySchema }),
  asyncHandler(authController.resetPassword),
);

router.post(
  '/switch-tenant',
  verifyAuth,
  validate({ body: switchTenantBodySchema }),
  asyncHandler(authController.switchTenant),
);

router.post(
  '/accept-invite',
  validate({ body: acceptInviteBodySchema }),
  asyncHandler(authController.acceptInvite),
);

export const authRouter = router;
