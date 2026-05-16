import 'dotenv/config';
import { type WsEnv, WsEnvSchema } from '@repo/schemas/env';

const parsed = WsEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid WS environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: WsEnv = parsed.data;
