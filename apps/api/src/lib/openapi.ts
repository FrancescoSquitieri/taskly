/**
 * OpenAPI documentation provider.
 *
 * Sprint 0 ships a minimal hand-curated spec and mounts it under `/api/docs`
 * via swagger-ui-express. In Sprint 12 this will be replaced by an auto-gen
 * pipeline that derives the spec from `@repo/schemas` Zod definitions (see
 * `TODO.md` and the project plan).
 */

export type OpenApiSpec = {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers: Array<{ url: string; description?: string }>;
  paths: Record<string, unknown>;
  components?: Record<string, unknown>;
};

export const openApiSpec: OpenApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Taskly API',
    version: '0.0.0',
    description:
      'Stub OpenAPI document. Full schema will be auto-generated from Zod sources during Sprint 12.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  paths: {
    '/healthz': {
      get: {
        summary: 'Health probe',
        responses: { 200: { description: 'Service is up' } },
      },
    },
  },
};
