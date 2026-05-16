import type { Request, Response } from 'express';

import { projectService } from '@/features/project/project.service.js';
import { ApiError } from '@/lib/api-error.js';
import { respondCreated, respondOk } from '@/lib/respond.js';

const requireTenant = (req: Request): string => {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.tenantId;
};

export const projectController = {
  async list(req: Request, res: Response): Promise<Response> {
    return respondOk(res, { items: await projectService.list(requireTenant(req)) });
  },

  async getById(req: Request, res: Response): Promise<Response> {
    return respondOk(
      res,
      await projectService.getById(requireTenant(req), req.params.id as string),
    );
  },

  async create(req: Request, res: Response): Promise<Response> {
    return respondCreated(res, await projectService.create(requireTenant(req), req.body));
  },
};
