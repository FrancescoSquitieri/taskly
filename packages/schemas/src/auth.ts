import { z } from 'zod';
import { UserSchema } from './user.js';

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/\d/, 'Password must contain a digit');

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1).max(128),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: PasswordSchema,
  name: z.string().min(1).max(120),
  tenantName: z.string().min(1).max(120),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const SessionSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  roles: z.array(z.string()),
  createdAt: z.coerce.date(),
  lastSeenAt: z.coerce.date(),
});
export type Session = z.infer<typeof SessionSchema>;

export const MeSchema = z.object({
  user: UserSchema,
  tenantId: z.string().uuid(),
  roles: z.array(z.string()),
});
export type Me = z.infer<typeof MeSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1).max(2048),
  password: PasswordSchema,
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const SwitchTenantSchema = z.object({
  tenantId: z.string().uuid(),
});
export type SwitchTenantInput = z.infer<typeof SwitchTenantSchema>;
