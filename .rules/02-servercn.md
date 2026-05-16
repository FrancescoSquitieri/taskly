# Backend Rules — servercn (MANDATORY)

> **READ THIS BEFORE ANY BACKEND CHANGE.** No exceptions.

The backend is built on **servercn** (https://servercn.vercel.app), a boilerplate / component generator for Node.js + Express. Components are scaffolded into the codebase via a CLI — they are NOT runtime dependencies. The project owns the generated code.

## The non-negotiable rule

**Before adding any backend functionality — middleware, utility, provider, integration, schema, or pattern — you MUST consult the servercn documentation first to check whether servercn already provides it as a component, provider, blueprint, foundation, or schema.**

If servercn provides it: generate it via the CLI. Do NOT hand-write equivalent code. Do NOT install equivalent packages manually.

If servercn does not provide it: only then write it manually, and document the decision in the PR description.

This rule applies to (non-exhaustive):

- Error handling, response formatting, async handler wrappers
- Authentication middleware (JWT, OAuth, sessions)
- Email service, SMTP integration (Nodemailer, Resend)
- Environment configuration, env validation
- File upload (Cloudinary, ImageKit)
- Rate limiting
- Request validation (Zod-based)
- Role-based access control (RBAC)
- Security headers
- Structured logger
- Swagger / OpenAPI documentation
- JWT and OTP/token utilities
- Health check endpoints
- Graceful shutdown
- Background jobs (cron)
- Database providers (Prisma, Drizzle, Mongoose)
- Redis provider

## Mandatory workflow

For **every** backend task, follow these steps in order:

1. **Identify what the task needs.** Example: "I need to add rate limiting to the login endpoint."
2. **Check the servercn docs first.** Navigate to https://servercn.vercel.app and find the relevant section:
   - **Components** → https://servercn.vercel.app/components
   - **Providers** → https://servercn.vercel.app/providers
   - **Blueprints** → https://servercn.vercel.app/blueprints
   - **Foundations** → https://servercn.vercel.app/foundations
   - **Schemas** → https://servercn.vercel.app/schemas
3. **If servercn provides it**, generate it with the CLI:
   ```bash
   npx servercn-cli add <component-name>
   ```
   Then adapt the generated code to the project's domain. Do not rewrite from scratch.
4. **If servercn does not provide it**, write it manually and add a brief note in the PR description: "Not available in servercn as of <date>."
5. **Never install a package that duplicates a servercn component.** Example: do not `npm install express-rate-limit` — use `npx servercn-cli add rate-limiter` instead.

## Project initialization (one-time)

The backend was (or will be) bootstrapped with a servercn foundation. The intended foundation is:

```bash
# From inside apps/api
npx servercn-cli init prisma-mysql-starter
```

> **Note on Postgres + Prisma:** as of the servercn version checked when these rules were written, the available Prisma foundations are MongoDB and MySQL only. Since the project uses PostgreSQL with Prisma, the recommended path is:
> 1. Initialize with `prisma-mysql-starter`.
> 2. Update `prisma/schema.prisma` to set `provider = "postgresql"`.
> 3. Update `servercn.config.json` `database.engine` to `postgresql` so future generators emit Postgres-appropriate code (verify via the docs).
>
> Before doing this, **always re-check the servercn docs** — a `prisma-pg-starter` may have been added since. Update this rule file if so.

## Architecture choice

Per `servercn.config.json`, the project uses **feature-based architecture**:

```json
{
  "architecture": "feature"
}
```

This means code is grouped by domain (e.g. `src/features/task/`, `src/features/auth/`), not by layer (no `controllers/`, `models/`, `services/` folders at the root).

When servercn generators emit code, they respect this setting. Do not relocate generated files into a layer-based structure.

## Pragmatic deviation (recorded 2026-05-17)

Spot-checking `servercn-cli@2.0.5` against this codebase showed that several components emit **Mongoose + JWT + `dotenv-flow` + `cross-env`** scaffolds — none of which fit a Prisma + Postgres + stateful-Redis-sessions + Zod project. Running `add` on these components would:

- silently install runtime deps in violation of hard rule #3 ([CLAUDE.md](../CLAUDE.md));
- overwrite `src/server.ts` / `src/app.ts` with Mongoose-based equivalents;
- import a non-existent `dotenv-flow/config` and `mongoose`/`jsonwebtoken` modules.

Per the rule's own escape hatch (*"If servercn does not provide it: only then write it manually, and document the decision"*) the project considers the Mongoose-flavoured components as **not provided for our stack** and writes the cross-cutting pieces by hand when the generator output is incompatible. Components that ARE stack-neutral (e.g. status codes, http constants) can still be added directly.

The Sprint 0 RBAC middleware (`apps/api/src/middleware/require-role.ts`) and the OpenAPI provider stub (`apps/api/src/lib/openapi.ts` mounted on `/api/docs` via `swagger-ui-express`) follow this pattern. If servercn ships Prisma-native variants later, regenerate them and adopt their shape.

## Components already required by the stack

The following servercn components are part of the stack. If they are not already generated, generate them on first use (after verifying the emitted code is compatible with Prisma + Postgres + sessions):

| Concern | servercn component | CLI |
|---|---|---|
| Error handling | API Error Handler + Global Error Handler | `add error-handler global-error-handler` |
| Response shape | API Response Formatter | `add response-formatter` |
| Async handlers | Async Request Handler | `add async-handler` |
| Auth middleware | Auth Verification Middleware | `add verify-auth-middleware` |
| Env validation | Env Configuration | `add env-config` |
| Health endpoint | Health Check Endpoint | `add health-check` |
| Graceful shutdown | Graceful Shutdown Handler | `add shutdown-handler` |
| HTTP status codes | HTTP Status Codes | `add http-status-codes` |
| Not found | Not Found Handler | `add not-found-handler` |
| Logger | Structured Logger | `add logger` |
| Password hashing | Password Hashing | `add password-hashing` |
| Rate limiting | Rate Limiter | `add rate-limiter` |
| Request validation | Request Validator (Zod) | `add request-validator` |
| RBAC | Role Based Access Control | `add rbac` |
| Security headers | Security Headers | `add security-header` |
| Swagger | Swagger API Documentation | `add swagger-docs` |
| OTP / tokens | Token & OTP Utilities | `add generate-otp-token` |
| Email | Email Service + Nodemailer Provider | `add email-service` |

## Blueprint reference: Stateful Auth

The project uses **stateful authentication** (sessions, not stateless JWT for the user-facing flow). servercn provides a full blueprint:

- https://servercn.vercel.app/docs/express/blueprints/stateful-auth

When working on auth, start from this blueprint, then adapt it to use Redis for the session store (see `07-auth-security.md`).

## When servercn changes

The servercn project is actively developed. New components, providers, and foundations are added regularly. **If a task requires functionality that is not currently in these rules but might be in servercn, re-check the docs**:

- Components index: https://servercn.vercel.app/components
- Providers index: https://servercn.vercel.app/providers

If a new useful component is found, update this file before implementing.

## What this rule does NOT mean

- It does not mean every package must come from servercn. Plain Node libraries (Express itself, Prisma, BullMQ, ioredis, socket.io) are installed normally as dependencies.
- It does not mean servercn code is sacred. The generated code is OWNED by the project — once generated, it can be modified freely to fit the domain.
- It does not mean checking the docs for trivial things (e.g. writing a domain-specific service method). The rule targets cross-cutting concerns and infrastructure: anything that is "boilerplate-shaped."
