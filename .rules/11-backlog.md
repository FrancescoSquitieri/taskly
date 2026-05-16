# 11 — Backlog conventions (`TODO.md`)

> **When to load this file**: alongside [TODO.md](../TODO.md) every time you start, resume, or close a feature. This is the operational rule for the living backlog.

## The file

The project's living backlog is **`TODO.md`** at the repository root. It contains:
- The plan per sprint (0 → 12)
- A checkbox for each feature
- A "Global status" counter at the top
- The "Nice-to-have" backlog (out of sprint)

All design rationale lives in the session plan (Claude Code plan file). `TODO.md` is the **operational** file you work from.

---

## Golden rules

### 1. One checkbox = one atomic feature

Each `[ ]` in `TODO.md` is a feature **shippable on its own**. If during implementation you discover it needs to be split in two, **update `TODO.md` in the same commit** (add the second checkbox).

### 2. Flip the checkbox only at merge

A feature is "done" only when **all four** of these are true:
1. Implemented (code in the repo)
2. Tested at least manually (sprint acceptance green where applicable)
3. Committed with a Conventional Commit ([.rules/09-quality.md](./09-quality.md))
4. Merged into the main branch

The flip from `[ ]` to `[x]` happens **in the same commit that merges the feature**. Not before.

### 3. Update the global counter

At the top of `TODO.md` there is:

```markdown
> **Global status**: Sprint X/12 · N features completed / M total
> **Last updated**: YYYY-MM-DD
```

When a feature lands:
- Increment `N` (features completed)
- Update `Last updated` with today's date
- If the feature closes a sprint (acceptance green), increment `Sprint X` (e.g. `0/12` → `1/12`)

### 4. Stay in sprint scope

When you start working:
1. **Open `TODO.md`**
2. Find the current sprint (the first one with open `[ ]` checkboxes)
3. Work only on features in that sprint, except for explicit dependencies

Resist the urge to "while I'm at it, fix X" from a future or past sprint. Tech debt **inside the current sprint yes**, adjacent refactor **no** ("Stay in scope" rule in [CLAUDE.md](../CLAUDE.md)).

---

## Inline tags

Inline annotations on checkboxes to make them machine-readable and traceable.

### `[blocked-by: sprint N · feature X]`
Explicit dependency. If the feature depends on something not yet done, tag it. Don't remove the tag until the dependency is `[x]`.

```markdown
- [ ] Smart time blocking AI suggestions [blocked-by: sprint 6 · Analytics Dashboard]
```

### `[new-dep: <package> ...]`
Marks new npm dependencies the feature introduces. Needed because **hard rule #3** in [CLAUDE.md](../CLAUDE.md) requires explicit approval before `npm install`. List the package with its approximate version or none.

```markdown
- [ ] Kanban board with dnd-kit [new-dep: @dnd-kit/core @dnd-kit/sortable]
```

When the PR is opened, it's the author's responsibility to get `new-dep` approved at review time. Once installed, **remove the tag** from `TODO.md` (the dep is now part of the project).

### `[deferred]`
Feature intentionally postponed. Include the reason in parentheses.

```markdown
- [ ] Custom DNS on personal domain [deferred] (requires domain purchase)
```

### `[needs-decision]`
Feature where a technical/product choice is required before starting. Use when you can't proceed without human input.

```markdown
- [ ] Email template engine [needs-decision] (react-email vs html template)
```

---

## Adding features "on the fly"

If during a sprint you discover a missing feature:
1. **If it blocks the current sprint** → add it to `TODO.md` in the same commit, inside the current sprint
2. **If it's "nice to have"** → add it at the bottom, in the "Nice-to-have backlog (out of sprint)" section
3. **If it's large and warrants a future sprint** → discuss with the user before planning it

Don't silently move features between sprints. If a sprint becomes too large, **discuss with the user** and split explicitly.

---

## Ideal workflow for a feature

```
1. Read TODO.md → identify a feature in the current sprint
2. Open PR / branch
3. Implement
4. Manual + automated tests (when in the Quality sprint)
5. Commit: `feat(<scope>): <description>` (Conventional Commits)
6. In the merge commit:
   - Flip [ ] → [x] in TODO.md
   - Update "Global status" counter
   - Update "Last updated"
   - If the feature was tagged [new-dep: ...], remove the tag
7. Merge → done
```

---

## What NOT to do

- ❌ Don't mark `[x]` before merge. Ever.
- ❌ Don't remove completed checkboxes to "tidy up" — they stay as the project's history.
- ❌ Don't rewrite whole sprint sections at will. For substantial changes, discuss with the user.
- ❌ Don't create new sprints without explicit planning.
- ❌ Don't leave `[ ]` "orphan" features without a tag (`blocked-by`, `deferred`, `needs-decision`). Anything not closed today must be justified.

---

## Cross-references

- Commit conventions: [09-quality.md](./09-quality.md)
- Backlog hard rule: [CLAUDE.md](../CLAUDE.md) "Hard rules" section #6
- Read triggers: [00-index.md](./00-index.md) "File map" table
