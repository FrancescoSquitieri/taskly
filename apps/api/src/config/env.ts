import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type ApiEnv, ApiEnvSchema } from '@repo/schemas/env';
import { config as loadDotenv } from 'dotenv';

// Resolve the monorepo root from this file's location. Works for both the
// TypeScript source layout (`apps/api/src/config/env.ts`) and the compiled
// output (`apps/api/dist/config/env.js`) because both are four levels deep.
const HERE = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(HERE, '..', '..', '..', '..');
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// `dotenv` does not override existing process.env values, so in environments
// where vars are already injected (Docker compose `env_file:`, CI, etc.) this
// silently no-ops; in host dev it loads the matching root env file.
loadDotenv({ path: resolve(MONOREPO_ROOT, `.env.${NODE_ENV}`) });

const parsed = ApiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid API environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: ApiEnv = parsed.data;
