import type { Prisma } from '@prisma/client';
import type { AuditAction } from '@repo/constants/audit';

import { logger } from '@/lib/logger.js';
import { prisma } from '@/lib/prisma.js';

export interface AuditEvent {
  tenantId: string;
  actorId?: string | null;
  action: AuditAction;
  target?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export const auditService = {
  /**
   * Persists an audit log entry. Failures are logged but do not throw —
   * audit is a side concern and must never break the primary flow.
   */
  record: async (event: AuditEvent): Promise<void> => {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: event.tenantId,
          actorId: event.actorId ?? null,
          action: event.action,
          target: event.target ?? null,
          metadata: event.metadata,
        },
      });
    } catch (error) {
      logger.error({ err: error, event }, 'Failed to record audit log');
    }
  },
};
