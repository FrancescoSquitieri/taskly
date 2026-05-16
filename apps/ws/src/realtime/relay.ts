import type { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { z } from 'zod';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '@repo/constants/socket';
import {
  TaskCreatedEventSchema,
  TaskDeletedEventSchema,
  TaskUpdatedEventSchema,
} from '@repo/schemas/socket';

import { env } from '@/config/env.js';
import { logger } from '@/lib/logger.js';

const CHANNEL = 'taskly:events';

const RelayEventSchema = z.object({
  event: z.string(),
  payload: z.unknown(),
});

export const startRedisRelay = (io: Server): Redis => {
  const subscriber = new Redis(env.REDIS_URL);

  subscriber.subscribe(CHANNEL).catch((err: unknown) => {
    logger.error({ err }, 'Failed to subscribe to Redis relay channel');
  });

  subscriber.on('message', (_channel: string, message: string) => {
    const envelope = RelayEventSchema.safeParse(JSON.parse(message));
    if (!envelope.success) {
      logger.warn({ message }, 'Invalid relay envelope');
      return;
    }
    const { event, payload } = envelope.data;

    switch (event) {
      case SOCKET_EVENTS.TASK_CREATED: {
        const parsed = TaskCreatedEventSchema.safeParse(payload);
        if (!parsed.success) return;
        io.to(SOCKET_ROOMS.tenant(parsed.data.tenantId)).emit(event, parsed.data);
        return;
      }
      case SOCKET_EVENTS.TASK_UPDATED: {
        const parsed = TaskUpdatedEventSchema.safeParse(payload);
        if (!parsed.success) return;
        io.to(SOCKET_ROOMS.tenant(parsed.data.tenantId)).emit(event, parsed.data);
        return;
      }
      case SOCKET_EVENTS.TASK_DELETED: {
        const parsed = TaskDeletedEventSchema.safeParse(payload);
        if (!parsed.success) return;
        io.to(SOCKET_ROOMS.tenant(parsed.data.tenantId)).emit(event, parsed.data);
        return;
      }
      default:
        logger.debug({ event }, 'Ignoring unknown relay event');
    }
  });

  return subscriber;
};
