import type { ResendVerificationInput } from '@repo/schemas/auth';
import { toast } from '@repo/ui';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/lib/axios';

const ResendResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ ok: z.literal(true) }),
});

export const useResendVerification = () => {
  return useMutation<void, Error, ResendVerificationInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/auth/resend-verification', input);
      ResendResponseSchema.parse(response.data);
    },
    onError: (error) => {
      toast.error(error.message || 'Could not resend the verification email.');
    },
  });
};
