# Auth & Security Rules

## Authentication — stateful sessions

The project uses **stateful authentication**. There is no JWT issued to the client for normal user flows.

### Session model

- On successful login, the server creates a session record in Redis: `redisKeys.session(sessionId)`.
- The session payload stores `{ userId, tenantId, roles, createdAt, lastSeenAt }`.
- The client receives an **HTTP-only, Secure, SameSite=Lax** cookie containing the opaque `sessionId`.
- The session has a **sliding TTL** in Redis — refreshed on every authenticated request.
- Absolute maximum session lifetime: 30 days (configurable via env, validated via the servercn env-config component).
- Logout invalidates the session in Redis and clears the cookie.

### Implementation source

The full auth flow starts from the servercn **Stateful Authentication** blueprint:
- https://servercn.vercel.app/docs/express/blueprints/stateful-auth

Generate it via the CLI and adapt the session store to Redis. The blueprint provides:

- Login / register / logout endpoints
- Password hashing (bcrypt) via servercn `password-hashing`
- OTP & token utilities for email verification and password reset via servercn `generate-otp-token`
- Email sending via servercn `email-service` + Nodemailer provider

### Auth verification middleware

- Use the servercn `verify-auth-middleware` component on every authenticated route.
- After it runs, `req.user` is populated with `{ userId, tenantId, roles }`.
- Unauthenticated requests get `401`. Forbidden (authenticated but not allowed) gets `403`.

### Cookies

- `HttpOnly: true` — JavaScript on the client cannot read the session cookie.
- `Secure: true` in production (HTTPS only).
- `SameSite: "lax"` — protects against most CSRF while keeping normal navigation flows.
- For state-changing requests across origins, also use a CSRF protection middleware (servercn does not currently ship one; if not added, document the gap and use SameSite + Origin checking as the temporary mitigation).

### Password handling

- Hash passwords with bcrypt via servercn `password-hashing`. Cost factor ≥ 12.
- **Never log a password, password hash, or session ID.** Redact in logger configuration.
- Enforce minimum complexity via the shared Zod schema in `@repo/schemas/auth`.

## Multitenancy — non-negotiable rules

Multitenancy is a security boundary. A bug here is a data breach.

### Tenant resolution

- The tenant ID is resolved from the **session**, not from any client-controlled header or body. The client cannot tell the server which tenant it is in.
- A user may belong to multiple tenants. The session stores the *currently selected* tenant. Switching tenants creates a new session (or rotates the tenant within the existing session and forces a re-fetch on the client).

### Repository contract (recap from `05-database.md`)

- Every repository method on a tenant-owned table accepts `tenantId` as a parameter and includes it in every `where` clause.
- Services pass `req.user.tenantId` to repository calls. **Never accept `tenantId` from the request body.**
- For tables that are NOT tenant-owned (e.g. system-wide config), this is documented in the schema with a comment.

### Defense in depth

Where possible, also enforce tenant scoping at the database level via Postgres Row-Level Security (RLS) policies. This is a stretch goal — start with application-level enforcement, add RLS once the model is stable.

### Cross-tenant queries

A small number of admin/system endpoints may need to operate across tenants (e.g. platform-admin dashboards). These:

- Live in a dedicated `features/platform-admin/` folder.
- Are protected by a `platform_admin` role (servercn RBAC).
- Bypass tenant scoping ONLY in repositories called via this feature — never globally.

## Authorization — RBAC

- Use the servercn `rbac` component.
- Roles are defined in `@repo/constants/roles`: e.g. `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, plus the system-wide `PLATFORM_ADMIN`.
- Role checks are enforced via middleware at the route level for coarse-grained access (e.g. only ADMIN+ can invite users) and via service-level checks for fine-grained logic (e.g. a MEMBER can edit a task only if they are the assignee).
- Roles are stored on the user-tenant membership, not the user. A user has different roles in different tenants.

## Rate limiting — token bucket

- Use the servercn `rate-limiter` component, backed by Redis (token bucket algorithm).
- Default global limit per IP: **120 req/min** (configurable per env).
- Stricter per-route limits for sensitive endpoints:
  - `POST /auth/login` — 10 req / 15 min per IP + per email.
  - `POST /auth/register` — 5 req / hour per IP.
  - `POST /auth/forgot-password` — 5 req / hour per email.
  - `POST /auth/verify-otp` — 10 req / 15 min per email.
- Identify the bucket by:
  - IP for unauthenticated routes.
  - `userId` + IP for authenticated routes (so one user's misbehaving client does not lock out the IP for other users behind the same NAT).
- Bucket keys in Redis live under `rl:` (see `redisKeys` in `05-database.md`).
- Exceeding the limit returns `429 Too Many Requests` with a `Retry-After` header.

### Socket.IO rate limiting

- Apply a per-connection event rate limit to prevent a client from flooding the server with events. Token bucket per `socketId`. Limits depend on the event:
  - Room joins: 30 / minute.
  - Domain events (e.g. cursor updates if added): more permissive but capped.
- Exceeding triggers a `socket.emit(SOCKET_EVENTS.RATE_LIMITED, ...)` and, for repeated abuse, disconnection.

## Input validation as security

- **Every external input is validated via Zod before reaching business logic.** External inputs include: HTTP request body/params/query, Socket.IO event payloads, BullMQ job data, webhook payloads, env variables.
- Validation schemas are the security boundary. If a field is not in the schema, it does not exist as far as business logic is concerned.

## Secrets & env

- All secrets come from environment variables, validated at startup via the servercn `env-config` component with a Zod schema.
- If env validation fails, the process exits with a non-zero status. The app NEVER starts with invalid config.
- Secrets are never logged, never committed, never sent to the client.
- `.env` files are gitignored. `.env.example` is committed with placeholder values and documentation.

## Security headers

- Use the servercn `security-header` component (wraps `helmet`).
- CSP should be configured to disallow inline scripts in production. The Vite build produces hashed assets, which CSP permits.
- HSTS enabled in production. Note: only after HTTPS is fully rolled out — enabling HSTS on HTTP breaks future testing.

## Audit logging

For sensitive actions (login, logout, password change, role change, tenant member added/removed, billing changes), write a structured log entry AND insert an audit row in a dedicated `audit_log` table:

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  actorId   String?  @map("actor_id")
  action    String
  target    String?
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([tenantId, createdAt])
  @@map("audit_logs")
}
```

Audit log writes happen via a dedicated `auditLog.service.ts` consumed by other services — never as inline `prisma.auditLog.create` calls.
