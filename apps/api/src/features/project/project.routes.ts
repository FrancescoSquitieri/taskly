import { Router } from 'express';

import { asyncHandler } from '@/middleware/async-handler.js';
import { validate } from '@/middleware/validate.js';
import { verifyAuth } from '@/middleware/verify-auth.js';
import { projectController } from '@/features/project/project.controller.js';
import {
  createProjectBodySchema,
  projectIdParamsSchema,
} from '@/features/project/project.validation.js';

const router: Router = Router();
router.use(verifyAuth);

router.get('/', asyncHandler(projectController.list));
router.post(
  '/',
  validate({ body: createProjectBodySchema }),
  asyncHandler(projectController.create),
);
router.get(
  '/:id',
  validate({ params: projectIdParamsSchema }),
  asyncHandler(projectController.getById),
);

export const projectRouter = router;
