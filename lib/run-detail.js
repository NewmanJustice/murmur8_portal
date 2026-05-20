/**
 * Pure helper functions for the run detail page.
 * Plain ESM — no TypeScript — for use with node --test runner.
 * Source of truth: lib/run-detail.ts
 */

// Re-export shared helpers from dashboard
export { formatDuration, formatCost, statusBadgeClass } from './dashboard.js';

// ---------------------------------------------------------------------------
// Pipeline stage order
// ---------------------------------------------------------------------------

export const STAGE_ORDER = [
  'alex',
  'cass',
  'nigel-spec',
  'nigel-tests',
  'codey-plan',
  'codey-implement',
];

// ---------------------------------------------------------------------------
// stageAccentClass
// ---------------------------------------------------------------------------

/**
 * Return a Tailwind CSS class string for the accent colour of a known stage.
 * alex → sky #38BDF8, cass → violet #A78BFA,
 * nigel-* → amber #F59E0B, codey-* → teal #2DD4BF
 * Unknown keys fall through to a neutral grey.
 * @param {string} stageKey
 * @returns {string}
 */
export function stageAccentClass(stageKey) {
  switch (stageKey) {
    case 'alex':
      return 'border-sky-400 text-sky-400';
    case 'cass':
      return 'border-violet-400 text-violet-400';
    case 'nigel-spec':
    case 'nigel-tests':
      return 'border-amber-400 text-amber-400';
    case 'codey-plan':
    case 'codey-implement':
      return 'border-teal-400 text-teal-400';
    default:
      return 'border-starling-slate text-starling-slate';
  }
}

// ---------------------------------------------------------------------------
// parseStages
// ---------------------------------------------------------------------------

/**
 * Filter and order a raw JSONB stages object to the known pipeline stage keys.
 * Returns an ordered array of { key, data } objects for known stages present
 * in the input. Unknown keys and non-object input are silently ignored.
 * @param {unknown} raw
 * @returns {{ key: string, data: unknown }[]}
 */
export function parseStages(raw) {
  if (raw === null || raw === undefined) return [];
  if (typeof raw !== 'object' || Array.isArray(raw)) return [];

  return STAGE_ORDER
    .filter((key) => Object.prototype.hasOwnProperty.call(raw, key))
    .map((key) => ({ key, data: raw[key] }));
}

// ---------------------------------------------------------------------------
// formatNullable
// ---------------------------------------------------------------------------

/**
 * Return the value as a string, or "—" (em dash) for null/undefined.
 * Numbers are converted via String().
 * @param {string | number | null | undefined} value
 * @returns {string}
 */
export function formatNullable(value) {
  if (value === null || value === undefined) return '—';
  return String(value);
}

// ---------------------------------------------------------------------------
// showRefinementLink
// ---------------------------------------------------------------------------

/**
 * Return true only when both conditions are met:
 *   - type === "refinement"
 *   - parentRunId is non-null
 * @param {string} type
 * @param {string | null | undefined} parentRunId
 * @returns {boolean}
 */
export function showRefinementLink(type, parentRunId) {
  return type === 'refinement' && parentRunId !== null && parentRunId !== undefined;
}
