import { z } from 'zod';
import { ProjectSchema } from './project.js';
import { TaskSchema } from './task.js';

export const SocketAckSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
});
export type SocketAck = z.infer<typeof SocketAckSchema>;

export const JoinProjectRoomSchema = z.object({
  projectId: z.string().uuid(),
});
export type JoinProjectRoomPayload = z.infer<typeof JoinProjectRoomSchema>;

export const TaskCreatedEventSchema = z.object({
  tenantId: z.string().uuid(),
  task: TaskSchema,
});
export type TaskCreatedEvent = z.infer<typeof TaskCreatedEventSchema>;

export const TaskUpdatedEventSchema = TaskCreatedEventSchema;
export type TaskUpdatedEvent = z.infer<typeof TaskUpdatedEventSchema>;

export const TaskDeletedEventSchema = z.object({
  tenantId: z.string().uuid(),
  taskId: z.string().uuid(),
  projectId: z.string().uuid(),
});
export type TaskDeletedEvent = z.infer<typeof TaskDeletedEventSchema>;

export const PresenceEventSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
});
export type PresenceEvent = z.infer<typeof PresenceEventSchema>;

export const ProjectUpdatedEventSchema = z.object({
  tenantId: z.string().uuid(),
  project: ProjectSchema,
});
export type ProjectUpdatedEvent = z.infer<typeof ProjectUpdatedEventSchema>;
