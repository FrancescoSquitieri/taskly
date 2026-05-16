import type { ForgotPasswordInput } from '@repo/schemas/auth';
import { toast } from '@repo/ui';
import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/axios';

export const useForgotPassword = () =>
  useMutation<void, Error, ForgotPasswordInput>({
    mutationFn: async (input) => {
      await apiClient.post('/api/v1/auth/forgot-password', input);
    },
    onError: () => {
      toast.error('Could not start the reset flow. Please retry shortly.');
    },
  });
