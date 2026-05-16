import { describe, expect, it, jest } from '@jest/globals';
import type { Socket } from 'socket.io';

import { socketAuth } from '@/middleware/socket-auth.js';

const buildSocket = (session: unknown) =>
  ({
    id: 'socket-1',
    data: {},
    request: { session },
  }) as unknown as Socket;

describe('socketAuth', () => {
  it('rejects when there is no session', () => {
    const next = jest.fn();
    socketAuth(buildSocket(undefined), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'unauthenticated' }));
  });

  it('rejects when userId or tenantId is missing', () => {
    const next = jest.fn();
    socketAuth(buildSocket({ userId: 'u-1' }), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'unauthenticated' }));
  });

  it('populates socket.data and calls next() on success', () => {
    const next = jest.fn();
    const socket = buildSocket({ userId: 'u-1', tenantId: 't-1', roles: ['ADMIN'] });
    socketAuth(socket, next);
    expect(next).toHaveBeenCalledWith();
    expect(socket.data).toMatchObject({ userId: 'u-1', tenantId: 't-1', roles: ['ADMIN'] });
  });
});
