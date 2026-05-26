/**
 * Database access layer for run history.
 * All queries enforce the userId invariant (R1) — user sees only their own runs.
 */

import { prisma } from '@/lib/prisma';
import type { FilterParams, PaginationParams } from '@/lib/dashboard';
import type { InsightsRun } from '@/lib/insights';

export interface RunRow {
  id: string;
  slug: string;
  status: string;
  type: string;
  completedAt: Date | null;
  totalDurationMs: number | null;
  totalCost: number | null;
  repoName: string | null;
  gitHubUser: string | null;
}

export interface GetUserRunsResult {
  runs: RunRow[];
  total: number;
  totalPages: number;
}

export interface RunDetail {
  id: string;
  userId: string;
  apiKeyId: string;
  slug: string;
  status: string;
  type: string;
  startedAt: Date;
  completedAt: Date | null;
  totalDurationMs: number | null;
  totalCost: number | null;
  commitHash: string | null;
  failedStage: string | null;
  pausedAfter: string | null;
  parentRunId: string | null;
  stages: unknown;
  receivedAt: Date;
}

/**
 * Fetch a single run by id, enforcing ownership via userId (R1).
 * Returns null if the run does not exist or belongs to a different user.
 */
export async function getRunDetail(
  id: string,
  userId: string
): Promise<RunDetail | null> {
  const run = await prisma.run.findFirst({
    where: { id, userId },
    select: {
      id: true,
      userId: true,
      apiKeyId: true,
      slug: true,
      status: true,
      type: true,
      startedAt: true,
      completedAt: true,
      totalDurationMs: true,
      totalCost: true,
      commitHash: true,
      failedStage: true,
      pausedAfter: true,
      parentRunId: true,
      stages: true,
      receivedAt: true,
    },
  });
  if (!run) return null;
  return { ...run, totalCost: run.totalCost ? run.totalCost.toNumber() : null };
}

/**
 * Fetch a page of the authenticated user's runs with optional filters.
 * userId is ALWAYS applied — never bypassed by filter values.
 */
export async function getUserRuns(
  userId: string,
  filters: FilterParams,
  pagination: PaginationParams
): Promise<GetUserRunsResult> {
  // Build where clause — userId is the immovable foundation (R1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.slug) {
    where.slug = { contains: filters.slug, mode: 'insensitive' };
  }

  if (filters.repo) {
    where.repoName = { contains: filters.repo, mode: 'insensitive' };
  }

  if (filters.user) {
    where.gitHubUser = { contains: filters.user, mode: 'insensitive' };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.completedAt = {};
    if (filters.dateFrom) {
      where.completedAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      // dateTo is inclusive: use start of next day or end of day
      const to = new Date(filters.dateTo);
      to.setDate(to.getDate() + 1);
      where.completedAt.lte = to;
    }
  }

  const [runs, total] = await Promise.all([
    prisma.run.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      skip: pagination.offset,
      take: pagination.limit,
      select: {
        id: true,
        slug: true,
        status: true,
        type: true,
        completedAt: true,
        totalDurationMs: true,
        totalCost: true,
        repoName: true,
        gitHubUser: true,
      },
    }),
    prisma.run.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pagination.limit));

  return {
    runs: runs.map((r) => ({ ...r, totalCost: r.totalCost ? r.totalCost.toNumber() : null })),
    total,
    totalPages,
  };
}

/**
 * Fetch the fields needed to compute insights for a given user.
 * userId is always enforced (R1).
 */
export async function getInsightsData(userId: string): Promise<InsightsRun[]> {
  const runs = await prisma.run.findMany({
    where: { userId },
    select: {
      status: true,
      totalDurationMs: true,
      totalCost: true,
      failedStage: true,
      stages: true,
      type: true,
      slug: true,
      startedAt: true,
      repoName: true,
    },
  });
  return runs.map((r) => ({ ...r, totalCost: r.totalCost ? r.totalCost.toNumber() : null, stage: null }));
}
