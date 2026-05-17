process.env.NODE_ENV = 'test';
process.env.API_PORT = process.env.API_PORT ?? '4099';
process.env.WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://taskly:taskly@localhost:5432/taskly_test?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379/1';
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET ?? 'test-secret-test-secret-test-secret-32+';
