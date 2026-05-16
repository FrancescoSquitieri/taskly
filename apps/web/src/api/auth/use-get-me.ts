import { type Me, MeSchema } from '@repo/schemas/auth';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authKeys } from '@/api/auth/keys';
import { apiClient } from '@/lib/axios';

const MeResponseSchema = z.object({
  ok: z.literal(true),
  data: MeSchema,
});

export const useGetMe = () => {
  return useQuery<Me | null>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/v1/auth/me');
        return MeResponseSchema.parse(response.data).data;
      } catch (error) {
        // 401 is expected when not logged in — treat as "no session"
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          (error as { response?: { status?: number } }).response?.status === 401
        ) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 30_000,
  });
};
