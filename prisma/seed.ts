import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STAGE_KEYS = ['alex', 'cass', 'nigel-spec', 'nigel-tests', 'codey-plan', 'codey-implement']

function makeStages(includedKeys: string[], failAt?: string) {
  const stages: Record<string, unknown> = {}
  for (const key of includedKeys) {
    const failed = key === failAt
    stages[key] = {
      startedAt: new Date(Date.now() - 600_000).toISOString(),
      completedAt: failed ? null : new Date().toISOString(),
      durationMs: failed ? null : Math.floor(Math.random() * 60_000) + 5_000,
      status: failed ? 'failed' : 'success',
      tokens: failed ? null : Math.floor(Math.random() * 20_000) + 2_000,
      cost: failed ? null : +(Math.random() * 0.5).toFixed(4),
      feedback: failed ? null : { rating: Math.floor(Math.random() * 2) + 4, issues: [] },
    }
    if (key === 'codey-implement' && !failed) {
      (stages[key] as Record<string, unknown>).stepsCompleted = Math.floor(Math.random() * 4) + 2
    }
    if (failed) break
  }
  return stages
}

async function main() {
  // Seed user
  const user = await prisma.user.upsert({
    where: { githubId: 'seed-user-1' },
    update: {},
    create: {
      githubId: 'seed-user-1',
      name: 'Steve Newman',
      email: 'steve@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      isAdmin: true,
    },
  })

  // Seed API key
  const apiKey = await prisma.apiKey.upsert({
    where: { key: 'mm8_seed_key_0000000000000000000000000000' },
    update: {},
    create: {
      key: 'mm8_seed_key_0000000000000000000000000000',
      keyPrefix: 'mm8_seed_key',
      name: 'Dev seed key',
      userId: user.id,
      lastUsedAt: new Date(),
    },
  })

  // Delete existing seed runs to avoid duplication on re-seed
  await prisma.run.deleteMany({ where: { apiKeyId: apiKey.id } })

  const slugs = [
    'project-scaffold',
    'github-auth',
    'api-key-management',
    'telemetry-ingestion',
    'run-history-dashboard',
    'run-detail-view',
    'insights-panel',
    'admin-key-panel',
  ]

  const runs: Parameters<typeof prisma.run.create>[0]['data'][] = [
    // 6 successful feature runs
    ...slugs.slice(0, 6).map((slug, i) => ({
      userId: user.id,
      apiKeyId: apiKey.id,
      slug,
      type: 'feature',
      status: 'success',
      startedAt: new Date(Date.now() - (8 - i) * 86_400_000),
      completedAt: new Date(Date.now() - (8 - i) * 86_400_000 + 900_000),
      totalDurationMs: 900_000 + i * 30_000,
      totalCost: ((0.8 + i * 0.12).toFixed(4)),
      commitHash: `abc${i}def${i}ghi${i}jkl${i}`.slice(0, 12),
      stages: makeStages(STAGE_KEYS),
    })),
    // 1 failed run (nigel-tests failed)
    {
      userId: user.id,
      apiKeyId: apiKey.id,
      slug: 'insights-panel',
      type: 'feature',
      status: 'failed',
      startedAt: new Date(Date.now() - 2 * 86_400_000),
      completedAt: new Date(Date.now() - 2 * 86_400_000 + 420_000),
      totalDurationMs: 420_000,
      totalCost: ('0.34'),
      commitHash: null,
      failedStage: 'nigel-tests',
      stages: makeStages(['alex', 'cass', 'nigel-spec', 'nigel-tests'], 'nigel-tests'),
    },
    // 1 paused run (paused after codey-plan)
    {
      userId: user.id,
      apiKeyId: apiKey.id,
      slug: 'admin-key-panel',
      type: 'feature',
      status: 'paused',
      startedAt: new Date(Date.now() - 1 * 86_400_000),
      completedAt: null,
      totalDurationMs: null,
      totalCost: ('0.55'),
      commitHash: null,
      pausedAfter: 'codey-plan',
      stages: makeStages(['alex', 'cass', 'nigel-spec', 'nigel-tests', 'codey-plan']),
    },
    // 1 refinement run linked to the run-detail-view success run
    {
      userId: user.id,
      apiKeyId: apiKey.id,
      slug: 'run-detail-view',
      type: 'refinement',
      status: 'success',
      startedAt: new Date(Date.now() - 12 * 3_600_000),
      completedAt: new Date(Date.now() - 12 * 3_600_000 + 600_000),
      totalDurationMs: 600_000,
      totalCost: ('0.42'),
      commitHash: 'ref1abc2def3',
      stages: makeStages(STAGE_KEYS),
    },
  ]

  for (const data of runs) {
    await prisma.run.create({ data })
  }

  // Link the refinement run to the first run-detail-view success run
  const [parentRun, refinementRun] = await Promise.all([
    prisma.run.findFirst({ where: { slug: 'run-detail-view', type: 'feature', userId: user.id } }),
    prisma.run.findFirst({ where: { slug: 'run-detail-view', type: 'refinement', userId: user.id } }),
  ])
  if (parentRun && refinementRun) {
    await prisma.run.update({
      where: { id: refinementRun.id },
      data: { parentRunId: parentRun.id },
    })
  }

  console.log(`Seeded: 1 user, 1 API key, ${runs.length} runs`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
