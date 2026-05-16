import { type Me, MeSchema } from '@repo/schemas/auth';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/lib/axios';

const MeResponseSchema = z.object({
  ok: z.literal(true),
  data: MeSchema,
});

export const useGetMe = () => {
  return useQuery<Me>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/auth/me');
      return MeResponseSchema.parse(response.data).data;
    },
    retry: false,
  });
};
