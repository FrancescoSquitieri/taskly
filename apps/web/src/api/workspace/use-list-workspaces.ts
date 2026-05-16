import { type WorkspaceSummary, WorkspaceSummarySchema } from '@repo/schemas/tenant';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { workspaceKeys } from '@/api/workspace/keys';
import { apiClient } from '@/lib/axios';

const ListWorkspacesResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ workspaces: z.array(WorkspaceSummarySchema) }),
});

export const useListWorkspaces = (enabled = true) =>
  useQuery<WorkspaceSummary[]>({
    queryKey: workspaceKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/workspaces');
      return ListWorkspacesResponseSchema.parse(response.data).data.workspaces;
    },
    enabled,
  });
