import { UserRoleSchema } from '@repo/schemas/user';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { workspaceKeys } from '@/api/workspace/keys';
import { apiClient } from '@/lib/axios';

const MemberSchema = z.object({
  id: z.string().uuid(),
  role: UserRoleSchema,
  createdAt: z.coerce.date(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    avatarUrl: z.string().url().nullable().optional(),
  }),
});

const ListMembersResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({ members: z.array(MemberSchema) }),
});

export type WorkspaceMember = z.infer<typeof MemberSchema>;

export const useListMembers = (enabled = true) =>
  useQuery<WorkspaceMember[]>({
    queryKey: workspaceKeys.members(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/workspaces/current/members');
      return ListMembersResponseSchema.parse(response.data).data.members;
    },
    enabled,
  });
