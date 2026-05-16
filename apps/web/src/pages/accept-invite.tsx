import { AcceptInviteSchema } from '@repo/schemas/invite';
import { Button, Input, Label, toast } from '@repo/ui';
import { type FormEvent, type JSX, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useAcceptInvite } from '@/api/auth/use-accept-invite';
import { AuthPageShell } from '@/components/auth-page-shell';

export const AcceptInvitePage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const accept = useAcceptInvite();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmedName = name.trim();
    const parsed = AcceptInviteSchema.safeParse({
      token,
      name: trimmedName || undefined,
      password: password || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input.');
      return;
    }
    accept.mutate(parsed.data, {
      onSuccess: (result) => {
        toast.success(
          result.createdAccount
            ? 'Account created and joined the workspace.'
            : 'Joined the workspace.',
        );
        navigate('/', { replace: true });
      },
    });
  };

  if (!token) {
    return (
      <AuthPageShell
        title="Invite link is invalid"
        description="This page needs a `token` query parameter. Re-open the link from the email."
        footer={
          <Link to="/login" className="font-medium text-foreground underline">
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">No token in the URL.</p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Accept your invite"
      description="If your email is already on Taskly, leave the bottom fields empty and we'll just add this workspace to your account."
      footer={
        <span>
          Already on Taskly?{' '}
          <Link to="/login" className="font-medium text-foreground underline">
            Sign in first
          </Link>{' '}
          and the invite will join the workspace automatically.
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name (new accounts)</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password (new accounts)</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Min 8 chars, one upper, one lower, one digit.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={accept.isPending}>
          {accept.isPending ? 'Joining…' : 'Accept invite'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
