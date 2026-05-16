import { describe, expect, it } from '@jest/globals';
import {
  CreateTaskSchema,
  TaskPrioritySchema,
  TaskSchema,
  TaskStatusSchema,
  UpdateTaskSchema,
} from './task.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('TaskStatusSchema', () => {
  it('accepts every valid status', () => {
    for (const status of ['todo', 'in_progress', 'done', 'archived'] as const) {
      expect(TaskStatusSchema.parse(status)).toBe(status);
    }
  });

  it('rejects an unknown status', () => {
    expect(() => TaskStatusSchema.parse('weird')).toThrow();
  });
});

describe('TaskPrioritySchema', () => {
  it('accepts every valid priority', () => {
    for (const priority of ['low', 'medium', 'high', 'urgent'] as const) {
      expect(TaskPrioritySchema.parse(priority)).toBe(priority);
    }
  });
});

describe('TaskSchema', () => {
  it('parses a fully shaped task', () => {
    const parsed = TaskSchema.parse({
      id: VALID_UUID,
      tenantId: VALID_UUID,
      projectId: VALID_UUID,
      title: 'Write release notes',
      description: 'Cover the highlights',
      status: 'todo',
      priority: 'high',
      assigneeId: VALID_UUID,
      dueAt: '2026-06-01T10:00:00Z',
      createdAt: '2026-05-16T10:00:00Z',
      updatedAt: '2026-05-16T10:00:00Z',
    });
    expect(parsed.dueAt).toBeInstanceOf(Date);
    expect(parsed.title).toBe('Write release notes');
  });

  it('rejects an empty title', () => {
    expect(() =>
      TaskSchema.parse({
        id: VALID_UUID,
        tenantId: VALID_UUID,
        projectId: VALID_UUID,
        title: '',
        status: 'todo',
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });
});

describe('CreateTaskSchema', () => {
  it('accepts the minimum fields', () => {
    const parsed = CreateTaskSchema.parse({
      projectId: VALID_UUID,
      title: 'Plan onboarding',
      priority: 'medium',
    });
    expect(parsed.title).toBe('Plan onboarding');
  });
});

describe('UpdateTaskSchema', () => {
  it('allows a status-only patch', () => {
    const parsed = UpdateTaskSchema.parse({ status: 'done' });
    expect(parsed.status).toBe('done');
  });
});
