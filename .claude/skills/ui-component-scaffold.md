---
name: ui-component-scaffold
description: Use when creating any new frontend component or feature folder in apps/web. Enforces the PascalCase folder convention with Index.tsx (entry), Types.ts (Zod + inferred TS), Helpers.ts (pure utils), Constants.ts (local consts), Components/ (private sub-components). Trigger keywords - "new component", "scaffold feature", "create page", "add view", "add screen".
---

# ui-component-scaffold

Every new component or feature in `apps/web/src/` lives in its **own PascalCase folder**. Flat `*.tsx` files at the root of `src/components/` are forbidden.

## Folder shape

```
SomeFeature/
├── Index.tsx          # entry point — default export = component
├── Types.ts           # Zod schemas + z.infer types local to this feature
├── Helpers.ts         # pure helpers local to this feature
├── Constants.ts       # local constants (SCREAMING_SNAKE_CASE)
└── Components/        # private sub-components used only here
    └── SubThing/
        └── Index.tsx
```

Only create `Types.ts` / `Helpers.ts` / `Constants.ts` / `Components/` **if actually needed**. Empty placeholder files are forbidden.

## Component file rules

- Max **250 lines** per file. At ~200 lines start extracting sub-components into `Components/`.
- Component is a **pure function**. Side effects → custom hooks.
- Props interface is named `<ComponentName>Props`. Never `Props`, never inline in the signature.
  ```ts
  interface TaskCardProps {
    task: Task;
    onStatusChange: (status: TaskStatus) => void;
  }
  export default function TaskCard({ task, onStatusChange }: TaskCardProps) { ... }
  ```
- Event handler props use `on*` (e.g. `onSubmit`). Internal handlers use `handle*` (e.g. `handleSubmit`).
- Booleans use `is/has/should/can` prefix.

## Decision tree for where shared things go

- Used in 2+ features inside `apps/web`? → `src/lib/`, `src/components/`, `src/hooks/`, `src/types/` (depending on kind).
- Used by **both** `apps/web` and `apps/api`? → `/packages/*` with `@repo/*` import. **Never** duplicate.
- Pure UI primitive missing from shadcn? → `src/components/ui/` (and only after running the `shadcn-first` skill).

## Import order (Biome enforces — don't fight it)

1. React / React-DOM / React Router
2. External libs (`@tanstack/react-query`, `axios`, `zustand`, `zod`, etc.)
3. Internal packages (`@repo/...`)
4. Absolute internals (`@/components/...`, `@/api/...`, `@/lib/...`)
5. Relative (`./Components`, `../Helpers`)
6. `import type { ... }`
7. Styles

## Anti-patterns to refuse

- Nested ternaries inside JSX — extract to a sub-component.
- `useState` for state used by sibling/cousin components — lift to a Zustand store in `src/stores/<domain>/index.ts`.
- API calls inside components — go through a hook in `src/api/<domain>/use-*.ts`.
- Server state in Zustand — server state lives in TanStack Query.
