# @taskly/web

React + Vite client for Taskly. Built with TanStack Query, Axios, Zustand, Zod, shadcn/ui (consumed
from `@repo/ui`), Tailwind CSS, Socket.IO client, Sonner, Lucide.

## Scripts

```sh
npm run dev          # start the Vite dev server on :5173
npm run build        # type-check and build to ./dist
npm run preview      # serve ./dist locally
npm run test:e2e     # run Playwright tests
npm run test:e2e:ui  # run Playwright with UI mode
npm run lint         # biome check
```

## How this app was bootstrapped

This package was set up to be the equivalent of the official Vite React + TS scaffold:

```sh
npm create vite@latest apps/web -- --template react-ts
```

…then integrated into the monorepo: `@repo/ui` Tailwind + shadcn is imported from
`@repo/ui/styles/globals.css` and components are added via shadcn against the `@repo/ui`
package (`npx shadcn@latest add <component> -c packages/ui`).

## Environment

Copy `.env.example` to `.env.local` and fill in the URLs.

| Variable        | Description                          |
|-----------------|--------------------------------------|
| `VITE_API_URL`  | REST API base URL (`apps/api`)       |
| `VITE_WS_URL`   | WebSocket server URL (`apps/ws`)     |
