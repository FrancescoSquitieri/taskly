import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma.js';

export const taskRepository = {
  findManyByTenant: (
    tenantId: string,
    filters: { projectId?: string; status?: string; assigneeId?: string; take: number },
  ) =>
    prisma.task.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.status
          ? { status: filters.status as Prisma.EnumTaskStatusFilter['equals'] }
          : {}),
        ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take,
    }),

  findById: (tenantId: string, id: string) =>
    prisma.task.findFirst({ where: { id, tenantId, deletedAt: null } }),

  create: (data: Prisma.TaskUncheckedCreateInput) => prisma.task.create({ data }),

  update: (tenantId: string, id: string, data: Prisma.TaskUncheckedUpdateInput) =>
    prisma.task.updateMany({ where: { id, tenantId, deletedAt: null }, data }),

  softDelete: (tenantId: string, id: string) =>
    prisma.task.updateMany({
      where: { id, tenantId, deletedAt: null },
      data: { deletedAt: new Date() },
    }),
};
