import { describe, expect, it, jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

jest.unstable_mockModule('@/lib/prisma.js', () => ({
  prisma: {
    $queryRaw: jest.fn(() => Promise.resolve([{ '?column?': 1 }])),
  },
}));

jest.unstable_mockModule('@/lib/redis.js', () => ({
  redis: { ping: jest.fn(() => Promise.resolve('PONG')) },
  redisQueueConnection: {},
  redisKeys: {},
}));

const { healthRouter } = await import('@/features/health/health.routes.js');

const buildApp = () => {
  const app = express();
  app.use('/', healthRouter);
  return app;
};

describe('GET /healthz', () => {
  it('returns 200 with status ok', async () => {
    const response = await request(buildApp()).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ok: true, data: { status: 'ok' } });
  });
});

describe('GET /readyz', () => {
  it('returns 200 when prisma and redis respond', async () => {
    const response = await request(buildApp()).get('/readyz');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ok: true, data: { status: 'ready' } });
  });
});
