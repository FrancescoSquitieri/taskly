import 'dotenv/config';
import { WsEnvSchema, type WsEnv } from '@repo/schemas/env';

const parsed = WsEnvSchema.safeParse(process.env);

if (!parsed.success) {
  // biome-ignore lint/suspicious/noConsole: env validation must surface before logger boots
  console.error('Invalid WS environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: WsEnv = parsed.data;
