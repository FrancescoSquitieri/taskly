import type { ResetPasswordInput } from '@repo/schemas/auth';
import { toast } from '@repo/ui';
import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/axios';

export const useResetPassword = () =>
  useMutation<void, Error, ResetPasswordInput>({
    mutationFn: async (input) => {
      await apiClient.post('/api/v1/auth/reset-password', input);
    },
    onError: () => {
      toast.error('Invalid or expired reset link. Request a new one.');
    },
  });
