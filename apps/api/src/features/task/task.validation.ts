import { z } from 'zod';
import {
  CreateTaskSchema,
  TaskListQuerySchema,
  UpdateTaskSchema,
} from '@repo/schemas/task';

export const createTaskBodySchema = CreateTaskSchema;
export const updateTaskBodySchema = UpdateTaskSchema;
export const taskListQuerySchema = TaskListQuerySchema;
export const taskIdParamsSchema = z.object({ id: z.string().uuid() });
