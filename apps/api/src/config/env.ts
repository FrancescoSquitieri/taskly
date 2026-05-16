import 'dotenv/config';
import { ApiEnvSchema, type ApiEnv } from '@repo/schemas/env';

const parsed = ApiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  // biome-ignore lint/suspicious/noConsole: env validation must surface before logger boots
  console.error('Invalid API environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: ApiEnv = parsed.data;
