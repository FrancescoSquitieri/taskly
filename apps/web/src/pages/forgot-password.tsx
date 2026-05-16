import { ForgotPasswordSchema } from '@repo/schemas/auth';
import { Button, Input, Label, toast } from '@repo/ui';
import { type FormEvent, type JSX, useState } from 'react';
import { Link } from 'react-router-dom';

import { useForgotPassword } from '@/api/auth/use-forgot-password';
import { AuthPageShell } from '@/components/auth-page-shell';

export const ForgotPasswordPage = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const forgot = useForgotPassword();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = ForgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error('Enter a valid email address.');
      return;
    }
    forgot.mutate(parsed.data, {
      onSuccess: () => setSubmitted(true),
    });
  };

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
      {submitted ? (
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{email}</span> is on file, a reset email
          is on its way. Open Mailhog at{' '}
          <a href="http://localhost:8025" className="underline" target="_blank" rel="noreferrer">
            localhost:8025
          </a>{' '}
          in dev to inspect it.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
};
