import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const repositoryMock = {
  findManyByTenant: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

jest.unstable_mockModule('@/features/task/task.repository.js', () => ({
  taskRepository: repositoryMock,
}));

const { taskService } = await import('@/features/task/task.service.js');

const TENANT = 'tenant-1';
const TASK_ID = 'task-1';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('taskService.list', () => {
  it('passes filters through to the repository', async () => {
    repositoryMock.findManyByTenant.mockResolvedValueOnce([] as never);
    await taskService.list(TENANT, {
      projectId: 'p-1',
      status: 'todo',
      limit: 50,
    } as never);
    expect(repositoryMock.findManyByTenant).toHaveBeenCalledWith(TENANT, {
      projectId: 'p-1',
      status: 'todo',
      assigneeId: undefined,
      take: 50,
    });
  });
});

describe('taskService.getById', () => {
  it('returns the task when found', async () => {
    repositoryMock.findById.mockResolvedValueOnce({ id: TASK_ID, tenantId: TENANT } as never);
    const task = await taskService.getById(TENANT, TASK_ID);
    expect(task).toMatchObject({ id: TASK_ID });
  });

  it('throws 404 when the task is missing', async () => {
    repositoryMock.findById.mockResolvedValueOnce(null as never);
    await expect(taskService.getById(TENANT, TASK_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('taskService.update', () => {
  it('throws 404 when no rows match', async () => {
    repositoryMock.update.mockResolvedValueOnce({ count: 0 } as never);
    await expect(taskService.update(TENANT, TASK_ID, { status: 'done' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('returns the updated task on success', async () => {
    repositoryMock.update.mockResolvedValueOnce({ count: 1 } as never);
    repositoryMock.findById.mockResolvedValueOnce({
      id: TASK_ID,
      tenantId: TENANT,
      status: 'done',
    } as never);
    const task = await taskService.update(TENANT, TASK_ID, { status: 'done' });
    expect(task.status).toBe('done');
  });
});

describe('taskService.remove', () => {
  it('throws 404 when nothing is deleted', async () => {
    repositoryMock.softDelete.mockResolvedValueOnce({ count: 0 } as never);
    await expect(taskService.remove(TENANT, TASK_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
