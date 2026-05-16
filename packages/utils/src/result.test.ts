import { describe, expect, it } from '@jest/globals';
import { err, isOk, ok } from './result.js';

describe('Result helpers', () => {
  it('builds an ok variant', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    expect(isOk(result)).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it('builds an err variant', () => {
    const result = err(new Error('boom'));
    expect(result.ok).toBe(false);
    expect(isOk(result)).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('boom');
    }
  });
});
