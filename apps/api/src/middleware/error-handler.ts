import { ERROR_CODES } from '@repo/constants/errors';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { ApiError } from '@/lib/api-error.js';
import { logger } from '@/lib/logger.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: {
        code: ERROR_CODES.VALIDATION,
        message: 'Invalid request payload',
        details: err.flatten(),
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    ok: false,
    error: {
      code: ERROR_CODES.INTERNAL,
      message: 'Internal server error',
    },
  });
};

export const notFoundHandler: ErrorRequestHandler = (_err, _req, res, _next) => {
  res.status(404).json({
    ok: false,
    error: { code: ERROR_CODES.NOT_FOUND, message: 'Route not found' },
  });
};
