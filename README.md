# Taskly

Multitenant task manager. Turborepo monorepo. Public portfolio project — code quality,
consistency, and clarity are first-class.

## Stack

| Surface | Stack |
|---|---|
| `apps/web` | React 19 + Vite + TypeScript, TanStack Query, Axios, Zustand, Zod, shadcn/ui (via `@repo/ui`), Tailwind, Lucide, Sonner, Socket.IO client, Playwright |
| `apps/api` | Node 20 + Express, TypeScript, Prisma + Postgres, Redis + BullMQ, `connect-redis` sessions, pino, helmet, express-rate-limit, Jest |
| `apps/ws`  | Node 20 + Socket.IO, `@socket.io/redis-adapter`, shared Redis-backed sessions, Jest |
| Tooling    | Turborepo, npm workspaces, Biome (lint + format), Husky + lint-staged, Commitlint, Conventional Commits |

The full set of rules and conventions lives in [`.rules/`](./.rules/00-index.md).

## Layout

```
.
├── apps/
│   ├── web/        # React + Vite client
│   ├── api/        # REST HTTP server (Express)
│   └── ws/         # WebSocket server (Socket.IO, separate process)
├── packages/
│   ├── config/     # Shared tsconfig bases
│   ├── constants/  # Socket event names, roles, queue names, error codes, limits
│   ├── schemas/    # Shared Zod schemas (single source of truth)
│   ├── types/      # Types derived from @repo/schemas + contract-only types
│   ├── ui/         # Shared shadcn/ui component library (Tailwind, Lucide, Sonner)
│   └── utils/      # Pure, environment-agnostic helpers
├── docker-compose.yml       # Full stack (api, worker, ws, web + postgres, redis, mailhog, migrate)
├── docker-compose.infra.yml # Infra only (postgres, redis, mailhog) — for dev on the host
├── biome.json
├── commitlint.config.js
├── .husky/
└── turbo.json
```

## Getting started

There are two supported workflows.

### A) Everything in Docker (one command)

Builds and starts the full stack (Postgres, Redis, Mailhog, **migrate one-shot**, api,
worker, ws, web) as containers:

```sh
npm install     # installs tooling and git hooks
npm run start   # alias of `npm run docker:up:build` — builds and starts everything
```

Other useful scripts:

```sh
npm run docker:up           # start in background (no rebuild)
npm run docker:up:fg        # start in foreground with logs attached
npm run docker:down         # stop and remove containers
npm run docker:down:volumes # stop and wipe Postgres + Redis data
npm run docker:logs         # follow logs of every service
npm run docker:ps           # show service status
npm run docker:migrate      # re-run Prisma migrations against the container DB
```

The `migrate` service runs `prisma migrate deploy` exactly once at boot; the `api`
and `worker` containers wait for it via `service_completed_successfully`.

### B) Dev workflow (apps on the host, only infra in Docker)

```sh
npm install
npm run docker:infra:up                                 # postgres + redis + mailhog only

# Copy env examples once (and tweak if needed)
cp apps/api/.env.example apps/api/.env
cp apps/ws/.env.example  apps/ws/.env
cp apps/web/.env.example apps/web/.env

npm exec --workspace=@taskly/api -- prisma generate
npm exec --workspace=@taskly/api -- prisma migrate dev  # applies migrations under apps/api/prisma/migrations
npm exec --workspace=@taskly/api -- prisma db seed      # loads the demo dataset

npm run dev                                             # turbo dev across every workspace

# In a separate terminal, optionally:
npm exec --workspace=@taskly/api -- npm run worker:dev
```

#### Demo accounts

The seeder creates two tenants — **Acme Studio** (`acme-studio`) and **Northwind Labs** (`northwind-labs`) — with five cross-cutting users:

| Email | Workspaces / role |
|---|---|
| `alice@taskly.dev` | Acme `OWNER`, Northwind `MEMBER` |
| `bob@taskly.dev`   | Acme `MEMBER`, Northwind `OWNER` |
| `carol@taskly.dev` | Acme `ADMIN` |
| `dave@taskly.dev`  | Acme `MEMBER` |
| `erin@taskly.dev`  | Northwind `MEMBER` |

Password for every account: `Password123!`. To wipe and reload the demo data at any time:

```sh
npm exec --workspace=@taskly/api -- prisma db seed
```

API documentation (stub) is served at <http://localhost:4000/api/docs>; JSON spec at <http://localhost:4000/api/docs.json>. Full OpenAPI auto-gen from Zod ships in Sprint 12 — see [TODO.md](./TODO.md).

Default ports:

| Service     | Port |
|-------------|------|
| `apps/web`  | 5173 |
| `apps/api`  | 4000 |
| `apps/ws`   | 4001 |
| Postgres    | 5432 |
| Redis       | 6379 |
| Mailhog UI  | 8025 |

## How `apps/web` was bootstrapped

```sh
npm create vite@latest apps/web -- --template react-ts
```

…then integrated into the monorepo (Tailwind, `@repo/ui`, `@repo/schemas`, etc.).

## How `@repo/ui` was bootstrapped

shadcn/ui is initialized inside `packages/ui` (`packages/ui/components.json`). To add a
component:

```sh
npx shadcn@latest add <component> -c packages/ui
```

The component lands in `packages/ui/src/components/ui/<component>.tsx` and is consumed by
`apps/web` via `import { ... } from '@repo/ui'`.

## Testing

- Frontend E2E — Playwright in `apps/web/e2e/`: `npm run test:e2e --workspace=@taskly/web`
- Backend unit + integration — Jest in `apps/api` and `apps/ws`:
  `npm run test --workspace=@taskly/api` / `--workspace=@taskly/ws`
- Shared packages — Jest in `packages/schemas` and `packages/utils`
- Run everything: `npm run test`

See [`/.rules/09-quality.md`](./.rules/09-quality.md) for the full testing contract.

## Git hooks

Husky is installed via `npm run prepare`. Hooks:

- `pre-commit`  → lint-staged (Biome) + typecheck affected workspaces
- `commit-msg`  → commitlint (Conventional Commits)
- `pre-push`    → lint + typecheck + test on affected workspaces

## CI

Continuous integration runs on every push to `main` and every pull request via
[`.github/workflows/ci.yml`](./.github/workflows/ci.yml). It performs `npm ci`,
generates the Prisma client, then runs `turbo run lint check-types test` across
the whole monorepo.

## Roadmap

The project follows a sprint-based backlog tracked in [`TODO.md`](./TODO.md).
Each feature flips from `[ ]` to `[x]` in the same commit that ships it. See
[`.rules/11-backlog.md`](./.rules/11-backlog.md) for the conventions and the
project plan for the design rationale.

## Docker

- `docker-compose.yml`       — **full stack**: postgres, redis, mailhog, migrate, api,
  worker, ws, web. Started by `npm run start`.
- `docker-compose.infra.yml` — **infra only**: postgres, redis, mailhog. Started by
  `npm run docker:infra:up` when you want to run apps on the host.

Each app has a multi-stage `Dockerfile` (`pruner → deps → build → runner`) using
`turbo prune` so images stay minimal and cacheable. `apps/web` ends as a static SPA
served by `nginx:alpine` (~30MB); `apps/api`, `apps/ws`, and the worker run on
`node:20-alpine` with `tini` as PID 1 and a non-root user.

Container env values come from the compose file with sensible defaults; override them
by copying `.env.docker.example` to `.env` and editing it.
