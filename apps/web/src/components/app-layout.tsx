import { Button } from '@repo/ui';
import { LogOut, Sparkles } from 'lucide-react';
import type { JSX, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useLogout } from '@/api/auth/use-logout';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { TenantSwitcher } from '@/components/tenant-switcher';
import { useAuth } from '@/hooks/use-auth';

export const AppLayout = ({ children }: { children: ReactNode }): JSX.Element => {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout.mutate(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            <span>Taskly</span>
          </Link>
          <div className="flex items-center gap-4">
            <TenantSwitcher />
            {user && (
              <span className="text-muted-foreground text-sm" aria-label="signed-in user">
                {user.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="gap-1.5"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container space-y-4 py-8">
        <EmailVerificationBanner />
        {children}
      </main>
    </div>
  );
};
