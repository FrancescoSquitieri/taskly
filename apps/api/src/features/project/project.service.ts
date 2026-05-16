import type { CreateProjectInput, Project } from '@repo/schemas/project';

import { projectRepository } from '@/features/project/project.repository.js';
import { ApiError } from '@/lib/api-error.js';

export const projectService = {
  async list(tenantId: string): Promise<Project[]> {
    const projects = await projectRepository.findManyByTenant(tenantId);
    return projects as unknown as Project[];
  },

  async getById(tenantId: string, id: string): Promise<Project> {
    const project = await projectRepository.findById(tenantId, id);
    if (!project) throw ApiError.notFound('Project not found');
    return project as unknown as Project;
  },

  async create(tenantId: string, input: CreateProjectInput): Promise<Project> {
    const project = await projectRepository.create({
      tenantId,
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? null,
    });
    return project as unknown as Project;
  },
};
