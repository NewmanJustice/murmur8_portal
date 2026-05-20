/**
 * Tests for feature: insights-panel
 * Test IDs: T-IP-01 through T-IP-20
 * Runner: node --test test/feature_insights-panel.test.js
 *
 * All tests are pure unit tests — no DB, no HTTP, no Next.js.
 * Tests target pure helper functions from lib/insights.js.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeInsights,
  computeStageAverages,
  getMostCommonFailureStage,
  STAGE_ORDER,
} from '../lib/insights.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeRun(overrides = {}) {
  return {
    status: 'success',
    totalDurationMs: null,
    totalCost: null,
    failedStage: null,
    stages: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// computeInsights
// ---------------------------------------------------------------------------

describe('computeInsights', () => {
  it('T-IP-01: empty runs → totalRuns:0, successRate:null, avgDurationMs:null, totalCost:0', () => {
    const result = computeInsights([]);
    assert.equal(result.totalRuns, 0);
    assert.equal(result.successRate, null);
    assert.equal(result.avgDurationMs, null);
    assert.equal(result.totalCost, 0);
  });

  it('T-IP-02: 3 success runs → totalRuns:3, successRate:100.0', () => {
    const runs = [
      makeRun({ status: 'success' }),
      makeRun({ status: 'success' }),
      makeRun({ status: 'success' }),
    ];
    const result = computeInsights(runs);
    assert.equal(result.totalRuns, 3);
    assert.equal(result.successRate, 100.0);
  });

  it('T-IP-03: 4 runs (2 success, 1 failed, 1 paused) → successRate:50.0', () => {
    const runs = [
      makeRun({ status: 'success' }),
      makeRun({ status: 'success' }),
      makeRun({ status: 'failed' }),
      makeRun({ status: 'paused' }),
    ];
    const result = computeInsights(runs);
    assert.equal(result.successRate, 50.0);
  });

  it('T-IP-04: 1 success, 2 failed → successRate rounds to 33.3', () => {
    const runs = [
      makeRun({ status: 'success' }),
      makeRun({ status: 'failed' }),
      makeRun({ status: 'failed' }),
    ];
    const result = computeInsights(runs);
    assert.equal(result.successRate, 33.3);
  });

  it('T-IP-05: no runs → successRate is null', () => {
    const result = computeInsights([]);
    assert.equal(result.successRate, null);
  });

  it('T-IP-06: 2 runs with durationMs 60000 and 120000 → avgDurationMs:90000', () => {
    const runs = [
      makeRun({ totalDurationMs: 60000 }),
      makeRun({ totalDurationMs: 120000 }),
    ];
    const result = computeInsights(runs);
    assert.equal(result.avgDurationMs, 90000);
  });

  it('T-IP-07: all runs have null totalDurationMs → avgDurationMs:null', () => {
    const runs = [
      makeRun({ totalDurationMs: null }),
      makeRun({ totalDurationMs: null }),
    ];
    const result = computeInsights(runs);
    assert.equal(result.avgDurationMs, null);
  });

  it('T-IP-08: 2 runs with cost 0.01 and 0.02 → totalCost close to 0.03', () => {
    const runs = [
      makeRun({ totalCost: 0.01 }),
      makeRun({ totalCost: 0.02 }),
    ];
    const result = computeInsights(runs);
    assert.ok(
      Math.abs(result.totalCost - 0.03) < 0.0001,
      `Expected totalCost ~0.03 but got ${result.totalCost}`
    );
  });

  it('T-IP-09: null totalCost treated as 0 → sum equals non-null values only', () => {
    const runs = [
      makeRun({ totalCost: 0.05 }),
      makeRun({ totalCost: null }),
      makeRun({ totalCost: 0.10 }),
    ];
    const result = computeInsights(runs);
    assert.ok(
      Math.abs(result.totalCost - 0.15) < 0.0001,
      `Expected totalCost ~0.15 but got ${result.totalCost}`
    );
  });
});

// ---------------------------------------------------------------------------
// computeStageAverages
// ---------------------------------------------------------------------------

describe('computeStageAverages', () => {
  it('T-IP-10: 2 runs with alex durationMs 10000 and 20000 → avg 15000', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 10000 } } }),
      makeRun({ stages: { alex: { durationMs: 20000 } } }),
    ];
    const result = computeStageAverages(runs);
    const alex = result.find(r => r.key === 'alex');
    assert.ok(alex, 'Expected alex entry');
    assert.equal(alex.avgDurationMs, 15000);
  });

  it('T-IP-11: stage absent from some runs → average uses only runs containing that stage', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 10000 }, cass: { durationMs: 5000 } } }),
      makeRun({ stages: { alex: { durationMs: 20000 } } }), // no cass
    ];
    const result = computeStageAverages(runs);
    const cass = result.find(r => r.key === 'cass');
    assert.ok(cass, 'Expected cass entry');
    assert.equal(cass.avgDurationMs, 5000); // only 1 run contributed
  });

  it('T-IP-12: stage absent from all runs → avgDurationMs:null', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 10000 } } }),
    ];
    const result = computeStageAverages(runs);
    const cass = result.find(r => r.key === 'cass');
    assert.ok(cass, 'Expected cass entry');
    assert.equal(cass.avgDurationMs, null);
  });

  it('T-IP-13: empty runs array → all known stages have avgDurationMs:null', () => {
    const result = computeStageAverages([]);
    assert.equal(result.length, STAGE_ORDER.length);
    for (const entry of result) {
      assert.equal(entry.avgDurationMs, null, `Expected null for stage ${entry.key}`);
    }
  });

  it('T-IP-14: always returns all 6 known stage keys in STAGE_ORDER', () => {
    const result = computeStageAverages([]);
    assert.equal(result.length, 6);
    for (let i = 0; i < STAGE_ORDER.length; i++) {
      assert.equal(result[i].key, STAGE_ORDER[i]);
    }
  });

  it('T-IP-20: stage durationMs=0 (valid) is included in average', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 0 } } }),
      makeRun({ stages: { alex: { durationMs: 6000 } } }),
    ];
    const result = computeStageAverages(runs);
    const alex = result.find(r => r.key === 'alex');
    assert.equal(alex.avgDurationMs, 3000); // (0 + 6000) / 2
  });
});

// ---------------------------------------------------------------------------
// getMostCommonFailureStage
// ---------------------------------------------------------------------------

describe('getMostCommonFailureStage', () => {
  it('T-IP-15: 2 "codey-implement" failures and 1 "alex" → returns "codey-implement"', () => {
    const runs = [
      makeRun({ status: 'failed', failedStage: 'codey-implement' }),
      makeRun({ status: 'failed', failedStage: 'codey-implement' }),
      makeRun({ status: 'failed', failedStage: 'alex' }),
    ];
    const result = getMostCommonFailureStage(runs);
    assert.equal(result, 'codey-implement');
  });

  it('T-IP-16: tie between "alex" and "cass" → returns "alex" (alphabetical)', () => {
    const runs = [
      makeRun({ status: 'failed', failedStage: 'cass' }),
      makeRun({ status: 'failed', failedStage: 'alex' }),
    ];
    const result = getMostCommonFailureStage(runs);
    assert.equal(result, 'alex');
  });

  it('T-IP-17: no failed runs → returns null', () => {
    const runs = [
      makeRun({ status: 'success' }),
      makeRun({ status: 'paused' }),
    ];
    const result = getMostCommonFailureStage(runs);
    assert.equal(result, null);
  });

  it('T-IP-18: failed run with null failedStage excluded from count', () => {
    const runs = [
      makeRun({ status: 'failed', failedStage: null }),
      makeRun({ status: 'failed', failedStage: null }),
      makeRun({ status: 'failed', failedStage: 'alex' }),
    ];
    const result = getMostCommonFailureStage(runs);
    assert.equal(result, 'alex');
  });

  it('T-IP-19: empty runs array → returns null', () => {
    const result = getMostCommonFailureStage([]);
    assert.equal(result, null);
  });
});
