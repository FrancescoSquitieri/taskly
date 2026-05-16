import type { LoginInput, RegisterInput } from '@repo/schemas/auth';
import { slugify } from '@repo/utils';
import bcrypt from 'bcrypt';

import { authRepository } from '@/features/auth/auth.repository.js';
import { ApiError } from '@/lib/api-error.js';

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
    return {
      userId: user.id,
      tenantId: membership.tenantId,
      roles: [membership.role],
    };
  },
};
