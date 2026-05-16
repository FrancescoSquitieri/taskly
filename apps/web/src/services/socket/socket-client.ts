import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@repo/types/socket';

import { env } from '@/lib/env';

let instance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (instance) {
    return instance;
  }
  instance = io(env.VITE_WS_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
  });
  return instance;
};

export const disconnectSocket = (): void => {
  if (!instance) return;
  instance.disconnect();
  instance = null;
};
