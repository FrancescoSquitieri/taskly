import type { ClientToServerEvents, ServerToClientEvents } from '@repo/types/socket';
import { type Socket, io } from 'socket.io-client';

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
