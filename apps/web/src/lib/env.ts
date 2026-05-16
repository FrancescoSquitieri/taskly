import { WebEnvSchema } from '@repo/schemas/env';

export const env = WebEnvSchema.parse({
  NODE_ENV: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
});
