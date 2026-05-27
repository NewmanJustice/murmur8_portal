import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const STAGE_KEYS = ['alex', 'cass', 'nigel-spec', 'nigel-tests', 'codey-plan', 'codey-implement']

const REPOS = ['murmur8-portal', 'murmur8-cli', 'agent-workflow', 'murmur8-docs']
const SLUGS = [
  'project-scaffold',
  'github-auth',
  'api-key-management',
  'telemetry-ingestion',
  'run-history-dashboard',
  'run-detail-view',
  'insights-panel',
  'admin-key-panel',
  'clickable-insight-tiles',
  'site-styling',
  'copy-key',
  'add-repo-fields',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

function makeStages(includedKeys: string[], failAt?: string) {
  const stages: Record<string, unknown> = {}
  for (const key of includedKeys) {
    const failed = key === failAt
    stages[key] = {
      startedAt: new Date(Date.now() - 600_000).toISOString(),
      completedAt: failed ? null : new Date().toISOString(),
      durationMs: failed ? null : randBetween(5_000, 65_000),
      status: failed ? 'failed' : 'success',
      tokens: failed ? null : { input: randBetween(1_000, 15_000), output: randBetween(500, 8_000) },
      cost: failed ? null : +(Math.random() * 0.5).toFixed(4),
      feedback: failed ? null : { rating: randBetween(3, 6), issues: [] },
    }
    if (key === 'codey-implement' && !failed) {
      (stages[key] as Record<string, unknown>).stepsCompleted = randBetween(2, 7)
    }
    if (failed) break
  }
  return stages
}

function generateRun(baseDate: Date, userId: string, apiKeyId: string) {
  const isFailed = Math.random() < 0.15
  const isPaused = !isFailed && Math.random() < 0.08
  const isRefinement = Math.random() < 0.25
  const status = isFailed ? 'failed' : isPaused ? 'paused' : 'success'

  const failedStage = isFailed ? pick(['nigel-tests', 'codey-implement', 'alex', 'cass']) : undefined
  const pausedAfter = isPaused ? pick(['alex', 'codey-plan', 'nigel-tests']) : undefined

  const stageCount = isFailed
    ? STAGE_KEYS.indexOf(failedStage!) + 1
    : isPaused
      ? STAGE_KEYS.indexOf(pausedAfter!) + 1
      : STAGE_KEYS.length

  const stagesToUse = STAGE_KEYS.slice(0, stageCount)
  const durationMs = status === 'paused' ? null : randBetween(300_000, 1_200_000)
  const cost = +(Math.random() * 1.5 + 0.2).toFixed(4)

  return {
    userId,
    apiKeyId,
    slug: pick(SLUGS),
    type: isRefinement ? 'refinement' : 'feature',
    status,
    startedAt: baseDate,
    completedAt: status === 'paused' ? null : new Date(baseDate.getTime() + (durationMs ?? 600_000)),
    totalDurationMs: durationMs,
    totalCost: String(cost),
    commitHash: status === 'success' ? Math.random().toString(36).slice(2, 14) : null,
    failedStage: failedStage ?? null,
    pausedAfter: pausedAfter ?? null,
    stages: makeStages(stagesToUse, failedStage),
    repoName: pick(REPOS),
    gitHubUser: 'NewmanJustice',
  }
}

async function main() {
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

  await prisma.run.deleteMany({ where: { apiKeyId: apiKey.id } })

  const now = Date.now()
  const DAY = 86_400_000
  const runs: ReturnType<typeof generateRun>[] = []

  // --- Current week: 2-3 runs per day for last 7 days ---
  for (let d = 0; d < 7; d++) {
    const runsPerDay = randBetween(2, 4)
    for (let r = 0; r < runsPerDay; r++) {
      const date = new Date(now - d * DAY - randBetween(0, DAY))
      runs.push(generateRun(date, user.id, apiKey.id))
    }
  }

  // --- Past month (days 8-30): 1-2 runs per day ---
  for (let d = 8; d <= 30; d++) {
    const runsPerDay = randBetween(1, 3)
    for (let r = 0; r < runsPerDay; r++) {
      const date = new Date(now - d * DAY - randBetween(0, DAY))
      runs.push(generateRun(date, user.id, apiKey.id))
    }
  }

  // --- Past 2-12 months: 5-10 runs per month ---
  for (let m = 2; m <= 12; m++) {
    const runsThisMonth = randBetween(5, 11)
    for (let r = 0; r < runsThisMonth; r++) {
      const daysAgo = m * 30 + randBetween(0, 28)
      const date = new Date(now - daysAgo * DAY - randBetween(0, DAY))
      runs.push(generateRun(date, user.id, apiKey.id))
    }
  }

  // --- Previous year (13-24 months ago): 3-8 runs per month ---
  for (let m = 13; m <= 24; m++) {
    const runsThisMonth = randBetween(3, 9)
    for (let r = 0; r < runsThisMonth; r++) {
      const daysAgo = m * 30 + randBetween(0, 28)
      const date = new Date(now - daysAgo * DAY - randBetween(0, DAY))
      runs.push(generateRun(date, user.id, apiKey.id))
    }
  }

  for (const data of runs) {
    await prisma.run.create({ data: { ...data, stages: data.stages as Prisma.InputJsonValue } })
  }

  // Link some refinement runs to parent feature runs
  const featureRuns = await prisma.run.findMany({
    where: { userId: user.id, type: 'feature', status: 'success' },
    take: 5,
    orderBy: { startedAt: 'desc' },
  })
  const refinementRuns = await prisma.run.findMany({
    where: { userId: user.id, type: 'refinement', parentRunId: null },
    take: 5,
    orderBy: { startedAt: 'desc' },
  })
  for (let i = 0; i < Math.min(featureRuns.length, refinementRuns.length); i++) {
    await prisma.run.update({
      where: { id: refinementRuns[i].id },
      data: { parentRunId: featureRuns[i].id },
    })
  }

  console.log(`Seeded: 1 user, 1 API key, ${runs.length} runs (spanning ~2 years)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
