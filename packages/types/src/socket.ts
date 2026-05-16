import type {
  JoinProjectRoomPayload,
  PresenceEvent,
  ProjectUpdatedEvent,
  SocketAck,
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskUpdatedEvent,
} from '@repo/schemas/socket';

export interface ServerToClientEvents {
  'task:created': (payload: TaskCreatedEvent) => void;
  'task:updated': (payload: TaskUpdatedEvent) => void;
  'task:deleted': (payload: TaskDeletedEvent) => void;
  'project:updated': (payload: ProjectUpdatedEvent) => void;
  'presence:joined': (payload: PresenceEvent) => void;
  'presence:left': (payload: PresenceEvent) => void;
  'rate:limited': (payload: { event: string; retryAfter: number }) => void;
}

export interface ClientToServerEvents {
  'project:join': (payload: JoinProjectRoomPayload, ack: (response: SocketAck) => void) => void;
  'project:leave': (payload: JoinProjectRoomPayload, ack: (response: SocketAck) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketUserData {
  userId: string;
  tenantId: string;
  roles: string[];
}
