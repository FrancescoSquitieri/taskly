import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma.js';

export const authRepository = {
  findUserByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findUserById: (id: string) => prisma.user.findUnique({ where: { id } }),

  createUserWithTenant: async (params: {
    email: string;
    name: string;
    passwordHash: string;
    tenantName: string;
    tenantSlug: string;
  }) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: { name: params.tenantName, slug: params.tenantSlug },
      });
      const user = await tx.user.create({
        data: {
          email: params.email,
          name: params.name,
          passwordHash: params.passwordHash,
        },
      });
      await tx.membership.create({
        data: { userId: user.id, tenantId: tenant.id, role: 'OWNER' },
      });
      return { user, tenant };
    }),

  findMembership: (userId: string, tenantId: string) =>
    prisma.membership.findUnique({ where: { userId_tenantId: { userId, tenantId } } }),

  findFirstMembershipForUser: (userId: string) =>
    prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    }),

  updatePassword: (userId: string, passwordHash: string) =>
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),

  markEmailVerified: (userId: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    }),
};
