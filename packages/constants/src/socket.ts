export const SOCKET_EVENTS = {
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  PROJECT_UPDATED: 'project:updated',
  PRESENCE_JOINED: 'presence:joined',
  PRESENCE_LEFT: 'presence:left',
  RATE_LIMITED: 'rate:limited',
  PROJECT_JOIN: 'project:join',
  PROJECT_LEAVE: 'project:leave',
} as const;
export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const SOCKET_ROOMS = {
  tenant: (tenantId: string): string => `tenant:${tenantId}`,
  user: (tenantId: string, userId: string): string => `tenant:${tenantId}:user:${userId}`,
  project: (tenantId: string, projectId: string): string =>
    `tenant:${tenantId}:project:${projectId}`,
} as const;
