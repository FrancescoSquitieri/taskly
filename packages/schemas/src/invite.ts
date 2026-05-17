import { z } from 'zod';

import { PasswordSchema } from './auth.js';
import { UserRoleSchema } from './user.js';

export const InviteRoleSchema = UserRoleSchema.exclude(['OWNER', 'PLATFORM_ADMIN']);
export type InviteRole = z.infer<typeof InviteRoleSchema>;

export const CreateInviteSchema = z.object({
  email: z.string().email().toLowerCase(),
  role: InviteRoleSchema.default('MEMBER'),
});
export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1).max(2048),
  name: z.string().min(1).max(120).optional(),
  password: PasswordSchema.optional(),
});
export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;

/**
 * Decoded invite token payload (HMAC-signed by the API).
 * Persisted nowhere — invites are stateless until accepted.
 */
export const InviteTokenPayloadSchema = z.object({
  v: z.literal(1),
  tenantId: z.string().uuid(),
  email: z.string().email().toLowerCase(),
  role: InviteRoleSchema,
  inviterId: z.string().uuid(),
  iat: z.number().int(),
  exp: z.number().int(),
});
export type InviteTokenPayload = z.infer<typeof InviteTokenPayloadSchema>;

export const PasswordResetTokenPayloadSchema = z.object({
  v: z.literal(1),
  userId: z.string().uuid(),
  email: z.string().email().toLowerCase(),
  iat: z.number().int(),
  exp: z.number().int(),
});
export type PasswordResetTokenPayload = z.infer<typeof PasswordResetTokenPayloadSchema>;

export const EmailVerificationTokenPayloadSchema = z.object({
  v: z.literal(1),
  userId: z.string().uuid(),
  email: z.string().email().toLowerCase(),
  iat: z.number().int(),
  exp: z.number().int(),
});
export type EmailVerificationTokenPayload = z.infer<typeof EmailVerificationTokenPayloadSchema>;
