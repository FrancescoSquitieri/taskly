# @taskly/api

REST HTTP server for Taskly. Express + Prisma + Postgres + Redis + BullMQ.
Feature-based architecture per `.rules/04-node.md`.

## Scripts

```sh
npm run dev              # start the API in watch mode (tsx watch)
npm run worker:dev       # start BullMQ workers in watch mode
npm run build            # tsc build to dist/
npm run start            # node dist/server.js
npm run worker:start     # node dist/jobs/index.js
npm run test             # jest
npm run prisma:migrate   # prisma migrate dev
npm run prisma:generate  # prisma generate
```

## Environment

Copy `.env.example` to `.env` and fill in real values. The `ApiEnvSchema` Zod validation
runs at startup — the process exits if a variable is missing or invalid.

## Architecture

`src/features/<domain>/<domain>.{routes,controller,service,repository,validation}.ts` — thin
routes, thin controllers, business logic in services, Prisma only in repositories.
