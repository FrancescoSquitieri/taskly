import { ROLE_RANK, type UserRoleName } from '@repo/constants/roles';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/lib/api-error.js';

const hasAnyRole = (userRoles: readonly string[], allowed: readonly UserRoleName[]): boolean =>
  userRoles.some((r) => (allowed as readonly string[]).includes(r));

const hasMinRole = (userRoles: readonly string[], minRole: UserRoleName): boolean => {
  const minRank = ROLE_RANK[minRole];
  return userRoles.some((r) => {
    const rank = ROLE_RANK[r as UserRoleName];
    return typeof rank === 'number' && rank >= minRank;
  });
};

/**
 * Allows the request through only if `req.user.roles` contains at least one of the
 * supplied roles. Assumes `verifyAuth` has run earlier in the chain.
 */
export const requireRole =
  (...allowed: UserRoleName[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (allowed.length === 0 || hasAnyRole(req.user.roles, allowed)) {
      next();
      return;
    }
    next(ApiError.forbidden());
  };

/**
 * Allows the request through only if one of the user's roles ranks at or above
 * `minRole`. Useful for hierarchical checks like "ADMIN or higher".
 */
export const requireMinRole =
  (minRole: UserRoleName) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (hasMinRole(req.user.roles, minRole)) {
      next();
      return;
    }
    next(ApiError.forbidden());
  };
