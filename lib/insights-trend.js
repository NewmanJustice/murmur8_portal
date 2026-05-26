export const METRIC_KEYS = [
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

export function isValidMetricKey(key) {
  return METRIC_KEYS.includes(key);
}

const METRIC_TITLES = {
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

export function getMetricTitle(key) {
  return METRIC_TITLES[key] ?? key;
}

function resolveWindow(w) {
  if (w === 'week' || w === 'month' || w === 'year') return w;
  return 'month';
}

export function getBucketBoundaries(window, referenceDate) {
  const w = resolveWindow(window);
  const ref = new Date(referenceDate);
  const buckets = [];
  let start;
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

function bucketKeyForRun(startedAt, window, buckets) {
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

function partitionByYear(runs, boundaries, referenceDate, window) {
  const w = resolveWindow(window);
  const current = new Map();
  for (const b of boundaries.buckets) current.set(b, []);

  const priorBoundaries = getBucketBoundaries(w, new Date(
    Date.UTC(referenceDate.getUTCFullYear() - 1, referenceDate.getUTCMonth(), referenceDate.getUTCDate())
  ));
  const prior = new Map();
  for (const b of priorBoundaries.buckets) prior.set(b, []);

  for (const run of runs) {
    if (!run.startedAt) continue;
    const d = new Date(run.startedAt);
    const currentKey = bucketKeyForRun(d, w, boundaries.buckets);
    if (currentKey) {
      current.get(currentKey).push(run);
      continue;
    }
    const priorKey = bucketKeyForRun(d, w, priorBoundaries.buckets);
    if (priorKey) {
      prior.get(priorKey).push(run);
    }
  }

  return { current, prior, priorBuckets: priorBoundaries.buckets };
}

function aggregateNumeric(runsInBucket, metricKey) {
  if (runsInBucket.length === 0) return null;
  switch (metricKey) {
    case 'total-runs':
      return runsInBucket.length;
    case 'success-rate': {
      const s = runsInBucket.filter(r => r.status === 'success').length;
      return parseFloat(((s / runsInBucket.length) * 100).toFixed(1));
    }
    case 'avg-duration': {
      const ds = runsInBucket.map(r => r.totalDurationMs).filter(d => d !== null);
      return ds.length > 0 ? ds.reduce((a, b) => a + b, 0) / ds.length : null;
    }
    case 'total-cost':
      return runsInBucket.reduce((s, r) => s + (r.totalCost != null ? Number(r.totalCost) : 0), 0);
    case 'avg-cost-per-run': {
      const total = runsInBucket.reduce((s, r) => s + (r.totalCost != null ? Number(r.totalCost) : 0), 0);
      return total / runsInBucket.length;
    }
    case 'refinement-rate': {
      const slugs = new Set(runsInBucket.map(r => r.slug).filter(Boolean));
      const refSlugs = new Set(runsInBucket.filter(r => r.type === 'refinement').map(r => r.slug).filter(Boolean));
      return slugs.size > 0 ? parseFloat(((refSlugs.size / slugs.size) * 100).toFixed(1)) : null;
    }
    case 'avg-feedback-rating': {
      const ratings = [];
      for (const run of runsInBucket) {
        if (!run.stages || typeof run.stages !== 'object' || Array.isArray(run.stages)) continue;
        for (const stageVal of Object.values(run.stages)) {
          if (!stageVal || typeof stageVal !== 'object') continue;
          const fb = stageVal.feedback;
          if (!fb || typeof fb !== 'object') continue;
          const r = fb.rating;
          if (typeof r === 'number' && r >= 1 && r <= 5) ratings.push(r);
        }
      }
      return ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : null;
    }
    default:
      return null;
  }
}

export function computeTrendData(runs, metricKey, window, referenceDate) {
  const w = resolveWindow(window);
  const boundaries = getBucketBoundaries(w, referenceDate);
  const { current, prior, priorBuckets } = partitionByYear(runs, boundaries, referenceDate, w);

  const currentPeriod = boundaries.buckets.map(b => ({
    bucket: b,
    value: aggregateNumeric(current.get(b) ?? [], metricKey),
  }));

  const hasPriorData = Array.from(prior.values()).some(arr => arr.length > 0);
  const priorYear = hasPriorData
    ? priorBuckets.map(b => ({
        bucket: b,
        value: aggregateNumeric(prior.get(b) ?? [], metricKey),
      }))
    : [];

  return { currentPeriod, priorYear };
}

export function computeCompoundTrendData(runs, metricKey, window, referenceDate) {
  const w = resolveWindow(window);
  const boundaries = getBucketBoundaries(w, referenceDate);
  const { current, prior, priorBuckets } = partitionByYear(runs, boundaries, referenceDate, w);

  function aggregateCompound(bucketRuns) {
    if (metricKey === 'runs-by-type') {
      const feature = bucketRuns.filter(r => r.type === 'feature').length;
      const refinement = bucketRuns.filter(r => r.type === 'refinement').length;
      const result = {};
      if (feature > 0) result.feature = feature;
      if (refinement > 0) result.refinement = refinement;
      return result;
    }
    if (metricKey === 'stage-success-rates') {
      const stageGroups = new Map();
      for (const run of bucketRuns) {
        if (!run.stages || typeof run.stages !== 'object' || Array.isArray(run.stages)) continue;
        for (const key of Object.keys(run.stages)) {
          const g = stageGroups.get(key) ?? { total: 0, success: 0 };
          g.total += 1;
          if (run.status === 'success') g.success += 1;
          stageGroups.set(key, g);
        }
      }
      const result = {};
      for (const [k, { total, success }] of stageGroups) {
        result[k] = parseFloat(((success / total) * 100).toFixed(1));
      }
      return result;
    }
    return {};
  }

  const currentPeriod = boundaries.buckets.map(b => ({
    bucket: b,
    series: aggregateCompound(current.get(b) ?? []),
  }));

  const hasPriorData = Array.from(prior.values()).some(arr => arr.length > 0);
  const priorYear = hasPriorData
    ? priorBuckets.map(b => ({ bucket: b, series: aggregateCompound(prior.get(b) ?? []) }))
    : [];

  return { currentPeriod, priorYear };
}

export function computeCategoricalTrendData(runs, metricKey, window, referenceDate) {
  const w = resolveWindow(window);
  const boundaries = getBucketBoundaries(w, referenceDate);
  const { current, prior, priorBuckets } = partitionByYear(runs, boundaries, referenceDate, w);

  function aggregateCategorical(bucketRuns) {
    if (metricKey === 'most-common-failure-stage') {
      const counts = {};
      for (const r of bucketRuns) {
        if (r.failedStage) counts[r.failedStage] = (counts[r.failedStage] ?? 0) + 1;
      }
      return counts;
    }
    if (metricKey === 'most-active-repo') {
      const counts = {};
      for (const r of bucketRuns) {
        if (r.repoName) counts[r.repoName] = (counts[r.repoName] ?? 0) + 1;
      }
      return counts;
    }
    return {};
  }

  const currentPeriod = boundaries.buckets.map(b => ({
    bucket: b,
    categories: aggregateCategorical(current.get(b) ?? []),
  }));

  const hasPriorData = Array.from(prior.values()).some(arr => arr.length > 0);
  const priorYear = hasPriorData
    ? priorBuckets.map(b => ({ bucket: b, categories: aggregateCategorical(prior.get(b) ?? []) }))
    : [];

  return { currentPeriod, priorYear };
}
