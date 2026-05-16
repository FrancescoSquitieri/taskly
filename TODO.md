# Taskly — Living backlog

> **Global status**: Sprint 0/12 · 4 features completed / ~110 total
> **Last updated**: 2026-05-17
> **Concept**: Deep-work / Focus Tracker PM — see plan file `/Users/francescosquitieri/.claude/plans/adesso-leggi-tutto-il-twinkling-pillow.md`

## Conventions

A feature is "done" only when:
1. Implemented
2. Tested at least manually (sprint acceptance green)
3. Committed with a Conventional Commit ([.rules/09-quality.md](.rules/09-quality.md))
4. Merged into the main branch

Flip `[ ] → [x]` **in the same commit that merges the feature**. Update the "Global status" counter at the top too.

### Legend
- 🎯 **Goal** of the sprint — the user-facing change in one sentence
- ⏱️ **Effort** — S (small), M (medium), L (large)
- ✅ **Acceptance** — binary criterion to declare the sprint closed
- 🎬 **Demo step** — what to show at an interview after this sprint
- `[blocked-by: sprint N · feature X]` — explicit dependency
- `[new-dep: <pkg>]` — introduces a new dependency → requires explicit approval ([CLAUDE.md](CLAUDE.md) hard rule #3)

---

## Sprint 0 — Foundation completion · ⏱️ S
🎯 Close the scaffold so we start with zero blockers.

- [x] First Prisma migration (`init`) on the dev DB
- [x] Set up `prisma db seed` with a TS script: 2 tenants, 5 users, 3 projects, 50 tasks, **30 days of synthetic, "narratable" TimeEntry/FocusSession data** (broken streaks, variable estimation accuracy) — TimeEntry/FocusSession seeding deferred to Sprint 3/4 once their schemas exist; the rest is in place with 78 audit entries spanning 31 days
- [x] Generate missing servercn components: `error-handler`, `async-handler`, `response-formatter`, `rbac` guard, `openapi` provider — via `npx servercn-cli add <name>` ([.rules/02-servercn.md](.rules/02-servercn.md)) — error-handler/async-handler/response-formatter already in tree; rbac and openapi added by hand because the servercn templates assume Mongoose+JWT (deviation logged in [.rules/02-servercn.md](.rules/02-servercn.md))
- [x] CI baseline in `.github/workflows/ci.yml`: `lint`, `check-types`, `test` on PR + push to main
- [ ] Verify Husky pre-commit + commit-msg + pre-push are working
- [ ] Update [README.md](README.md) with definitive setup steps (Docker workflow + host workflow)
- [ ] Create [TODO.md](TODO.md) (this file) + update [CLAUDE.md](CLAUDE.md), [.rules/00-index.md](.rules/00-index.md), create [.rules/11-backlog.md](.rules/11-backlog.md) — **in progress**

✅ **Acceptance**: `npm run dev` starts all services; login API endpoint returns 200 with a seed user; CI green on a test PR.
🎬 **Demo**: "One-command setup — Docker up, sample data ready, CI passing."

---

## Sprint 1 — Auth flow & Workspace bootstrap · ⏱️ M
🎯 A real user can register, log in, create a workspace, and invite a teammate via email.

- [ ] Pages `/login`, `/register`, `/forgot-password`, `/reset-password` (React Router v7)
- [ ] `useAuth` hook + redirect logic (protected routes, guard component)
- [ ] Workspace onboarding wizard (3 steps: workspace name, slug, invite teammates)
- [ ] Email invites (BullMQ + Nodemailer + Mailhog dev) — `react-email` template or simple HTML `[new-dep: react-email optional, nodemailer already present]`
- [ ] Accept-invite flow (link with signed short-lived JWT)
- [ ] RBAC enforcement on sensitive endpoints (middleware `requireRole(['OWNER','ADMIN'])`)
- [ ] Tenant switcher in topbar (Zustand store already present)
- [ ] Audit log: `auth.login`, `auth.register`, `workspace.created`, `member.invited`, `member.joined` (written to DB; UI comes in Sprint 9)

✅ **Acceptance**: two different browsers → user A invites B → B receives email on Mailhog → clicks the link → B sees A's workspace in the switcher.
🎬 **Demo**: "Sign up → workspace → email invite → collaborative join. All with an audit trail."

---

## Sprint 2 — Core PM UI + Real-time foundation · ⏱️ L
🎯 Project + Task CRUD with a Kanban board; every mutation emits WS events from the start.

- [ ] Page `/projects` (list + create dialog)
- [ ] Page `/projects/:id` with tabs: Board / List / Calendar / Timeline (only **Board** functional this sprint)
- [ ] Kanban board with **dnd-kit** (columns = TaskStatus) `[new-dep: @dnd-kit/core @dnd-kit/sortable]`
- [ ] Task detail drawer/sheet (shadcn): title, description (markdown), assignee, due date, priority, tags
- [ ] Markdown editor `[new-dep: @uiw/react-md-editor]` (or a lighter alternative)
- [ ] **Real-time WS events emitted by the backend**: `task.created`, `task.updated`, `task.moved`, `task.deleted`, `project.updated` → Redis pub/sub → fan-out to room `project:<id>` ([.rules/06-realtime.md](.rules/06-realtime.md))
- [ ] Frontend: subscribe to WS events + integrate with TanStack Query (invalidate or setQueryData)
- [ ] Optimistic updates on drag-drop with rollback on error
- [ ] Command Palette (Cmd+K) v1: search task/project + "Open task" action `[new-dep: cmdk]`

✅ **Acceptance**: 2 browsers on the same project → user A moves a task → B sees the update <500ms without refresh.
🎬 **Demo**: "Classic Kanban, but real-time. Cmd+K to jump anywhere."

---

## Sprint 3 — Time Tracking Core · ⏱️ M
🎯 Any task can be "worked on" with a timer; daily timesheet auto-filled.

- [ ] Prisma schema: `TimeEntry { id, tenantId, taskId, userId, startedAt, endedAt?, durationSec?, description?, source: 'manual'|'pomodoro' }`
- [ ] Migration `add_time_entry`
- [ ] Backend `time-entry` feature: start/stop/list/update/delete (routes/controller/service/repository) ([.rules/04-node.md](.rules/04-node.md))
- [ ] Mini sticky timer widget in topbar: start/stop, current task
- [ ] Daily timesheet view `/timesheet` (entries per day, total hours, inline edit)
- [ ] Idle detection (frontend): inactivity > 5min → toast "still there? Want to pause?"
- [ ] WS events `timer.started` / `timer.stopped` → useful for presence (Sprint 7)
- [ ] CSV export of timesheet (BullMQ job → generate file → download)

✅ **Acceptance**: start timer on a task → 5 minutes → stop → entry appears in timesheet with the correct duration; CSV export downloadable.
🎬 **Demo**: "Click Start, work, click Stop. The timesheet builds itself. CSV export in 2 clicks."

---

## Sprint 4 — Focus Sessions + Notifications base · ⏱️ L
🎯 The **signature** feature of Taskly — deep-work tracker with Pomodoro, streaks, and Don't Disturb.

- [ ] Prisma schema: `FocusSession { id, tenantId, userId, taskId, goalMinutes, startedAt, endedAt?, distractionCount, completedCycles, status }`
- [ ] Migration `add_focus_session`
- [ ] Backend `focus-session` feature
- [ ] Pomodoro engine on frontend (default 25/5, configurable) — **Web Worker** for accurate timing even with the tab in background
- [ ] **Focus mode UI**: minimal fullscreen screen → task + timer + "I'm distracted" button → increments counter
- [ ] **Streak tracking**: consecutive days with ≥1 completed focus session — Redis sorted set for internal leaderboard
- [ ] Notifications base:
  - [ ] Email queue (BullMQ + Nodemailer) — already scaffolded
  - [ ] In-app notification (Sonner toast + persisted in DB `Notification`)
  - [ ] Prisma schema `Notification` + migration
  - [ ] WS event `notification.created`
  - [ ] "1 min to break" reminder via Web Notification API + opt-in sound
- [ ] **Don't disturb mode**: during focus, backend publishes `user.focusing` → other users see a badge; notifications/mentions arrive *silently* and are grouped at the end of the session

✅ **Acceptance**: 25-min focus session on task X → at min 24 I receive "1 min to break" notif → at min 25 popup "break time" → TimeEntry automatically created with `source: 'pomodoro'` → streak counter +1.
🎬 **Demo**: "Start focus on 'Refactor checkout'. Screen goes clean, no notifications. End: 2 distractions, streak 12 days. The team saw I was focusing and waited."

---

## Sprint 5 — Calendar & Time Blocking · ⏱️ L
🎯 Plan the day by dragging tasks into time slots.

- [ ] FullCalendar integrated: day/week view `[new-dep: @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction]`
- [ ] Drag task from sidebar → calendar slot = create `TimeBlock { taskId, startsAt, endsAt }`
- [ ] Prisma schema `TimeBlock` + migration
- [ ] "Today" view `/today`: list of time-blocked tasks + placeholder for AI suggestions (wired up in Sprint 8)
- [ ] Delta visualization: time-blocked vs actual TimeEntry → bar (under/over)
- [ ] Recurring blocks (e.g. "Deep work morning 9-11 every weekday")
- [ ] Read-only iCal export (generates `.ics` for import into Google Cal / Apple Cal)

✅ **Acceptance**: drag 3 tasks onto Monday morning → Today view shows them → run a focus session on one → delta tracking visible at end of day.
🎬 **Demo**: "Monday morning: I drag tasks into the calendar. I work. The delta at the end of the day tells me if I estimated well."

---

## Sprint 6 — Analytics Dashboard · ⏱️ L
🎯 The **wow** moment for data. Hero chart = GitHub-style productivity heatmap. `[blocked-by: sprint 3, 4]`

- [ ] Page `/analytics`
- [ ] **Custom hero chart in Visx**: productivity heatmap (deep work hours per day, last 12 months) `[new-dep: @visx/heatmap @visx/scale]`
- [ ] Recharts: line chart deep work hours/week, bar chart distractions by day of the week `[new-dep: recharts]`
- [ ] **Estimation accuracy chart**: scatter plot of estimated vs actual time per task
- [ ] Per-project time breakdown (donut chart)
- [ ] **Redis caching layer** for analytics queries: key `analytics:<tenant>:<user>:<range>`, TTL 5min, **event-driven invalidation** on `timeentry.created`/`updated`/`deleted` → `DEL` keys
- [ ] Stats card: total deep work hours, average daily focus, current streak, longest streak
- [ ] PDF export of weekly report (headless Puppeteer in BullMQ worker) `[new-dep: puppeteer]`

✅ **Acceptance**: with 30 days of seed data, the dashboard loads in <1s (second call <100ms thanks to cache); heatmap shows activity correctly; PDF export downloadable.
🎬 **Demo**: "Hero heatmap of my deep work, estimation accuracy scatter, per-project donut. PDF of the weekly report."

---

## Sprint 7 — Presence & Activity Feed · ⏱️ S
🎯 Make team collaboration alive (Socket.IO has been pervasive since Sprint 2).

- [ ] Presence: "online now" list with status (idle/active/focusing) — Redis `tenant:<id>:presence` (sorted set with TTL)
- [ ] Activity feed `/activity`: scrollable tenant event feed (filters by project/user/type)
- [ ] WS subscriber on `tenant:<id>` room updates the feed in real time
- [ ] Avatar bubbles with presence ring in project headers
- [ ] "Now focusing on" indicator in team view (privacy: task title only, no description)

✅ **Acceptance**: 3 browsers → I see everyone's presence, live activity, others' focus state visible.
🎬 **Demo**: "Three browsers open, activity scrolling in real time, focus badges changing."

---

## Sprint 8 — AI Coach · ⏱️ L
🎯 The qualitative wow feature. Claude API integrated as a **coach**, not a gimmick. `[blocked-by: sprint 6]`

- [ ] Set up Anthropic SDK in `apps/api` `[new-dep: @anthropic-ai/sdk]`, env `ANTHROPIC_API_KEY`
- [ ] **Weekly review job**: BullMQ cron every Monday 8:00 → for every active user in the tenant → generate a review using last week's TimeEntry/FocusSession data → **prompt caching** on the system prompt (long, reusable across users)
- [ ] Weekly review UI: card in the dashboard with markdown-formatted review, "Apply suggestions" link
- [ ] **Sub-task generation**: "Break down with AI" button on a task → **SSE streaming** → generates 3-7 sub-tasks
- [ ] **Tool use** for sub-tasks: the model calls a tool `create_subtask(title, estimated_minutes)` → backend validates via Zod and inserts into DB
- [ ] **Smart time blocking**: "Plan my day" button → input: selected tasks + capacity → output: optimal time blocks (morning = complex tasks, afternoon = reactive work) — rationale based on the user's energy patterns
- [ ] AI rate limiting per tenant (e.g. 100 req/day) + usage log in `Notification` or dedicated table

✅ **Acceptance**: Monday 8am I receive an email "Your weekly review is ready" + the dashboard shows an accurate review; "Break down with AI" on a task → I get 5 sensible sub-tasks streamed live.
🎬 **Demo**: "Click 'Plan my day' → AI blocks my calendar in 3 seconds with rationale. 'Break down with AI' on 'Refactor checkout' → 5 sub-tasks generated live via streaming."

---

## Sprint 9 — Audit log UI + Notification Center · ⏱️ M
🎯 Transparency + governance.

- [ ] Page `/audit` (visible to OWNER/ADMIN): table filterable by actor/action/target/date
- [ ] Backend audit log expansion: hook into all write services to emit `auditService.record(...)`
- [ ] Notification center: persistent panel with tabs "All / Mentions / @me"
- [ ] Mark as read, mark all as read, archive
- [ ] Preferences page `/settings/notifications`: choose channel (email/in-app/none) per event type

✅ **Acceptance**: ADMIN opens `/audit` → sees seeded events with working filters; toggling preferences correctly disables email for that type.
🎬 **Demo**: "Audit log exposed to the client, configurable per event type."

---

## Sprint 10 — Capacity Planning · ⏱️ M
🎯 The "team-respectful" pillar becomes actionable. `[blocked-by: sprint 3, 6]`

- [ ] Daily energy check-in: modal on first opening of the day → "How do you feel? 1-5" → saved in `EnergyEntry`
- [ ] Migration + Prisma schema `EnergyEntry`
- [ ] Team workload view `/team`: team heatmap (user × day = booked hours)
- [ ] Capacity alerting: when creating/moving a task, compute booked hours for assignee → if > capacity (default 6h/day) → toast warning
- [ ] Per-user capacity setting (`User.dailyCapacityHours` with related migration)
- [ ] AI Coach v2: smart suggestions use `EnergyEntry` ("you logged low energy on Wednesday, block creative tasks on Tuesday")

✅ **Acceptance**: assign 5 heavy tasks to a user with 6h capacity → toast warning; team view shows red/yellow/green per user.
🎬 **Demo**: "Team workload heatmap — who's overloaded, who can take more tasks. AI suggests redistribution."

---

## Sprint 11 — Quality & Polish · ⏱️ L
🎯 Portfolio-grade quality.

### Tests
- [ ] Jest unit tests on `service`/`repository` (critical-path coverage >60%)
- [ ] Jest integration tests on routes (`supertest`)
- [ ] **Playwright E2E**: 5 happy paths (register, create task, focus session, time block, AI sub-task)

### Accessibility
- [ ] Audit with axe-core, fix labels/aria
- [ ] Full keyboard nav (escape closes modals, correct tab order)

### Performance
- [ ] React Router lazy loading of pages
- [ ] Image optimization
- [ ] Bundle analyzer (`vite-bundle-visualizer`) → split chart libs into separate chunk
- [ ] Lighthouse mobile/desktop >90 score

### Reliability & UX
- [ ] **Sentry**: FE + BE integration, source maps, release tracking `[new-dep: @sentry/react @sentry/node]`
- [ ] React error boundaries + fallback UI
- [ ] Empty/loading/error states for every page (no white screen ever)
- [ ] **Keyboard shortcuts overlay** (`?`) with all commands
- [ ] Dark mode (shadcn already supports it — just wire up the theme switcher)
- [ ] **Minimal i18n**: only IT + EN `[new-dep: react-i18next i18next]`, structure ready for other languages

✅ **Acceptance**: desktop Lighthouse >90; Playwright E2E green in CI; Sentry shows a caught test event; `?` overlay functional.
🎬 **Demo**: "Theme + language switcher, keyboard shortcuts with `?`. Lighthouse 95+. Errors auto-logged to Sentry."

---

## Sprint 12 — DevOps, Deploy & Showcase · ⏱️ M
🎯 App deployed, repo presentable, demo ready to show at interviews.

### Build & deploy
- [ ] Multi-stage prod Dockerfile per app (web/api/ws) — verify existing one
- [ ] GitHub Actions CI/CD: build → push image → deploy
- [ ] Railway deploy: managed Postgres + Redis + 3 services
- [ ] Custom DNS (e.g. `taskly.francescosquitieri.dev`) — optional
- [ ] **Small Terraform module** (`infra/`) — documentation "I know IaC" even if the real deploy is on Railway

### API + integrations
- [ ] **OpenAPI auto-gen** from Zod (`@asteasolutions/zod-to-openapi`) + public Swagger UI on `/api/docs` `[new-dep: @asteasolutions/zod-to-openapi swagger-ui-express]`
- [ ] **Outbound Webhooks**: `webhook` feature → `WebhookEndpoint { id, tenantId, url, secret, events[] }`, exponential retry via BullMQ, **HMAC SHA-256 signature** in header
- [ ] **Public Share Token**: link `/share/<token>` for read-only weekly report, signed token (short-lived JWT), rate-limited

### Documentation & showcase
- [ ] Final README: tagline, animated screenshots, demo link, architecture diagram (excalidraw), tech stack badges, "how to run locally", credits
- [ ] **90s demo video** (Loom): narrated demo story
- [ ] **Architecture diagram** in repo (`docs/architecture.svg`)

✅ **Acceptance**: public URL functional with demo seed data, Swagger UI accessible, webhook test delivers a `task.completed` event to `webhook.site`, share token produces a readable report without login.
🎬 **Demo**: "Open the public URL. 30-second demo story. Show Swagger and webhook live."

---

## "Nice-to-have" backlog (out of sprint)

Ideas for future expansion, **not to be implemented within the 13 sprints**. Pick from these if time allows or for future iterations.

- [ ] PWA (service worker, offline-first timer)
- [ ] Mobile app (React Native / Expo)
- [ ] Slack integration (slash command to start focus, OAuth, notifications to Slack)
- [ ] GitHub integration (link PR to task, status auto-update)
- [ ] Multi-org (a user in multiple tenants simultaneously with shared session)
- [ ] Custom workflows (configurable state machine per project: custom statuses, transition rules)
- [ ] Custom fields per task (config per project)
- [ ] Task templates (e.g. "bug report", "feature request")
- [ ] Smart break suggestions based on HRV/wearables (Apple Health integration)
- [ ] Voice notes on tasks (Whisper API)
- [ ] Public roadmap page per project

---

## Demo story (interview memo)

> "Monday morning I open Taskly. The AI Coach shows the weekly review: *last week estimated 32h, logged 41, accuracy 78%, focus peak Tuesday 10–12*. I drag three tasks into the calendar to plan today; the system warns I'm at 95% capacity. I click Start on the first task: Pomodoro starts, my team status flips to 'focusing', presence updates via WS, notifications mute. At the end I log 2 distractions, streak at 12 days. I export the timesheet as PDF and generate a public read-only link for the client."

Covers: **AI · analytics · capacity · time blocking · focus · real-time · team-awareness · export · sharing**.
