---
name: icon-conventions
description: Use whenever an icon is added to the UI in apps/web. Enforces Lucide React as the only icon library, named imports only, sizing via Tailwind classes (w-* h-*) and never via the size prop or inline style, color via semantic tokens. Trigger keywords - "icon", "lucide", "svg", "button icon", "menu icon".
---

# icon-conventions

One icon family = one visual language. `lucide-react` is the **only** approved icon library for `apps/web`. Heroicons, react-icons, FontAwesome, custom SVG sprites, emoji-as-icons are forbidden.

## Import

```ts
// GOOD
import { Search, Settings, Loader2 } from "lucide-react";

// BAD — default / namespace import
import * as Icons from "lucide-react";
import LucideSearch from "lucide-react/dist/esm/icons/search";
```

Always **named imports**. Tree-shaking depends on it.

## Sizing

Size is **always** controlled by Tailwind width/height utilities. Never the `size` prop, never inline `style`.

```tsx
// GOOD
<Search className="w-4 h-4 text-muted-foreground" />
<Loader2 className="w-5 h-5 animate-spin" />

// BAD
<Search size={16} />
<Search style={{ width: 16, height: 16 }} />
<Search className="text-sm" />   // text-* does NOT size icons
```

### Canonical sizes

| Context | Classes |
|---|---|
| Inline next to body text | `w-4 h-4` |
| Inside a button (default) | `w-4 h-4` |
| Inside a button (sm) | `w-3.5 h-3.5` |
| Sidebar / nav item | `w-5 h-5` |
| Empty state hero | `w-12 h-12` or `w-16 h-16` |
| Avatar fallback | matches avatar size |

Pick from this scale. New sizes need justification.

## Color

Color is **always** a semantic token, not a palette color (see the `design-tokens` skill).

```tsx
// GOOD
<Trash2 className="w-4 h-4 text-destructive" />
<Check className="w-4 h-4 text-muted-foreground" />

// BAD
<Trash2 className="w-4 h-4 text-red-500" />
<Trash2 className="w-4 h-4" color="#ef4444" />
```

If the icon should inherit the parent text color (e.g. inside a Button), pass no color class — Lucide icons use `currentColor` by default.

## Accessibility

- Decorative-only icon (text label exists next to it): add `aria-hidden="true"`.
  ```tsx
  <Search className="w-4 h-4" aria-hidden="true" />
  ```
- Icon-only interactive element (icon button): the parent **must** have an `aria-label` or visually-hidden text.
  ```tsx
  <Button variant="ghost" size="icon" aria-label="Open settings">
    <Settings className="w-4 h-4" />
  </Button>
  ```

## Loading & spinning

Use `Loader2` with `animate-spin`. No custom spinners.

## Forbidden

- Raw `<svg>` elements with copy-pasted paths.
- Emoji as UI icons (👍, ✅, ⚠️) — these are content, not UI.
- Inline `<img src="...icon.svg">` for UI affordances.
