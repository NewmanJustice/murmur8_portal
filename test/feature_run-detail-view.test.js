/**
 * Tests for feature: run-detail-view
 * Test IDs: T-RDV-01 through T-RDV-18
 * Runner: node --test test/feature_run-detail-view.test.js
 *
 * Stories: .blueprint/features/feature_run-detail-view/story-run-header.md
 *          .blueprint/features/feature_run-detail-view/story-stage-breakdown.md
 *
 * All tests are pure unit tests — no DB, no HTTP server, no Next.js.
 * Tests target pure helper functions from lib/run-detail.js.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatNullable,
  statusBadgeClass,
  parseStages,
  stageAccentClass,
  formatDuration,
  STAGE_ORDER,
} from '../lib/run-detail.js';

// ---------------------------------------------------------------------------
// formatNullable — story-run-header AC1, AC4
// ---------------------------------------------------------------------------

describe('formatNullable', () => {
  it('T-RDV-01: returns value as string when non-null string', () => {
    assert.equal(formatNullable('abc123'), 'abc123');
  });

  it('T-RDV-02: returns "—" for null', () => {
    assert.equal(formatNullable(null), '—');
  });

  it('T-RDV-03: returns "—" for undefined', () => {
    assert.equal(formatNullable(undefined), '—');
  });

  it('T-RDV-05: null commitHash, failedStage, pausedAfter each return "—"', () => {
    assert.equal(formatNullable(null), '—', 'commitHash null → "—"');
    assert.equal(formatNullable(null), '—', 'failedStage null → "—"');
    assert.equal(formatNullable(null), '—', 'pausedAfter null → "—"');
  });
});

// ---------------------------------------------------------------------------
// statusBadgeClass — story-run-header AC2
// ---------------------------------------------------------------------------

describe('statusBadgeClass (run-detail re-export)', () => {
  it('T-RDV-04a: success → green badge class', () => {
    const cls = statusBadgeClass('success');
    assert.ok(cls.includes('text-green-600'), `Expected text-green-600 in "${cls}"`);
    assert.ok(cls.includes('bg-green-50'), `Expected bg-green-50 in "${cls}"`);
  });

  it('T-RDV-04b: failed → red badge class', () => {
    const cls = statusBadgeClass('failed');
    assert.ok(cls.includes('text-red-600'), `Expected text-red-600 in "${cls}"`);
    assert.ok(cls.includes('bg-red-50'), `Expected bg-red-50 in "${cls}"`);
  });

  it('T-RDV-04c: paused → yellow badge class', () => {
    const cls = statusBadgeClass('paused');
    assert.ok(cls.includes('text-yellow-600'), `Expected text-yellow-600 in "${cls}"`);
    assert.ok(cls.includes('bg-yellow-50'), `Expected bg-yellow-50 in "${cls}"`);
  });
});

// ---------------------------------------------------------------------------
// parseStages — story-stage-breakdown AC1, AC2, AC6, AC7
// ---------------------------------------------------------------------------

describe('parseStages', () => {
  it('T-RDV-07: known stages appear in fixed pipeline order', () => {
    const raw = {
      'codey-implement': { durationMs: 1000 },
      alex: { durationMs: 500 },
      'nigel-tests': { durationMs: 200 },
    };
    const result = parseStages(raw);
    const keys = result.map((s) => s.key);
    assert.deepEqual(keys, ['alex', 'nigel-tests', 'codey-implement'],
      `Expected pipeline order, got: ${JSON.stringify(keys)}`);
  });

  it('T-RDV-08: only stages present in JSONB are returned', () => {
    const raw = { alex: { durationMs: 100 }, cass: { durationMs: 200 } };
    const result = parseStages(raw);
    assert.equal(result.length, 2, 'Expected exactly 2 stages');
    assert.ok(result.every((s) => STAGE_ORDER.includes(s.key)), 'All returned keys must be known stages');
  });

  it('T-RDV-09: absent cass key → cass omitted from result', () => {
    const raw = { alex: {}, 'nigel-spec': {}, 'codey-implement': {} };
    const result = parseStages(raw);
    const keys = result.map((s) => s.key);
    assert.ok(!keys.includes('cass'), `cass should be absent, got: ${JSON.stringify(keys)}`);
    assert.equal(keys.length, 3);
  });

  it('T-RDV-17: unknown JSONB key is ignored', () => {
    const raw = { alex: {}, 'future-agent': { durationMs: 999 } };
    const result = parseStages(raw);
    const keys = result.map((s) => s.key);
    assert.ok(!keys.includes('future-agent'), `Unknown key should be absent, got: ${JSON.stringify(keys)}`);
    assert.equal(keys.length, 1);
    assert.equal(keys[0], 'alex');
  });

  it('T-RDV-18: stepsCompleted on codey-implement is passed through in data', () => {
    const raw = { 'codey-implement': { stepsCompleted: 7, durationMs: 3000 } };
    const result = parseStages(raw);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'codey-implement');
    assert.equal(result[0].data.stepsCompleted, 7, 'stepsCompleted should be preserved in data');
  });
});

// ---------------------------------------------------------------------------
// stageAccentClass — story-stage-breakdown AC4
// ---------------------------------------------------------------------------

describe('stageAccentClass', () => {
  it('T-RDV-10: alex → sky class (accent #38BDF8)', () => {
    const cls = stageAccentClass('alex');
    assert.ok(cls.includes('sky'), `Expected "sky" in "${cls}"`);
  });

  it('T-RDV-11: cass → violet class (accent #A78BFA)', () => {
    const cls = stageAccentClass('cass');
    assert.ok(cls.includes('violet'), `Expected "violet" in "${cls}"`);
  });

  it('T-RDV-12: nigel-spec → amber class (accent #F59E0B)', () => {
    const cls = stageAccentClass('nigel-spec');
    assert.ok(cls.includes('amber'), `Expected "amber" in "${cls}"`);
  });

  it('T-RDV-13: nigel-tests → amber class (accent #F59E0B)', () => {
    const cls = stageAccentClass('nigel-tests');
    assert.ok(cls.includes('amber'), `Expected "amber" in "${cls}"`);
  });

  it('T-RDV-14: codey-plan → teal class (accent #2DD4BF)', () => {
    const cls = stageAccentClass('codey-plan');
    assert.ok(cls.includes('teal'), `Expected "teal" in "${cls}"`);
  });

  it('T-RDV-15: codey-implement → teal class (accent #2DD4BF)', () => {
    const cls = stageAccentClass('codey-implement');
    assert.ok(cls.includes('teal'), `Expected "teal" in "${cls}"`);
  });
});

// ---------------------------------------------------------------------------
// formatNullable for per-stage null fields — story-stage-breakdown AC5
// ---------------------------------------------------------------------------

describe('formatNullable (stage null fields)', () => {
  it('T-RDV-16: null tokens, cost, feedback each return "—"', () => {
    assert.equal(formatNullable(null), '—', 'null tokens → "—"');
    assert.equal(formatNullable(null), '—', 'null cost → "—"');
    assert.equal(formatNullable(null), '—', 'null feedback → "—"');
  });
});

// ---------------------------------------------------------------------------
// formatDuration re-export — story-graceful-degradation AC5
// ---------------------------------------------------------------------------

describe('formatDuration (run-detail re-export)', () => {
  it('T-RDV-23: numeric durationMs → human-readable string', () => {
    assert.equal(formatDuration(12340), '12s');
  });
});
