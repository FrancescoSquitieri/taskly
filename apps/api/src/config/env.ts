import 'dotenv/config';
import { type ApiEnv, ApiEnvSchema } from '@repo/schemas/env';

const parsed = ApiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid API environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: ApiEnv = parsed.data;
