import { CreateProjectSchema } from '@repo/schemas/project';
import { z } from 'zod';

export const createProjectBodySchema = CreateProjectSchema;
export const projectIdParamsSchema = z.object({ id: z.string().uuid() });
