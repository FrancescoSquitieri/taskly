import { Button, toast } from '@repo/ui';
import { MailWarning } from 'lucide-react';
import type { JSX } from 'react';

import { useResendVerification } from '@/api/auth/use-resend-verification';
import { useAuth } from '@/hooks/use-auth';

export const EmailVerificationBanner = (): JSX.Element | null => {
  const { user } = useAuth();
  const resend = useResendVerification();

  if (!user || user.emailVerifiedAt) return null;

  const handleResend = () => {
    resend.mutate(
      { email: user.email },
      {
        onSuccess: () =>
          toast.success('Verification email sent — check your inbox (or Mailhog in dev).'),
      },
    );
  };

  return (
    <div
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300/60 bg-amber-50 px-4 py-3 text-amber-900 text-sm dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <div className="flex items-center gap-2">
        <MailWarning className="h-4 w-4" aria-hidden />
        <span>
          Confirm your email <span className="font-medium">{user.email}</span> to keep your account
          active.
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleResend}
        disabled={resend.isPending}
        className="border-amber-300/60 bg-transparent hover:bg-amber-100/60 dark:border-amber-700/60 dark:hover:bg-amber-900/50"
      >
        {resend.isPending ? 'Sending…' : 'Resend email'}
      </Button>
    </div>
  );
};
