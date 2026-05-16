import crypto from 'node:crypto';

import {
  InviteTokenPayloadSchema,
  type InviteTokenPayload,
  PasswordResetTokenPayloadSchema,
  type PasswordResetTokenPayload,
} from '@repo/schemas/invite';

import { env } from '@/config/env.js';

const encode = (buf: Buffer): string => buf.toString('base64url');
const decode = (s: string): Buffer => Buffer.from(s, 'base64url');

const sign = (payload: object): string => {
  const body = encode(Buffer.from(JSON.stringify(payload), 'utf-8'));
  const sig = crypto.createHmac('sha256', env.SESSION_SECRET).update(body).digest();
  return `${body}.${encode(sig)}`;
};

const verifyAndDecode = (token: string): unknown => {
  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('Malformed token');
  }
  const [body, signature] = parts as [string, string];
  const expectedSig = crypto.createHmac('sha256', env.SESSION_SECRET).update(body).digest();
  const providedSig = decode(signature);
  if (
    expectedSig.length !== providedSig.length ||
    !crypto.timingSafeEqual(expectedSig, providedSig)
  ) {
    throw new Error('Invalid token signature');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(decode(body).toString('utf-8'));
  } catch {
    throw new Error('Malformed token payload');
  }
  return parsed;
};

const ensureNotExpired = (exp: number): void => {
  if (exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
};

export const tokenUtils = {
  signInvite: (
    payload: Omit<InviteTokenPayload, 'v' | 'iat' | 'exp'>,
    ttlSeconds: number,
  ): string => {
    const now = Math.floor(Date.now() / 1000);
    const full: InviteTokenPayload = {
      v: 1,
      ...payload,
      iat: now,
      exp: now + ttlSeconds,
    };
    return sign(full);
  },

  verifyInvite: (token: string): InviteTokenPayload => {
    const parsed = verifyAndDecode(token);
    const data = InviteTokenPayloadSchema.parse(parsed);
    ensureNotExpired(data.exp);
    return data;
  },

  signPasswordReset: (
    payload: Omit<PasswordResetTokenPayload, 'v' | 'iat' | 'exp'>,
    ttlSeconds: number,
  ): string => {
    const now = Math.floor(Date.now() / 1000);
    const full: PasswordResetTokenPayload = {
      v: 1,
      ...payload,
      iat: now,
      exp: now + ttlSeconds,
    };
    return sign(full);
  },

  verifyPasswordReset: (token: string): PasswordResetTokenPayload => {
    const parsed = verifyAndDecode(token);
    const data = PasswordResetTokenPayloadSchema.parse(parsed);
    ensureNotExpired(data.exp);
    return data;
  },
};
