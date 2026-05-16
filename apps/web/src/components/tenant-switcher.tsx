import { Building2 } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

import { useSwitchTenant } from '@/api/auth/use-switch-tenant';
import { useListWorkspaces } from '@/api/workspace/use-list-workspaces';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@repo/ui';

export const TenantSwitcher = ({ className }: { className?: string }): JSX.Element | null => {
  const { tenantId, isAuthenticated } = useAuth();
  const { data: workspaces } = useListWorkspaces(isAuthenticated);
  const switchTenant = useSwitchTenant();

  if (!isAuthenticated || !workspaces || workspaces.length === 0) {
    return null;
  }

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const next = event.target.value;
    if (!next || next === tenantId) return;
    switchTenant.mutate(
      { tenantId: next },
      {
        onSuccess: () => {
          // Cleanest way to re-fetch every dependent query after a tenant flip
          if (typeof window !== 'undefined') {
            window.location.assign('/');
          }
        },
      },
    );
  };

  return (
    <label className={cn('flex items-center gap-2 text-sm', className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Active workspace</span>
      <select
        value={tenantId ?? ''}
        onChange={handleChange}
        disabled={switchTenant.isPending}
        className="rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        {workspaces.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name} · {w.role}
          </option>
        ))}
      </select>
    </label>
  );
};
