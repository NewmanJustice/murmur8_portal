/**
 * Pure helper functions for the run history dashboard.
 * Plain ESM — no TypeScript — for use with node --test runner.
 * Source of truth: lib/dashboard.ts
 */

const PAGE_SIZE = 20;
const VALID_STATUSES = new Set(['success', 'failed', 'paused']);

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Parse and validate pagination params from URL search params.
 * Page is clamped to ≥ 1. Limit is always 20.
 * @param {Record<string, string | undefined>} searchParams
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function getPaginationParams(searchParams) {
  const rawPage = parseInt(searchParams.page ?? '', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

/**
 * Parse and validate filter params from URL search params.
 * Invalid status values are silently ignored.
 * Whitespace-only slug is treated as absent.
 * @param {Record<string, string | undefined>} searchParams
 * @returns {{ status?: string, slug?: string, dateFrom?: string, dateTo?: string }}
 */
export function getFilterParams(searchParams) {
  const result = {};

  const status = searchParams.status;
  if (status && VALID_STATUSES.has(status)) {
    result.status = status;
  }

  const slug = searchParams.slug?.trim();
  if (slug && slug.length > 0) {
    result.slug = slug;
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
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
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
 * @param {number} n
 * @returns {string}
 */
export function formatCost(n) {
  return `$${n.toFixed(3)}`;
}

// ---------------------------------------------------------------------------
// Badge classes
// ---------------------------------------------------------------------------

/**
 * Return Tailwind CSS class string for a status badge.
 * success → green, failed → red, paused → yellow/amber
 * @param {string} status
 * @returns {string}
 */
export function statusBadgeClass(status) {
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
 * @param {string} type
 * @returns {string}
 */
export function typeBadgeClass(type) {
  switch (type) {
    case 'feature':
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-sky-600 bg-sky-50';
    case 'refinement':
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-violet-600 bg-violet-50';
    default:
      return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-starling-slate bg-starling-cloud';
  }
}
