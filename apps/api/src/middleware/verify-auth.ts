import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/lib/api-error.js';

export const verifyAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.session || !req.session.userId || !req.session.tenantId) {
    next(ApiError.unauthorized());
    return;
  }
  req.user = {
    userId: req.session.userId,
    tenantId: req.session.tenantId,
    roles: req.session.roles ?? [],
  };
  next();
};
