import {
  type MembershipRole,
  PrismaClient,
  type TaskPriority,
  type TaskStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD_PLAINTEXT = 'Password123!';
const BCRYPT_ROUNDS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const TENANTS = [
  { slug: 'acme-studio', name: 'Acme Studio' },
  { slug: 'northwind-labs', name: 'Northwind Labs' },
] as const;

const USERS = [
  { email: 'alice@taskly.dev', name: 'Alice Roselli' },
  { email: 'bob@taskly.dev', name: 'Bob Castelli' },
  { email: 'carol@taskly.dev', name: 'Carol Ferrara' },
  { email: 'dave@taskly.dev', name: 'Dave Greco' },
  { email: 'erin@taskly.dev', name: 'Erin Marconi' },
] as const;

type SeededTenant = { id: string; slug: string };
type SeededUser = { id: string; email: string };

const PROJECTS: ReadonlyArray<{
  tenantSlug: (typeof TENANTS)[number]['slug'];
  name: string;
  description: string;
  color: string;
}> = [
  {
    tenantSlug: 'acme-studio',
    name: 'Spring Campaign',
    description: 'Cross-channel launch for the spring collection. Hard deadline: Apr 30.',
    color: '#F59E0B',
  },
  {
    tenantSlug: 'acme-studio',
    name: 'Brand Refresh',
    description: 'New visual identity, logo, and design system tokens.',
    color: '#8B5CF6',
  },
  {
    tenantSlug: 'northwind-labs',
    name: 'API v2 Launch',
    description: 'Migrate public REST endpoints to v2 with OpenAPI contract and versioned types.',
    color: '#10B981',
  },
];

const TASK_TITLES_BY_PROJECT: Record<string, string[]> = {
  'Spring Campaign': [
    'Photoshoot brief — outdoor set',
    'Select location and book talent',
    'Storyboard for 30s hero video',
    'Tighten copy for landing page',
    'Run media-buying RFP',
    'Approve final palette with client',
    'Sync with influencer agency',
    'Define KPIs and tracking plan',
    'Schedule social calendar',
    'Hand-off assets to dev team',
    'QA newsletter rendering across clients',
    "Cut director's commentary",
    'Translate copy IT/EN',
    'Final review with creative director',
    'Press release draft',
    'Pricing page revisions',
    'Internal alignment with sales',
    'Post-mortem template',
  ],
  'Brand Refresh': [
    'Audit current brand assets',
    'Collect competitor benchmarks',
    'Mood-board workshop',
    'First logo direction explorations',
    'Typography pairing tests',
    'Define color tokens',
    'Spacing scale and grid spec',
    'Iconography pass',
    'Apply tokens to Figma library',
    'Migrate web components to new tokens',
    'Email template restyle',
    'Print collateral updates',
    'Brand guidelines doc v1',
    'Voice & tone guide',
    'Onboarding deck for stakeholders',
  ],
  'API v2 Launch': [
    'Decide v1 deprecation timeline',
    'Draft OpenAPI 3.1 spec',
    'Generate TypeScript SDK from spec',
    'Move auth to scoped API tokens',
    'Migrate `/tasks` endpoints',
    'Migrate `/projects` endpoints',
    'Migrate `/users` endpoints',
    'Add cursor-based pagination',
    'Write migration guide for customers',
    'Publish changelog tooling',
    'Set up contract tests in CI',
    'Load test the new endpoints',
    'Audit error taxonomy',
    'Public docs revamp',
    'Migrate Stripe webhooks listener',
    'Decommission v1 (post-grace period)',
    'Rate-limit per token tier',
  ],
};

const ROLE_PRIORITY: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

function pickStatus(seed: number): TaskStatus {
  const bucket = seed % 10;
  if (bucket < 4) return 'todo';
  if (bucket < 6) return 'in_progress';
  if (bucket < 9) return 'done';
  return 'archived';
}

function pickPriority(seed: number): TaskPriority {
  const order: TaskPriority[] = ['low', 'medium', 'medium', 'high', 'high', 'urgent'];
  return order[seed % order.length] ?? 'medium';
}

async function clean() {
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
}

async function seedTenants(): Promise<SeededTenant[]> {
  const created = await Promise.all(
    TENANTS.map((tenant) => prisma.tenant.create({ data: tenant })),
  );
  return created.map((t) => ({ id: t.id, slug: t.slug }));
}

async function seedUsers(): Promise<SeededUser[]> {
  const passwordHash = await bcrypt.hash(PASSWORD_PLAINTEXT, BCRYPT_ROUNDS);
  const now = new Date();
  const created = await Promise.all(
    USERS.map((user) =>
      prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash,
          emailVerifiedAt: now,
        },
      }),
    ),
  );
  return created.map((u) => ({ id: u.id, email: u.email }));
}

async function seedMemberships(tenants: SeededTenant[], users: SeededUser[]): Promise<void> {
  const findTenant = (slug: string) => tenants.find((t) => t.slug === slug)?.id;
  const findUser = (email: string) => users.find((u) => u.email === email)?.id;

  const acme = findTenant('acme-studio');
  const northwind = findTenant('northwind-labs');
  if (!acme || !northwind) throw new Error('Seed: tenant lookup failed');

  const assignments: Array<{ email: string; tenantId: string; role: MembershipRole }> = [
    { email: 'alice@taskly.dev', tenantId: acme, role: 'OWNER' },
    { email: 'carol@taskly.dev', tenantId: acme, role: 'ADMIN' },
    { email: 'dave@taskly.dev', tenantId: acme, role: 'MEMBER' },
    { email: 'bob@taskly.dev', tenantId: acme, role: 'MEMBER' },
    { email: 'bob@taskly.dev', tenantId: northwind, role: 'OWNER' },
    { email: 'alice@taskly.dev', tenantId: northwind, role: 'MEMBER' },
    { email: 'erin@taskly.dev', tenantId: northwind, role: 'MEMBER' },
  ];

  await Promise.all(
    assignments.map(({ email, tenantId, role }) => {
      const userId = findUser(email);
      if (!userId) throw new Error(`Seed: user not found ${email}`);
      return prisma.membership.create({ data: { userId, tenantId, role } });
    }),
  );
}

type SeededProject = { id: string; name: string; tenantId: string };

async function seedProjects(tenants: SeededTenant[]): Promise<SeededProject[]> {
  const tenantBySlug = new Map(tenants.map((t) => [t.slug, t.id]));
  const records = await Promise.all(
    PROJECTS.map((p) => {
      const tenantId = tenantBySlug.get(p.tenantSlug);
      if (!tenantId) throw new Error(`Seed: tenant ${p.tenantSlug} not found`);
      return prisma.project.create({
        data: {
          tenantId,
          name: p.name,
          description: p.description,
          color: p.color,
        },
      });
    }),
  );
  return records.map((p) => ({ id: p.id, name: p.name, tenantId: p.tenantId }));
}

async function seedTasks(
  projects: SeededProject[],
  tenants: SeededTenant[],
  users: SeededUser[],
  memberships: Array<{ userId: string; tenantId: string }>,
): Promise<number> {
  const usersByTenant = new Map<string, string[]>();
  for (const m of memberships) {
    const list = usersByTenant.get(m.tenantId) ?? [];
    list.push(m.userId);
    usersByTenant.set(m.tenantId, list);
  }

  const now = Date.now();
  let totalCreated = 0;
  let globalIndex = 0;

  for (const project of projects) {
    const titles = TASK_TITLES_BY_PROJECT[project.name] ?? [];
    const tenantMembers = usersByTenant.get(project.tenantId) ?? [];
    if (tenantMembers.length === 0) continue;

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      if (!title) continue;
      const status = pickStatus(globalIndex);
      const priority = pickPriority(globalIndex);
      const assignee = tenantMembers[globalIndex % tenantMembers.length];
      // Spread due dates: -10..+14 days from now
      const dueOffsetDays = ((globalIndex * 7) % 25) - 10;
      const dueAt = new Date(now + dueOffsetDays * DAY_MS);
      // Backdate done/archived to simulate history (between 5 and 25 days ago)
      const createdAt =
        status === 'done' || status === 'archived'
          ? new Date(now - (5 + (globalIndex % 20)) * DAY_MS)
          : new Date(now - (globalIndex % 7) * DAY_MS);

      await prisma.task.create({
        data: {
          tenantId: project.tenantId,
          projectId: project.id,
          title,
          description: descriptionFor(title, priority),
          status,
          priority,
          assigneeId: assignee,
          dueAt,
          createdAt,
        },
      });
      totalCreated++;
      globalIndex++;
    }
  }

  // Pad with synthetic backlog tasks until we hit ~50 across all projects.
  const padTarget = 50;
  const padTitles = [
    'Refine acceptance criteria',
    'Pair with design on edge cases',
    'Add Storybook entry',
    'Write changelog entry',
    'Capture screenshots for release notes',
    'Schedule retro',
    'Update onboarding doc',
  ];
  let padIndex = 0;
  while (totalCreated < padTarget) {
    const project = projects[padIndex % projects.length];
    if (!project) break;
    const tenantMembers = usersByTenant.get(project.tenantId) ?? [];
    if (tenantMembers.length === 0) {
      padIndex++;
      continue;
    }
    const title = `${padTitles[padIndex % padTitles.length]} (${project.name})`;
    const status = pickStatus(globalIndex);
    const priority = pickPriority(globalIndex);
    await prisma.task.create({
      data: {
        tenantId: project.tenantId,
        projectId: project.id,
        title,
        status,
        priority,
        assigneeId: tenantMembers[padIndex % tenantMembers.length],
        dueAt: new Date(now + ((padIndex % 14) - 3) * DAY_MS),
        createdAt: new Date(now - (padIndex % 14) * DAY_MS),
      },
    });
    totalCreated++;
    globalIndex++;
    padIndex++;
  }

  // Silence unused parameter warning when used dynamically in future.
  void tenants;
  void users;

  return totalCreated;
}

function descriptionFor(title: string, priority: TaskPriority): string {
  const urgency = ROLE_PRIORITY[priority] >= 3 ? 'High-priority work item.' : 'Routine work item.';
  return [
    `# ${title}`,
    '',
    urgency,
    '',
    '## Notes',
    '- Definition of done lives with the project owner.',
    '- Link blockers in the task comments when relevant.',
  ].join('\n');
}

async function seedAuditLogs(tenants: SeededTenant[], users: SeededUser[]): Promise<number> {
  const now = Date.now();
  const actions = [
    'auth.login',
    'auth.logout',
    'task.created',
    'task.updated',
    'task.status_changed',
    'project.created',
    'project.updated',
    'member.invited',
  ];
  let total = 0;
  for (let day = 30; day >= 0; day--) {
    const eventsForDay = ((day * 7) % 4) + 1; // 1..4 events per day
    for (let e = 0; e < eventsForDay; e++) {
      const tenant = tenants[(day + e) % tenants.length];
      const actor = users[(day + e) % users.length];
      if (!tenant || !actor) continue;
      const action = actions[(day + e) % actions.length];
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorId: actor.id,
          action: action ?? 'unknown',
          target: null,
          metadata: { day, slot: e },
          createdAt: new Date(now - day * DAY_MS + e * 60 * 60 * 1000),
        },
      });
      total++;
    }
  }
  return total;
}

async function main() {
  console.log('▸ seed: cleaning existing data');
  await clean();

  console.log('▸ seed: tenants');
  const tenants = await seedTenants();

  console.log('▸ seed: users');
  const users = await seedUsers();

  console.log('▸ seed: memberships');
  await seedMemberships(tenants, users);

  const memberships = await prisma.membership.findMany({
    select: { userId: true, tenantId: true },
  });

  console.log('▸ seed: projects');
  const projects = await seedProjects(tenants);

  console.log('▸ seed: tasks');
  const tasksCreated = await seedTasks(projects, tenants, users, memberships);

  console.log('▸ seed: audit logs');
  const auditCreated = await seedAuditLogs(tenants, users);

  console.log('');
  console.log('Seed complete:');
  console.log(`  tenants:     ${tenants.length}`);
  console.log(`  users:       ${users.length} (password: "${PASSWORD_PLAINTEXT}" for all)`);
  console.log(`  memberships: ${memberships.length}`);
  console.log(`  projects:    ${projects.length}`);
  console.log(`  tasks:       ${tasksCreated}`);
  console.log(`  audit logs:  ${auditCreated}`);
  console.log('');
  console.log('NOTE: TimeEntry / FocusSession data will be added by the seeder in Sprint 3/4');
  console.log('      once their Prisma models are introduced (see TODO.md).');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
