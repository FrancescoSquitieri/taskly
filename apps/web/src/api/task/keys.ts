export const taskKeys = {
  all: ['tasks'] as const,
  list: (filters: { projectId?: string; status?: string }) =>
    [...taskKeys.all, 'list', filters] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};
