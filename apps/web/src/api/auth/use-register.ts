import type { RegisterInput } from '@repo/schemas/auth';
import { toast } from '@repo/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { authKeys } from '@/api/auth/keys';
import { apiClient } from '@/lib/axios';

const RegisterResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ userId: z.string().uuid(), tenantId: z.string().uuid() }),
});

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation<{ userId: string; tenantId: string }, Error, RegisterInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/auth/register', input);
      return RegisterResponseSchema.parse(response.data).data;
    },
    onError: (error) => {
      toast.error(error.message || 'Sign-up failed. Try again.');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};
