import type { AcceptInviteInput } from '@repo/schemas/invite';
import { toast } from '@repo/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { authKeys } from '@/api/auth/keys';
import { apiClient } from '@/lib/axios';

const AcceptInviteResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    userId: z.string().uuid(),
    tenantId: z.string().uuid(),
    createdAccount: z.boolean(),
  }),
});

type AcceptInviteResult = z.infer<typeof AcceptInviteResponseSchema>['data'];

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  return useMutation<AcceptInviteResult, Error, AcceptInviteInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/auth/accept-invite', input);
      return AcceptInviteResponseSchema.parse(response.data).data;
    },
    onError: (error) => {
      toast.error(error.message || 'Could not accept the invite.');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};
