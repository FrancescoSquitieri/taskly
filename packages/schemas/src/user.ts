import { z } from 'zod';

export const UserRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER', 'PLATFORM_ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(120),
  avatarUrl: z.string().url().nullable().optional(),
  emailVerifiedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.pick({ email: true, name: true }).extend({
  password: z.string().min(8).max(128),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
