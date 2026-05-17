import type { Request, Response } from 'express';

import { authRepository } from '@/features/auth/auth.repository.js';
import { authService } from '@/features/auth/auth.service.js';
import { ApiError } from '@/lib/api-error.js';
import { respondCreated, respondOk } from '@/lib/respond.js';

export const authController = {
  async register(req: Request, res: Response): Promise<Response> {
    const result = await authService.register(req.body);
    req.session.userId = result.userId;
    req.session.tenantId = result.tenantId;
    req.session.roles = result.roles;
    return respondCreated(res, { userId: result.userId, tenantId: result.tenantId });
  },

  async login(req: Request, res: Response): Promise<Response> {
    const result = await authService.login(req.body);
    req.session.userId = result.userId;
    req.session.tenantId = result.tenantId;
    req.session.roles = result.roles;
    return respondOk(res, { userId: result.userId, tenantId: result.tenantId });
  },

  async logout(req: Request, res: Response): Promise<Response> {
    const { userId, tenantId } = req.session;
    if (userId && tenantId) {
      await authService.recordLogout(userId, tenantId);
    }
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => (err ? reject(err) : resolve()));
    });
    res.clearCookie('taskly.sid');
    return respondOk(res, { ok: true });
  },

  async me(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const user = await authRepository.findUserById(req.user.userId);
    if (!user) {
      throw ApiError.unauthorized();
    }
    return respondOk(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tenantId: req.user.tenantId,
      roles: req.user.roles,
    });
  },

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    await authService.forgotPassword(req.body);
    return respondOk(res, { ok: true });
  },

  async resetPassword(req: Request, res: Response): Promise<Response> {
    await authService.resetPassword(req.body);
    return respondOk(res, { ok: true });
  },

  async verifyEmail(req: Request, res: Response): Promise<Response> {
    const result = await authService.verifyEmail(req.body);
    return respondOk(res, { ok: true, alreadyVerified: result.alreadyVerified });
  },

  async resendVerification(req: Request, res: Response): Promise<Response> {
    await authService.resendVerification(req.body);
    return respondOk(res, { ok: true });
  },

  async switchTenant(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const result = await authService.switchTenant(req.user.userId, req.body.tenantId);
    req.session.tenantId = result.tenantId;
    req.session.roles = [result.role];
    return respondOk(res, { tenantId: result.tenantId, roles: [result.role] });
  },

  async acceptInvite(req: Request, res: Response): Promise<Response> {
    const result = await authService.acceptInvite(req.body);
    req.session.userId = result.userId;
    req.session.tenantId = result.tenantId;
    req.session.roles = result.roles;
    return respondOk(res, {
      userId: result.userId,
      tenantId: result.tenantId,
      createdAccount: result.createdAccount,
    });
  },
};
