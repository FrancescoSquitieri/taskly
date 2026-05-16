import type { CreateWorkspaceInput, WorkspaceSummary } from '@repo/schemas/tenant';
import { WorkspaceSummarySchema } from '@repo/schemas/tenant';
import { toast } from '@repo/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { workspaceKeys } from '@/api/workspace/keys';
import { apiClient } from '@/lib/axios';

const CreateWorkspaceResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ workspace: WorkspaceSummarySchema }),
});

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceSummary, Error, CreateWorkspaceInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/workspaces', input);
      return CreateWorkspaceResponseSchema.parse(response.data).data.workspace;
    },
    onError: () => {
      toast.error('Could not create the workspace.');
    },
    onSuccess: (workspace) => {
      toast.success(`Workspace “${workspace.name}” created.`);
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
};
