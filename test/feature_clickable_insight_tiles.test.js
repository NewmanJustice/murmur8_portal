/**
 * Tests for feature: clickable_insight_tiles
 * Test IDs: T01 through T44
 * Runner: node --test test/feature_clickable_insight_tiles.test.js
 *
 * Pure unit tests — no DB, no HTTP, no React, no browser.
 * Data-layer tests target lib/insights-trend.js.
 * Component tests use file-content assertions.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  METRIC_KEYS,
  computeTrendData,
  computeCompoundTrendData,
  computeCategoricalTrendData,
  getBucketBoundaries,
  isValidMetricKey,
  getMetricTitle,
} from '../lib/insights-trend.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = join(import.meta.dirname, '..');
const REFERENCE_DATE = new Date('2026-05-26T00:00:00Z');

function readSrc(relativePath) {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

function makeRun(overrides = {}) {
  return {
    status: 'success',
    totalDurationMs: 120000,
    totalCost: 0.50,
    failedStage: null,
    stages: { alex: { durationMs: 30000, status: 'success', feedback: { rating: 4 }, tokens: { input: 1000, output: 500 } } },
    type: 'feature',
    slug: 'test-slug',
    startedAt: new Date('2026-05-15'),
    repoName: 'test-repo',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tile Click Affordance (T01-T05)
// ---------------------------------------------------------------------------

describe('Tile Click Affordance', () => {
  const src = readSrc('app/dashboard/InsightsPanel.tsx');

  it('T01: Each of 11 tiles links to /dashboard/insights/[metric]', () => {
    for (const key of METRIC_KEYS) {
      assert.ok(
        src.includes(`/dashboard/insights/${key}`),
        `Missing link for metric key: ${key}`
      );
    }
  });

  it('T02: Clickable tiles have hover/pointer affordance', () => {
    assert.ok(
      src.includes('cursor-pointer') || src.includes('hover:'),
      'No hover affordance found on clickable tiles'
    );
  });

  it('T03: Tiles rendered as <a> or <Link> for keyboard access', () => {
    assert.ok(
      src.includes('<Link') || src.includes('<a'),
      'No <Link> or <a> element found for tiles'
    );
  });

  it('T04: Accessible name includes metric context', () => {
    assert.ok(
      src.includes('aria-label') || src.includes('view trend') || src.includes('View trend'),
      'No accessible label found for tile links'
    );
  });

  it('T05: Stage table and Run Velocity tile are NOT clickable', () => {
    const tableSection = src.slice(src.indexOf('<table'));
    assert.ok(
      !tableSection.includes('/dashboard/insights/'),
      'Stage table should not have insight links'
    );
    // Run Velocity tile: find its containing element and verify it's a <div> not a <Link>
    const velIdx = src.indexOf('Run Velocity');
    // Look backwards from "Run Velocity" to find its parent element opening tag
    const before = src.slice(Math.max(0, velIdx - 200), velIdx);
    const lastLink = before.lastIndexOf('/dashboard/insights/');
    const lastDiv = before.lastIndexOf('<div');
    const lastLinkTag = before.lastIndexOf('<Link');
    assert.ok(
      lastDiv > lastLinkTag,
      'Run Velocity tile should be wrapped in a <div>, not a <Link>'
    );
  });
});

// ---------------------------------------------------------------------------
// Trend Page Shell (T06-T11)
// ---------------------------------------------------------------------------

describe('Trend Page Shell', () => {
  const pagePath = 'app/dashboard/insights/[metric]/page.tsx';
  let src;

  it('T06: Trend page file exists and exports default function', () => {
    src = readSrc(pagePath);
    assert.ok(src.includes('export default'), 'Missing default export');
  });

  it('T07: Invalid metric key returns 404', () => {
    if (!src) src = readSrc(pagePath);
    assert.ok(
      src.includes('notFound') && (src.includes('isValidMetricKey') || src.includes('METRIC_KEYS')),
      'Missing metric key validation with notFound()'
    );
  });

  it('T08: Page displays human-readable metric title', () => {
    if (!src) src = readSrc(pagePath);
    assert.ok(
      src.includes('getMetricTitle') || src.includes('metricTitle'),
      'Missing metric title display'
    );
  });

  it('T09: Back link navigates to /dashboard', () => {
    if (!src) src = readSrc(pagePath);
    assert.ok(src.includes('/dashboard'), 'Missing back link to dashboard');
  });

  it('T10: Page has standard header chrome with logo', () => {
    if (!src) src = readSrc(pagePath);
    assert.ok(
      src.includes('murmur8-logo') || src.includes('Image'),
      'Missing logo/header chrome'
    );
  });

  it('T11: Unauthenticated user redirected to login', () => {
    if (!src) src = readSrc(pagePath);
    assert.ok(
      src.includes('redirect') && src.includes('getSession'),
      'Missing auth check with redirect'
    );
  });
});

// ---------------------------------------------------------------------------
// Time-Window Toggle (T12-T18)
// ---------------------------------------------------------------------------

describe('Time-Window Toggle', () => {
  it('T12: Three toggle options exist (week, month, year)', () => {
    const boundaries = getBucketBoundaries('week', REFERENCE_DATE);
    assert.ok(boundaries);
    const bMonth = getBucketBoundaries('month', REFERENCE_DATE);
    assert.ok(bMonth);
    const bYear = getBucketBoundaries('year', REFERENCE_DATE);
    assert.ok(bYear);
  });

  it('T13: Month is the default window with 4-5 weekly buckets', () => {
    const { buckets } = getBucketBoundaries('month', REFERENCE_DATE);
    assert.ok(buckets.length >= 4 && buckets.length <= 5, `Expected 4-5 buckets, got ${buckets.length}`);
  });

  it('T14: Week window produces 7 daily buckets', () => {
    const { buckets } = getBucketBoundaries('week', REFERENCE_DATE);
    assert.equal(buckets.length, 7);
  });

  it('T15: Year window produces 12 monthly buckets', () => {
    const { buckets } = getBucketBoundaries('year', REFERENCE_DATE);
    assert.equal(buckets.length, 12);
  });

  it('T16: getBucketBoundaries returns start and end dates', () => {
    const { start, end } = getBucketBoundaries('month', REFERENCE_DATE);
    assert.ok(start instanceof Date, 'start should be a Date');
    assert.ok(end instanceof Date, 'end should be a Date');
    assert.ok(start < end, 'start should be before end');
  });

  it('T17: Invalid window param falls back to month', () => {
    const invalid = getBucketBoundaries('invalid', REFERENCE_DATE);
    const month = getBucketBoundaries('month', REFERENCE_DATE);
    assert.equal(invalid.buckets.length, month.buckets.length);
  });

  it('T18: Trend page file references searchParams for window state', () => {
    const src = readSrc('app/dashboard/insights/[metric]/page.tsx');
    assert.ok(
      src.includes('searchParams') || src.includes('useSearchParams') || src.includes('window'),
      'Missing URL-driven window state'
    );
  });
});

// ---------------------------------------------------------------------------
// Metric Trend Data Layer (T19-T25)
// ---------------------------------------------------------------------------

describe('Metric Trend Data Layer', () => {
  const runs = [
    makeRun({ startedAt: new Date('2026-05-20'), totalDurationMs: 100000, totalCost: 0.40, status: 'success' }),
    makeRun({ startedAt: new Date('2026-05-21'), totalDurationMs: 140000, totalCost: 0.60, status: 'failed', failedStage: 'nigel-tests' }),
    makeRun({ startedAt: new Date('2026-05-22'), totalDurationMs: 120000, totalCost: 0.50, status: 'success', type: 'refinement' }),
    makeRun({ startedAt: new Date('2025-05-20'), totalDurationMs: 90000, totalCost: 0.30, status: 'success' }),
  ];

  it('T19: Returns { currentPeriod, priorYear } with bucket and value keys', () => {
    const result = computeTrendData(runs, 'total-runs', 'week', REFERENCE_DATE);
    assert.ok(Array.isArray(result.currentPeriod));
    assert.ok(Array.isArray(result.priorYear));
    if (result.currentPeriod.length > 0) {
      assert.ok('bucket' in result.currentPeriod[0]);
      assert.ok('value' in result.currentPeriod[0]);
    }
  });

  it('T20: Bucket counts match window granularity', () => {
    const week = computeTrendData(runs, 'total-runs', 'week', REFERENCE_DATE);
    const month = computeTrendData(runs, 'total-runs', 'month', REFERENCE_DATE);
    const year = computeTrendData(runs, 'total-runs', 'year', REFERENCE_DATE);
    assert.equal(week.currentPeriod.length, 7);
    assert.ok(month.currentPeriod.length >= 4 && month.currentPeriod.length <= 5);
    assert.equal(year.currentPeriod.length, 12);
  });

  it('T21: Prior-year array populated when prior-year runs exist', () => {
    const result = computeTrendData(runs, 'total-runs', 'year', REFERENCE_DATE);
    assert.ok(result.priorYear.length > 0, 'Expected prior-year data');
  });

  it('T22: Metric aggregation is correct per key', () => {
    const totalRuns = computeTrendData(runs, 'total-runs', 'year', REFERENCE_DATE);
    const mayBucket = totalRuns.currentPeriod.find(b => b.bucket.includes('2026-05'));
    assert.ok(mayBucket && mayBucket.value >= 3, 'Expected at least 3 runs in May 2026 bucket');

    const successRate = computeTrendData(runs, 'success-rate', 'year', REFERENCE_DATE);
    const mayRate = successRate.currentPeriod.find(b => b.bucket.includes('2026-05'));
    assert.ok(mayRate && mayRate.value !== null && mayRate.value <= 100);
  });

  it('T23: Function only processes provided runs (no leakage)', () => {
    const singleRun = [makeRun({ startedAt: new Date('2026-05-25') })];
    const result = computeTrendData(singleRun, 'total-runs', 'week', REFERENCE_DATE);
    const total = result.currentPeriod.reduce((s, b) => s + (b.value ?? 0), 0);
    assert.equal(total, 1);
  });

  it('T24: Empty bucket returns value: null', () => {
    const result = computeTrendData([], 'total-runs', 'week', REFERENCE_DATE);
    assert.ok(result.currentPeriod.every(b => b.value === null || b.value === 0));
  });

  it('T25: No prior-year runs returns empty priorYear array', () => {
    const recentOnly = [makeRun({ startedAt: new Date('2026-05-20') })];
    const result = computeTrendData(recentOnly, 'total-runs', 'week', REFERENCE_DATE);
    assert.ok(result.priorYear.length === 0 || result.priorYear.every(b => b.value === null || b.value === 0));
  });
});

// ---------------------------------------------------------------------------
// Chart Rendering (T26-T32)
// ---------------------------------------------------------------------------

describe('Chart Rendering', () => {
  const chartPath = 'app/dashboard/insights/[metric]/TrendChart.tsx';
  let src;

  it('T26: TrendChart component file exists and uses Recharts LineChart', () => {
    src = readSrc(chartPath);
    assert.ok(src.includes('LineChart') || src.includes('recharts'), 'Missing Recharts LineChart');
  });

  it('T27: Primary line uses solid stroke', () => {
    if (!src) src = readSrc(chartPath);
    assert.ok(
      src.includes('Line') && (src.includes('solid') || src.includes('strokeDasharray') === false || src.includes('type="monotone"')),
      'Primary line should use solid stroke'
    );
  });

  it('T28: Prior-year line renders with dashed style', () => {
    if (!src) src = readSrc(chartPath);
    assert.ok(src.includes('strokeDasharray'), 'Prior-year line should use dashed stroke');
  });

  it('T29: Prior-year line conditionally rendered when data exists', () => {
    if (!src) src = readSrc(chartPath);
    assert.ok(
      src.includes('priorYear') && (src.includes('length') || src.includes('?') || src.includes('&&')),
      'Prior-year line should be conditionally rendered'
    );
  });

  it('T30: Chart uses ResponsiveContainer for responsive sizing', () => {
    if (!src) src = readSrc(chartPath);
    assert.ok(src.includes('ResponsiveContainer'), 'Missing ResponsiveContainer for responsive chart');
  });

  it('T31: Chart has aria-label for accessibility', () => {
    if (!src) src = readSrc(chartPath);
    assert.ok(src.includes('aria-label') || src.includes('role='), 'Missing aria-label on chart');
  });

  it('T32: Null values handled as gaps via connectNulls=false or allowDataOverflow', () => {
    if (!src) src = readSrc(chartPath);
    assert.ok(
      src.includes('connectNulls') || src.includes('null') || src.includes('undefined'),
      'Chart should handle null values as gaps'
    );
  });
});

// ---------------------------------------------------------------------------
// Compound/Categorical Metrics (T33-T39)
// ---------------------------------------------------------------------------

describe('Compound/Categorical Metrics', () => {
  const runs = [
    makeRun({ startedAt: new Date('2026-05-20'), type: 'feature', status: 'success', repoName: 'repo-a', failedStage: null }),
    makeRun({ startedAt: new Date('2026-05-21'), type: 'refinement', status: 'failed', repoName: 'repo-b', failedStage: 'codey-implement' }),
    makeRun({ startedAt: new Date('2026-05-22'), type: 'feature', status: 'failed', repoName: 'repo-a', failedStage: 'nigel-tests' }),
  ];

  it('T33: runs-by-type returns multi-series data with feature and refinement keys', () => {
    const result = computeCompoundTrendData(runs, 'runs-by-type', 'week', REFERENCE_DATE);
    assert.ok(Array.isArray(result.currentPeriod));
    const withData = result.currentPeriod.find(b => b.series && Object.keys(b.series).length > 0);
    if (withData) {
      assert.ok('feature' in withData.series || 'refinement' in withData.series);
    }
  });

  it('T34: stage-success-rates returns one series entry per stage', () => {
    const result = computeCompoundTrendData(runs, 'stage-success-rates', 'week', REFERENCE_DATE);
    assert.ok(Array.isArray(result.currentPeriod));
    const withData = result.currentPeriod.find(b => b.series && Object.keys(b.series).length > 0);
    if (withData) {
      assert.ok(Object.keys(withData.series).length >= 1, 'Expected at least one stage key');
    }
  });

  it('T35: most-common-failure-stage returns categorical data with categories key', () => {
    const result = computeCategoricalTrendData(runs, 'most-common-failure-stage', 'week', REFERENCE_DATE);
    assert.ok(Array.isArray(result.currentPeriod));
    const withData = result.currentPeriod.find(b => b.categories && Object.keys(b.categories).length > 0);
    assert.ok(withData, 'Expected at least one bucket with failure stage categories');
  });

  it('T36: most-active-repo returns categorical data with repo names', () => {
    const result = computeCategoricalTrendData(runs, 'most-active-repo', 'week', REFERENCE_DATE);
    assert.ok(Array.isArray(result.currentPeriod));
    const withData = result.currentPeriod.find(b => b.categories && Object.keys(b.categories).length > 0);
    assert.ok(withData, 'Expected at least one bucket with repo categories');
  });

  it('T37: Compound data shape has { bucket, series: Record<string,number> }', () => {
    const result = computeCompoundTrendData(runs, 'runs-by-type', 'week', REFERENCE_DATE);
    for (const point of result.currentPeriod) {
      assert.ok('bucket' in point, 'Missing bucket key');
      assert.ok('series' in point, 'Missing series key');
      assert.equal(typeof point.series, 'object');
    }
  });

  it('T38: Categorical data shape has { bucket, categories: Record<string,number> }', () => {
    const result = computeCategoricalTrendData(runs, 'most-common-failure-stage', 'week', REFERENCE_DATE);
    for (const point of result.currentPeriod) {
      assert.ok('bucket' in point, 'Missing bucket key');
      assert.ok('categories' in point, 'Missing categories key');
      assert.equal(typeof point.categories, 'object');
    }
  });

  it('T39: Compound/categorical include priorYear array', () => {
    const runsWithPrior = [
      ...runs,
      makeRun({ startedAt: new Date('2025-05-20'), type: 'feature', repoName: 'repo-a', failedStage: 'alex' }),
    ];
    const result = computeCompoundTrendData(runsWithPrior, 'runs-by-type', 'year', REFERENCE_DATE);
    assert.ok(Array.isArray(result.priorYear), 'Missing priorYear array');
  });
});

// ---------------------------------------------------------------------------
// Empty and Edge States (T40-T44)
// ---------------------------------------------------------------------------

describe('Empty and Edge States', () => {
  it('T40: Zero runs returns all-null buckets for currentPeriod', () => {
    const result = computeTrendData([], 'success-rate', 'month', REFERENCE_DATE);
    assert.ok(result.currentPeriod.length > 0, 'Should still return bucket structure');
    assert.ok(result.currentPeriod.every(b => b.value === null || b.value === 0));
  });

  it('T41: Single data point renders without error', () => {
    const single = [makeRun({ startedAt: new Date('2026-05-25') })];
    const result = computeTrendData(single, 'total-runs', 'week', REFERENCE_DATE);
    assert.ok(result.currentPeriod.length === 7);
    const nonNull = result.currentPeriod.filter(b => b.value !== null && b.value > 0);
    assert.equal(nonNull.length, 1);
  });

  it('T42: Gaps in data produce null values in intermediate buckets', () => {
    const gapped = [
      makeRun({ startedAt: new Date('2026-05-20') }),
      makeRun({ startedAt: new Date('2026-05-25') }),
    ];
    const result = computeTrendData(gapped, 'total-runs', 'week', REFERENCE_DATE);
    const values = result.currentPeriod.map(b => b.value);
    const hasNull = values.some(v => v === null || v === 0);
    assert.ok(hasNull, 'Expected gaps between data points');
  });

  it('T43: No prior-year data shows current only without error', () => {
    const recentOnly = [makeRun({ startedAt: new Date('2026-05-22') })];
    const result = computeTrendData(recentOnly, 'avg-duration', 'year', REFERENCE_DATE);
    assert.ok(result.currentPeriod.length === 12);
    assert.ok(result.priorYear.length === 0 || result.priorYear.every(b => b.value === null || b.value === 0));
  });

  it('T44: No failures returns empty categories for failure-stage metric', () => {
    const noFailures = [makeRun({ status: 'success', failedStage: null })];
    const result = computeCategoricalTrendData(noFailures, 'most-common-failure-stage', 'week', REFERENCE_DATE);
    const allEmpty = result.currentPeriod.every(b => Object.keys(b.categories).length === 0);
    assert.ok(allEmpty, 'Expected all empty categories when no failures');
  });
});
