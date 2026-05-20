/**
 * Tests for feature: run-detail-view (edge cases)
 * Test IDs: T-RDV-19 through T-RDV-28
 * Runner: node --test test/feature_run-detail-view-edge.test.js
 *
 * Stories: .blueprint/features/feature_run-detail-view/story-graceful-degradation.md
 *          .blueprint/features/feature_run-detail-view/story-refinement-link.md
 *
 * All tests are pure unit tests — no DB, no HTTP server, no Next.js.
 * Tests target pure helper functions from lib/run-detail.js.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseStages,
  formatNullable,
  formatDuration,
  showRefinementLink,
} from '../lib/run-detail.js';

// ---------------------------------------------------------------------------
// parseStages boundary inputs — story-graceful-degradation AC1, AC2
// ---------------------------------------------------------------------------

describe('parseStages (boundary inputs)', () => {
  it('T-RDV-19: null stages input → empty array, no throw', () => {
    assert.doesNotThrow(() => {
      const result = parseStages(null);
      assert.deepEqual(result, [], `Expected [], got ${JSON.stringify(result)}`);
    });
  });

  it('T-RDV-20a: undefined stages input → empty array, no throw', () => {
    assert.doesNotThrow(() => {
      const result = parseStages(undefined);
      assert.deepEqual(result, [], `Expected [], got ${JSON.stringify(result)}`);
    });
  });

  it('T-RDV-20b: string stages input → empty array, no throw', () => {
    assert.doesNotThrow(() => {
      const result = parseStages('malformed');
      assert.deepEqual(result, [], `Expected [], got ${JSON.stringify(result)}`);
    });
  });

  it('T-RDV-20c: array stages input → empty array, no throw', () => {
    assert.doesNotThrow(() => {
      const result = parseStages(['alex', 'cass']);
      assert.deepEqual(result, [], `Expected [], got ${JSON.stringify(result)}`);
    });
  });

  it('T-RDV-20d: empty object stages input → empty array, no throw', () => {
    assert.doesNotThrow(() => {
      const result = parseStages({});
      assert.deepEqual(result, [], `Expected [], got ${JSON.stringify(result)}`);
    });
  });
});

// ---------------------------------------------------------------------------
// formatNullable edge cases — story-graceful-degradation AC3, AC4
// ---------------------------------------------------------------------------

describe('formatNullable (per-stage null/edge fields)', () => {
  it('T-RDV-21: null per-stage fields → "—" em dash string', () => {
    const emDash = '—';
    assert.equal(formatNullable(null), emDash, 'Should return U+2014 em dash');
    assert.equal(formatNullable(undefined), emDash, 'Should return U+2014 em dash for undefined');
  });

  it('T-RDV-22a: numeric zero returns "0" not "—"', () => {
    assert.equal(formatNullable(0), '0', 'Numeric zero is a valid value, not null');
  });

  it('T-RDV-22b: empty string returns "" not "—"', () => {
    assert.equal(formatNullable(''), '', 'Empty string is a defined value, not null');
  });
});

// ---------------------------------------------------------------------------
// formatDuration / formatNullable — story-graceful-degradation AC5
// ---------------------------------------------------------------------------

describe('formatDuration and formatNullable (null durationMs)', () => {
  it('T-RDV-24: null durationMs → formatNullable returns "—"', () => {
    assert.equal(formatNullable(null), '—', 'null durationMs should display as "—"');
  });

  it('T-RDV-23 (edge): formatDuration 0ms → "0s"', () => {
    assert.equal(formatDuration(0), '0s');
  });
});

// ---------------------------------------------------------------------------
// showRefinementLink — story-refinement-link AC1 through AC4
// ---------------------------------------------------------------------------

describe('showRefinementLink', () => {
  it('T-RDV-25: type=refinement + parentRunId set → true', () => {
    assert.equal(showRefinementLink('refinement', 'run-abc-123'), true);
  });

  it('T-RDV-26: type=feature → false regardless of parentRunId', () => {
    assert.equal(showRefinementLink('feature', 'run-abc-123'), false,
      'feature type with parentRunId should return false');
    assert.equal(showRefinementLink('feature', null), false,
      'feature type with null parentRunId should return false');
  });

  it('T-RDV-27: type=refinement + parentRunId=null → false', () => {
    assert.equal(showRefinementLink('refinement', null), false,
      'refinement type without parentRunId should return false');
  });

  it('T-RDV-27b: type=refinement + parentRunId=undefined → false', () => {
    assert.equal(showRefinementLink('refinement', undefined), false,
      'refinement type with undefined parentRunId should return false');
  });

  it('T-RDV-28: link href is constructed as /dashboard/runs/[parentRunId]', () => {
    const parentRunId = 'clxyz1234';
    const shouldShow = showRefinementLink('refinement', parentRunId);
    assert.equal(shouldShow, true, 'Link should be shown');
    const href = `/dashboard/runs/${parentRunId}`;
    assert.equal(href, '/dashboard/runs/clxyz1234', 'href template is /dashboard/runs/[parentRunId]');
  });
});
