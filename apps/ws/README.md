# @taskly/ws

WebSocket server for Taskly. Runs as a **separate process** from `apps/api` and
communicates with it via Redis pub/sub on the `taskly:events` channel. Sessions are
shared via `connect-redis` so the cookie issued by the REST API authenticates sockets
too.

## Scripts

```sh
npm run dev          # start the WS server in watch mode
npm run build        # tsc build to dist/
npm run start        # node dist/server.js
npm run test         # jest
```

## How it talks to the REST API

1. `apps/api` validates the user, mutates state, then publishes a `{ event, payload }`
   envelope on `taskly:events`.
2. `apps/ws` subscribes to that channel and re-emits the validated payload to the
   correct tenant/project room.

This keeps the two services independently scalable while still presenting a single
session model to the client.
