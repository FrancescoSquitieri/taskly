import { describe, expect, it } from '@jest/globals';
import { LoginSchema, PasswordSchema, RegisterSchema } from './auth.js';

describe('PasswordSchema', () => {
  it('accepts a complex password', () => {
    expect(PasswordSchema.parse('Str0ngPass')).toBe('Str0ngPass');
  });

  it('rejects passwords without an uppercase letter', () => {
    expect(() => PasswordSchema.parse('weakpass1')).toThrow();
  });

  it('rejects passwords without a digit', () => {
    expect(() => PasswordSchema.parse('WeakPass')).toThrow();
  });

  it('rejects passwords below the minimum length', () => {
    expect(() => PasswordSchema.parse('Aa1')).toThrow();
  });
});

describe('LoginSchema', () => {
  it('normalises the email to lowercase', () => {
    const parsed = LoginSchema.parse({ email: 'Test@Example.COM', password: 'whatever' });
    expect(parsed.email).toBe('test@example.com');
  });
});

describe('RegisterSchema', () => {
  it('rejects when the tenant name is empty', () => {
    expect(() =>
      RegisterSchema.parse({
        email: 'user@example.com',
        password: 'Str0ngPass',
        name: 'User',
        tenantName: '',
      }),
    ).toThrow();
  });
});
