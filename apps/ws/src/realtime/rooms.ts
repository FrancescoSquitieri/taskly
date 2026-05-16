import { SOCKET_ROOMS } from '@repo/constants/socket';
import type { Socket } from 'socket.io';

import { logger } from '@/lib/logger.js';

export const joinDefaultRooms = (socket: Socket): void => {
  const tenantId = socket.data.tenantId as string;
  const userId = socket.data.userId as string;
  socket.join(SOCKET_ROOMS.tenant(tenantId));
  socket.join(SOCKET_ROOMS.user(tenantId, userId));
  logger.info({ socketId: socket.id, tenantId, userId }, 'Socket joined default rooms');
};
