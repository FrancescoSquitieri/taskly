import { z } from 'zod';
import { CreateProjectSchema } from '@repo/schemas/project';

export const createProjectBodySchema = CreateProjectSchema;
export const projectIdParamsSchema = z.object({ id: z.string().uuid() });
