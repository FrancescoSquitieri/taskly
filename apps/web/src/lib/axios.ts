import axios, { type AxiosInstance } from 'axios';
import { toast } from '@repo/ui';

import { env } from '@/lib/env';

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  timeout: 15_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        window.location.assign('/login');
      } else if (error.response?.status === 429) {
        toast.warning('Too many requests. Please slow down.');
      }
    }
    return Promise.reject(error);
  },
);
