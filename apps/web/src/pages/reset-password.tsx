import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordSchema, type ResetPasswordInput, ResetPasswordSchema } from '@repo/schemas/auth';
import { Button, Input, Label, toast } from '@repo/ui';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { z } from 'zod';

import { useResetPassword } from '@/api/auth/use-reset-password';
import { AuthPageShell } from '@/components/auth-page-shell';
import { FieldError } from '@/components/field-error';

const ResetPasswordFormSchema = ResetPasswordSchema.extend({
  confirm: PasswordSchema,
}).refine((values) => values.password === values.confirm, {
  path: ['confirm'],
  message: 'Passwords do not match',
});
type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;

export const ResetPasswordPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const reset = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { token, password: '', confirm: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(({ confirm: _confirm, ...payload }) => {
    void _confirm;
    reset.mutate(payload as ResetPasswordInput, {
      onSuccess: () => {
        toast.success('Password updated. Sign in with the new one.');
        navigate('/login', { replace: true });
      },
      onError: (error) =>
        setError('root', {
          type: 'server',
          message: error.message || 'Could not update the password.',
        }),
    });
  });

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
        <p className="text-muted-foreground text-sm">No token in the URL.</p>
      </AuthPageShell>
    );
  }

  const submitting = reset.isPending || isSubmitting;

  return (
    <AuthPageShell
      title="Pick a new password"
      description="Strong, fresh, easy to remember — one of these is enough."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="hidden" {...register('token')} />
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
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
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.confirm ? 'true' : undefined}
            {...register('confirm')}
          />
          <FieldError message={errors.confirm?.message} />
        </div>
        <FieldError message={errors.root?.message} />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
