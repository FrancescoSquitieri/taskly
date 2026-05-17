import { zodResolver } from '@hookform/resolvers/zod';
import { type ForgotPasswordInput, ForgotPasswordSchema } from '@repo/schemas/auth';
import { Button, Input, Label } from '@repo/ui';
import { type JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { useForgotPassword } from '@/api/auth/use-forgot-password';
import { AuthPageShell } from '@/components/auth-page-shell';
import { FieldError } from '@/components/field-error';

export const ForgotPasswordPage = (): JSX.Element => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const forgot = useForgotPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    forgot.mutate(values, {
      onSuccess: () => setSubmittedEmail(values.email),
      onError: (error) =>
        setError('root', {
          type: 'server',
          message: error.message || 'Could not send the reset email.',
        }),
    });
  });

  const submitting = forgot.isPending || isSubmitting;

  return (
    <AuthPageShell
      title="Reset your password"
      description="Tell us the email you registered with — we'll send a reset link if it matches an account."
      footer={
        <Link to="/login" className="font-medium text-foreground underline">
          Back to sign in
        </Link>
      }
    >
      {submittedEmail ? (
        <p className="text-muted-foreground text-sm">
          If <span className="font-medium text-foreground">{submittedEmail}</span> is on file, a
          reset email is on its way. Open Mailhog at{' '}
          <a href="http://localhost:8025" className="underline" target="_blank" rel="noreferrer">
            localhost:8025
          </a>{' '}
          in dev to inspect it.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : undefined}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <FieldError message={errors.root?.message} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
};
