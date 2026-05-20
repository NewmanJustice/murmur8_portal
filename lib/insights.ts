/**
 * Pure helper functions for the insights panel.
 * TypeScript source — lib/insights.js mirrors this file for the node --test runner.
 */

// ---------------------------------------------------------------------------
// Stage order constant (shared with run-detail)
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
// Types
// ---------------------------------------------------------------------------

export interface InsightsRun {
  status: string;
  totalDurationMs: number | null;
  totalCost: unknown; // Prisma returns Decimal; cast via Number()
  failedStage: string | null;
  stages: unknown;
}

export interface AggregateInsights {
  totalRuns: number;
  successRate: number | null;
  avgDurationMs: number | null;
  totalCost: number;
}

export interface StageAverage {
  key: string;
  avgDurationMs: number | null;
}

// ---------------------------------------------------------------------------
// computeInsights
// ---------------------------------------------------------------------------

/**
 * Compute aggregate statistics across all of a user's runs.
 * - successRate: null when totalRuns === 0
 * - avgDurationMs: null when no runs have non-null totalDurationMs
 * - totalCost: 0 when no runs or all totalCost are null
 */
export function computeInsights(runs: InsightsRun[]): AggregateInsights {
  const totalRuns = runs.length;

  if (totalRuns === 0) {
    return { totalRuns: 0, successRate: null, avgDurationMs: null, totalCost: 0 };
  }

  // Success rate
  const successCount = runs.filter(r => r.status === 'success').length;
  const successRate = parseFloat(((successCount / totalRuns) * 100).toFixed(1));

  // Average duration (exclude null values)
  const durations = runs
    .map(r => r.totalDurationMs)
    .filter((d): d is number => d !== null && d !== undefined);
  const avgDurationMs = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : null;

  // Total cost (null treated as 0)
  const totalCost = runs.reduce((sum, r) => {
    const cost = r.totalCost !== null && r.totalCost !== undefined ? Number(r.totalCost) : 0;
    return sum + cost;
  }, 0);

  return { totalRuns, successRate, avgDurationMs, totalCost };
}

// ---------------------------------------------------------------------------
// computeStageAverages
// ---------------------------------------------------------------------------

/**
 * Compute per-stage average durations from the stages JSONB field.
 * Returns an array with one entry per known STAGE_ORDER key, always.
 * Stages absent from all runs get avgDurationMs: null.
 * Runs with missing/malformed stages JSONB are silently skipped.
 */
export function computeStageAverages(runs: InsightsRun[]): StageAverage[] {
  return STAGE_ORDER.map(stageKey => {
    const durations: number[] = [];

    for (const run of runs) {
      const stages = run.stages;
      if (stages === null || stages === undefined) continue;
      if (typeof stages !== 'object' || Array.isArray(stages)) continue;

      const record = stages as Record<string, unknown>;
      const stageData = record[stageKey];
      if (stageData === null || stageData === undefined) continue;
      if (typeof stageData !== 'object') continue;

      const stageRecord = stageData as Record<string, unknown>;
      const durationMs = stageRecord.durationMs;
      if (durationMs !== null && durationMs !== undefined && typeof durationMs === 'number') {
        durations.push(durationMs);
      }
    }

    const avgDurationMs = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : null;

    return { key: stageKey, avgDurationMs };
  });
}

// ---------------------------------------------------------------------------
// getMostCommonFailureStage
// ---------------------------------------------------------------------------

/**
 * Return the failedStage value that appears most often across runs.
 * Null failedStage values are excluded.
 * If no runs with a non-null failedStage exist, returns null.
 * Tie-breaks resolved alphabetically (first alphabetically wins).
 */
export function getMostCommonFailureStage(runs: InsightsRun[]): string | null {
  const counts = new Map<string, number>();

  for (const run of runs) {
    if (run.failedStage === null || run.failedStage === undefined) continue;
    const current = counts.get(run.failedStage) ?? 0;
    counts.set(run.failedStage, current + 1);
  }

  if (counts.size === 0) return null;

  let maxCount = 0;
  for (const count of counts.values()) {
    if (count > maxCount) maxCount = count;
  }

  const topStages: string[] = [];
  for (const [stage, count] of counts.entries()) {
    if (count === maxCount) topStages.push(stage);
  }

  topStages.sort();
  return topStages[0];
}
