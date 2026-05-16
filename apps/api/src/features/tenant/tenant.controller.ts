import type { Request, Response } from 'express';

import { tenantService } from '@/features/tenant/tenant.service.js';
import { ApiError } from '@/lib/api-error.js';
import { respondCreated, respondOk } from '@/lib/respond.js';

export const tenantController = {
  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const workspaces = await tenantService.listForUser(req.user.userId);
    return respondOk(res, { workspaces });
  },

  async create(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const workspace = await tenantService.create(req.body, req.user.userId);
    return respondCreated(res, { workspace });
  },

  async listMembers(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const members = await tenantService.listMembers(req.user.tenantId);
    return respondOk(res, { members });
  },

  async createInvite(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const result = await tenantService.createInvite({
      input: req.body,
      tenantId: req.user.tenantId,
      inviterUserId: req.user.userId,
    });
    return respondCreated(res, { acceptUrl: result.acceptUrl });
  },
};
