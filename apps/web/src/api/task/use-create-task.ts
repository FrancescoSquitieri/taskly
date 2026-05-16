import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from '@repo/ui';
import { TaskSchema, type CreateTaskInput, type Task } from '@repo/schemas/task';

import { apiClient } from '@/lib/axios';
import { taskKeys } from '@/api/task/keys';

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
