import { describe, expect, it } from '@jest/globals';

import { ApiError } from '@/lib/api-error.js';

describe('ApiError factory helpers', () => {
  it('builds a 400 validation error', () => {
    const err = ApiError.badRequest('Invalid');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('validation_failed');
  });

  it('builds a 401 unauthenticated error', () => {
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('unauthenticated');
  });

  it('builds a 403 forbidden error', () => {
    const err = ApiError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('forbidden');
  });

  it('builds a 404 not found error', () => {
    const err = ApiError.notFound();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('not_found');
  });

  it('builds a 409 conflict error', () => {
    const err = ApiError.conflict('Already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('conflict');
  });
});
