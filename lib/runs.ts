/**
 * Database access layer for run history.
 * All queries enforce the userId invariant (R1) — user sees only their own runs.
 */

import { prisma } from '@/lib/prisma';
import type { FilterParams, PaginationParams } from '@/lib/dashboard';

export interface RunRow {
  id: string;
  slug: string;
  status: string;
  type: string;
  completedAt: Date | null;
  totalDurationMs: number | null;
  totalCost: unknown; // Prisma returns Decimal; cast in UI layer
}

export interface GetUserRunsResult {
  runs: RunRow[];
  total: number;
  totalPages: number;
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
      },
    }),
    prisma.run.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pagination.limit));

  return { runs, total, totalPages };
}
