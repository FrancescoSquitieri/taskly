import { z } from 'zod';
import { UserRoleSchema } from './user.js';

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Tenant = z.infer<typeof TenantSchema>;

export const MembershipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: UserRoleSchema,
  createdAt: z.coerce.date(),
});
export type Membership = z.infer<typeof MembershipSchema>;

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, digits, or hyphens')
    .optional(),
});
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;

export const WorkspaceSummarySchema = TenantSchema.extend({
  role: UserRoleSchema,
});
export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>;
