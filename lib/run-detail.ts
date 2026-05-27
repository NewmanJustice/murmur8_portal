/**
 * Pure helper functions for the run detail page.
 * TypeScript source — lib/run-detail.js mirrors this file for the node --test runner.
 */

// Re-export shared helpers from dashboard
export { formatDuration, formatCost, statusBadgeClass } from './dashboard';

// ---------------------------------------------------------------------------
// Pipeline stage order
// ---------------------------------------------------------------------------

export const STAGE_ORDER: string[] = [
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
 */
export function stageAccentClass(stageKey: string): string {
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

export interface StageEntry {
  key: string;
  data: unknown;
}

/**
 * Filter and order a raw JSONB stages object to the known pipeline stage keys.
 * Returns an ordered array of { key, data } objects for known stages present
 * in the input. Unknown keys and non-object input are silently ignored.
 */
export function parseStages(raw: unknown): StageEntry[] {
  if (raw === null || raw === undefined) return [];
  if (typeof raw !== 'object' || Array.isArray(raw)) return [];

  const record = raw as Record<string, unknown>;
  return STAGE_ORDER
    .filter((key) => Object.prototype.hasOwnProperty.call(record, key))
    .map((key) => ({ key, data: record[key] }));
}

// ---------------------------------------------------------------------------
// formatNullable
// ---------------------------------------------------------------------------

/**
 * Return the value as a string, or "—" (em dash) for null/undefined.
 * Numbers are converted via String().
 */
export function formatNullable(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

// ---------------------------------------------------------------------------
// BACK_LINK — back navigation constant (story-run-header AC3)
// ---------------------------------------------------------------------------

export const BACK_LINK: { label: string; href: string } = {
  label: '← Run History',
  href: '/dashboard/runs',
};

// ---------------------------------------------------------------------------
// SITE_NAV_LINKS — site nav link definitions (story-site-nav)
// ---------------------------------------------------------------------------

export const SITE_NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Run History', href: '/dashboard/runs' },
  { label: 'API Keys', href: '/keys' },
];

// ---------------------------------------------------------------------------
// computeTotalTokens — sum inputTokens + outputTokens across stage JSONB
// (story-telemetry-tiles AC2, AC4)
// ---------------------------------------------------------------------------

/**
 * Sum inputTokens + outputTokens across all stages in a raw JSONB stages value.
 * Null/absent token fields count as 0. Non-object input returns 0.
 */
export function computeTotalTokens(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw !== 'object' || Array.isArray(raw)) return 0;
  const stages = raw as Record<string, unknown>;
  let total = 0;
  for (const stageData of Object.values(stages)) {
    if (stageData !== null && typeof stageData === 'object' && !Array.isArray(stageData)) {
      const s = stageData as Record<string, unknown>;
      // Support both flat inputTokens/outputTokens and nested tokens.input/tokens.output
      if (s.tokens !== null && typeof s.tokens === 'object' && !Array.isArray(s.tokens)) {
        const t = s.tokens as Record<string, unknown>;
        total += typeof t.input === 'number' ? t.input : 0;
        total += typeof t.output === 'number' ? t.output : 0;
      } else {
        total += typeof s.inputTokens === 'number' ? s.inputTokens : 0;
        total += typeof s.outputTokens === 'number' ? s.outputTokens : 0;
      }
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// computeStageCount — number of stage keys in JSONB (story-telemetry-tiles AC5)
// ---------------------------------------------------------------------------

/**
 * Return the number of keys present in a raw JSONB stages object.
 * Non-object input returns 0.
 */
export function computeStageCount(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw !== 'object' || Array.isArray(raw)) return 0;
  return Object.keys(raw as Record<string, unknown>).length;
}

// ---------------------------------------------------------------------------
// showRefinementLink
// ---------------------------------------------------------------------------

/**
 * Return true only when both conditions are met:
 *   - type === "refinement"
 *   - parentRunId is non-null
 */
export function showRefinementLink(
  type: string,
  parentRunId: string | null | undefined
): boolean {
  return type === 'refinement' && parentRunId !== null && parentRunId !== undefined;
}
