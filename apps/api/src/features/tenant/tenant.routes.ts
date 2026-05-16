import { USER_ROLES } from '@repo/constants/roles';
import { Router } from 'express';

import { tenantController } from '@/features/tenant/tenant.controller.js';
import {
  createInviteBodySchema,
  createWorkspaceBodySchema,
} from '@/features/tenant/tenant.validation.js';
import { asyncHandler } from '@/middleware/async-handler.js';
import { requireRole } from '@/middleware/require-role.js';
import { validate } from '@/middleware/validate.js';
import { verifyAuth } from '@/middleware/verify-auth.js';

const router: Router = Router();

router.use(verifyAuth);

router.get('/', asyncHandler(tenantController.list));

router.post(
  '/',
  validate({ body: createWorkspaceBodySchema }),
  asyncHandler(tenantController.create),
);

router.get('/current/members', asyncHandler(tenantController.listMembers));

router.post(
  '/current/invites',
  requireRole(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate({ body: createInviteBodySchema }),
  asyncHandler(tenantController.createInvite),
);

export const tenantRouter = router;
