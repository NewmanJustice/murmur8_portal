/**
 * Pure helper functions for the run history dashboard.
 * These are framework-agnostic and fully testable without DB or Next.js.
 */

const PAGE_SIZE = 20;
const VALID_STATUSES = new Set(['success', 'failed', 'paused']);

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Parse and validate pagination params from URL search params.
 * Page is clamped to ≥ 1. Limit is always PAGE_SIZE (20).
 */
export function getPaginationParams(
  searchParams: Record<string, string | undefined>
): PaginationParams {
  const rawPage = parseInt(searchParams.page ?? '', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface FilterParams {
  status?: string;
  slug?: string;
  repo?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Parse and validate filter params from URL search params.
 * Invalid status values are silently ignored.
 * Whitespace-only slug is treated as absent.
 */
export function getFilterParams(
  searchParams: Record<string, string | undefined>
): FilterParams {
  const result: FilterParams = {};

  const status = searchParams.status;
  if (status && VALID_STATUSES.has(status)) {
    result.status = status;
  }

  const slug = searchParams.slug?.trim();
  if (slug && slug.length > 0) {
    result.slug = slug;
  }

  const repo = searchParams.repo?.trim();
  if (repo && repo.length > 0) {
    result.repo = repo;
  }

  const user = searchParams.user?.trim();
  if (user && user.length > 0) {
    result.user = user;
  }

  const dateFrom = searchParams.dateFrom;
  if (dateFrom) {
    result.dateFrom = dateFrom;
  }

  const dateTo = searchParams.dateTo;
  if (dateTo) {
    result.dateTo = dateTo;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Duration formatting
// ---------------------------------------------------------------------------

/**
 * Convert milliseconds to a human-readable duration string.
 * - < 60s:    "Xs"
 * - < 1 hour: "Xm Ys"
 * - ≥ 1 hour: "Xh Ym" (seconds dropped)
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// ---------------------------------------------------------------------------
// Cost formatting
// ---------------------------------------------------------------------------

/**
 * Format a cost number as "$X.XXX" (3 decimal places, dollar sign prefix).
 */
export function formatCost(n: number): string {
  return `$${n.toFixed(3)}`;
}

// ---------------------------------------------------------------------------
// Badge classes
// ---------------------------------------------------------------------------

/**
 * Return Tailwind CSS class string for a status badge.
 * success → green, failed → red, paused → yellow/amber
 */
export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'success':
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-green-600 bg-green-50';
    case 'failed':
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-red-600 bg-red-50';
    case 'paused':
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-yellow-600 bg-yellow-50';
    default:
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-starling-slate bg-starling-cloud';
  }
}

/**
 * Return Tailwind CSS class string for a type badge.
 * feature → sky-blue (Alex), refinement → violet (Cass)
 */
export function typeBadgeClass(type: string): string {
  switch (type) {
    case 'feature':
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-sky-600 bg-sky-50';
    case 'refinement':
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-violet-600 bg-violet-50';
    default:
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-starling-slate bg-starling-cloud';
  }
}
