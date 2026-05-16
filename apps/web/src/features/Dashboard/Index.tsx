import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Building2, CheckCircle2, Sparkles, UserPlus } from 'lucide-react';
import type { JSX } from 'react';
import { Link } from 'react-router-dom';

import { useListMembers } from '@/api/workspace/use-list-members';
import { useListWorkspaces } from '@/api/workspace/use-list-workspaces';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { useSocketStore } from '@/stores/socket';

export const Dashboard = (): JSX.Element => {
  useSocket();
  const status = useSocketStore((state) => state.status);
  const { user, tenantId, roles } = useAuth();
  const { data: workspaces } = useListWorkspaces();
  const { data: members } = useListMembers();
  const activeWorkspace = workspaces?.find((w) => w.id === tenantId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">
              Active workspace:{' '}
              <span className="font-medium text-foreground">{activeWorkspace?.name ?? '—'}</span> ·
              role <span className="font-medium text-foreground">{roles.join(', ') || '—'}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/onboarding" className="gap-1.5">
                <UserPlus className="h-4 w-4" aria-hidden />
                <span>Invite teammate</span>
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden /> Deep work starts here
              </CardTitle>
              <CardDescription>
                Sprint 1 wired the foundation. Project + task UI lands in Sprint 2.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Real-time socket status:{' '}
                <span className="font-medium text-foreground">{status}</span>
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Account &amp; workspace bootstrapped
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Invite teammates from{' '}
                <Link to="/onboarding" className="underline">
                  onboarding
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" aria-hidden /> Workspace members
              </CardTitle>
              <CardDescription>
                {members
                  ? `${members.length} member${members.length === 1 ? '' : 's'}`
                  : 'Loading…'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {members?.slice(0, 6).map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                  >
                    <span className="truncate">
                      {m.user.name}{' '}
                      <span className="text-xs text-muted-foreground">— {m.user.email}</span>
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {m.role}
                    </span>
                  </li>
                ))}
                {members && members.length === 0 && (
                  <li className="text-muted-foreground">No members yet.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
