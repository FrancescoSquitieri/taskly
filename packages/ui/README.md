# @repo/ui

Shared shadcn/ui component library for the Taskly monorepo.

## Adding components

shadcn is wired to this package via `components.json`. From the repo root:

```sh
npx shadcn@latest add <component-name> -c packages/ui
```

The generated file lands in `src/components/ui/<component>.tsx` and is automatically
available to any consumer via `import { ... } from '@repo/ui/components/ui/<component>'`.

## Consuming the styles

The Tailwind layer is exposed at `@repo/ui/styles/globals.css`. Each consuming app imports
it once from its entry stylesheet and points its own `tailwind.config.ts` `content` glob
at this package so utility classes are detected.
