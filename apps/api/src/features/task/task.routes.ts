import { Router } from 'express';

import { taskController } from '@/features/task/task.controller.js';
import {
  createTaskBodySchema,
  taskIdParamsSchema,
  taskListQuerySchema,
  updateTaskBodySchema,
} from '@/features/task/task.validation.js';
import { asyncHandler } from '@/middleware/async-handler.js';
import { validate } from '@/middleware/validate.js';
import { verifyAuth } from '@/middleware/verify-auth.js';

const router: Router = Router();

router.use(verifyAuth);

router.get('/', validate({ query: taskListQuerySchema }), asyncHandler(taskController.list));
router.post('/', validate({ body: createTaskBodySchema }), asyncHandler(taskController.create));
router.get('/:id', validate({ params: taskIdParamsSchema }), asyncHandler(taskController.getById));
router.patch(
  '/:id',
  validate({ params: taskIdParamsSchema, body: updateTaskBodySchema }),
  asyncHandler(taskController.update),
);
router.delete(
  '/:id',
  validate({ params: taskIdParamsSchema }),
  asyncHandler(taskController.remove),
);

export const taskRouter = router;
