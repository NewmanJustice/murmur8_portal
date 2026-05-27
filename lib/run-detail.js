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

export function formatNullable(value) {
  if (value === null || value === undefined) return '—';
  return String(value);
}

// ---------------------------------------------------------------------------
// BACK_LINK — back navigation constant (story-run-header AC3)
// ---------------------------------------------------------------------------

export const BACK_LINK = {
  label: '← Run History',
  href: '/dashboard/runs',
};

// ---------------------------------------------------------------------------
// SITE_NAV_LINKS — site nav link definitions (story-site-nav)
// ---------------------------------------------------------------------------

export const SITE_NAV_LINKS = [
  { label: 'Run History', href: '/dashboard/runs' },
  { label: 'API Keys', href: '/keys' },
];

// ---------------------------------------------------------------------------
// computeTotalTokens — sum inputTokens + outputTokens across stage JSONB
// ---------------------------------------------------------------------------

export function computeTotalTokens(raw) {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw !== 'object' || Array.isArray(raw)) return 0;
  let total = 0;
  for (const stageData of Object.values(raw)) {
    if (stageData !== null && typeof stageData === 'object' && !Array.isArray(stageData)) {
      if (stageData.tokens !== null && typeof stageData.tokens === 'object' && !Array.isArray(stageData.tokens)) {
        total += typeof stageData.tokens.input === 'number' ? stageData.tokens.input : 0;
        total += typeof stageData.tokens.output === 'number' ? stageData.tokens.output : 0;
      } else {
        total += typeof stageData.inputTokens === 'number' ? stageData.inputTokens : 0;
        total += typeof stageData.outputTokens === 'number' ? stageData.outputTokens : 0;
      }
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// computeStageCount — number of stage keys in JSONB
// ---------------------------------------------------------------------------

export function computeStageCount(raw) {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw !== 'object' || Array.isArray(raw)) return 0;
  return Object.keys(raw).length;
}

// ---------------------------------------------------------------------------
// showRefinementLink
// ---------------------------------------------------------------------------

export function showRefinementLink(type, parentRunId) {
  return type === 'refinement' && parentRunId !== null && parentRunId !== undefined;
}
