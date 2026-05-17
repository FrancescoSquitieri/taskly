import type { VerifyEmailInput } from '@repo/schemas/auth';
import { toast } from '@repo/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { authKeys } from '@/api/auth/keys';
import { apiClient } from '@/lib/axios';

const VerifyEmailResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ ok: z.literal(true), alreadyVerified: z.boolean() }),
});

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  return useMutation<{ alreadyVerified: boolean }, Error, VerifyEmailInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/auth/verify-email', input);
      const parsed = VerifyEmailResponseSchema.parse(response.data).data;
      return { alreadyVerified: parsed.alreadyVerified };
    },
    onError: (error) => {
      toast.error(error.message || 'Could not verify the email link.');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};
