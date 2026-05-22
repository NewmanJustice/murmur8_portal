/**
 * Pure helper functions for the insights panel.
 * Plain ESM — no TypeScript — for use with node --test runner.
 * Source of truth: lib/insights.ts
 */

// ---------------------------------------------------------------------------
// Stage order constant (shared with run-detail)
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
// computeInsights
// ---------------------------------------------------------------------------

/**
 * Compute aggregate statistics across all of a user's runs.
 *
 * @param {Array<{
 *   status: string,
 *   totalDurationMs: number | null,
 *   totalCost: number | null,
 *   failedStage: string | null,
 *   stages: unknown
 * }>} runs
 * @returns {{
 *   totalRuns: number,
 *   successRate: number | null,
 *   avgDurationMs: number | null,
 *   totalCost: number
 * }}
 */
export function computeInsights(runs) {
  const totalRuns = runs.length;

  if (totalRuns === 0) {
    return {
      totalRuns: 0, successRate: null, avgDurationMs: null, totalCost: 0,
      avgCostPerRun: 0, refinementRate: 0, featureRuns: 0, refinementRuns: 0, stageSuccessRates: {},
      last7Days: 0, last30Days: 0, avgFeedbackRating: null,
    };
  }

  // Success rate
  const successCount = runs.filter(r => r.status === 'success').length;
  const successRate = parseFloat(((successCount / totalRuns) * 100).toFixed(1));

  // Average duration (exclude null values)
  const durations = runs
    .map(r => r.totalDurationMs)
    .filter(d => d !== null && d !== undefined);
  const avgDurationMs = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : null;

  // Total cost (null treated as 0)
  const totalCost = runs.reduce((sum, r) => {
    const cost = r.totalCost !== null && r.totalCost !== undefined ? Number(r.totalCost) : 0;
    return sum + cost;
  }, 0);

  // Avg cost per run
  const avgCostPerRun = totalRuns > 0 ? totalCost / totalRuns : 0;

  // Runs by type
  const featureRuns = runs.filter(r => r.type === 'feature').length;
  const refinementRuns = runs.filter(r => r.type === 'refinement').length;

  // Refinement rate: % of distinct slugs that have at least one refinement run
  const allSlugs = new Set(runs.map(r => r.slug).filter(s => s !== null && s !== undefined));
  const slugsWithRefinement = new Set(
    runs.filter(r => r.type === 'refinement' && r.slug !== null && r.slug !== undefined).map(r => r.slug)
  );
  const refinementRate = allSlugs.size > 0
    ? parseFloat(((slugsWithRefinement.size / allSlugs.size) * 100).toFixed(1))
    : 0;

  // Success rate by stage (keyed by stage key present in JSONB stages field)
  const stageGroups = new Map();
  for (const run of runs) {
    const stagesObj = run.stages;
    if (stagesObj === null || stagesObj === undefined) continue;
    if (typeof stagesObj !== 'object' || Array.isArray(stagesObj)) continue;
    for (const stageKey of Object.keys(stagesObj)) {
      const group = stageGroups.get(stageKey) ?? { total: 0, success: 0 };
      group.total += 1;
      if (run.status === 'success') group.success += 1;
      stageGroups.set(stageKey, group);
    }
  }
  const stageSuccessRates = {};
  for (const [stageKey, { total, success }] of stageGroups.entries()) {
    stageSuccessRates[stageKey] = parseFloat(((success / total) * 100).toFixed(1));
  }

  // Run velocity (count runs with startedAt within last 7 / 30 days)
  const now = Date.now();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  let last7Days = 0;
  let last30Days = 0;
  for (const run of runs) {
    if (run.startedAt === null || run.startedAt === undefined) continue;
    const ts = new Date(run.startedAt).getTime();
    if (now - ts <= ms7) last7Days += 1;
    if (now - ts <= ms30) last30Days += 1;
  }

  // Avg feedback rating (traverse stages JSONB for feedback.rating in [1,5])
  const ratings = [];
  for (const run of runs) {
    const stagesObj = run.stages;
    if (stagesObj === null || stagesObj === undefined) continue;
    if (typeof stagesObj !== 'object' || Array.isArray(stagesObj)) continue;
    for (const stageVal of Object.values(stagesObj)) {
      if (stageVal === null || typeof stageVal !== 'object') continue;
      const feedback = stageVal.feedback;
      if (feedback === null || typeof feedback !== 'object') continue;
      const ratingRaw = feedback.rating;
      if (typeof ratingRaw !== 'number') continue;
      if (ratingRaw >= 1 && ratingRaw <= 5) ratings.push(ratingRaw);
    }
  }
  const avgFeedbackRating = ratings.length > 0
    ? parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1))
    : null;

  return { totalRuns, successRate, avgDurationMs, totalCost, avgCostPerRun, refinementRate, featureRuns, refinementRuns, stageSuccessRates, last7Days, last30Days, avgFeedbackRating };
}

// ---------------------------------------------------------------------------
// computeStageAverages
// ---------------------------------------------------------------------------

/**
 * Compute per-stage average durations from the stages JSONB field.
 * Returns an array with one entry per known STAGE_ORDER key, always.
 * Stages absent from all runs get avgDurationMs: null.
 * Runs with missing/malformed stages JSONB are silently skipped.
 *
 * @param {Array<{ stages: unknown }>} runs
 * @returns {Array<{ key: string, avgDurationMs: number | null }>}
 */
export function computeStageAverages(runs) {
  return STAGE_ORDER.map(stageKey => {
    const durations = [];

    for (const run of runs) {
      const stages = run.stages;
      if (stages === null || stages === undefined) continue;
      if (typeof stages !== 'object' || Array.isArray(stages)) continue;

      const stageData = stages[stageKey];
      if (stageData === null || stageData === undefined) continue;
      if (typeof stageData !== 'object') continue;

      const durationMs = stageData.durationMs;
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
 * Return the failedStage value that appears most often across failed runs.
 * Null failedStage values are excluded.
 * If no failed runs with a non-null failedStage exist, returns null.
 * Tie-breaks are resolved alphabetically (first alphabetically wins).
 *
 * @param {Array<{ status: string, failedStage: string | null }>} runs
 * @returns {string | null}
 */
export function getMostCommonFailureStage(runs) {
  // Count non-null failedStage values across all runs (not just failed — spec says any run with failedStage)
  const counts = new Map();

  for (const run of runs) {
    if (run.failedStage === null || run.failedStage === undefined) continue;
    const current = counts.get(run.failedStage) ?? 0;
    counts.set(run.failedStage, current + 1);
  }

  if (counts.size === 0) return null;

  // Find max count
  let maxCount = 0;
  for (const count of counts.values()) {
    if (count > maxCount) maxCount = count;
  }

  // Collect all stages with max count, then sort alphabetically for tie-break
  const topStages = [];
  for (const [stage, count] of counts.entries()) {
    if (count === maxCount) topStages.push(stage);
  }

  topStages.sort();
  return topStages[0];
}
