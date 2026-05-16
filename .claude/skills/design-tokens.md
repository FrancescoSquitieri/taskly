---
name: design-tokens
description: Use BEFORE writing any Tailwind class that touches color, background, border, ring, or text styling. Forces the use of shadcn semantic design tokens (foreground, background, muted, accent, primary, secondary, destructive, border, ring) instead of raw Tailwind palette colors (gray-500, blue-600, slate-100). This is what keeps the UI coherent under light/dark theme and across the whole app.
---

# design-tokens

Coherent UI = **one palette**, applied semantically. shadcn exposes a fixed set of CSS-variable tokens. Use them everywhere. Raw Tailwind palette colors are forbidden in app code.

## The allowed token surface

| Purpose | Tailwind class |
|---|---|
| Page background | `bg-background` |
| Primary text | `text-foreground` |
| Secondary / hint text | `text-muted-foreground` |
| Subtle surface (cards, panels) | `bg-card` + `text-card-foreground` |
| Popover surface | `bg-popover` + `text-popover-foreground` |
| Primary action | `bg-primary` + `text-primary-foreground` |
| Secondary action | `bg-secondary` + `text-secondary-foreground` |
| Muted surface (chips, skeleton) | `bg-muted` + `text-muted-foreground` |
| Accent / hover surface | `bg-accent` + `text-accent-foreground` |
| Destructive (delete, error) | `bg-destructive` + `text-destructive-foreground` |
| Borders | `border-border` |
| Focus ring | `ring-ring`, `ring-offset-background` |
| Chart series | `text-chart-1` … `text-chart-5` |

## Forbidden in app code

- `text-gray-*`, `text-slate-*`, `text-zinc-*`, `text-neutral-*`, `text-stone-*`
- `text-blue-*`, `text-red-*`, `text-green-*`, etc. used for **semantic state**
  - Error → `text-destructive`. Success → use Sonner toast, not inline color. Warning → use a dedicated `Badge` variant.
- `bg-white`, `bg-black`, `bg-gray-*` — use `bg-background` or `bg-card`.
- Arbitrary color values: `bg-[#fafafa]`, `text-[rgb(...)]` — forbidden unless adding a new token to `globals.css` and justifying in one sentence.
- Inline `style={{ color: ... }}` — never for color/spacing. Only for runtime-computed values (e.g. dynamic chart positions).

## Allowed exceptions

- `src/components/ui/*` may reference base palette colors **only** when implementing a shadcn primitive that does so in the official registry.
- Decorative-only one-off branded sections (a landing hero) may add a custom token in `globals.css` — never inline.
- Charts: prefer `--chart-1..5` over raw palette colors.

## Procedure when reviewing or writing a className

1. Scan the className for color/bg/border/ring utilities.
2. For each match, ask: "Is this a semantic token?" If no → replace with the semantic equivalent from the table above.
3. If no token fits the intent, the intent is probably wrong. Re-examine the design.

## Theme rule

The app must look correct in **both** light and dark mode without any conditional class. If you find yourself writing `dark:bg-...` to "fix" colors, you used a raw palette color instead of a token — go back and fix the root cause.
