import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResendVerificationSchema,
  ResetPasswordSchema,
  SwitchTenantSchema,
  VerifyEmailSchema,
} from '@repo/schemas/auth';
import { AcceptInviteSchema } from '@repo/schemas/invite';

export const loginBodySchema = LoginSchema;
export const registerBodySchema = RegisterSchema;
export const forgotPasswordBodySchema = ForgotPasswordSchema;
export const resetPasswordBodySchema = ResetPasswordSchema;
export const switchTenantBodySchema = SwitchTenantSchema;
export const acceptInviteBodySchema = AcceptInviteSchema;
export const verifyEmailBodySchema = VerifyEmailSchema;
export const resendVerificationBodySchema = ResendVerificationSchema;
