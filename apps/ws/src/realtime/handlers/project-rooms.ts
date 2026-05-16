import { SOCKET_EVENTS, SOCKET_ROOMS } from '@repo/constants/socket';
import { JoinProjectRoomSchema } from '@repo/schemas/socket';
import type { Server, Socket } from 'socket.io';

import { logger } from '@/lib/logger.js';

export const registerProjectRoomHandlers = (_io: Server, socket: Socket): void => {
  socket.on(SOCKET_EVENTS.PROJECT_JOIN, async (payload, ack) => {
    const parsed = JoinProjectRoomSchema.safeParse(payload);
    if (!parsed.success) {
      ack?.({ ok: false, error: 'invalid_payload' });
      return;
    }
    const tenantId = socket.data.tenantId as string;
    const room = SOCKET_ROOMS.project(tenantId, parsed.data.projectId);
    await socket.join(room);
    logger.info({ socketId: socket.id, room }, 'Joined project room');
    ack?.({ ok: true });
  });

  socket.on(SOCKET_EVENTS.PROJECT_LEAVE, async (payload, ack) => {
    const parsed = JoinProjectRoomSchema.safeParse(payload);
    if (!parsed.success) {
      ack?.({ ok: false, error: 'invalid_payload' });
      return;
    }
    const tenantId = socket.data.tenantId as string;
    const room = SOCKET_ROOMS.project(tenantId, parsed.data.projectId);
    await socket.leave(room);
    ack?.({ ok: true });
  });
};
