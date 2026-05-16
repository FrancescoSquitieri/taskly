import { CreateInviteSchema } from '@repo/schemas/invite';
import { CreateWorkspaceSchema } from '@repo/schemas/tenant';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  toast,
} from '@repo/ui';
import { CheckCircle2, Mail, Sparkles, Users } from 'lucide-react';
import { type FormEvent, type JSX, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCreateInvite } from '@/api/workspace/use-create-invite';
import { useCreateWorkspace } from '@/api/workspace/use-create-workspace';
import { AppLayout } from '@/components/app-layout';

type Step = 'name' | 'invite' | 'done';

export const OnboardingPage = (): JSX.Element => {
  const [step, setStep] = useState<Step>('name');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const createInvite = useCreateInvite();

  const handleCreateWorkspace = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = CreateWorkspaceSchema.safeParse({
      name: workspaceName,
      slug: workspaceSlug || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input.');
      return;
    }
    createWorkspace.mutate(parsed.data, {
      onSuccess: () => setStep('invite'),
    });
  };

  const handleSendInvite = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = CreateInviteSchema.safeParse({ email: inviteEmail });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input.');
      return;
    }
    createInvite.mutate(parsed.data, {
      onSuccess: () => {
        setInviteEmail('');
      },
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" aria-hidden />
          <h1 className="text-2xl font-semibold">Set up your workspace</h1>
        </div>

        <ol className="grid grid-cols-3 gap-2 text-xs uppercase tracking-wide">
          <Step label="Workspace" active={step === 'name'} done={step !== 'name'} />
          <Step label="Invite team" active={step === 'invite'} done={step === 'done'} />
          <Step label="Done" active={step === 'done'} done={step === 'done'} />
        </ol>

        {step === 'name' && (
          <Card>
            <CardHeader>
              <CardTitle>Name your workspace</CardTitle>
              <CardDescription>You can change the slug later.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWorkspace} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="ws-name">Workspace name</Label>
                  <Input
                    id="ws-name"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ws-slug">Slug (optional)</Label>
                  <Input
                    id="ws-slug"
                    placeholder="auto-derived from the name"
                    value={workspaceSlug}
                    onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase())}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createWorkspace.isPending}>
                  {createWorkspace.isPending ? 'Creating…' : 'Create workspace'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'invite' && (
          <Card>
            <CardHeader>
              <CardTitle>Invite a teammate</CardTitle>
              <CardDescription>
                Send one (or skip) — you can invite more from the team page later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvite} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email">Teammate email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createInvite.isPending || inviteEmail.length === 0}
                    className="flex-1 gap-2"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    {createInvite.isPending ? 'Sending…' : 'Send invite'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setStep('done')}>
                    Skip
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden /> You're ready
              </CardTitle>
              <CardDescription>
                Your workspace is set up. Time to plan some deep work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate('/', { replace: true })} className="w-full">
                Go to dashboard
              </Button>
              <Link to="/" className="block text-center text-sm text-muted-foreground underline">
                Or browse the team
              </Link>
            </CardContent>
          </Card>
        )}

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" aria-hidden /> Roles are scoped per workspace — invites
          land as <span className="font-medium">MEMBER</span> by default.
        </p>
      </div>
    </AppLayout>
  );
};

const Step = ({
  label,
  active,
  done,
}: { label: string; active: boolean; done: boolean }): JSX.Element => (
  <li
    className={`flex items-center justify-center rounded-md px-3 py-2 ${
      active ? 'bg-foreground text-background' : done ? 'bg-primary/15 text-primary' : 'bg-muted'
    }`}
  >
    {label}
  </li>
);
