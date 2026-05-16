import { type CreateTaskInput, type Task, TaskSchema } from '@repo/schemas/task';
import { toast } from '@repo/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { taskKeys } from '@/api/task/keys';
import { apiClient } from '@/lib/axios';

const CreateTaskResponseSchema = z.object({
  ok: z.literal(true),
  data: TaskSchema,
});

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post('/api/v1/tasks', input);
      return CreateTaskResponseSchema.parse(response.data).data;
    },
    onError: () => {
      toast.error('Could not create the task. Please try again.');
    },
    onSuccess: () => {
      toast.success('Task created.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};
