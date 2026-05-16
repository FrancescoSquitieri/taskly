# Database Rules — Prisma + PostgreSQL, Redis, BullMQ

## Prisma + PostgreSQL

### Setup

- Prisma client is initialized **once** in `apps/api/src/lib/prisma.ts` and exported as a singleton.
- In development, use the global-singleton pattern to prevent hot-reload from creating multiple clients:
  ```ts
  // src/lib/prisma.ts
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
- Prisma client is imported ONLY in `*.repository.ts` files. Never in services, controllers, or routes.

### Schema conventions

- Schema file: `apps/api/prisma/schema.prisma`.
- `provider = "postgresql"`.
- Every multitenant model has a `tenantId String` field with an index. No exceptions for tables holding user data.
- Soft delete via `deletedAt DateTime?` where applicable. Repositories always filter `deletedAt: null` by default.
- Timestamps: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- Primary keys: UUIDs via `@default(uuid())` unless there is a strong reason for an integer ID.
- Snake_case for column names via `@map`, PascalCase for model names. Example:
  ```prisma
  model Task {
    id        String   @id @default(uuid())
    tenantId  String   @map("tenant_id")
    title     String
    createdAt DateTime @default(now()) @map("created_at")

    @@index([tenantId])
    @@map("tasks")
  }
  ```

### Migrations

- Every schema change ships with a Prisma migration via `npx prisma migrate dev --name <descriptive-name>`.
- Migration names are kebab-case and describe the intent (e.g. `add-task-priority`, `index-tasks-by-tenant`).
- **Never edit a migration that has already been applied to a shared environment.** Roll forward with a new migration.
- `npx prisma migrate deploy` is the CI/CD command for production. It runs as part of the deploy pipeline (see `08-devops.md`).

### Repository pattern

Repositories are the only place Prisma is imported. They:

1. Always scope by `tenantId` for tenant-owned tables. The repository accepts `tenantId` as a parameter and includes it in every `where` clause.
2. Return plain domain objects (Prisma types are fine when they match `@repo/types`; if they diverge, map at the boundary).
3. Do not throw business errors. They throw on infrastructure failure only. Business errors (e.g. "not found") are decided by the service.

```ts
// task.repository.ts
import { prisma } from "@/lib/prisma";

export const taskRepository = {
  findManyByTenant: (tenantId: string) =>
    prisma.task.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),

  findById: (tenantId: string, id: string) =>
    prisma.task.findFirst({ where: { id, tenantId, deletedAt: null } }),

  create: (data: Prisma.TaskCreateInput) => prisma.task.create({ data }),
};
```

### Transactions

- Use `prisma.$transaction()` for any operation that mutates multiple tables and must be atomic (e.g. create user + create membership + log audit event).
- Prefer the array form for independent writes; use the callback form when later writes depend on earlier reads.

### Query performance

- For any list endpoint, support pagination (cursor-based preferred over offset). Limit page size server-side with a Zod schema (e.g. `max: 100`).
- Add indexes for every column used in a `where` clause on a hot path. `tenantId` is always indexed; the combination `(tenantId, <filterColumn>)` is the right composite index for most listing queries.
- Use `select` to fetch only needed columns when the response is a projection of the full entity.
- Detect N+1 problems early. Use `include` or `findMany` with relations rather than per-item lookups.

---

## Redis

### Use cases

Redis is used for:
- **Session storage** for stateful auth (see `07-auth-security.md`).
- **Rate limiting** (token bucket — see `07-auth-security.md`).
- **BullMQ** queue and job state.
- **Caching** for read-heavy, slow-to-compute data (optional, when justified).
- **Pub/Sub for Socket.IO** when there is more than one API instance (see `06-realtime.md`).

### Setup

- Use `ioredis` as the client.
- Single `Redis` instance for general use, exported from `apps/api/src/lib/redis.ts`.
- BullMQ may use a separate connection (and `maxRetriesPerRequest: null` is required for BullMQ).
- The Socket.IO adapter uses a dedicated pub + sub pair.

### Key namespacing

All Redis keys are prefixed by domain and, where relevant, tenant. Use a helper to build keys — never construct strings inline.

```ts
// src/lib/redis-keys.ts
export const redisKeys = {
  session: (sessionId: string) => `session:${sessionId}`,
  rateLimit: (bucket: string, identifier: string) => `rl:${bucket}:${identifier}`,
  cache: (tenantId: string, resource: string, id: string) => `cache:${tenantId}:${resource}:${id}`,
};
```

### TTLs

- Every cached key MUST have an explicit TTL. Unbounded keys in Redis are a leak.
- Sessions: TTL refreshed on each request (sliding expiration).
- Rate-limit buckets: TTL slightly longer than the bucket window.

---

## BullMQ

### When to use a queue

Use a queue (not an inline call) when the work:
- Is slow (>200ms typical) and not blocking the user response.
- Should retry on failure.
- Should be deferred or scheduled.
- Has fan-out (one event → many side effects).

Examples: sending emails, generating reports, processing webhooks, syncing to external systems, scheduled cleanup.

### Structure

```
apps/api/src/jobs/
├── queues/
│   ├── email.queue.ts          # Queue definition + typed `add` helper
│   └── notification.queue.ts
├── workers/
│   ├── email.worker.ts         # Worker process logic
│   └── notification.worker.ts
└── index.ts                    # Worker bootstrap (run as separate process in prod)
```

### Conventions

- Each queue has a typed `JobData` Zod schema in its file. Producers validate before enqueueing; workers re-validate at the start of the processor (queues are an external boundary).
- Job names within a queue are kebab-case strings declared as constants in `@repo/constants` so producers and workers agree.
- Default job options: `attempts: 3`, exponential backoff, `removeOnComplete: { age: 86400, count: 1000 }`, `removeOnFail: { age: 7 * 86400 }`.
- Workers run as a **separate process** in production (separate container in the docker-compose / ECS setup — see `08-devops.md`), not inside the API process. In development they can run in the same process for convenience.
- Workers MUST log every job start, completion, and failure via the structured logger with `jobId`, `queueName`, and `attempt` fields.
- Workers MUST NOT swallow errors. Let BullMQ retry per the queue's policy. Throw to fail the job.

### Multitenancy in jobs

Job payloads MUST include `tenantId`. Workers MUST scope their database operations by it (same rule as the API). A job has no implicit "current tenant" — the producer states it explicitly.

```ts
const EmailJobDataSchema = z.object({
  tenantId: z.string().uuid(),
  to: z.string().email(),
  template: z.enum(["welcome", "password-reset", "invitation"]),
  variables: z.record(z.string(), z.unknown()),
});
```
