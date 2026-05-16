import { toast } from '@repo/ui';
import axios, { type AxiosInstance } from 'axios';

import { env } from '@/lib/env';

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  timeout: 15_000,
});

const PUBLIC_AUTH_PATHS = ['/api/v1/auth/me', '/api/v1/auth/accept-invite'];

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? '';
      const isAuthProbe = PUBLIC_AUTH_PATHS.some((path) => url.endsWith(path));
      if (status === 401 && !isAuthProbe && typeof window !== 'undefined') {
        const onAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(
          (p) => window.location.pathname.startsWith(p),
        );
        if (!onAuthPage) {
          window.location.assign('/login');
        }
      } else if (status === 429) {
        toast.warning('Too many requests. Please slow down.');
      }
    }
    return Promise.reject(error);
  },
);
