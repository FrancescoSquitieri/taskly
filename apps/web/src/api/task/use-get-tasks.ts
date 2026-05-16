import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from '@repo/ui';
import { TaskSchema, type TaskListQuery, type Task } from '@repo/schemas/task';

import { apiClient } from '@/lib/axios';
import { taskKeys } from '@/api/task/keys';

const TaskListResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    items: z.array(TaskSchema),
    nextCursor: z.string().nullable(),
  }),
});

export const useGetTasks = (filters: Partial<TaskListQuery> = {}) => {
  return useQuery<{ items: Task[]; nextCursor: string | null }>({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/v1/tasks', { params: filters });
        return TaskListResponseSchema.parse(response.data).data;
      } catch (error) {
        toast.error('Could not load tasks. Please try again.');
        throw error;
      }
    },
  });
};
