import { useEffect } from 'react';
import { toast } from '@repo/ui';
import { SOCKET_EVENTS } from '@repo/constants/socket';

import { getSocket } from '@/services/socket/socket-client';
import { useSocketStore } from '@/stores/socket';

export const useSocket = (): void => {
  const setStatus = useSocketStore((state) => state.setStatus);

  useEffect(() => {
    const socket = getSocket();
    setStatus('connecting');

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => {
      setStatus('disconnected');
      toast.warning('Connection lost. Reconnecting...');
    });
    socket.on('connect_error', () => {
      setStatus('error');
      toast.error('Connection error. Please refresh the page.');
    });
    socket.on(SOCKET_EVENTS.RATE_LIMITED, (payload) => {
      toast.warning(`Rate limited on ${payload.event}. Retry in ${payload.retryAfter}s.`);
    });

    socket.connect();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off(SOCKET_EVENTS.RATE_LIMITED);
    };
  }, [setStatus]);
};
