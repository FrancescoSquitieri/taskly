# CLAUDE.md — Entry point for Claude Code

This file is the entry point for **Claude Code**. The full rule set lives in `.rules/`, split by domain so that only the relevant files load into context per task.

## How to navigate the rules

**Always start by reading `.rules/00-index.md`** — it is the table of contents and tells you which other files to load based on the task at hand.

Minimum loadout for every task:
- `.rules/00-index.md`
- `.rules/01-project.md`
- `TODO.md` (root) — living backlog: current sprint, dependencies, what's already done

Then load only the additional files relevant to the task. The index file gives concrete trigger examples.

## Hard rules (summary — full text in `.rules/`)

1. **Monorepo with `/packages` as the single source of truth for shared code.** Types, Zod schemas, constants, and pure utilities shared between `apps/web` and `apps/api` MUST live in `/packages/*` and be imported via the `@repo/*` alias. Never duplicate.
2. **Backend changes consult the servercn docs FIRST.** Before adding any middleware, utility, provider, or integration to the backend, check https://servercn.vercel.app for an existing component, provider, blueprint, or schema. If servercn provides it, generate it with `npx servercn-cli add <name>` rather than hand-writing it. Full rule: `.rules/02-servercn.md`.
3. **No new dependencies without explicit user approval.** If a task seems to require a package not already listed in the rules, stop and ask before installing.
4. **No `any`, no `console.log`, no commented-out code.** Use `unknown` + Zod, the structured logger, and delete dead code.
5. **Multitenancy is a security boundary.** Every backend query scopes by `tenantId` from the session. Never accept `tenantId` from the client. Full rule: `.rules/07-auth-security.md`.
6. **Living backlog in `TODO.md`.** The [TODO.md](TODO.md) file at the root tracks the state of every sprint and feature. **Before starting a new feature**: read `TODO.md` to identify the current sprint, dependencies (`blocked-by`), and what's already done. **When you complete and commit a feature**: flip the checkbox `[ ] → [x]` in the same merge commit and update the "Global status" counter at the top. Full conventions: [.rules/11-backlog.md](.rules/11-backlog.md).

## Claude Code specifics

- **Use Context7** (configured as an MCP server — see `.rules/10-mcp-skills.md`) for any library docs lookup, especially `servercn`, `prisma`, `@tanstack/react-query`, `socket.io`, `bullmq`. The servercn rule (`02-servercn.md`) is best satisfied by querying Context7 for `servercn` docs at the start of any backend task.
- **Skills** live in `.claude/skills/`. The recommended skill set is documented in `.rules/10-mcp-skills.md`. Load skills proactively when their triggers match.
- **Stay in scope.** When a task is bounded (e.g. "fix the styling of TaskCard"), do not refactor adjacent code unless explicitly asked.
- **Plan before editing.** For any change touching more than one file, lay out the plan first (one short paragraph or a brief list), confirm or self-confirm, then execute.

## Quick start for new tasks

1. Read `.rules/00-index.md` and load the relevant rule files for the task.
2. If the task touches the backend, query Context7 for the relevant servercn doc page before generating code.
3. If the task introduces shared code, place it in `/packages/*` from the start — do not write it in `apps/*` "for now."
4. Run `npm exec turbo -- run lint check-types test` on the affected workspaces before finishing.
5. Commit using Conventional Commits (`.rules/09-quality.md`).
