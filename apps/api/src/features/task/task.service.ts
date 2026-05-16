import type { Task } from '@repo/schemas/task';
import type { CreateTaskInput, TaskListQuery, UpdateTaskInput } from '@repo/schemas/task';

import { taskRepository } from '@/features/task/task.repository.js';
import { ApiError } from '@/lib/api-error.js';

export const taskService = {
  async list(tenantId: string, query: TaskListQuery): Promise<{ items: Task[]; nextCursor: null }> {
    const items = await taskRepository.findManyByTenant(tenantId, {
      projectId: query.projectId,
      status: query.status,
      assigneeId: query.assigneeId,
      take: query.limit,
    });
    return { items: items as unknown as Task[], nextCursor: null };
  },

  async getById(tenantId: string, id: string): Promise<Task> {
    const task = await taskRepository.findById(tenantId, id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    return task as unknown as Task;
  },

  async create(tenantId: string, input: CreateTaskInput): Promise<Task> {
    const created = await taskRepository.create({
      tenantId,
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      assigneeId: input.assigneeId ?? null,
      dueAt: input.dueAt ?? null,
    });
    return created as unknown as Task;
  },

  async update(tenantId: string, id: string, input: UpdateTaskInput): Promise<Task> {
    const result = await taskRepository.update(tenantId, id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
      ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });
    if (result.count === 0) {
      throw ApiError.notFound('Task not found');
    }
    return this.getById(tenantId, id);
  },

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await taskRepository.softDelete(tenantId, id);
    if (result.count === 0) {
      throw ApiError.notFound('Task not found');
    }
  },
};
