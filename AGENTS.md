# AGENTS.md — Entry point for Zed (Copilot / Claude agent)

This file is the entry point for **Zed**'s agent (Copilot or Claude via Zed). The full rule set lives in `.rules/`, split by domain so that only the relevant files load into context per task.

## How to navigate the rules

**Always start by reading `.rules/00-index.md`** — it is the table of contents and tells you which other files to load based on the task at hand.

Minimum loadout for every task:
- `.rules/00-index.md`
- `.rules/01-project.md`

Then load only the additional files relevant to the task. The index file gives concrete trigger examples.

## Hard rules (summary — full text in `.rules/`)

1. **Monorepo with `/packages` as the single source of truth for shared code.** Types, Zod schemas, constants, and pure utilities shared between `apps/web` and `apps/api` MUST live in `/packages/*` and be imported via the `@repo/*` alias. Never duplicate.
2. **Backend changes consult the servercn docs FIRST.** Before adding any middleware, utility, provider, or integration to the backend, check https://servercn.vercel.app for an existing component, provider, blueprint, or schema. If servercn provides it, generate it with `npx servercn-cli add <name>` rather than hand-writing it. Full rule: `.rules/02-servercn.md`.
3. **No new dependencies without explicit user approval.** If a task seems to require a package not already listed in the rules, stop and ask before installing.
4. **No `any`, no `console.log`, no commented-out code.** Use `unknown` + Zod, the structured logger, and delete dead code.
5. **Multitenancy is a security boundary.** Every backend query scopes by `tenantId` from the session. Never accept `tenantId` from the client. Full rule: `.rules/07-auth-security.md`.

## Zed specifics

- **MCP servers** are configured in Zed's settings under `context_servers`. The recommended set is in `.rules/10-mcp-skills.md` — at minimum, enable **Context7** for live docs (essential for the servercn rule).
- **Agent rules**: this file (`AGENTS.md`) plus the `.rules/` folder are the project's rule surface. Zed loads `AGENTS.md` automatically. The agent should follow the navigation guidance above to load additional files on demand.
- **Stay in scope.** When a task is bounded (e.g. "fix the styling of TaskCard"), do not refactor adjacent code unless explicitly asked.
- **Plan before editing.** For any change touching more than one file, lay out the plan first (one short paragraph or a brief list), confirm or self-confirm, then execute.

## Quick start for new tasks

1. Read `.rules/00-index.md` and load the relevant rule files for the task.
2. If the task touches the backend, use Context7 (or fetch directly) for the relevant servercn doc page before generating code.
3. If the task introduces shared code, place it in `/packages/*` from the start — do not write it in `apps/*` "for now."
4. Run `pnpm turbo lint typecheck` on the affected workspaces before finishing.
5. Commit using Conventional Commits (`.rules/09-quality.md`).
