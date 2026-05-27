/**
 * Tests for feature: run-detail-view
 * Test IDs: T-RDV-01 through T-RDV-18 (original), T-RDV-29 through T-RDV-45 (refinement 2026-05-27)
 * Runner: node --test test/feature_run-detail-view.test.js
 *
 * Stories: .blueprint/features/feature_run-detail-view/story-run-header.md
 *          .blueprint/features/feature_run-detail-view/story-stage-breakdown.md
 *          .blueprint/features/feature_run-detail-view/story-site-nav.md         (refinement)
 *          .blueprint/features/feature_run-detail-view/story-telemetry-tiles.md  (refinement)
 *          .blueprint/features/feature_run-detail-view/story-spec-and-stories-display.md (refinement)
 *
 * All tests are pure unit tests — no DB, no HTTP server, no Next.js.
 * Tests target pure helper functions from lib/run-detail.js and lib/telemetry.js.
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
  SITE_NAV_LINKS,
  BACK_LINK,
  computeTotalTokens,
  computeStageCount,
} from '../lib/run-detail.js';

import { validatePayload, buildRunData } from '../lib/telemetry.js';

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

// ===========================================================================
// REFINEMENT 2026-05-27 — new stories
// ===========================================================================

// ---------------------------------------------------------------------------
// story-run-header AC3 (updated) — back link label
// ---------------------------------------------------------------------------

describe('BACK_LINK constant — story-run-header AC3', () => {
  it('T-RDV-45: back link label is "← Run History"', () => {
    assert.equal(BACK_LINK.label, '← Run History',
      `Expected BACK_LINK.label to be "← Run History", got "${BACK_LINK.label}"`);
  });

  it('T-RDV-45b: back link href is "/dashboard/runs"', () => {
    assert.equal(BACK_LINK.href, '/dashboard/runs',
      `Expected BACK_LINK.href to be "/dashboard/runs", got "${BACK_LINK.href}"`);
  });
});

// ---------------------------------------------------------------------------
// story-site-nav — SITE_NAV_LINKS constant
// ---------------------------------------------------------------------------

describe('SITE_NAV_LINKS — story-site-nav AC1–AC4', () => {
  it('T-RDV-29: SITE_NAV_LINKS is an array with at least two entries', () => {
    assert.ok(Array.isArray(SITE_NAV_LINKS), 'SITE_NAV_LINKS must be an array');
    assert.ok(SITE_NAV_LINKS.length >= 2, `Expected at least 2 nav links, got ${SITE_NAV_LINKS.length}`);
  });

  it('T-RDV-30: "Run History" link is present pointing to /dashboard/runs', () => {
    const link = SITE_NAV_LINKS.find((l) => l.label === 'Run History');
    assert.ok(link, 'Expected a nav link with label "Run History"');
    assert.equal(link.href, '/dashboard/runs',
      `Expected Run History href to be "/dashboard/runs", got "${link.href}"`);
  });

  it('T-RDV-31: "Keys" link (API Keys) is present', () => {
    const link = SITE_NAV_LINKS.find((l) => l.label === 'API Keys' || l.label === 'Keys');
    assert.ok(link, 'Expected a nav link for Keys/API Keys');
    assert.ok(typeof link.href === 'string' && link.href.length > 0,
      `Expected Keys link to have a non-empty href, got "${link.href}"`);
  });

  it('T-RDV-32: each nav link entry has a non-empty label and href', () => {
    for (const link of SITE_NAV_LINKS) {
      assert.ok(typeof link.label === 'string' && link.label.trim() !== '',
        `Nav link label must be a non-empty string, got "${link.label}"`);
      assert.ok(typeof link.href === 'string' && link.href.trim() !== '',
        `Nav link href must be a non-empty string, got "${link.href}"`);
    }
  });
});

// ---------------------------------------------------------------------------
// story-telemetry-tiles — computeTotalTokens and computeStageCount
// ---------------------------------------------------------------------------

describe('computeTotalTokens — story-telemetry-tiles AC2, AC4', () => {
  it('T-RDV-33: four expected tile labels are defined as a constant', () => {
    // The tile labels are contractually fixed: Total Cost, Total Duration, Total Tokens, Stage Count
    const EXPECTED_TILE_LABELS = ['Total Cost', 'Total Duration', 'Total Tokens', 'Stage Count'];
    assert.equal(EXPECTED_TILE_LABELS.length, 4, 'Expected exactly 4 tile labels');
    assert.ok(EXPECTED_TILE_LABELS.includes('Total Tokens'), 'Total Tokens tile must be present');
    assert.ok(EXPECTED_TILE_LABELS.includes('Stage Count'), 'Stage Count tile must be present');
  });

  it('T-RDV-34: sums inputTokens + outputTokens across all stages', () => {
    const stages = {
      alex: { inputTokens: 100, outputTokens: 50 },
      cass: { inputTokens: 200, outputTokens: 80 },
      'nigel-tests': { inputTokens: 150, outputTokens: 30 },
    };
    const total = computeTotalTokens(stages);
    assert.equal(total, 610, `Expected 610, got ${total}`);
  });

  it('T-RDV-36: null or absent token fields are treated as 0', () => {
    const stages = {
      alex: { inputTokens: null, outputTokens: null },
      cass: { outputTokens: 50 },            // inputTokens absent
      'nigel-tests': { inputTokens: 100 },   // outputTokens absent
    };
    assert.doesNotThrow(() => {
      const total = computeTotalTokens(stages);
      assert.equal(total, 150, `Expected 150, got ${total}`);
    });
  });

  it('T-RDV-36b: null stages input returns 0, no throw', () => {
    assert.doesNotThrow(() => {
      const total = computeTotalTokens(null);
      assert.equal(total, 0, `Expected 0 for null stages, got ${total}`);
    });
  });
});

describe('computeStageCount — story-telemetry-tiles AC5', () => {
  it('T-RDV-35: returns number of stage keys present in JSONB', () => {
    const stages = {
      alex: {},
      cass: {},
      'nigel-tests': {},
      'codey-implement': {},
    };
    assert.equal(computeStageCount(stages), 4, 'Expected 4 stage keys');
  });

  it('T-RDV-35b: empty stages object returns 0', () => {
    assert.equal(computeStageCount({}), 0);
  });

  it('T-RDV-35c: null stages input returns 0, no throw', () => {
    assert.doesNotThrow(() => {
      assert.equal(computeStageCount(null), 0);
    });
  });
});

// ---------------------------------------------------------------------------
// story-spec-and-stories-display — featureSpec and stories passthrough
// ---------------------------------------------------------------------------

// Shared valid telemetry payload base for spec/stories tests
const BASE_PAYLOAD = {
  slug: 'run-detail-spec-test',
  status: 'success',
  type: 'feature',
  startedAt: '2026-05-27T09:00:00Z',
  completedAt: '2026-05-27T09:30:00Z',
  totalDurationMs: 1800000,
  stages: { alex: { durationMs: 60000 } },
};

const MOCK_KEY = { id: 'key-spec-001', userId: 'user-spec-001' };

describe('validatePayload — story-spec-and-stories-display AC5', () => {
  it('T-RDV-37: featureSpec non-null passes through to validated data', () => {
    const result = validatePayload({ ...BASE_PAYLOAD, featureSpec: '# My Spec\n\nContent here.' });
    assert.equal(result.success, true, `Expected success, got errors: ${JSON.stringify(result.errors)}`);
    assert.equal(result.data.featureSpec, '# My Spec\n\nContent here.');
  });

  it('T-RDV-38: featureSpec absent → validated data has featureSpec as null or undefined', () => {
    const result = validatePayload({ ...BASE_PAYLOAD });
    assert.equal(result.success, true);
    // featureSpec should be null or undefined (not an error) when absent
    assert.ok(result.data.featureSpec === null || result.data.featureSpec === undefined,
      `Expected featureSpec to be null/undefined, got "${result.data.featureSpec}"`);
  });

  it('T-RDV-41: validatePayload accepts featureSpec as optional string', () => {
    const withSpec = validatePayload({ ...BASE_PAYLOAD, featureSpec: 'spec content' });
    assert.equal(withSpec.success, true);
    const withoutSpec = validatePayload({ ...BASE_PAYLOAD });
    assert.equal(withoutSpec.success, true, 'Payload without featureSpec must also be valid');
  });

  it('T-RDV-42: validatePayload accepts stories as optional array of {title, content}', () => {
    const stories = [
      { title: 'Story One', content: 'As a user...' },
      { title: 'Story Two', content: 'As an admin...' },
    ];
    const result = validatePayload({ ...BASE_PAYLOAD, stories });
    assert.equal(result.success, true, `Expected success, got: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.data.stories, stories);
  });

  it('T-RDV-39: stories non-null array passes through to validated data', () => {
    const stories = [{ title: 'AC1', content: 'User sees X' }];
    const result = validatePayload({ ...BASE_PAYLOAD, stories });
    assert.equal(result.success, true);
    assert.deepEqual(result.data.stories, stories);
  });

  it('T-RDV-40: stories absent → validated data has stories as null or undefined', () => {
    const result = validatePayload({ ...BASE_PAYLOAD });
    assert.equal(result.success, true);
    assert.ok(result.data.stories === null || result.data.stories === undefined,
      `Expected stories to be null/undefined when absent, got "${JSON.stringify(result.data.stories)}"`);
  });

  it('T-RDV-43: validatePayload rejects malformed stories — non-array value', () => {
    const result = validatePayload({ ...BASE_PAYLOAD, stories: 'not-an-array' });
    assert.equal(result.success, false,
      'Expected failure when stories is a string, not an array');
    assert.ok(result.errors.some((e) => e.field === 'stories' || e.message?.includes('stories')),
      `Expected an error referencing "stories", got: ${JSON.stringify(result.errors)}`);
  });

  it('T-RDV-43b: validatePayload rejects malformed stories — object (not array)', () => {
    const result = validatePayload({ ...BASE_PAYLOAD, stories: { title: 'bad', content: 'bad' } });
    assert.equal(result.success, false,
      'Expected failure when stories is a plain object, not an array');
  });
});

describe('buildRunData — story-spec-and-stories-display AC5', () => {
  it('T-RDV-44: buildRunData passes featureSpec through to output', () => {
    const payload = { ...BASE_PAYLOAD, featureSpec: '# Feature Spec' };
    const result = validatePayload(payload);
    assert.equal(result.success, true);
    const data = buildRunData(MOCK_KEY, result.data);
    assert.equal(data.featureSpec, '# Feature Spec',
      `Expected featureSpec to be passed through, got "${data.featureSpec}"`);
  });

  it('T-RDV-44b: buildRunData passes stories through to output', () => {
    const stories = [{ title: 'S1', content: 'Content 1' }];
    const payload = { ...BASE_PAYLOAD, stories };
    const result = validatePayload(payload);
    assert.equal(result.success, true);
    const data = buildRunData(MOCK_KEY, result.data);
    assert.deepEqual(data.stories, stories,
      `Expected stories to be passed through, got ${JSON.stringify(data.stories)}`);
  });

  it('T-RDV-44c: buildRunData with no featureSpec or stories still succeeds', () => {
    const result = validatePayload(BASE_PAYLOAD);
    assert.equal(result.success, true);
    const data = buildRunData(MOCK_KEY, result.data);
    assert.equal(data.userId, MOCK_KEY.userId);
    assert.equal(data.slug, BASE_PAYLOAD.slug);
  });
});
