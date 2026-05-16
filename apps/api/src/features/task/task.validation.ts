import { CreateTaskSchema, TaskListQuerySchema, UpdateTaskSchema } from '@repo/schemas/task';
import { z } from 'zod';

export const createTaskBodySchema = CreateTaskSchema;
export const updateTaskBodySchema = UpdateTaskSchema;
export const taskListQuerySchema = TaskListQuerySchema;
export const taskIdParamsSchema = z.object({ id: z.string().uuid() });
