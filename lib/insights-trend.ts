export const METRIC_KEYS: string[] = [
  'total-runs',
  'success-rate',
  'avg-duration',
  'total-cost',
  'avg-cost-per-run',
  'refinement-rate',
  'runs-by-type',
  'stage-success-rates',
  'avg-feedback-rating',
  'most-common-failure-stage',
  'most-active-repo',
];

export function isValidMetricKey(key: string): boolean {
  return METRIC_KEYS.includes(key);
}

const METRIC_TITLES: Record<string, string> = {
  'total-runs': 'Total Runs',
  'success-rate': 'Success Rate',
  'avg-duration': 'Avg Duration',
  'total-cost': 'Total Cost',
  'avg-cost-per-run': 'Avg Cost / Run',
  'refinement-rate': 'Refinement Rate',
  'runs-by-type': 'Runs by Type',
  'stage-success-rates': 'Stage Success Rates',
  'avg-feedback-rating': 'Avg Feedback Rating',
  'most-common-failure-stage': 'Most Common Failure Stage',
  'most-active-repo': 'Most Active Repo',
};

export function getMetricTitle(key: string): string {
  return METRIC_TITLES[key] ?? key;
}

type WindowType = 'week' | 'month' | 'year';

function resolveWindow(w: string): WindowType {
  if (w === 'week' || w === 'month' || w === 'year') return w;
  return 'month';
}

export interface BucketBoundaries {
  start: Date;
  end: Date;
  buckets: string[];
}

export function getBucketBoundaries(window: string, referenceDate: Date): BucketBoundaries {
  const w = resolveWindow(window);
  const ref = new Date(referenceDate);
  const buckets: string[] = [];
  let start: Date;
  const end = new Date(ref);

  if (w === 'week') {
    start = new Date(ref);
    start.setUTCDate(start.getUTCDate() - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      buckets.push(d.toISOString().slice(0, 10));
    }
  } else if (w === 'month') {
    start = new Date(ref);
    start.setUTCDate(start.getUTCDate() - 27);
    const weekStart = new Date(start);
    while (weekStart <= end) {
      buckets.push(weekStart.toISOString().slice(0, 10));
      weekStart.setUTCDate(weekStart.getUTCDate() + 7);
    }
  } else {
    start = new Date(ref);
    start.setUTCMonth(start.getUTCMonth() - 11);
    start.setUTCDate(1);
    for (let i = 0; i < 12; i++) {
      const d = new Date(start);
      d.setUTCMonth(d.getUTCMonth() + i);
      buckets.push(d.toISOString().slice(0, 7));
    }
  }

  return { start, end, buckets };
}

export interface TrendRun {
  status: string;
  totalDurationMs: number | null;
  totalCost: unknown;
  failedStage: string | null;
  stages: unknown;
  type: string | null;
  slug: string | null;
  startedAt: Date | null;
  repoName: string | null;
}

interface TrendPoint {
  bucket: string;
  value: number | null;
}

interface CompoundTrendPoint {
  bucket: string;
  series: Record<string, number>;
}

interface CategoricalTrendPoint {
  bucket: string;
  categories: Record<string, number>;
}

export interface TrendResult {
  currentPeriod: TrendPoint[];
  priorYear: TrendPoint[];
}

export interface CompoundTrendResult {
  currentPeriod: CompoundTrendPoint[];
  priorYear: CompoundTrendPoint[];
}

export interface CategoricalTrendResult {
  currentPeriod: CategoricalTrendPoint[];
  priorYear: CategoricalTrendPoint[];
}

function bucketKeyForRun(startedAt: Date, window: WindowType, buckets: string[]): string | null {
  const iso = startedAt.toISOString();
  if (window === 'week') {
    const dayKey = iso.slice(0, 10);
    return buckets.includes(dayKey) ? dayKey : null;
  } else if (window === 'month') {
    const dayMs = startedAt.getTime();
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (dayMs >= new Date(buckets[i]).getTime()) return buckets[i];
    }
    return null;
  } else {
    const monthKey = iso.slice(0, 7);
    return buckets.includes(monthKey) ? monthKey : null;
  }
}

function partitionByYear(runs: TrendRun[], boundaries: BucketBoundaries, referenceDate: Date, window: WindowType) {
  const w = resolveWindow(window);
  const current: Map<string, TrendRun[]> = new Map();
  for (const b of boundaries.buckets) current.set(b, []);

  const priorBoundaries = getBucketBoundaries(w, new Date(
    Date.UTC(referenceDate.getUTCFullYear() - 1, referenceDate.getUTCMonth(), referenceDate.getUTCDate())
  ));
  const prior: Map<string, TrendRun[]> = new Map();
  for (const b of priorBoundaries.buckets) prior.set(b, []);

  for (const run of runs) {
    if (!run.startedAt) continue;
    const d = new Date(run.startedAt);
    const currentKey = bucketKeyForRun(d, w, boundaries.buckets);
    if (currentKey) {
      current.get(currentKey)!.push(run);
      continue;
    }
    const priorKey = bucketKeyForRun(d, w, priorBoundaries.buckets);
    if (priorKey) {
      prior.get(priorKey)!.push(run);
    }
  }

  return { current, prior, priorBuckets: priorBoundaries.buckets };
}

function aggregateNumeric(runsInBucket: TrendRun[], metricKey: string): number | null {
  if (runsInBucket.length === 0) return null;
  switch (metricKey) {
    case 'total-runs':
      return runsInBucket.length;
    case 'success-rate': {
      const s = runsInBucket.filter(r => r.status === 'success').length;
      return parseFloat(((s / runsInBucket.length) * 100).toFixed(1));
    }
    case 'avg-duration': {
      const ds = runsInBucket.map(r => r.totalDurationMs).filter((d): d is number => d !== null);
      return ds.length > 0 ? ds.reduce((a, b) => a + b, 0) / ds.length : null;
    }
    case 'total-cost':
      return runsInBucket.reduce((s, r) => s + (r.totalCost !== null && r.totalCost !== undefined ? Number(r.totalCost) : 0), 0);
    case 'avg-cost-per-run': {
      const total = runsInBucket.reduce((s, r) => s + (r.totalCost !== null && r.totalCost !== undefined ? Number(r.totalCost) : 0), 0);
      return total / runsInBucket.length;
    }
    case 'refinement-rate': {
      const slugs = new Set(runsInBucket.map(r => r.slug).filter(Boolean));
      const refSlugs = new Set(runsInBucket.filter(r => r.type === 'refinement').map(r => r.slug).filter(Boolean));
      return slugs.size > 0 ? parseFloat(((refSlugs.size / slugs.size) * 100).toFixed(1)) : null;
    }
    case 'avg-feedback-rating': {
      const ratings: number[] = [];
      for (const run of runsInBucket) {
        if (!run.stages || typeof run.stages !== 'object' || Array.isArray(run.stages)) continue;
        for (const stageVal of Object.values(run.stages as Record<string, unknown>)) {
          if (!stageVal || typeof stageVal !== 'object') continue;
          const fb = (stageVal as Record<string, unknown>).feedback;
          if (!fb || typeof fb !== 'object') continue;
          const r = (fb as Record<string, unknown>).rating;
          if (typeof r === 'number' && r >= 1 && r <= 5) ratings.push(r);
        }
      }
      return ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : null;
    }
    default:
      return null;
  }
}

export function computeTrendData(runs: TrendRun[], metricKey: string, window: string, referenceDate: Date): TrendResult {
  const w = resolveWindow(window);
  const boundaries = getBucketBoundaries(w, referenceDate);
  const { current, prior, priorBuckets } = partitionByYear(runs, boundaries, referenceDate, w);

  const currentPeriod: TrendPoint[] = boundaries.buckets.map(b => ({
    bucket: b,
    value: aggregateNumeric(current.get(b) ?? [], metricKey),
  }));

  const hasPriorData = Array.from(prior.values()).some(arr => arr.length > 0);
  const priorYear: TrendPoint[] = hasPriorData
    ? priorBuckets.map(b => ({
        bucket: b,
        value: aggregateNumeric(prior.get(b) ?? [], metricKey),
      }))
    : [];

  return { currentPeriod, priorYear };
}

export function computeCompoundTrendData(runs: TrendRun[], metricKey: string, window: string, referenceDate: Date): CompoundTrendResult {
  const w = resolveWindow(window);
  const boundaries = getBucketBoundaries(w, referenceDate);
  const { current, prior, priorBuckets } = partitionByYear(runs, boundaries, referenceDate, w);

  function aggregateCompound(bucketRuns: TrendRun[]): Record<string, number> {
    if (metricKey === 'runs-by-type') {
      const feature = bucketRuns.filter(r => r.type === 'feature').length;
      const refinement = bucketRuns.filter(r => r.type === 'refinement').length;
      const result: Record<string, number> = {};
      if (feature > 0) result.feature = feature;
      if (refinement > 0) result.refinement = refinement;
      return result;
    }
    if (metricKey === 'stage-success-rates') {
      const stageGroups = new Map<string, { total: number; success: number }>();
      for (const run of bucketRuns) {
        if (!run.stages || typeof run.stages !== 'object' || Array.isArray(run.stages)) continue;
        for (const key of Object.keys(run.stages as Record<string, unknown>)) {
          const g = stageGroups.get(key) ?? { total: 0, success: 0 };
          g.total += 1;
          if (run.status === 'success') g.success += 1;
          stageGroups.set(key, g);
        }
      }
      const result: Record<string, number> = {};
      for (const [k, { total, success }] of stageGroups) {
        result[k] = parseFloat(((success / total) * 100).toFixed(1));
      }
      return result;
    }
    return {};
  }

  const currentPeriod: CompoundTrendPoint[] = boundaries.buckets.map(b => ({
    bucket: b,
    series: aggregateCompound(current.get(b) ?? []),
  }));

  const hasPriorData = Array.from(prior.values()).some(arr => arr.length > 0);
  const priorYear: CompoundTrendPoint[] = hasPriorData
    ? priorBuckets.map(b => ({ bucket: b, series: aggregateCompound(prior.get(b) ?? []) }))
    : [];

  return { currentPeriod, priorYear };
}

export function computeCategoricalTrendData(runs: TrendRun[], metricKey: string, window: string, referenceDate: Date): CategoricalTrendResult {
  const w = resolveWindow(window);
  const boundaries = getBucketBoundaries(w, referenceDate);
  const { current, prior, priorBuckets } = partitionByYear(runs, boundaries, referenceDate, w);

  function aggregateCategorical(bucketRuns: TrendRun[]): Record<string, number> {
    if (metricKey === 'most-common-failure-stage') {
      const counts: Record<string, number> = {};
      for (const r of bucketRuns) {
        if (r.failedStage) counts[r.failedStage] = (counts[r.failedStage] ?? 0) + 1;
      }
      return counts;
    }
    if (metricKey === 'most-active-repo') {
      const counts: Record<string, number> = {};
      for (const r of bucketRuns) {
        if (r.repoName) counts[r.repoName] = (counts[r.repoName] ?? 0) + 1;
      }
      return counts;
    }
    return {};
  }

  const currentPeriod: CategoricalTrendPoint[] = boundaries.buckets.map(b => ({
    bucket: b,
    categories: aggregateCategorical(current.get(b) ?? []),
  }));

  const hasPriorData = Array.from(prior.values()).some(arr => arr.length > 0);
  const priorYear: CategoricalTrendPoint[] = hasPriorData
    ? priorBuckets.map(b => ({ bucket: b, categories: aggregateCategorical(prior.get(b) ?? []) }))
    : [];

  return { currentPeriod, priorYear };
}
