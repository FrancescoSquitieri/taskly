# DevOps Rules — Docker, GitHub Actions, AWS IaC

## Docker

### Local development

Two compose files at the repo root:

- `docker-compose.yml`        — **full stack** (api, worker, ws, web + postgres, redis,
  mailhog + a `migrate` one-shot that runs `prisma migrate deploy` and gates the api/worker
  via `service_completed_successfully`). Started with `npm run start`
  (alias of `docker compose up -d --build`).
- `docker-compose.infra.yml`  — **infra only** (postgres, redis, mailhog). Started with
  `npm run docker:infra:up`. Use this when you want to iterate on the apps on the host
  via `npm run dev`.

Choose A or B per developer preference:
- **A. Everything in Docker** — closest to production, slower edit/rebuild loop. Use
  `npm run start` / `npm run docker:logs` / `npm run docker:down`.
- **B. Apps on host, infra in Docker** — fastest inner loop. Use `npm run docker:infra:up`
  then `npm run dev`.

Root-level npm scripts that wrap docker compose:

```
npm run start                # docker:up:build (build + up the full stack)
npm run stop                 # docker:down
npm run docker:up            # up -d
npm run docker:up:build      # up -d --build
npm run docker:up:fg         # up --build (foreground, logs attached)
npm run docker:down          # down
npm run docker:down:volumes  # down -v (wipes data)
npm run docker:restart       # restart all services
npm run docker:logs          # tail -f all services
npm run docker:ps            # status
npm run docker:migrate       # run the `migrate` one-shot again
npm run docker:infra:up      # bring up only postgres + redis + mailhog
npm run docker:infra:down    # stop only the infra compose
```

### Dockerfiles

Each app has its own Dockerfile:
- `apps/api/Dockerfile`         — REST server (Express)
- `apps/api/Dockerfile.worker`  — BullMQ workers (separate image, separate container)
- `apps/ws/Dockerfile`          — WebSocket server (Socket.IO)
- `apps/web/Dockerfile`         — static SPA built with Vite, served by `nginx:alpine`

### Dockerfile rules

- **Multi-stage builds** are mandatory. The canonical 4-stage pattern:
  1. `pruner` stage — run `turbo prune --scope=<app> --docker` to emit a minimal monorepo
     subset (the `out/` directory).
  2. `deps` stage — install dependencies with `npm ci --no-audit --no-fund` against the
     pruned `package.json` files. This stage is heavily cached.
  3. `build` stage — run `turbo run build --filter=<app>`.
  4. `runner` stage — copy only the built output and production-needed assets. Use
     `node:<version>-alpine`.
- For `apps/web`, the runner stage is `nginx:alpine` serving the Vite `dist/` directory.
  This produces an image under ~30MB.
- Run as a **non-root user** in the runner stage (`USER nodejs` with UID 1001).
- Set `NODE_ENV=production` in the runner stage.
- Use `tini` as PID 1 for proper signal handling (graceful shutdown via servercn
  `shutdown-handler`).
- Pin base images by digest in production-bound Dockerfiles. Renovate / Dependabot keeps
  them current.
- `.dockerignore` (at the repo root) excludes `node_modules`, `.turbo`, `.git`, `dist`,
  `coverage`, `playwright-report`, `*.log`, `.env*`.

### Image tagging

- Locally: `<app>:dev`.
- CI builds: `<registry>/<app>:<git-sha>` and additionally `<registry>/<app>:<branch>` for the default branch.
- Releases: `<registry>/<app>:<semver>` produced by a release workflow on tag push.

## GitHub Actions — CI/CD

### Workflow files

```
.github/workflows/
├── ci.yml             # PR and push to main: lint + typecheck + test + build
├── deploy-staging.yml # Push to main → deploy to staging
├── deploy-prod.yml    # Tag v* → deploy to production
└── infra.yml          # Manual + on infra/** changes → plan/apply IaC
```

### `ci.yml` essentials

- Trigger: `pull_request` and `push` to default branch.
- Uses pnpm with caching (`actions/setup-node` + `pnpm/action-setup`).
- Uses Turborepo Remote Cache (the free GitHub Actions cache via `turbo-ignore` + `actions/cache`, or a Vercel/self-hosted remote cache if available — see Turborepo docs).
- Steps in order:
  1. Checkout
  2. Setup Node + pnpm
  3. `npm ci --no-audit --no-fund`
  4. `npx biome ci .` (lint + format check, see `09-quality.md`)
  5. `npm exec turbo -- typecheck`
  6. `npm exec turbo -- test`
  7. `npm exec turbo -- build`
- Steps run via Turborepo so cached tasks are skipped.
- Run only the **affected** workspaces in PRs when possible: `turbo run <task> --filter=...[origin/main]`.

### Deployment workflows

- `deploy-staging.yml`: builds Docker images, pushes to ECR, updates the staging ECS service (or equivalent — see IaC below). Auto-runs on push to `main`.
- `deploy-prod.yml`: same flow, gated on a tag `v*.*.*` and a manual environment approval (GitHub Environments → `production`).
- Migrations run as a **pre-deploy step** via a one-shot task (ECS RunTask or equivalent): `npx prisma migrate deploy`. The new app version is rolled out only if migrations succeed.

### Secrets

- All deployment secrets are stored in **GitHub Environments** (not at the repo level) and exposed only to the workflow that needs them.
- AWS credentials use **OIDC federation** (`aws-actions/configure-aws-credentials` with `role-to-assume`) — no long-lived access keys.

## AWS — Infrastructure as Code

### Tooling

The infra layer is defined as code in `/infra`. Choose ONE tool and stick with it for the whole project. The two acceptable options are:

- **Terraform** (HCL, large ecosystem, cross-cloud).
- **AWS CDK** (TypeScript, code-driven, AWS-native).

Recommendation for this project: **AWS CDK (TypeScript)** because it shares language with the rest of the codebase and slots into the monorepo (`infra/` becomes another workspace).

The choice is recorded in `infra/README.md`. Once chosen, do not mix tools.

### Components provisioned

At minimum:

- **VPC** with public + private subnets across 2 AZs.
- **RDS Postgres** (db.t4g.small to start). Private subnet. Automated backups.
- **ElastiCache Redis** (cache.t4g.micro to start). Private subnet.
- **ECS on Fargate** (or App Runner for simplicity) — four services:
  - `api` (Express REST)
  - `ws`  (Socket.IO WebSocket)
  - `worker` (BullMQ)
  - `web` is built as static assets and served via CloudFront + S3 (no container needed)
- **Application Load Balancer** in front of the API service, HTTPS only, ACM cert.
- **CloudFront + S3** for the web app (and assets).
- **ECR** repositories for `api`, `ws`, and `worker` images.
- **Secrets Manager** for runtime secrets (database URL, session secret, SMTP creds). The API task reads them at startup.
- **SES** for production email (or a managed SMTP provider — choose at deploy time).
- **CloudWatch** for logs (structured logger output → log group per service).

### Environments

Two environments: `staging` and `production`. Same architecture, different sizing. Each environment is a separate CDK stack (or Terraform workspace) deployed by its own GitHub Actions workflow.

### Cost guardrails

- Tag every resource with `Project=<name>` and `Environment=<staging|production>`.
- Enable AWS Budgets with email alerts.
- Use Graviton (ARM) instance types where supported.
- Start with the smallest tier of every managed service. Scale up only when metrics justify it.

### State

- For Terraform: state in S3 + DynamoDB lock table. The state bucket is provisioned manually first (chicken-and-egg) and referenced by all stacks.
- For CDK: state lives in CloudFormation. The `cdk bootstrap` step runs once per account/region.

### Drift

- Do not modify infra resources via the AWS console for `staging` / `production`. All changes go through the IaC repo + PR review.
- The `infra.yml` workflow runs `plan` (Terraform) or `cdk diff` (CDK) on every PR touching `infra/**` and posts the result as a PR comment.

## Observability (baseline)

- Structured logs to CloudWatch (one log group per service).
- Health check endpoint from servercn (`add health-check`) at `/healthz` — the ALB target group uses it.
- An uptime monitor (e.g. Better Stack, Uptime Kuma) pings `/healthz` from outside the VPC.
- For deeper observability later: OpenTelemetry SDK + an OTel collector. Not required for v1.

## Branch strategy

- `main` is always deployable. Push to `main` triggers staging deploy.
- Tags `v*.*.*` on `main` trigger production deploy.
- Feature work in short-lived branches with PRs. Squash-merge to `main`.
- Hotfixes branch from the latest production tag, merge to `main`, then tag a patch release.
