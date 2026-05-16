import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    tenantId: string;
    roles: string[];
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        tenantId: string;
        roles: string[];
      };
    }
  }
}
