import { AUDIT_ACTIONS, TOKEN_TTL_SECONDS } from '@repo/constants/audit';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@repo/schemas/auth';
import { slugify } from '@repo/utils';
import bcrypt from 'bcrypt';

import { authRepository } from '@/features/auth/auth.repository.js';
import { env } from '@/config/env.js';
import {
  enqueuePasswordResetEmail,
  enqueueWelcomeEmail,
} from '@/jobs/queues/email.queue.js';
import { ApiError } from '@/lib/api-error.js';
import { auditService } from '@/lib/audit.js';
import { logger } from '@/lib/logger.js';
import { tokenUtils } from '@/lib/tokens.js';

const BCRYPT_COST = 12;

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  roles: string[];
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthenticatedUser> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const tenantSlug = `${slugify(input.tenantName)}-${Date.now().toString(36)}`;
    const { user, tenant } = await authRepository.createUserWithTenant({
      email: input.email,
      name: input.name,
      passwordHash,
      tenantName: input.tenantName,
      tenantSlug,
    });

    await auditService.record({
      tenantId: tenant.id,
      actorId: user.id,
      action: AUDIT_ACTIONS.AUTH_REGISTER,
      target: user.id,
    });
    await auditService.record({
      tenantId: tenant.id,
      actorId: user.id,
      action: AUDIT_ACTIONS.WORKSPACE_CREATED,
      target: tenant.id,
      metadata: { slug: tenant.slug },
    });
    await enqueueWelcomeEmail({
      tenantId: tenant.id,
      to: user.email,
      userName: user.name,
      workspaceName: tenant.name,
    });

    return { userId: user.id, tenantId: tenant.id, roles: ['OWNER'] };
  },

  async login(input: LoginInput): Promise<AuthenticatedUser> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    const membership = await authRepository.findFirstMembershipForUser(user.id);
    if (!membership) {
      throw ApiError.forbidden('User has no tenant membership');
    }

    await auditService.record({
      tenantId: membership.tenantId,
      actorId: user.id,
      action: AUDIT_ACTIONS.AUTH_LOGIN,
      target: user.id,
    });

    return {
      userId: user.id,
      tenantId: membership.tenantId,
      roles: [membership.role],
    };
  },

  async recordLogout(userId: string, tenantId: string): Promise<void> {
    await auditService.record({
      tenantId,
      actorId: userId,
      action: AUDIT_ACTIONS.AUTH_LOGOUT,
      target: userId,
    });
  },

  /**
   * Always responds successfully (whether or not the email exists) to avoid
   * enumerating accounts. When the email maps to a user, we enqueue the reset
   * email out-of-band.
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      logger.info({ email: input.email }, 'forgot-password: no user (silent success)');
      return;
    }
    const membership = await authRepository.findFirstMembershipForUser(user.id);
    if (!membership) {
      return;
    }
    const token = tokenUtils.signPasswordReset(
      { userId: user.id, email: user.email },
      TOKEN_TTL_SECONDS.PASSWORD_RESET,
    );
    const resetUrl = `${env.WEB_ORIGIN}/reset-password?token=${encodeURIComponent(token)}`;
    await enqueuePasswordResetEmail({
      tenantId: membership.tenantId,
      to: user.email,
      userName: user.name,
      resetUrl,
    });
    await auditService.record({
      tenantId: membership.tenantId,
      actorId: user.id,
      action: AUDIT_ACTIONS.AUTH_PASSWORD_RESET_REQUESTED,
      target: user.id,
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    let payload: ReturnType<typeof tokenUtils.verifyPasswordReset>;
    try {
      payload = tokenUtils.verifyPasswordReset(input.token);
    } catch (error) {
      logger.warn({ err: error }, 'reset-password: invalid token');
      throw ApiError.badRequest('Invalid or expired reset token');
    }
    const user = await authRepository.findUserById(payload.userId);
    if (!user || user.email !== payload.email) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    await authRepository.updatePassword(user.id, passwordHash);
    const membership = await authRepository.findFirstMembershipForUser(user.id);
    if (membership) {
      await auditService.record({
        tenantId: membership.tenantId,
        actorId: user.id,
        action: AUDIT_ACTIONS.AUTH_PASSWORD_RESET_COMPLETED,
        target: user.id,
      });
    }
  },

  async switchTenant(userId: string, tenantId: string): Promise<{ tenantId: string; role: string }> {
    const membership = await authRepository.findMembership(userId, tenantId);
    if (!membership) {
      throw ApiError.forbidden('You are not a member of this workspace');
    }
    await auditService.record({
      tenantId: membership.tenantId,
      actorId: userId,
      action: AUDIT_ACTIONS.AUTH_TENANT_SWITCHED,
      target: tenantId,
    });
    return { tenantId: membership.tenantId, role: membership.role };
  },
};
