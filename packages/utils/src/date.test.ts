import { describe, expect, it } from '@jest/globals';
import { isFutureDate, toIsoString } from './date.js';

describe('toIsoString', () => {
  it('serializes a Date to ISO format', () => {
    expect(toIsoString(new Date('2026-05-16T10:00:00Z'))).toBe('2026-05-16T10:00:00.000Z');
  });

  it('throws on an invalid input', () => {
    expect(() => toIsoString('not-a-date')).toThrow('Invalid date');
  });
});

describe('isFutureDate', () => {
  it('returns true for a future ISO string', () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isFutureDate(future)).toBe(true);
  });

  it('returns false for a past ISO string', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isFutureDate(past)).toBe(false);
  });
});
