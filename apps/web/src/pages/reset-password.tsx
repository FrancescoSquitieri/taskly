import { ResetPasswordSchema } from '@repo/schemas/auth';
import { Button, Input, Label, toast } from '@repo/ui';
import { type FormEvent, type JSX, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useResetPassword } from '@/api/auth/use-reset-password';
import { AuthPageShell } from '@/components/auth-page-shell';

export const ResetPasswordPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const reset = useResetPassword();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    const parsed = ResetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input.');
      return;
    }
    reset.mutate(parsed.data, {
      onSuccess: () => {
        toast.success('Password updated. Sign in with the new one.');
        navigate('/login', { replace: true });
      },
    });
  };

  if (!token) {
    return (
      <AuthPageShell
        title="Reset link missing"
        description="This page expects a `token` query parameter — open the link from your email."
        footer={
          <Link to="/forgot-password" className="font-medium text-foreground underline">
            Request a new reset email
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">No token in the URL.</p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Pick a new password"
      description="Strong, fresh, easy to remember — one of these is enough."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Min 8 chars, one upper, one lower, one digit.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={reset.isPending}>
          {reset.isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
