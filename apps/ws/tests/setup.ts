process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT ?? '4098';
process.env.WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379/2';
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET ?? 'test-secret-test-secret-test-secret-32+';
process.env.USE_SOCKET_REDIS_ADAPTER = 'false';
