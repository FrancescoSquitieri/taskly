# Project Rules — Index

> **Read this file first.** It tells you which rule files to load based on the task.
> Loading only the relevant files keeps the context window small.

## How to use this index

1. Identify what the task touches (frontend, backend, db, deploy, etc.).
2. **Always** load `01-project.md` — it defines the monorepo, the shared packages contract, and the global naming conventions.
3. Load the additional files matching the task. Do NOT load files unrelated to the task.
4. If the task touches both frontend and backend (e.g. shared type, end-to-end feature), load both relevant files plus `01-project.md`.

## File map

| File | When to load |
|---|---|
| `01-project.md` | **ALWAYS.** Monorepo layout, shared packages, global conventions, stack overview. |
| `02-servercn.md` | **ALWAYS when touching the backend (`apps/api`).** Mandatory consult of servercn docs before any backend change. |
| `03-react.md` | Frontend tasks in `apps/web` (components, hooks, UI, client state, data fetching from UI). |
| `04-node.md` | REST backend tasks in `apps/api` (Express, services, middleware, business logic). |
| `05-database.md` | Schema changes, Prisma migrations, queries, Redis, BullMQ jobs. |
| `06-realtime.md` | WebSocket tasks in `apps/ws` (Socket.IO, rooms, Redis pub/sub bridge with `apps/api`). |
| `07-auth-security.md` | Auth flows, sessions, rate limiting, multitenancy enforcement. |
| `08-devops.md` | Docker, CI/CD, GitHub Actions, AWS / IaC. |
| `09-quality.md` | Biome, Husky, commits, linting, formatting, testing (Playwright + Jest). |
| `10-mcp-skills.md` | MCP servers and skills available for richer output. |

## Trigger examples

- *"Add a new endpoint to create a task"* → `01`, `02`, `04`, `05`, `07` (because it touches multitenancy).
- *"Fix a styling bug in the dashboard"* → `01`, `03`.
- *"Set up a BullMQ job to send emails"* → `01`, `02`, `04`, `05`.
- *"Add a real-time notification when a task is updated"* → `01`, `02`, `04`, `06`, `07`
  (REST publishes the event, `apps/ws` re-emits it to the tenant room).
- *"Update the Dockerfile"* → `01`, `08`.
- *"Add a shared Zod schema for the Task entity"* → `01` (the schema lives in `/packages`).
- *"Add a Playwright test for the dashboard"* → `01`, `03`, `09`.
- *"Add Jest unit tests for the task service"* → `01`, `04`, `09`.

## Golden rules (apply to every task)

- **Shared code goes in `/packages`.** Anything used by both `apps/web` and `apps/api` (types, Zod schemas, constants, helpers) MUST live in a `/packages/*` workspace and be imported by both. Never duplicate.
- **Backend changes require consulting the servercn docs first.** See `02-servercn.md`. This is non-negotiable.
- **No new dependencies without explicit user approval.** If a task seems to need a package not already listed in these rules, stop and ask.
- **No `any`. Ever.** Use `unknown` and narrow it.
- **No `console.log` in committed code.** Use `pino` on the backend (`apps/api`, `apps/ws`)
  and the dev-only logger wrapper in `apps/web/src/lib/logger.ts` on the frontend.
- **Tests are part of every feature.** Backend: Jest (services mocked, repositories + routes
  via supertest). Frontend: Playwright spec covering the user-visible flow. See `09-quality.md`.
