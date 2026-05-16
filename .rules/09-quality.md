# Code Quality Rules — Biome, Husky, Commits, Testing

## Biome

The project uses **Biome** as the single lint + format tool. No ESLint, no Prettier.

### Configuration

- Configuration lives in `biome.json` at the repo root and is **shared** by all workspaces via the `extends` mechanism (or by referencing the root config from each app).
- Base settings:
  - Formatter: 2 spaces, single quotes for JS/TS, trailing commas `all`, line width 100.
  - Linter: all `recommended` rules ON; additional rules per project taste documented in the file.
- The Biome config in `@repo/config` (if extracted) is the authoritative source. Workspaces extend it; they do not override base rules silently.

### Scripts

Each workspace `package.json` exposes:

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

Turborepo wires them up so `npm exec turbo -- lint` runs across the monorepo with caching.

### What Biome enforces (highlights — full list in `biome.json`)

- No `console.log` (ERROR). Use the logger.
- No unused variables / imports (ERROR).
- No `any` (ERROR).
- Consistent imports order (auto-fixed).
- Sorted object keys where applicable.
- No floating promises (ERROR).
- Exhaustive deps in `useEffect` (ERROR).

If a Biome rule needs to be disabled for a specific line, use a `// biome-ignore <rule>: <reason>` comment with a concrete reason. No anonymous disables.

## Husky + lint-staged

- Husky installs git hooks via the root `npm run prepare` script (auto-runs on
  `npm install`).
- Hooks live in `.husky/` at the repo root and are tracked in git.
- Hooks:
  - `pre-commit`: runs `lint-staged` (Biome on staged files) + `turbo run check-types
    --filter=...[HEAD]` for affected workspaces.
  - `commit-msg`: runs `commitlint --edit` against the Conventional Commits spec
    (`commitlint.config.js`).
  - `pre-push`: runs `turbo run lint check-types test --filter=...[HEAD~1] --concurrency=4`
    to catch what `pre-commit` missed.

### `lint-staged` config

Declared in the root `package.json` under the `lint-staged` key:

```json
{
  "*.{ts,tsx,js,jsx,json,md}": ["biome check --write --no-errors-on-unmatched"]
}
```

Servercn provides scaffolding for Husky + lint-staged + Commitlint — see
https://servercn.vercel.app/docs/tooling/. Use those generators before hand-writing
config when adding new hooks.

## Commits — Conventional Commits

Every commit message follows the Conventional Commits spec:

```
<type>(<scope>)!: <subject>

<body>

<footer>
```

- **Allowed types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `style`, `revert`.
- **Scope** is the affected workspace or feature: `web`, `api`, `worker`, `infra`, `schemas`, `task`, `auth`, `realtime`. Lowercase.
- **Subject** is imperative ("add", not "added"), under 72 chars, no trailing period.
- `!` indicates a breaking change. The body or a `BREAKING CHANGE:` footer explains the break.

Examples:
- `feat(task): support drag-and-drop reordering on board`
- `fix(api): scope task list query by tenantId`
- `chore(infra): bump RDS instance to db.t4g.medium`
- `refactor(schemas)!: rename TaskStatus values to lowercase`

## Testing

Each feature ships with **detailed, working tests** — happy path + at least one edge case.
The toolchain is split by surface.

### Frontend — Playwright (end-to-end)

- `apps/web` uses **Playwright** for end-to-end tests. There is no unit-test runner on the
  frontend by default — UI logic is covered through the E2E layer plus the shared package
  tests in Jest (`@repo/schemas`, `@repo/utils`).
- Test files live in `apps/web/e2e/<feature>.spec.ts`. One spec file per feature.
- The Playwright config (`apps/web/playwright.config.ts`) auto-spawns `npm run dev` unless
  `E2E_BASE_URL` is provided.
- Use the three default browser projects: `chromium`, `firefox`, `webkit`. Disable a project
  only with a written reason in the PR description.
- Test against role/label semantic queries (`getByRole`, `getByText`) — never against
  CSS class names or DOM structure (those break under shadcn updates).
- For flows that need a logged-in user, build an `apps/web/e2e/fixtures/auth.ts` helper
  that hits the REST API directly to seed the session, then attaches the cookie to the
  Playwright context. Do not click through the login form in every spec.

```sh
# Run E2E locally
cd apps/web && npm run test:e2e
# Open the inspector
cd apps/web && npm run test:e2e:ui
```

### Backend — Jest (apps/api and apps/ws)

- Both `apps/api` and `apps/ws` use **Jest** with `ts-jest` in ESM mode.
- Test layers in isolation:
  - **Services**: mock the repository (`jest.mock('@/features/<domain>/<domain>.repository')`),
    assert business logic, error paths, multitenancy boundaries.
  - **Repositories**: integration tests against a real Postgres in CI (via a `postgres`
    service container in the workflow) or a test schema in the dev DB. Wrap each test
    in a transaction that is rolled back at teardown.
  - **Controllers**: thin, exercised via **supertest** against a freshly composed
    `createApp()` Express instance (no listening port required). Use this for routing,
    middleware order, and error-shape verification.
  - **Realtime handlers** (`apps/ws`): unit-test the handler in isolation by passing a
    stubbed `Socket`. End-to-end socket tests boot a real Socket.IO server on a random
    port and connect with `socket.io-client`.
- **Job processors**: test the pure handler function with a fake job object, not BullMQ
  itself.
- Test files live next to source (`*.test.ts`) for unit tests, or under
  `apps/<app>/tests/{unit,integration}/` for cross-layer tests.

```sh
# Run all backend tests
npm run test --workspace=@taskly/api
npm run test --workspace=@taskly/ws
```

### Shared packages

- `@repo/schemas` and `@repo/utils` use Jest (ESM via `ts-jest`).
- `@repo/schemas`: tests for any non-trivial refinement (`.refine`, `.transform`), every
  enum, and every cross-field validation. Plain `z.object` shapes do not need tests.
- `@repo/utils`: test every exported function — these helpers are imported by many
  surfaces; one regression here breaks the whole repo.

### CI

- `npm run test` at the root runs `turbo run test` across all workspaces.
- E2E tests run as a separate job (`npm run test:e2e`) — they start the dev server and
  take longer, so they don't gate the inner CI loop.

### What "done" looks like

- The unit's happy path has a test.
- At least one edge / error case has a test.
- For a backend feature: a service unit test (happy + error) AND a controller integration
  test through supertest.
- For a frontend feature: at least one Playwright spec covering the user-visible flow.
- CI runs everything green before merge.

## Documentation

- The repo's root `README.md` covers: what the project is, the stack, local setup steps, and pointers to `/.rules` and `/infra`.
- Each app and each package has its own `README.md` with a one-paragraph description and any app-specific setup notes.
- Architectural decisions go in `/docs/adr/NNNN-<slug>.md` using the standard ADR template (context, decision, consequences). Examples worth documenting:
  - Why stateful auth instead of JWT.
  - Why servercn instead of NestJS / hand-rolled.
  - Why CDK instead of Terraform (or vice versa).
- API docs are generated by the servercn Swagger component — link from the root README.

## Process discipline

- **Small PRs.** A PR should be reviewable in under 15 minutes. If it cannot be split, explain why in the description.
- **PR description format**: what changed, why, how it was tested, screenshots/screencasts for UI changes, migration notes if any.
- **No `WIP` merged to `main`.** Use draft PRs for work in progress.
- **Reviews self-checked first**: the author reviews their own PR before requesting review — checks for `console.log`, dead code, missing tests, broken types.
