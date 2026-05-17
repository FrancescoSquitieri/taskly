import { zodResolver } from '@hookform/resolvers/zod';
import { type CreateInviteInput, CreateInviteSchema } from '@repo/schemas/invite';
import { type CreateWorkspaceInput, CreateWorkspaceSchema } from '@repo/schemas/tenant';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui';
import { CheckCircle2, Mail, Sparkles, Users } from 'lucide-react';
import { type JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useCreateInvite } from '@/api/workspace/use-create-invite';
import { useCreateWorkspace } from '@/api/workspace/use-create-workspace';
import { AppLayout } from '@/components/app-layout';
import { FieldError } from '@/components/field-error';

type Step = 'name' | 'invite' | 'done';

export const OnboardingPage = (): JSX.Element => {
  const [step, setStep] = useState<Step>('name');
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const createInvite = useCreateInvite();

  const workspaceForm = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(CreateWorkspaceSchema),
    defaultValues: { name: '', slug: undefined },
    mode: 'onBlur',
  });

  const inviteForm = useForm<CreateInviteInput>({
    resolver: zodResolver(CreateInviteSchema),
    defaultValues: { email: '', role: 'MEMBER' },
    mode: 'onBlur',
  });

  const handleCreateWorkspace = workspaceForm.handleSubmit((values) => {
    const payload: CreateWorkspaceInput = {
      name: values.name,
      slug: values.slug || undefined,
    };
    createWorkspace.mutate(payload, {
      onSuccess: () => setStep('invite'),
      onError: (error) =>
        workspaceForm.setError('root', {
          type: 'server',
          message: error.message || 'Could not create the workspace.',
        }),
    });
  });

  const handleSendInvite = inviteForm.handleSubmit((values) => {
    createInvite.mutate(values, {
      onSuccess: () => inviteForm.reset({ email: '', role: 'MEMBER' }),
      onError: (error) =>
        inviteForm.setError('root', {
          type: 'server',
          message: error.message || 'Could not send the invite.',
        }),
    });
  });

  const workspaceSubmitting = createWorkspace.isPending || workspaceForm.formState.isSubmitting;
  const inviteSubmitting = createInvite.isPending || inviteForm.formState.isSubmitting;

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" aria-hidden />
          <h1 className="font-semibold text-2xl">Set up your workspace</h1>
        </div>

        <ol className="grid grid-cols-3 gap-2 text-xs uppercase tracking-wide">
          <StepIndicator label="Workspace" active={step === 'name'} done={step !== 'name'} />
          <StepIndicator label="Invite team" active={step === 'invite'} done={step === 'done'} />
          <StepIndicator label="Done" active={step === 'done'} done={step === 'done'} />
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
                    aria-invalid={workspaceForm.formState.errors.name ? 'true' : undefined}
                    {...workspaceForm.register('name')}
                  />
                  <FieldError message={workspaceForm.formState.errors.name?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ws-slug">Slug (optional)</Label>
                  <Input
                    id="ws-slug"
                    placeholder="auto-derived from the name"
                    aria-invalid={workspaceForm.formState.errors.slug ? 'true' : undefined}
                    {...workspaceForm.register('slug')}
                  />
                  <FieldError message={workspaceForm.formState.errors.slug?.message} />
                </div>
                <FieldError message={workspaceForm.formState.errors.root?.message} />
                <Button type="submit" className="w-full" disabled={workspaceSubmitting}>
                  {workspaceSubmitting ? 'Creating…' : 'Create workspace'}
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
                    aria-invalid={inviteForm.formState.errors.email ? 'true' : undefined}
                    {...inviteForm.register('email')}
                  />
                  <FieldError message={inviteForm.formState.errors.email?.message} />
                </div>
                <FieldError message={inviteForm.formState.errors.root?.message} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={inviteSubmitting} className="flex-1 gap-2">
                    <Mail className="h-4 w-4" aria-hidden />
                    {inviteSubmitting ? 'Sending…' : 'Send invite'}
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
              <Link to="/" className="block text-center text-muted-foreground text-sm underline">
                Or browse the team
              </Link>
            </CardContent>
          </Card>
        )}

        <p className="flex items-center gap-2 text-muted-foreground text-xs">
          <Users className="h-3.5 w-3.5" aria-hidden /> Roles are scoped per workspace — invites
          land as <span className="font-medium">MEMBER</span> by default.
        </p>
      </div>
    </AppLayout>
  );
};

const StepIndicator = ({
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
