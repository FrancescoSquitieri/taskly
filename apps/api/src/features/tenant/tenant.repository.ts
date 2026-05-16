import type { MembershipRole, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma.js';

export const tenantRepository = {
  listWorkspacesForUser: (userId: string) =>
    prisma.membership.findMany({
      where: { userId },
      include: { tenant: true },
      orderBy: { createdAt: 'asc' },
    }),

  findTenantById: (tenantId: string) => prisma.tenant.findUnique({ where: { id: tenantId } }),

  findTenantBySlug: (slug: string) => prisma.tenant.findUnique({ where: { slug } }),

  createTenantWithOwner: async (params: {
    name: string;
    slug: string;
    ownerUserId: string;
  }) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: { name: params.name, slug: params.slug },
      });
      const membership = await tx.membership.create({
        data: { userId: params.ownerUserId, tenantId: tenant.id, role: 'OWNER' },
      });
      return { tenant, membership };
    }),

  listMembersForTenant: (tenantId: string) =>
    prisma.membership.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    }),

  upsertMembership: (params: { userId: string; tenantId: string; role: MembershipRole }) =>
    prisma.membership.upsert({
      where: { userId_tenantId: { userId: params.userId, tenantId: params.tenantId } },
      create: params,
      update: { role: params.role },
    }),

  createUserAndMembership: async (params: {
    email: string;
    name: string;
    passwordHash: string;
    tenantId: string;
    role: MembershipRole;
  }) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: params.email,
          name: params.name,
          passwordHash: params.passwordHash,
          emailVerifiedAt: new Date(),
        },
      });
      const membership = await tx.membership.create({
        data: { userId: user.id, tenantId: params.tenantId, role: params.role },
      });
      return { user, membership };
    }),
};
