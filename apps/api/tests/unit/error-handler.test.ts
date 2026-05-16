import { describe, expect, it, jest } from '@jest/globals';
import { ZodError } from 'zod';

import { ApiError } from '@/lib/api-error.js';
import { errorHandler } from '@/middleware/error-handler.js';

const buildRes = () => {
  const res = { status: jest.fn(), json: jest.fn() } as unknown as {
    status: jest.Mock;
    json: jest.Mock;
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
};

describe('errorHandler', () => {
  it('renders ApiError with its status and code', () => {
    const res = buildRes();
    errorHandler(ApiError.notFound('Missing'), {} as never, res as never, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: 'not_found', message: 'Missing' }),
      }),
    );
  });

  it('renders ZodError as a 400', () => {
    const res = buildRes();
    const zodError = new ZodError([{ code: 'custom', message: 'bad', path: ['title'] } as never]);
    errorHandler(zodError, {} as never, res as never, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('renders unknown errors as a generic 500', () => {
    const res = buildRes();
    errorHandler(new Error('boom'), {} as never, res as never, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: 'internal_error' }),
      }),
    );
  });
});
