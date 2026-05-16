import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma.js';

export const projectRepository = {
  findManyByTenant: (tenantId: string) =>
    prisma.project.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),

  findById: (tenantId: string, id: string) =>
    prisma.project.findFirst({ where: { id, tenantId, deletedAt: null } }),

  create: (data: Prisma.ProjectUncheckedCreateInput) => prisma.project.create({ data }),
};
