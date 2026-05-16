---
name: tailwind-cn-rule
description: Use whenever writing className props in apps/web. Enforces cn() (from @/lib/utils) for ALL conditional or composed class names, bans template literals with conditional Tailwind, bans arbitrary values without justification, ensures consistent class composition. Trigger keywords - "className", "conditional class", "merge classes", "variant styles".
---

# tailwind-cn-rule

Class composition must be predictable so designs stay coherent. The rules below are mechanical and easy to enforce.

## The `cn()` rule

`cn()` from `@/lib/utils` composes `clsx` + `tailwind-merge`. It is the **only** acceptable way to build conditional or merged className values.

```ts
// BAD — template literal, no tailwind-merge, no readability
className={`text-sm ${isActive ? 'text-blue-500' : 'text-gray-400'} ${className}`}

// GOOD
className={cn(
  "text-sm",
  isActive ? "text-primary" : "text-muted-foreground",
  className,
)}
```

### When `cn()` is required

- Any time a className combines a static string with a conditional class.
- Any time a className combines props (`className` from parent) with internal classes.
- Any time you spread classes from `cva` variants.

### When `cn()` is NOT required

- Pure static className with no conditions and no incoming className prop:
  ```tsx
  <div className="flex items-center gap-2" />
  ```

## Class ordering convention

Group classes in this order (Biome / Prettier-Tailwind plugin handles it automatically — do not reorder by hand):

1. Layout (`flex`, `grid`, `block`, `hidden`)
2. Position (`relative`, `absolute`, `inset-*`)
3. Box model (`w-*`, `h-*`, `p-*`, `m-*`, `gap-*`)
4. Typography (`text-*`, `font-*`, `leading-*`, `tracking-*`)
5. Visual (`bg-*`, `border-*`, `rounded-*`, `shadow-*`, `ring-*`)
6. Interactivity (`cursor-*`, `select-*`, `pointer-events-*`)
7. States (`hover:*`, `focus-visible:*`, `disabled:*`, `data-[state=*]:*`)
8. Responsive prefixes go at the **end** of each related group (`sm:*`, `md:*`).

## Arbitrary values

`text-[14px]`, `w-[437px]`, `bg-[#abc]` are forbidden by default.

Allowed only when:
1. The value is genuinely outside Tailwind's scale AND
2. You add a one-line comment justifying it (e.g. matching a fixed design asset width).

Otherwise: use the closest Tailwind scale token (`text-sm`, `w-[27rem]` → `w-[28rem]` no; `w-md` yes).

## Forbidden patterns

- `className={"text-sm " + (isActive ? "text-primary" : "")}` — string concat. Use `cn()`.
- Nested ternaries inside `className`. Extract to a variable or sub-component.
- `style={{ marginTop: 12 }}` for spacing — use `mt-3`.
- `style={{ display: 'flex' }}` — use `flex`.
- `!important` via `!` prefix (`!text-red-500`) — restructure the cascade instead. Allowed only inside `src/components/ui/*` when shadcn itself uses it.

## Variant-driven components

For components with multiple visual variants, use `cva` (class-variance-authority) — shadcn ships with it. Define variants alongside the component:

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4" },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);
```

Never branch on `variant === "..."` inside the component body to apply classes — declare it in `cva`.
