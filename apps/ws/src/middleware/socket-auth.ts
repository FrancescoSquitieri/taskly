import type { Socket } from 'socket.io';

import { logger } from '@/lib/logger.js';

type SocketAuthNext = (err?: Error) => void;

export const socketAuth = (socket: Socket, next: SocketAuthNext): void => {
  const request = socket.request as unknown as {
    session?: { userId?: string; tenantId?: string; roles?: string[] };
  };
  const session = request.session;

  if (!session?.userId || !session.tenantId) {
    logger.warn({ socketId: socket.id }, 'Socket rejected: missing session');
    next(new Error('unauthenticated'));
    return;
  }

  socket.data.userId = session.userId;
  socket.data.tenantId = session.tenantId;
  socket.data.roles = session.roles ?? [];
  next();
};
