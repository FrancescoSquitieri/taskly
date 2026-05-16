import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  SwitchTenantSchema,
} from '@repo/schemas/auth';

export const loginBodySchema = LoginSchema;
export const registerBodySchema = RegisterSchema;
export const forgotPasswordBodySchema = ForgotPasswordSchema;
export const resetPasswordBodySchema = ResetPasswordSchema;
export const switchTenantBodySchema = SwitchTenantSchema;
