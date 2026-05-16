import type { LoginInput } from '@repo/schemas/auth';
import { toast } from '@repo/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { authKeys } from '@/api/auth/keys';
import { apiClient } from '@/lib/axios';

const LoginResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ userId: z.string().uuid(), tenantId: z.string().uuid() }),
});

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<{ userId: string; tenantId: string }, Error, LoginInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/auth/login', input);
      return LoginResponseSchema.parse(response.data).data;
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed. Check your credentials.');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};
