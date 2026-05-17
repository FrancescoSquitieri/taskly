import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginInput, LoginSchema } from '@repo/schemas/auth';
import { Button, Input, Label } from '@repo/ui';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useLogin } from '@/api/auth/use-login';
import { AuthPageShell } from '@/components/auth-page-shell';
import { FieldError } from '@/components/field-error';

export const LoginPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        const next = searchParams.get('next');
        navigate(next?.startsWith('/') ? next : '/', { replace: true });
      },
      onError: (error) => {
        // Map common backend errors to a useful inline state.
        setError('root', {
          type: 'server',
          message: error.message || 'Invalid email or password.',
        });
      },
    });
  });

  const submitting = login.isPending || isSubmitting;

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
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? 'true' : undefined}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <FieldError message={errors.root?.message} />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
