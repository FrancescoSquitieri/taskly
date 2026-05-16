# Frontend Rules — React (`apps/web`)

These rules are adapted from the previous LocalTongue rules, plus additions for the new stack (Socket.IO, multitenancy, optimistic updates, shared schemas from `/packages`).

## WebSocket (Socket.IO)

- The Socket.IO connection MUST be managed as a singleton service in `src/services/socket/`.
- Never instantiate `io()` inside a component or hook.
- Reactive socket state (connection status, presence, room) MUST live in a dedicated Zustand store in `src/stores/socket/`.
- Components access socket state and emit events only via a `useSocket` hook. Never via the service directly.
- The socket connection is initialized once in `App.tsx` (or in a top-level `SocketProvider`) and never re-initialized on component mount.
- Socket event names MUST be imported from `@repo/constants` — never hardcoded strings.
  ```ts
  import { SOCKET_EVENTS } from "@repo/constants/socket";
  socket.emit(SOCKET_EVENTS.TASK_UPDATED, payload);
  ```
- All incoming socket payloads MUST be validated with the corresponding Zod schema from `@repo/schemas` before being used.

See `06-realtime.md` for the cross-cutting real-time design (rooms, multitenancy, server side).

## HTTP & Data Fetching

- Always use **TanStack Query** (`@tanstack/react-query`) for all HTTP requests and server state management.
- Always use **Axios** as the HTTP client inside query/mutation functions. Never use `fetch` directly.
- A single Axios instance lives in `src/lib/axios.ts` with the base URL, credentials (`withCredentials: true` for stateful auth), and response interceptors configured once.
- Never call an API inside a component directly. Always create a **custom hook** first that encapsulates the TanStack Query logic, then consume that hook inside the component.
- Before creating a new custom hook, always scan the entire `src/api/` directory to check whether a hook for that operation already exists. Reuse it if so.
- Custom hooks follow the naming convention: `use` + action + resource, camelCase.
  - Good: `useGetTasks`, `useCreateTask`, `useDeleteTask`, `useUpdateTaskStatus`
  - Bad: `useData`, `useFetch`, `useQuery`
- All API hooks live in `src/api/`. Never create API hooks anywhere else.
- Inside `src/api/`, each domain has its own folder named in kebab-case after the resource:
  - `src/api/task/`, `src/api/project/`, `src/api/tenant/`, `src/api/auth/`
- Each hook is in its own file inside the domain folder, named in kebab-case after the operation:
  - `src/api/task/use-get-tasks.ts`, `src/api/task/use-create-task.ts`
- API response data MUST be validated with the Zod schema from `@repo/schemas` before being returned by the hook. Trust nothing the server sends without validation.

### Query keys

- Query keys are arrays starting with the resource name, then identifiers in order of specificity:
  - `["tasks"]` — all tasks for the current tenant
  - `["tasks", { projectId }]` — tasks filtered by project
  - `["tasks", taskId]` — single task
- Define query key factories in `src/api/<domain>/keys.ts` to avoid stringly-typed mistakes:
  ```ts
  export const taskKeys = {
    all: ["tasks"] as const,
    list: (filters: TaskFilters) => [...taskKeys.all, filters] as const,
    detail: (id: string) => [...taskKeys.all, id] as const,
  };
  ```

### Optimistic Updates

Mutations that affect a list or item visible in the UI MUST implement optimistic updates when the success case is the common path (creating a task, toggling status, reordering). Use TanStack Query's `onMutate` / `onError` / `onSettled` pattern:

```ts
useMutation({
  mutationFn: updateTaskStatus,
  onMutate: async (updatedTask) => {
    await queryClient.cancelQueries({ queryKey: taskKeys.all });
    const previous = queryClient.getQueryData(taskKeys.all);
    queryClient.setQueryData(taskKeys.all, (old) => /* optimistic patch */);
    return { previous };
  },
  onError: (error, _vars, context) => {
    if (context?.previous) {
      queryClient.setQueryData(taskKeys.all, context.previous);
    }
    toast.error("Could not update the task. Please try again.");
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all });
  },
});
```

Do NOT implement optimistic updates for: payments, irreversible deletes (use a confirm dialog instead), or anything where the server might legitimately reject the request often.

## Error Handling — Toast Notifications

- Always handle errors with toast notifications using **Sonner**, imported from `@/components/ui/sonner`.
  - Never import Sonner directly from the `sonner` package — always use the local shadcn component.
- Every TanStack Query mutation and query MUST have an `onError` callback that fires a `toast.error()`.
- Never show raw error messages from the server directly to the user. Show a human-readable message.
  - Good: `toast.error("Could not load tasks. Please try again.")`
- Socket errors trigger `toast.error()` or `toast.warning()` depending on severity:
  - Connection lost → `toast.warning("Connection lost. Reconnecting...")`
  - Unrecoverable error → `toast.error("Connection error. Please refresh the page.")`
- Never use `alert()` or `console.error()` as a user-facing error strategy. Console is for development only — and even there, prefer a logger wrapper.
- Success feedback is optional via `toast.success()` — use it for actions the user needs explicit confirmation of (saved, deleted, sent, invited).

## UI State Management

- Always use **Zustand** for UI state (modals, toggles, selected items, drawer state, ephemeral state).
- Never use `useState` for state that is shared across components — lift it to a Zustand store instead.
- Keep stores small and domain-specific. One store per feature: `useTaskBoardStore`, `useTenantSwitcherStore`, `useCommandPaletteStore`.
- Stores live in `src/stores/<domain>/index.ts`.
- Never put server state in Zustand. Server state belongs in TanStack Query.

## Validation

- Always use **Zod** for runtime validation: form inputs, API responses, environment variables, socket payloads.
- For shared entities, **import the schema from `@repo/schemas`**. Never redefine it.
- For purely UI-local validation (e.g. a form's confirm-password field), define the schema in the feature folder's `Types.ts`.
- Derive TypeScript types from Zod schemas via `z.infer<typeof Schema>`. Never duplicate type definitions manually.

## Component Rules

- **Maximum 250 lines per component file.** If a file approaches this limit, extract sub-components immediately.
- Sub-components used only in one place go in the same folder as the parent.
- Sub-components shared across features go in `src/components/`.
- Never write nested conditional logic inside JSX. Extract conditional branches into separate components.
  - Bad: `{condition && <div>{anotherCondition ? <A /> : <B />}</div>}`
  - Good: `{condition && <TaskPanel />}` where `TaskPanel` handles its own rendering logic.
- All component props are typed with an `interface` named `ComponentNameProps`:
  ```ts
  interface TaskCardProps {
    task: Task;
    onStatusChange: (status: TaskStatus) => void;
  }
  ```
- Never use a generic `Props` name. Never inline prop types in the function signature.
- Components are pure functions. Side effects belong in hooks (`useEffect`, custom hooks). Keep render logic free of side effects.

## File & Folder Structure

- Every new component or feature lives in its own **folder**, named in **PascalCase**.
- The folder contains an `Index.tsx` as the main entry point.
- Additional files only if actually needed:
  - `Types.ts` — Zod schemas and inferred TS types local to this feature
  - `Helpers.ts` — pure utility functions local to this feature
  - `Constants.ts` — constants local to this feature
  - `Components/` — sub-components used only here
- If a helper, constant, or type is shared across features: place it in the relevant global file (`src/lib/helpers.ts`, `src/lib/constants.ts`, `src/types/index.ts`).
- If a helper, constant, schema, or type is shared with the **backend**: place it in `/packages/*` (see `01-project.md`).
- Never create flat component files at the root of `src/components/`. Always use a folder.

## Styling

- Always use **shadcn/ui** for UI components. Prefer existing shadcn components before building custom ones.
- If a needed UI element is not available in shadcn, create it in `src/components/ui/`, following shadcn conventions.
- Always use **Tailwind CSS** for styling. Never write custom CSS unless absolutely unavoidable.
- Always use the `cn()` utility (from `@/lib/utils`, which composes `clsx` + `tailwind-merge`) for conditional or composed class names. Never use template literals for conditional Tailwind classes.
  - Bad: `` className={`text-sm ${isActive ? 'text-blue-500' : 'text-gray-400'}`} ``
  - Good: `className={cn("text-sm", isActive ? "text-blue-500" : "text-gray-400")}`
- For icons, always use **Lucide React** (`lucide-react`). Named imports only:
  ```ts
  import { Search, Settings } from "lucide-react";
  ```
- Icon size and color are controlled via Tailwind classes, never inline styles:
  ```tsx
  <Search className="w-4 h-4 text-muted-foreground" />
  ```

## Import Order

Organize imports in this order, with a blank line between each group:

1. React and React-related (`react`, `react-dom`, `react-router-dom`)
2. External libraries (`@tanstack/react-query`, `axios`, `zustand`, `zod`, `socket.io-client`, etc.)
3. Internal monorepo packages (`@repo/schemas`, `@repo/types`, `@repo/constants`, `@repo/utils`)
4. Internal absolute imports (`@/components/...`, `@/hooks/...`, `@/lib/...`, `@/api/...`)
5. Relative imports (`./Components`, `../Helpers`)
6. Types (`import type { ... }`)
7. Styles (if any)

Biome handles the sorting automatically — do not fight it.

## Multitenant awareness (frontend)

- The current tenant ID is held in a dedicated Zustand store (`useTenantStore`) and resolved on app boot from the session.
- All API hooks operate within the active tenant context — the server scopes data by session, so the frontend rarely sends `tenantId` explicitly. But when it does (e.g. switching tenant), include it in the query key so caches do not leak:
  ```ts
  ["tasks", { tenantId }]
  ```
- On tenant switch: invalidate ALL queries via `queryClient.clear()` to prevent cross-tenant data leakage in the UI.

## Authentication (frontend)

- The app uses **stateful auth** with HTTP-only session cookies. The Axios instance is configured with `withCredentials: true`.
- There is no token stored in `localStorage` / `sessionStorage`. Do not introduce one.
- On 401 responses, the Axios response interceptor invalidates the user query and redirects to `/login`.

## Packages — frontend allowed list

- `@tanstack/react-query`
- `axios`
- `zustand`
- `zod`
- `socket.io-client`
- `lucide-react`
- `sonner` (consumed via shadcn `@/components/ui/sonner`)
- `clsx`, `tailwind-merge`
- shadcn/ui components (added via CLI, not as a runtime dep)
- React Router (if routing is needed)

Anything else: ask first.
