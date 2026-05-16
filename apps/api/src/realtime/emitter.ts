import { SOCKET_EVENTS } from '@repo/constants/socket';
import type { TaskCreatedEvent, TaskDeletedEvent, TaskUpdatedEvent } from '@repo/schemas/socket';
import { Redis } from 'ioredis';

import { env } from '@/config/env.js';
import { logger } from '@/lib/logger.js';

const publisher = new Redis(env.REDIS_URL);
const CHANNEL = 'taskly:events';

interface OutboundEvent<TPayload> {
  event: string;
  payload: TPayload;
}

const publish = async <TPayload>(event: OutboundEvent<TPayload>): Promise<void> => {
  try {
    await publisher.publish(CHANNEL, JSON.stringify(event));
  } catch (err) {
    logger.error({ err, event: event.event }, 'Failed to publish realtime event');
  }
};

export const taskRealtime = {
  emitCreated: (payload: TaskCreatedEvent) =>
    publish({ event: SOCKET_EVENTS.TASK_CREATED, payload }),
  emitUpdated: (payload: TaskUpdatedEvent) =>
    publish({ event: SOCKET_EVENTS.TASK_UPDATED, payload }),
  emitDeleted: (payload: TaskDeletedEvent) =>
    publish({ event: SOCKET_EVENTS.TASK_DELETED, payload }),
};
