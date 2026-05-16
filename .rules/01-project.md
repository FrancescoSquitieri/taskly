# Project Rules — Foundation

## Project Overview

This project is a **multitenant task manager** built as a Turborepo monorepo.
It is part of a public portfolio, so code quality, consistency, and clarity are priorities.

## Stack (authoritative)

The following stack is the **only** approved stack. Do not propose alternatives unless the user explicitly asks.

**Monorepo & tooling**
- Turborepo
- npm (package manager — workspaces in the root `package.json`)
- Biome (lint + format — replaces ESLint + Prettier)
- Husky + lint-staged (git hooks)
- Commitlint (Conventional Commits enforcement)

**Frontend (`apps/web`)**
- React + Vite — bootstrapped with `npm create vite@latest apps/web -- --template react-ts`, then integrated into the monorepo
- TypeScript
- TanStack Query (server state)
- Axios (HTTP client)
- Zustand (UI state)
- Zod (validation)
- shadcn/ui (sourced from the shared `@repo/ui` package) + Tailwind CSS
- `socket.io-client` (real-time)
- Lucide React (icons)
- Sonner (toasts, consumed via `@repo/ui`)
- React Router DOM (routing)
- **Playwright** (end-to-end tests — see `09-quality.md`)

**Backend — split into TWO apps**

`apps/api` — REST HTTP server
- Node.js (>=20)
- Express
- TypeScript
- **servercn** (boilerplate generator — see `02-servercn.md`)
- Prisma (ORM) + PostgreSQL
- Redis + BullMQ (queues, caching, rate limit storage)
- Nodemailer (SMTP) — or another SMTP provider if servercn provides a richer one
- Zod (validation, shared with the frontend via `/packages`)
- Stateful authentication (server sessions backed by Redis)
- **Jest** (unit + integration tests — see `09-quality.md`)

`apps/ws` — WebSocket server (separate process)
- Node.js (>=20)
- TypeScript
- Socket.IO + `@socket.io/redis-adapter`
- Shares the session store with `apps/api` via Redis (`connect-redis`)
- Consumes domain events from the REST API via Redis pub/sub (channel: `taskly:events`)
- **Jest** for unit tests

**Infrastructure**
- Docker + docker-compose (local dev)
- AWS (production), provisioned via Infrastructure as Code (Terraform or AWS CDK — see `08-devops.md`)
- GitHub Actions (CI/CD)

## Monorepo layout

```
.
├── apps/
│   ├── web/                  # React + Vite client
│   ├── api/                  # Express REST HTTP server
│   └── ws/                   # Socket.IO WebSocket server (separate process)
├── packages/
│   ├── types/                # Shared TypeScript types
│   ├── schemas/              # Shared Zod schemas (single source of truth)
│   ├── constants/            # Shared constants (event names, role names, etc.)
│   ├── config/               # Shared config: tsconfig bases, etc.
│   ├── ui/                   # Shared shadcn/ui component library (Tailwind + Lucide + Sonner)
│   └── utils/                # Pure, environment-agnostic helpers
├── infra/                    # IaC definitions (see 08-devops.md)
├── .rules/                   # These rule files
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml        # postgres, redis, mailhog (dev infra)
├── docker-compose.full.yml   # full stack: api, ws, web, worker, infra
├── biome.json                # root Biome config (lint + format)
├── commitlint.config.js      # commit message rules
├── .husky/                   # git hooks
├── turbo.json
└── package.json              # npm workspaces (apps/* and packages/*)
```

### The `/packages` contract — MANDATORY

Any code that is consumed by **both** `apps/web` and `apps/api` MUST live in a `/packages/*` workspace. This is non-negotiable.

**What goes in `/packages`:**
- Zod schemas for any entity touched by both client and server (User, Task, Project, Tenant, etc.) → `@repo/schemas`
- TypeScript types derived from those schemas → `@repo/types`
- Constants shared between client and server: Socket.IO event names, role identifiers, error codes, validation limits, queue names → `@repo/constants`
- Pure utility functions usable in any environment (no `window`, no `process`, no Node-only APIs) → `@repo/utils`
- shadcn/ui components and the Tailwind theme → `@repo/ui` (consumed only by `apps/web`, but lives in `/packages` because shadcn is generated, not authored, and we want a single source of truth across any future React surface)
- TypeScript and tooling config bases → `@repo/config`

**What does NOT go in `/packages`:**
- Code that depends on the DOM (frontend-only) → stays in `apps/web`
- Code that depends on Node/Express/Prisma (backend-only) → stays in `apps/api`
- Components, hooks, stores, middleware — all app-specific

**Import rule:** Always import shared code via the workspace alias.
- Good: `import { TaskSchema } from "@repo/schemas/task";`
- Bad: `import { TaskSchema } from "../../../../packages/schemas/src/task";`

**Before duplicating any type, schema, constant, or helper across `apps/web` and `apps/api`, STOP.** Move it to the correct `/packages/*` workspace first, then import it in both apps.

### Workspace naming

All internal packages use the `@repo/*` scope. Example `package.json` for `packages/schemas`:

```json
{
  "name": "@repo/schemas",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

## Zod as the single source of truth

For any entity shared between client and server:

1. Define the Zod schema in `@repo/schemas`.
2. Derive the TypeScript type via `z.infer<typeof Schema>` and re-export from `@repo/types`.
3. **Never** define a TypeScript interface for a shared entity manually. Derive it.

```ts
// packages/schemas/src/task.ts
import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: z.enum(["todo", "in_progress", "done"]),
  tenantId: z.string().uuid(),
  createdAt: z.coerce.date(),
});

export type Task = z.infer<typeof TaskSchema>;
```

The same schema is then used by:
- The frontend to validate form input and API responses.
- The backend to validate incoming requests (via servercn's Request Validator component) and outgoing payloads.

## Global naming conventions

These apply to BOTH frontend and backend.

- **Files and folders containing components or domain features**: PascalCase (e.g. `TaskList/Index.tsx`, `TaskBoard/`).
- **Plain modules, scripts, config files**: kebab-case (e.g. `format-date.ts`, `prisma-client.ts`).
- **Variables and functions**: descriptive camelCase. Never single-letter or abbreviated names.
  - Bad: `i`, `x`, `val`, `tmp`, `cb`, `fn`, `res`, `req` (except in Express handlers where `req`/`res` are conventional)
  - Good: `selectedTaskId`, `onTaskCreated`, `tenantIdFromSession`
- **Constants**: SCREAMING_SNAKE_CASE (e.g. `MAX_TASKS_PER_PROJECT`, `SESSION_TTL_SECONDS`).
- **Interfaces and types**: PascalCase. Component prop interfaces are suffixed `Props` (e.g. `TaskCardProps`).
- **Booleans**: prefix with `is`, `has`, `should`, `can` (e.g. `isLoading`, `hasPermission`).
- **Event handlers**: prefix with `on` for props, `handle` for internal handlers (e.g. `onSubmit` prop, `handleSubmit` implementation).
- **Async functions that perform side effects**: verb-first (e.g. `createTask`, `sendEmail`, `invalidateSession`).

## TypeScript — universal

- `strict: true` and `noUncheckedIndexedAccess: true` in every tsconfig. Set once in `@repo/config`.
- **Never use `any`.** If a value's type is genuinely unknown, type it as `unknown` and narrow with a Zod schema or a type guard.
- All function parameters and return types are explicitly typed when they are exported. Inferred return types are acceptable only for non-exported local functions.
- Use `interface` for object shapes (props, entities). Use `type` for unions, intersections, and aliases.
- No `@ts-ignore`. If you really need it, use `@ts-expect-error` with a comment explaining why.

## Code quality — universal

- **No `console.log` in committed code.** Use the logger from `@repo/logger` if added later, or the structured logger from servercn for the backend. The frontend can use a thin `logger` wrapper that no-ops in production.
- **No commented-out code blocks.** Delete it — git remembers.
- **No magic numbers or inline string literals** in business logic. Extract them to a `Constants.ts` file (per-feature) or `@repo/constants` (if shared).
- **No dead exports.** If something is not imported anywhere, remove it.
- Comment only non-obvious logic. Never comment what the code already says.
- Keep functions small and single-responsibility. If a function does more than one thing, split it.

## Packages

- Only install packages that are explicitly listed in these rules OR explicitly requested by the user.
- **Never add a dependency without being asked.** If a task seems to require a new package, stop and ask the user before adding it.
- Never suggest replacing an already-listed package with an alternative.
- For backend dependencies, always check `02-servercn.md` first — many things come from servercn boilerplate and must NOT be manually installed.
