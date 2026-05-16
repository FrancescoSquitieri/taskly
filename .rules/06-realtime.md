# Real-Time Rules — Socket.IO (Multitenant)

> **Topology change.** Real-time is now served by a **dedicated app `apps/ws`** that runs
> as a separate process from `apps/api`. The two apps share state via Redis (sessions in
> `connect-redis`, domain events in pub/sub).
>
> Previous versions of these rules mounted Socket.IO on the same HTTP server as Express.
> That is no longer the case. Do not re-merge them.

## Topology

```
┌────────────┐     HTTP (cookie auth)     ┌──────────────┐
│   apps/web │ ─────────────────────────► │   apps/api   │
│  (React)   │                            │ Express REST │
│            │ ◄───── Socket.IO ───────── │              │
└────────────┘            │               └─────┬────────┘
                          ▼                     │ Redis pub/sub
                  ┌──────────────┐               │  (channel: taskly:events)
                  │   apps/ws    │ ◄─────────────┘
                  │  Socket.IO   │
                  └──────────────┘
                  Redis adapter (multi-instance)
                  connect-redis session store
```

- The browser opens a WebSocket connection to `apps/ws` (e.g. `VITE_WS_URL`).
- The WS server reads the session cookie issued by `apps/api` via the shared `connect-redis`
  store. Sockets without a valid session are rejected.
- When `apps/api` mutates state it publishes a validated event envelope on the Redis channel
  `taskly:events`. `apps/ws` subscribes, re-validates with the matching Zod schema, and
  re-emits to the correct tenant/project room.

## Why a separate WebSocket service

- Independent scaling: WS connections are long-lived; REST is request-shaped.
- Cleaner deployment topology on ECS / k8s — different health checks, different autoscaling.
- Forces the team to keep "what gets broadcast" behind a typed Redis channel rather than a
  shared in-process emitter.

## Server setup (apps/ws)

- Socket.IO is created **once** in `apps/ws/src/realtime/socket-server.ts`.
- It is mounted on a minimal Node `http.Server` whose only HTTP endpoint is a liveness
  probe (`GET /` returns `{ ok: true, service: 'ws' }`).
- `io.engine.use(sessionMiddleware)` shares the session with the REST app.
- `io.use(socketAuth)` enforces auth — sockets without `session.userId` + `session.tenantId`
  are rejected with `Error('unauthenticated')`.

## Server setup (apps/api)

- `apps/api` does NOT instantiate Socket.IO.
- It publishes domain events through `apps/api/src/realtime/emitter.ts`. The emitter wraps
  a Redis publisher; services call typed helpers (`taskRealtime.emitCreated(payload)`).
- Payloads are validated with the shared Zod schema (`@repo/schemas/socket`) before being
  serialized and published.

## Multi-instance support (Redis adapter)

When `apps/ws` runs with more than one instance (production), Socket.IO MUST use the Redis
adapter (`@socket.io/redis-adapter`) so events are fanned out across instances.

The adapter is enabled via env (`USE_SOCKET_REDIS_ADAPTER=true` in prod). The pub/sub Redis
connections used by the adapter are **separate** from the relay subscriber and from the
general-purpose Redis client.

## Rooms — tenant isolation is mandatory

The room layout is the security boundary for real-time. Get this wrong and tenants see each
other's events. Room name builders live in `@repo/constants/socket` and are imported by both
sides:

| Room name | Purpose |
|---|---|
| `tenant:<tenantId>` | All sockets for a tenant. Tenant-wide broadcasts. |
| `tenant:<tenantId>:user:<userId>` | All sockets belonging to one user in one tenant. User-targeted notifications. |
| `tenant:<tenantId>:project:<projectId>` | All sockets currently viewing a project. Collaborative updates. |

**On connection**, the auth middleware joins the socket to `tenant:<tenantId>` and
`tenant:<tenantId>:user:<userId>` automatically. Feature-specific rooms (projects, etc.)
are joined on demand via explicit client events.

**Joining a feature-specific room MUST be authorized.** Before `socket.join("...:project:...")`,
the WS server verifies that the user has access to that project. For now, this verification
happens server-side based on `socket.data.tenantId` and a quick `apps/api` RPC or direct
Redis cache lookup. Never trust the client to tell you which rooms it can join.

## Server-side emission

- **Never emit directly to a socket ID.** Always emit to a room.
- `apps/api` services never call `io.emit(...)` (they don't have an `io` reference). They
  call `taskRealtime.emitCreated(payload)` which publishes to Redis.
- `apps/ws` consumes the published envelope and emits to the correct tenant room:
  ```ts
  io.to(SOCKET_ROOMS.tenant(payload.tenantId)).emit(SOCKET_EVENTS.TASK_CREATED, payload);
  ```

## Event names and payloads

- All event names are constants in `@repo/constants/socket`. Frontend, REST API, and WS
  server import the same constant.
- Event names follow the format `<domain>:<verb>` in past tense (something has happened).
- Every payload has a Zod schema in `@repo/schemas/socket`. The emitter (`apps/api`) validates
  before publishing. The relay (`apps/ws`) re-validates before emitting. The client validates
  on arrival. Sockets are an external boundary on all three sides.
- Payloads include enough information for the client to update its TanStack Query cache
  without making a follow-up HTTP request — but only what is safe to send to everyone in
  the room.

## Client-side (recap — full rules in `03-react.md`)

- Singleton service in `src/services/socket/`. Never `io()` inside a component.
- Zustand store for reactive socket state (`useSocketStore`).
- `useSocket()` hook is the only consumer surface for components.
- Incoming payloads are validated with the shared Zod schema before being applied to the
  cache.
- The client connects to `VITE_WS_URL`, NOT to the REST URL.

## Integration with TanStack Query

When a server event arrives, the client typically:

1. Validates the payload with the shared Zod schema.
2. Either updates the relevant query cache directly via `queryClient.setQueryData(...)`
   for small, predictable changes, OR invalidates the relevant query keys via
   `queryClient.invalidateQueries(...)` for larger or uncertain changes.
3. Optionally fires a UI toast for noteworthy events (`toast.info(...)`).

Cache updates from socket events MUST respect the same query key shape used by hooks
(see `03-react.md`).

## Lifecycle

- The client connects on app boot (after auth is confirmed via REST) and disconnects on
  logout.
- On reconnect, the client re-joins feature-specific rooms by re-issuing the join events.
  The server's rate limiting (see `07-auth-security.md`) covers this so a reconnect storm
  cannot DoS.

## What NOT to use Socket.IO for

- Long-running uploads → use HTTP.
- Request/response patterns → use HTTP. Socket.IO is for push notifications and
  collaborative updates.
- Anything where ordering across tenants matters → it does not exist in a properly-roomed
  setup.
