# MCP Servers & Skills — Output Quality Boosters

Both Claude Code and Zed (with Copilot/Claude) support MCP servers and skills. The list below is the project's recommended setup. Enable only what you actually use — extra tools dilute the agent's attention.

## MCP servers

| Server | What it does | When to enable | Notes |
|---|---|---|---|
| **Context7** | Pulls fresh, version-pinned docs for libraries directly into the prompt. | **Always.** Solves "the model knows an old API." | Especially valuable for `servercn`, `prisma`, `socket.io`, `bullmq`, `@tanstack/react-query`. |
| **GitHub MCP** | Read repos, issues, PRs, CI logs. | When working with PRs or issues. | Auth via PAT or GitHub App. |
| **Filesystem MCP** | Read/write outside the project root (e.g. `~/Documents`). | Rarely needed — agents already have project FS access. | Keep scoped to specific folders. |
| **Postgres MCP** | Query the dev database, inspect schema, run ad-hoc SQL. | When debugging data issues or designing schemas. | Connect to the LOCAL dev DB only. Never staging/prod. |
| **AWS MCP** (or equivalent) | Inspect AWS resources, read CloudWatch logs. | When debugging deploy or runtime issues on AWS. | Read-only IAM role. |
| **Puppeteer / Playwright MCP** | Drive a browser to test the deployed app or scrape docs. | For E2E debugging or doc-scraping. | Heavy — enable only when needed. |
| **Sentry MCP** (if Sentry is added) | Pull error events into context. | Once error tracking is wired up. | Useful for "why did this fail in prod" prompts. |

### Servercn-specific

There is no official servercn MCP server. The combination of **Context7 + the servercn docs URL** is the practical equivalent — Context7 will pull the current docs on demand, satisfying the "always check the docs" rule in `02-servercn.md` without manual `web_fetch`.

### Configuration locations

- **Claude Code**: project-level `.mcp.json` at the repo root (committed) for shared servers; user-level config for personal credentials.
- **Zed**: `~/.config/zed/settings.json` under `context_servers`. For project-specific servers, use Zed's per-project settings.

Always commit the MCP server *list* (without credentials). Credentials go in environment variables or per-user config files that are gitignored.

## Skills

Skills are reusable instructions that an agent loads on demand. The project benefits from these.

### Always-on skills (project-wide)

1. **`servercn-first`** — A one-page skill that restates the rule from `02-servercn.md`: before adding any backend boilerplate, query Context7 / the servercn docs to find the component. Bind it to triggers like "add middleware", "add auth", "add rate limit", "send email".
2. **`shared-package-mover`** — Detects when a type, schema, constant, or helper is being duplicated between `apps/web` and `apps/api` and instructs the agent to move it to `/packages/*` first. Triggers: "I need this type on both sides", "shared between frontend and backend".
3. **`tenant-scope-check`** — Before generating any new repository method or service, verifies that the implementation includes `tenantId` scoping. Triggers: keywords `prisma.`, `findMany`, `repository`, `service` in backend files.
4. **`commit-message-formatter`** — Enforces Conventional Commits per `09-quality.md`. Triggers on commit-message generation.

### On-demand skills

5. **`feature-scaffold`** — Generates a new backend feature folder skeleton (`routes`, `controller`, `service`, `repository`, `validation`) following the conventions in `04-node.md`. Triggers: "add a new feature", "scaffold X domain".
6. **`react-feature-scaffold`** — Generates a new frontend feature folder (PascalCase, `Index.tsx`, `Types.ts`, optional `Helpers.ts`, `Constants.ts`) per `03-react.md`.
7. **`zod-schema-author`** — Generates Zod schemas with sensible refinements (string trimming, min/max, email/url shapes) and the corresponding `z.infer` type alias, placed in the right `@repo/schemas` file.
8. **`prisma-migration-namer`** — Suggests a kebab-case migration name from the schema diff.
9. **`adr-author`** — Drops a new ADR file in `/docs/adr/` using the standard template (context, decision, consequences).
10. **`socket-event-author`** — When adding a new realtime event, generates the constant (in `@repo/constants/socket`), the Zod payload schema (in `@repo/schemas/socket`), and both the server emit helper and the client handler stub.

### Skill locations

- **Claude Code**: place skill markdown files in `.claude/skills/` at the repo root. Each file is a short, focused instruction set with a `description` frontmatter that the agent matches against the task.
- **Zed**: Zed uses agent rules files (this `AGENTS.md` lives in the project root and is auto-loaded). Skills as such are not first-class in Zed — the equivalent is well-described sections in the rule files. The skills above are documented in their respective rule files, and this section serves as the index.

## How to add a new MCP server or skill

1. Verify it actually solves a recurring problem on this project. One-shot needs do not justify permanent additions.
2. Add the server to the MCP table or skill to the skills table in this file.
3. Add the configuration to the appropriate config location.
4. Test that it works end-to-end on a real task.
5. Commit with `chore(tooling): add <name> mcp/skill` and a short note in the PR about what problem it solves.

## How to evaluate that the agent is following the rules

A few quick spot-checks when reviewing agent output:

- Did backend changes consult the servercn docs (visible in tool calls or PR description)?
- Are shared types/schemas living in `/packages` or duplicated?
- Are repository methods scoped by `tenantId`?
- Are imports ordered per `01-project.md` and per the app-specific rule files?
- Are commit messages Conventional?
- No `console.log`, no `any`, no inline-conditional Tailwind?

If any of those fail, the rules need to be either tightened or surfaced more aggressively (e.g. via a skill that fires earlier).
