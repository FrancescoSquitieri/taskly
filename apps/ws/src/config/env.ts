import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type WsEnv, WsEnvSchema } from '@repo/schemas/env';
import { config as loadDotenv } from 'dotenv';

const HERE = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(HERE, '..', '..', '..', '..');
const NODE_ENV = process.env.NODE_ENV ?? 'development';

loadDotenv({ path: resolve(MONOREPO_ROOT, `.env.${NODE_ENV}`) });

const parsed = WsEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid WS environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: WsEnv = parsed.data;
