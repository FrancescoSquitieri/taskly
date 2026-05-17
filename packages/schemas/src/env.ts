import { z } from 'zod';

export const NodeEnvSchema = z.enum(['development', 'test', 'production']);

export const SharedEnvSchema = z.object({
  NODE_ENV: NodeEnvSchema.default('development'),
});
export type SharedEnv = z.infer<typeof SharedEnvSchema>;

// The root .env.<NODE_ENV> file is shared by every app, so each app reads its
// own port (API_PORT vs WS_PORT) instead of a single PORT key that would
// collide.
export const ApiEnvSchema = SharedEnvSchema.extend({
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(60)
    .default(60 * 60 * 24 * 7),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
});
export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export const WsEnvSchema = SharedEnvSchema.extend({
  WS_PORT: z.coerce.number().int().min(1).max(65535).default(4001),
  WEB_ORIGIN: z.string().url(),
  REDIS_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  USE_SOCKET_REDIS_ADAPTER: z
    .union([z.literal('true'), z.literal('false')])
    .default('false')
    .transform((value) => value === 'true'),
});
export type WsEnv = z.infer<typeof WsEnvSchema>;

export const WebEnvSchema = SharedEnvSchema.extend({
  VITE_API_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
});
export type WebEnv = z.infer<typeof WebEnvSchema>;
