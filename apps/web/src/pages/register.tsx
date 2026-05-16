import { RegisterSchema } from '@repo/schemas/auth';
import { Button, Input, Label, toast } from '@repo/ui';
import { type FormEvent, type JSX, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useRegister } from '@/api/auth/use-register';
import { AuthPageShell } from '@/components/auth-page-shell';

export const RegisterPage = (): JSX.Element => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const navigate = useNavigate();
  const register = useRegister();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = RegisterSchema.safeParse({ name, email, password, tenantName });
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input';
      toast.error(firstError);
      return;
    }
    register.mutate(parsed.data, {
      onSuccess: () => {
        toast.success(`Welcome, ${parsed.data.name}!`);
        navigate('/', { replace: true });
      },
    });
  };

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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Min 8 chars, one upper, one lower, one digit.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tenantName">Workspace name</Label>
          <Input
            id="tenantName"
            required
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? 'Creating workspace…' : 'Create account'}
        </Button>
      </form>
    </AuthPageShell>
  );
};
