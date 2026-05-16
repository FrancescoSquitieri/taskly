---
name: toast-feedback
description: Use whenever giving the user transient feedback from the frontend (success, error, info, warning, loading) or wiring an onError / onSuccess callback in a TanStack Query mutation, or handling a socket disconnect. Enforces Sonner via @/components/ui/sonner. Forbids alert(), window.confirm(), console.error to the user. Trigger keywords - "toast", "notification", "feedback", "onError", "onSuccess", "error message".
---

# toast-feedback

User-facing feedback is **always** a toast. Sonner is the only notification mechanism in `apps/web`.

## The import rule

```ts
// GOOD
import { toast } from "@/components/ui/sonner";

// BAD — bypasses the project's shadcn-wrapped instance
import { toast } from "sonner";
```

The `Toaster` component is mounted once at the app root (in `App.tsx` or the root layout). Never mount additional `Toaster` instances.

## When to fire what

| Situation | Call |
|---|---|
| Recoverable error (network, validation) | `toast.error("Could not load tasks. Please try again.")` |
| Unrecoverable error (corrupted session, missing tenant) | `toast.error("Something went wrong. Please refresh the page.")` |
| Soft warning (you're offline, rate-limit close) | `toast.warning("Connection lost. Reconnecting…")` |
| Confirmation of a destructive action | `toast.success("Task deleted.")` — but **only** after a confirm dialog. |
| Confirmation of an explicit user action | `toast.success("Project created.")`, `toast.success("Invite sent.")` |
| Long-running with promise | `toast.promise(promise, { loading, success, error })` |

## Message style

- **Human-readable, never the raw server error.** Map error codes from the API to user-friendly strings in a `getErrorMessage(error)` helper.
- One sentence. End with a period. No exclamation marks except for genuine celebrations.
- Mention the **resource** (`task`, `project`), not the API path.
- BAD: `toast.error("AxiosError: Request failed with status code 500")`
- BAD: `toast.error("Internal Server Error")`
- GOOD: `toast.error("Could not save the task. Please try again.")`

## Mandatory onError on every mutation/query

Every TanStack Query `useMutation` and `useQuery` (when the failure is user-relevant) MUST wire an `onError`:

```ts
useMutation({
  mutationFn: createTask,
  onError: (error) => toast.error(getErrorMessage(error, "Could not create the task.")),
  onSuccess: () => toast.success("Task created."),
});
```

For optimistic mutations, the rollback happens in `onError` **before** the toast.

## Socket events

- Disconnect → `toast.warning("Connection lost. Reconnecting…")`
- Unrecoverable socket error → `toast.error("Connection error. Please refresh the page.")`
- Reconnect → optional `toast.success("Reconnected.")` only if a `warning` was previously shown.

## Forbidden

- `alert()`, `window.confirm()`, `window.prompt()` — use a shadcn `AlertDialog` for confirmation, never the browser primitives.
- `console.error()` / `console.warn()` as the user feedback path. (Use the logger wrapper for developer-only diagnostics, in dev only.)
- Showing raw stack traces or error objects in the UI.
- Persistent inline error banners for transient errors — use a toast. Inline errors are reserved for **form field** validation, attached to the field.

## Loading states are NOT toasts

Loading is a UI state on the element (button shows `Loader2`, skeleton in the list). Don't show a `toast.loading("Saving…")` for fast actions — only for actions >2s or whose effect isn't visible yet (e.g. an email send).
