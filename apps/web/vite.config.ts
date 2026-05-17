import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// Monorepo root holds the canonical .env.<NODE_ENV> files shared with the
// backend apps. Vite normally reads from `process.cwd()`; we redirect it here.
const MONOREPO_ROOT = path.resolve(dirname, '..', '..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, MONOREPO_ROOT, 'VITE_');

  return {
    plugins: [react()],
    envDir: MONOREPO_ROOT,
    resolve: {
      alias: {
        '@': path.resolve(dirname, 'src'),
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT ?? 5173),
      strictPort: true,
    },
    preview: {
      port: 5173,
      strictPort: true,
    },
    build: {
      target: 'es2022',
      sourcemap: mode !== 'production',
      outDir: 'dist',
    },
  };
});
