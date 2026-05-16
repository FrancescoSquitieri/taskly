import type { Request, Response } from 'express';

import { ApiError } from '@/lib/api-error.js';
import { respondCreated, respondOk, respondPaginated } from '@/lib/respond.js';
import { taskService } from '@/features/task/task.service.js';

const requireTenant = (req: Request): string => {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.tenantId;
};

export const taskController = {
  async list(req: Request, res: Response): Promise<Response> {
    const result = await taskService.list(requireTenant(req), req.query as never);
    return respondPaginated(res, result);
  },

  async getById(req: Request, res: Response): Promise<Response> {
    const task = await taskService.getById(requireTenant(req), req.params.id as string);
    return respondOk(res, task);
  },

  async create(req: Request, res: Response): Promise<Response> {
    const task = await taskService.create(requireTenant(req), req.body);
    return respondCreated(res, task);
  },

  async update(req: Request, res: Response): Promise<Response> {
    const task = await taskService.update(
      requireTenant(req),
      req.params.id as string,
      req.body,
    );
    return respondOk(res, task);
  },

  async remove(req: Request, res: Response): Promise<Response> {
    await taskService.remove(requireTenant(req), req.params.id as string);
    return res.status(204).send();
  },
};
