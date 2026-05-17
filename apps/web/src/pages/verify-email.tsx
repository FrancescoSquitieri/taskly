import { Button, toast } from '@repo/ui';
import { type JSX, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useVerifyEmail } from '@/api/auth/use-verify-email';
import { AuthPageShell } from '@/components/auth-page-shell';

type Status = 'pending' | 'success' | 'already' | 'error';

export const VerifyEmailPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<Status>('pending');
  const verifyEmail = useVerifyEmail();
  const navigate = useNavigate();
  const triggered = useRef(false);

  useEffect(() => {
    if (!token || triggered.current) return;
    triggered.current = true;
    verifyEmail.mutate(
      { token },
      {
        onSuccess: (result) => {
          setStatus(result.alreadyVerified ? 'already' : 'success');
          if (!result.alreadyVerified) {
            toast.success('Email confirmed.');
          }
        },
        onError: () => {
          setStatus('error');
        },
      },
    );
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <AuthPageShell
        title="Verification link missing"
        description="This page expects a `token` query parameter — open the link from your email."
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

  if (status === 'pending') {
    return (
      <AuthPageShell title="Confirming your email…" description="One moment.">
        <p className="text-muted-foreground text-sm">Validating the link.</p>
      </AuthPageShell>
    );
  }

  if (status === 'error') {
    return (
      <AuthPageShell
        title="Could not confirm the email"
        description="The link is invalid or expired. Request a new one from the dashboard once you sign in."
        footer={
          <Link to="/login" className="font-medium text-foreground underline">
            Back to sign in
          </Link>
        }
      >
        <p className="text-muted-foreground text-sm">
          If you keep seeing this, ask your workspace admin to re-invite you.
        </p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title={status === 'already' ? 'Already confirmed' : 'Email confirmed'}
      description={
        status === 'already'
          ? 'This email was already verified — nothing else to do.'
          : 'Thanks for confirming your email. You can keep using Taskly.'
      }
    >
      <Button className="w-full" onClick={() => navigate('/', { replace: true })}>
        Continue
      </Button>
    </AuthPageShell>
  );
};
