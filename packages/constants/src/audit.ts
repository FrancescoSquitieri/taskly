export const AUDIT_ACTIONS = {
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REGISTER: 'auth.register',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth.password_reset_requested',
  AUTH_PASSWORD_RESET_COMPLETED: 'auth.password_reset_completed',
  AUTH_EMAIL_VERIFIED: 'auth.email_verified',
  AUTH_EMAIL_VERIFICATION_SENT: 'auth.email_verification_sent',
  AUTH_TENANT_SWITCHED: 'auth.tenant_switched',
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const TOKEN_TTL_SECONDS = {
  INVITE: 60 * 60 * 24 * 7,
  PASSWORD_RESET: 60 * 60,
  EMAIL_VERIFICATION: 60 * 60 * 24,
} as const;
