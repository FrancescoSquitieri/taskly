import type { Server as HttpServer } from 'node:http';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketUserData,
} from '@repo/types/socket';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'socket.io';

import { env } from '@/config/env.js';
import { logger } from '@/lib/logger.js';
import { pubClient, subClient } from '@/lib/redis.js';
import { sessionMiddleware } from '@/middleware/session.js';
import { socketAuth } from '@/middleware/socket-auth.js';
import { registerProjectRoomHandlers } from '@/realtime/handlers/project-rooms.js';
import { startRedisRelay } from '@/realtime/relay.js';
import { joinDefaultRooms } from '@/realtime/rooms.js';

export const createSocketServer = (
  httpServer: HttpServer,
): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketUserData> => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketUserData
  >(httpServer, {
    cors: { origin: env.WEB_ORIGIN, credentials: true },
    transports: ['websocket', 'polling'],
  });

  if (env.USE_SOCKET_REDIS_ADAPTER) {
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.IO Redis adapter enabled');
  }

  io.engine.use(sessionMiddleware);
  io.use(socketAuth);

  io.on('connection', (socket) => {
    joinDefaultRooms(socket);
    registerProjectRoomHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'Socket disconnected');
    });
  });

  startRedisRelay(io);

  return io;
};
