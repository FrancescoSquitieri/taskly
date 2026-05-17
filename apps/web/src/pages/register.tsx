import { zodResolver } from '@hookform/resolvers/zod';
import { type RegisterInput, RegisterSchema } from '@repo/schemas/auth';
import { Button, Input, Label, toast } from '@repo/ui';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useRegister } from '@/api/auth/use-register';
import { AuthPageShell } from '@/components/auth-page-shell';
import { FieldError } from '@/components/field-error';

export const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();
  const register = useRegister();

  const {
    register: rhfRegister,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '', tenantName: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    register.mutate(values, {
      onSuccess: () => {
        toast.success(`Welcome, ${values.name}! Check your email to confirm the account.`);
        navigate('/', { replace: true });
      },
      onError: (error) => {
        const message = error.message || 'Could not create the account.';
        if (/already exists/i.test(message)) {
          setError('email', { type: 'server', message });
          return;
        }
        setError('root', { type: 'server', message });
      },
    });
  });

  const submitting = register.isPending || isSubmitting;

  return (
    <AuthPageShell
      title="Create your workspace"
      description="One account, a fresh workspace, instant focus."
      footer={
        <span>
          Already on Taskly?{' '}
          <Link to="/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : undefined}
            {...rhfRegister('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : undefined}
            {...rhfRegister('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? 'true' : undefined}
            {...rhfRegister('password')}
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
          <Label htmlFor="tenantName">Workspace name</Label>
          <Input
            id="tenantName"
            aria-invalid={errors.tenantName ? 'true' : undefined}
            {...rhfRegister('tenantName')}
          />
          <FieldError message={errors.tenantName?.message} />
        </div>
        <FieldError message={errors.root?.message} />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating workspace…' : 'Create account'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
