import { zodResolver } from '@hookform/resolvers/zod';
import { type AcceptInviteInput, AcceptInviteSchema } from '@repo/schemas/invite';
import { Button, Input, Label, toast } from '@repo/ui';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useAcceptInvite } from '@/api/auth/use-accept-invite';
import { AuthPageShell } from '@/components/auth-page-shell';
import { FieldError } from '@/components/field-error';

export const AcceptInvitePage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const accept = useAcceptInvite();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(AcceptInviteSchema),
    defaultValues: { token, name: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    const trimmedName = values.name?.trim();
    const payload: AcceptInviteInput = {
      token: values.token,
      name: trimmedName || undefined,
      password: values.password || undefined,
    };
    accept.mutate(payload, {
      onSuccess: (result) => {
        toast.success(
          result.createdAccount
            ? 'Account created and joined the workspace.'
            : 'Joined the workspace.',
        );
        navigate('/', { replace: true });
      },
      onError: (error) =>
        setError('root', {
          type: 'server',
          message: error.message || 'Could not accept the invite.',
        }),
    });
  });

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
        <p className="text-muted-foreground text-sm">No token in the URL.</p>
      </AuthPageShell>
    );
  }

  const submitting = accept.isPending || isSubmitting;

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
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="hidden" {...register('token')} />
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name (new accounts)</Label>
          <Input id="name" aria-invalid={errors.name ? 'true' : undefined} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password (new accounts)</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? 'true' : undefined}
            {...register('password')}
          />
          {errors.password ? (
            <FieldError message={errors.password.message} />
          ) : (
            <p className="text-muted-foreground text-xs">
              Min 8 chars, one upper, one lower, one digit.
            </p>
          )}
        </div>
        <FieldError message={errors.root?.message} />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Joining…' : 'Accept invite'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
