export const USER_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
} as const;
export type UserRoleName = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_RANK: Record<UserRoleName, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
  PLATFORM_ADMIN: 100,
};
