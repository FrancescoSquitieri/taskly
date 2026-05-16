---
name: a11y-check
description: Use BEFORE finishing any UI work in apps/web that ships a new interactive element, form, dialog, or page. Verifies semantic HTML, ARIA, focus management, keyboard navigation, alt text, label association, and contrast via design tokens. Trigger keywords - "form", "button", "dialog", "modal", "menu", "input", "interactive", "before commit".
---

# a11y-check

Accessibility is part of "clean UI", not a separate phase. Run this checklist before declaring any UI task done. Most items are mechanical.

## Semantic HTML

- Buttons are `<button>` (or shadcn `Button`). **Never** `<div onClick={...}>`.
- Links are `<a>` (or `<Link>` from React Router). **Never** `<button>` that navigates.
- Headings follow the document outline. Exactly **one `<h1>`** per page. No skipping levels.
- Lists use `<ul>` / `<ol>` / `<li>` — not `<div>` siblings.
- Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>`, `<section>` for landmark regions.

## Forms

- Every input has a `<Label htmlFor="...">` (shadcn `Label`) bound to the input's `id`. Placeholder ≠ label.
- Required fields are marked with `aria-required="true"` AND visual indication.
- Field validation errors are connected via `aria-describedby` to a `<p id="...">` below the field.
- The error message uses `text-destructive`, never raw red.
- A `<form>` element with an `onSubmit` handler is mandatory. Submitting via Enter must work.

## Buttons and icon-only controls

- Every icon-only button has `aria-label` describing the action (see `icon-conventions` skill).
- Decorative icons inside text buttons have `aria-hidden="true"`.
- Disabled buttons use the `disabled` attribute, not `pointer-events-none` alone — screen readers need the state.
- Toggle buttons use `aria-pressed`. Expand/collapse triggers use `aria-expanded` + `aria-controls`.

## Dialogs / Sheets / Popovers

- Always built from the shadcn primitives (Radix under the hood) — they handle focus trap, ESC, and aria-modal for you.
- Every `Dialog` has a `DialogTitle` (visible or `sr-only` if visually omitted) and ideally a `DialogDescription`.
- Triggering element regains focus on close (Radix default — don't override).

## Keyboard

- Every interactive element is reachable via Tab. Tab order matches visual order.
- `focus-visible:` ring is present on all interactive elements. Use the shadcn default ring tokens (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`) — never `outline-none` without a replacement.
- Esc closes overlays. Arrow keys navigate menus and selects (free from Radix when using shadcn).
- Custom drag-and-drop must also work via keyboard (use `@dnd-kit` with `KeyboardSensor` — if dnd is added, ask first).

## Images and media

- Every `<img>` has `alt`. Decorative images use `alt=""` (empty, not missing).
- Avatars with no image fall back to initials or a Lucide icon — never an empty circle.

## Color & contrast

- Color is **only** from semantic tokens (`design-tokens` skill). Tokens are designed for AA contrast on the matching surface.
- Never communicate state by color alone. Pair color with an icon or text (e.g. error message has `AlertCircle` + red text + the word "Error").

## Live regions

- Toasts are wired through Sonner — already announces correctly. Do not add another `aria-live` region for the same purpose.
- For inline status (e.g. "Saving…" appearing near a button), wrap in `<span role="status" aria-live="polite">`.

## Quick checklist before declaring done

- [ ] Tabbed through the entire view with only the keyboard — every interactive thing is reachable and visible focus is clear.
- [ ] Every input has a label. Every error message references the field via `aria-describedby`.
- [ ] No `<div onClick>`. No `text-red-500`. No `outline-none` without a focus replacement.
- [ ] Every icon-only button has `aria-label`.
- [ ] One `<h1>` per page; landmark elements present.
