import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from '@/config/env.js';
import { authRouter } from '@/features/auth/auth.routes.js';
import { healthRouter } from '@/features/health/health.routes.js';
import { projectRouter } from '@/features/project/project.routes.js';
import { taskRouter } from '@/features/task/task.routes.js';
import { tenantRouter } from '@/features/tenant/tenant.routes.js';
import { logger } from '@/lib/logger.js';
import { openApiSpec } from '@/lib/openapi.js';
import { errorHandler, notFoundHandler } from '@/middleware/error-handler.js';
import { globalRateLimiter } from '@/middleware/rate-limit.js';
import { sessionMiddleware } from '@/middleware/session.js';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.use(pinoHttp({ logger }));
  app.use(globalRateLimiter);

  app.use('/', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/tasks', taskRouter);
  app.use('/api/v1/projects', projectRouter);
  app.use('/api/v1/workspaces', tenantRouter);

  app.get('/api/docs.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
