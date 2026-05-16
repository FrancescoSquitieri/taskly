import { AUDIT_ACTIONS, TOKEN_TTL_SECONDS } from '@repo/constants/audit';
import type { CreateInviteInput } from '@repo/schemas/invite';
import type { CreateWorkspaceInput, WorkspaceSummary } from '@repo/schemas/tenant';
import { slugify } from '@repo/utils';

import { env } from '@/config/env.js';
import { authRepository } from '@/features/auth/auth.repository.js';
import { tenantRepository } from '@/features/tenant/tenant.repository.js';
import { enqueueInvitationEmail } from '@/jobs/queues/email.queue.js';
import { ApiError } from '@/lib/api-error.js';
import { auditService } from '@/lib/audit.js';
import { tokenUtils } from '@/lib/tokens.js';

const ensureUniqueSlug = async (desired: string): Promise<string> => {
  const candidate = desired || `workspace-${Date.now().toString(36)}`;
  const existing = await tenantRepository.findTenantBySlug(candidate);
  if (!existing) return candidate;
  return `${candidate}-${Date.now().toString(36)}`;
};

export const tenantService = {
  async listForUser(userId: string): Promise<WorkspaceSummary[]> {
    const memberships = await tenantRepository.listWorkspacesForUser(userId);
    return memberships.map((m) => ({
      id: m.tenant.id,
      name: m.tenant.name,
      slug: m.tenant.slug,
      createdAt: m.tenant.createdAt,
      updatedAt: m.tenant.updatedAt,
      role: m.role,
    }));
  },

  async create(input: CreateWorkspaceInput, ownerUserId: string): Promise<WorkspaceSummary> {
    const desiredSlug = input.slug ?? slugify(input.name);
    const slug = await ensureUniqueSlug(desiredSlug);
    const { tenant, membership } = await tenantRepository.createTenantWithOwner({
      name: input.name,
      slug,
      ownerUserId,
    });
    await auditService.record({
      tenantId: tenant.id,
      actorId: ownerUserId,
      action: AUDIT_ACTIONS.WORKSPACE_CREATED,
      target: tenant.id,
      metadata: { slug: tenant.slug },
    });
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      role: membership.role,
    };
  },

  async listMembers(tenantId: string) {
    const memberships = await tenantRepository.listMembersForTenant(tenantId);
    return memberships.map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
      },
    }));
  },

  async createInvite(params: {
    input: CreateInviteInput;
    tenantId: string;
    inviterUserId: string;
  }): Promise<{ acceptUrl: string }> {
    const tenant = await tenantRepository.findTenantById(params.tenantId);
    if (!tenant) {
      throw ApiError.notFound('Workspace not found');
    }
    const inviter = await authRepository.findUserById(params.inviterUserId);
    if (!inviter) {
      throw ApiError.unauthorized();
    }
    const token = tokenUtils.signInvite(
      {
        tenantId: params.tenantId,
        email: params.input.email,
        role: params.input.role,
        inviterId: params.inviterUserId,
      },
      TOKEN_TTL_SECONDS.INVITE,
    );
    const acceptUrl = `${env.WEB_ORIGIN}/accept-invite?token=${encodeURIComponent(token)}`;
    await enqueueInvitationEmail({
      tenantId: params.tenantId,
      to: params.input.email,
      inviterName: inviter.name,
      workspaceName: tenant.name,
      role: params.input.role,
      acceptUrl,
    });
    await auditService.record({
      tenantId: params.tenantId,
      actorId: params.inviterUserId,
      action: AUDIT_ACTIONS.MEMBER_INVITED,
      target: params.input.email,
      metadata: { role: params.input.role },
    });
    return { acceptUrl };
  },
};
