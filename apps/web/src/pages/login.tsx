import { LoginSchema } from '@repo/schemas/auth';
import { Button, Input, Label, toast } from '@repo/ui';
import { type FormEvent, type JSX, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useLogin } from '@/api/auth/use-login';
import { AuthPageShell } from '@/components/auth-page-shell';

export const LoginPage = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error('Please enter a valid email and password.');
      return;
    }
    login.mutate(parsed.data, {
      onSuccess: () => {
        const next = searchParams.get('next');
        navigate(next?.startsWith('/') ? next : '/', { replace: true });
      },
    });
  };

  return (
    <AuthPageShell
      title="Welcome back"
      description="Log in to keep your deep-work streak alive."
      footer={
        <>
          <span>
            New to Taskly?{' '}
            <Link to="/register" className="font-medium text-foreground underline">
              Create an account
            </Link>
          </span>
          <Link to="/forgot-password" className="text-foreground underline">
            Forgot password?
          </Link>
        </>
      }
    >
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
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
