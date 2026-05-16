import { toast } from '@repo/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { authKeys } from '@/api/auth/keys';
import { apiClient } from '@/lib/axios';

const SwitchTenantResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ tenantId: z.string().uuid(), roles: z.array(z.string()) }),
});

export const useSwitchTenant = () => {
  const queryClient = useQueryClient();
  return useMutation<{ tenantId: string; roles: string[] }, Error, { tenantId: string }>({
    mutationFn: async ({ tenantId }) => {
      const response = await apiClient.post('/api/v1/auth/switch-tenant', { tenantId });
      return SwitchTenantResponseSchema.parse(response.data).data;
    },
    onError: () => {
      toast.error('Could not switch workspace.');
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
