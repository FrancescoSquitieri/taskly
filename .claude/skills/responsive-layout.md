---
name: responsive-layout
description: Use whenever building a page, panel, list, grid, sidebar, toolbar, or any layout that must scale across viewports. Enforces mobile-first Tailwind breakpoints (no max-width queries), bans hardcoded px widths on primary layout elements, standardizes spacing scale and breakpoint set. Trigger keywords - "layout", "page", "sidebar", "responsive", "mobile", "grid", "flex".
---

# responsive-layout

Coherence across viewports means **one** breakpoint convention and a **mobile-first** mindset. Tailwind's defaults are the contract.

## Breakpoints (use only these)

| Prefix | Min width | Typical use |
|---|---|---|
| (none) | 0 | Mobile portrait — the default style |
| `sm:` | 640px | Large phone landscape, small tablet |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Tablet landscape, small laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

- **Mobile-first only.** Style the mobile case unprefixed, then **add** styles for larger viewports.
- Never use `max-*` (`max-md:hidden`) unless the alternative is genuinely worse. Default to "show, then narrow on larger" or "hide, then reveal on larger".
- Never introduce custom breakpoints in `tailwind.config.*` without explicit user approval.

## Spacing scale (use only Tailwind scale)

- Gap / padding / margin: pick from `0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32`.
- Standard component padding: `p-4` (16px). Standard list gap: `gap-2` or `gap-3`. Standard section vertical rhythm: `space-y-6` or `space-y-8`.
- Section horizontal padding on pages: `px-4 sm:px-6 lg:px-8`. Apply on the page container, not on every child.

## Containers

- Page-level container: a single `<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">` wrapper. Inner elements then use `w-full`.
- Never set `width: 100vw` (causes overflow with scrollbars). Use `w-full` or `w-screen` deliberately.
- Never hardcode primary widths in px (`w-[1280px]`). Use `max-w-*` tokens (`max-w-7xl`, `max-w-3xl`).

## Common layout recipes (preferred patterns)

### Sidebar + main

```tsx
<div className="flex min-h-screen">
  <aside className="hidden md:block w-64 shrink-0 border-r border-border">…</aside>
  <main className="flex-1 min-w-0">…</main>
</div>
```
`min-w-0` on the flex child is required to prevent overflow from long text.

### Responsive grid of cards

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(...)}
</div>
```

### Stack on mobile, row on desktop

```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">…</div>
```

## Mobile rules

- Touch targets are ≥ 40×40px. Use `h-10` on inputs/buttons; icon buttons use shadcn `size="icon"` (already correct).
- Avoid hover-only affordances. Anything triggered by hover on desktop must have a tap-accessible equivalent on mobile (e.g. row actions visible in a menu).
- Test that tables/long text don't break layout — use `overflow-x-auto` on table wrappers and `truncate` on cells.

## Forbidden

- Inline `style={{ width: 1280 }}` for layout.
- Width / height in `vh` units in primary content (mobile browser chrome breaks `100vh`). Use `min-h-dvh` if needed.
- `max-*` breakpoint prefixes for the primary direction of change.
- Hiding content on mobile that's essential to the feature. If it doesn't fit, redesign.
- Mixing `flex` and `grid` to achieve a single layout — pick one.

## Quick checklist before declaring done

- [ ] View renders correctly at 360px, 768px, 1280px widths.
- [ ] No horizontal scroll at any width.
- [ ] No content hidden behind a fixed header/sidebar on mobile.
- [ ] Touch targets ≥ 40px.
- [ ] All breakpoint prefixes used are from the standard set; none are custom.
