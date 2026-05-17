import { Router } from 'express';

import { authController } from '@/features/auth/auth.controller.js';
import {
  acceptInviteBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resendVerificationBodySchema,
  resetPasswordBodySchema,
  switchTenantBodySchema,
  verifyEmailBodySchema,
} from '@/features/auth/auth.validation.js';
import { asyncHandler } from '@/middleware/async-handler.js';
import {
  forgotPasswordRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  resendVerificationRateLimiter,
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

router.post(
  '/verify-email',
  validate({ body: verifyEmailBodySchema }),
  asyncHandler(authController.verifyEmail),
);

router.post(
  '/resend-verification',
  resendVerificationRateLimiter,
  validate({ body: resendVerificationBodySchema }),
  asyncHandler(authController.resendVerification),
);

export const authRouter = router;
