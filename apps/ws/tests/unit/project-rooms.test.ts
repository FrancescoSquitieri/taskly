import { describe, expect, it, jest } from '@jest/globals';
import type { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '@repo/constants/socket';

import { registerProjectRoomHandlers } from '@/realtime/handlers/project-rooms.js';

const buildSocket = () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const socket = {
    id: 'socket-1',
    data: { tenantId: 't-1', userId: 'u-1', roles: [] },
    on: jest.fn((event: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(event, handler);
    }),
    join: jest.fn(() => Promise.resolve()),
    leave: jest.fn(() => Promise.resolve()),
  } as unknown as Socket;
  return { socket, handlers };
};

describe('registerProjectRoomHandlers', () => {
  it('joins a project room and acknowledges', async () => {
    const { socket, handlers } = buildSocket();
    registerProjectRoomHandlers({} as Server, socket);
    const join = handlers.get(SOCKET_EVENTS.PROJECT_JOIN);
    const ack = jest.fn();
    await (join as (payload: unknown, ack: unknown) => Promise<void>)(
      { projectId: '550e8400-e29b-41d4-a716-446655440000' },
      ack,
    );
    expect(socket.join).toHaveBeenCalledWith(
      SOCKET_ROOMS.project('t-1', '550e8400-e29b-41d4-a716-446655440000'),
    );
    expect(ack).toHaveBeenCalledWith({ ok: true });
  });

  it('rejects a malformed projectId', async () => {
    const { socket, handlers } = buildSocket();
    registerProjectRoomHandlers({} as Server, socket);
    const join = handlers.get(SOCKET_EVENTS.PROJECT_JOIN);
    const ack = jest.fn();
    await (join as (payload: unknown, ack: unknown) => Promise<void>)(
      { projectId: 'not-a-uuid' },
      ack,
    );
    expect(socket.join).not.toHaveBeenCalled();
    expect(ack).toHaveBeenCalledWith({ ok: false, error: 'invalid_payload' });
  });

  it('leaves a project room', async () => {
    const { socket, handlers } = buildSocket();
    registerProjectRoomHandlers({} as Server, socket);
    const leave = handlers.get(SOCKET_EVENTS.PROJECT_LEAVE);
    const ack = jest.fn();
    await (leave as (payload: unknown, ack: unknown) => Promise<void>)(
      { projectId: '550e8400-e29b-41d4-a716-446655440000' },
      ack,
    );
    expect(socket.leave).toHaveBeenCalled();
    expect(ack).toHaveBeenCalledWith({ ok: true });
  });
});
