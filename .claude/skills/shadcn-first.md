---
name: shadcn-first
description: Use BEFORE building any UI component, page section, form, dialog, popover, table, navigation, or input. Forces a lookup in the shadcn registry (via the shadcn MCP server) so we reuse existing primitives instead of hand-rolling them. Trigger keywords - "build a component", "add a modal", "create a form", "table", "dropdown", "command palette", "sidebar", "tabs", "any new UI".
---

# shadcn-first

Before writing **any** UI component in `apps/web`, you MUST consult the shadcn registry first. Custom components are a last resort.

## Procedure (non-negotiable)

1. Identify the UI primitive needed (e.g. "combobox", "data table", "date picker").
2. Call the shadcn MCP tools in this order:
   - `mcp__shadcn__search_items_in_registries` with the keyword
   - `mcp__shadcn__view_items_in_registries` on the top match to read the API
   - `mcp__shadcn__get_item_examples_from_registries` to see real usage
3. If a matching item exists, install it with:
   - `mcp__shadcn__get_add_command_for_items` then run the returned `npx shadcn@latest add ...` command.
4. Only if **no** registry item matches, build a custom component in `src/components/ui/` following shadcn conventions (Radix primitives, `cva` for variants, `cn()` for class merging, forwardRef, `data-slot` attributes).

## Hard rules

- Never reimplement Dialog, Popover, Dropdown, Sheet, Tabs, Tooltip, Toast (Sonner), Form, Select, Combobox, Calendar, Command, Table, Pagination, Skeleton, Avatar, Badge, Breadcrumb, Card, Carousel, Checkbox, Collapsible, Context Menu, Hover Card, Input, Label, Menubar, Navigation Menu, Progress, Radio Group, Resizable, Scroll Area, Separator, Slider, Switch, Textarea, Toggle, Toggle Group — they exist in shadcn.
- Never import `sonner` directly. Import the Toaster from `@/components/ui/sonner` (added via the shadcn CLI).
- Never use Material UI, Chakra, Mantine, Ant Design, Radix UI directly (use Radix only as a transitive dep of shadcn).

## When to escape this skill

- Pure layout / spacing wrappers (a `<div className="grid gap-4">`) — no skill needed.
- Domain-specific compositions (e.g. `TaskCard`, `ProjectBoard`) — these are **built from** shadcn primitives, not from scratch. Run this skill once for each underlying primitive.

## Output verification

When you finish a UI task, confirm in your closing message which shadcn items you reused. If you built something custom, justify in one sentence why no registry item fit.
