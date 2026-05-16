import type { CreateInviteInput } from '@repo/schemas/invite';
import { toast } from '@repo/ui';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/lib/axios';

const CreateInviteResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ acceptUrl: z.string().url() }),
});

export const useCreateInvite = () =>
  useMutation<{ acceptUrl: string }, Error, CreateInviteInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/workspaces/current/invites', input);
      return CreateInviteResponseSchema.parse(response.data).data;
    },
    onError: (error) => {
      toast.error(error.message || 'Could not send the invite.');
    },
    onSuccess: ({ acceptUrl }) => {
      toast.success('Invite email queued. Check Mailhog in dev.', {
        description: acceptUrl,
      });
    },
  });
