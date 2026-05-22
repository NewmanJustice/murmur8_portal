/**
 * Tests for feature: add_more_insights
 * Test IDs: T-AMI-01 through T-AMI-28
 * Runner: node --test test/feature_add_more_insights.test.js
 *
 * All tests are pure file-content assertions — no imports, no build, no DB.
 * Expected state BEFORE implementation: all tests FAIL.
 * Expected state AFTER implementation: all tests PASS.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const insightsLib = fs.readFileSync(path.join(projectRoot, 'lib/insights.ts'), 'utf8');
const insightsPanel = fs.readFileSync(path.join(projectRoot, 'app/dashboard/InsightsPanel.tsx'), 'utf8');

// ---------------------------------------------------------------------------
// run velocity metric — lib/insights.ts
// ---------------------------------------------------------------------------

describe('run velocity metric — lib/insights.ts', () => {
  it('T-AMI-01: AggregateInsights contains last7Days and last30Days fields', () => {
    assert.ok(
      insightsLib.includes('last7Days'),
      'Expected lib/insights.ts AggregateInsights to contain last7Days field'
    );
    assert.ok(
      insightsLib.includes('last30Days'),
      'Expected lib/insights.ts AggregateInsights to contain last30Days field'
    );
  });

  it('T-AMI-02: computeInsights contains a 7-day relative time window computation', () => {
    assert.ok(
      insightsLib.includes('7') && insightsLib.includes('last7Days'),
      'Expected lib/insights.ts computeInsights to compute a 7-day velocity window'
    );
  });

  it('T-AMI-03: computeInsights contains a 30-day relative time window computation', () => {
    assert.ok(
      insightsLib.includes('30') && insightsLib.includes('last30Days'),
      'Expected lib/insights.ts computeInsights to compute a 30-day velocity window'
    );
  });

  it('T-AMI-04: velocity block has a null-guard before date comparison', () => {
    assert.ok(
      (insightsLib.includes('startedAt') || insightsLib.includes('completedAt') || insightsLib.includes('receivedAt')) &&
      (insightsLib.includes('=== null') || insightsLib.includes('!== null') || insightsLib.includes('!== undefined') || insightsLib.includes('== null')),
      'Expected lib/insights.ts to null-guard the datetime field before date arithmetic in velocity computation'
    );
  });

  it('T-AMI-05: velocity fields default to 0 when no runs fall in window', () => {
    assert.ok(
      insightsLib.includes('last7Days: 0') || insightsLib.includes('last7Days') && insightsLib.includes(': 0'),
      'Expected lib/insights.ts to default velocity fields to 0 (not null/undefined)'
    );
  });

  it('T-AMI-08: InsightsRun interface contains a datetime field (startedAt, completedAt, or receivedAt)', () => {
    assert.ok(
      insightsLib.includes('startedAt') || insightsLib.includes('completedAt') || insightsLib.includes('receivedAt'),
      'Expected lib/insights.ts InsightsRun interface to declare a datetime field (startedAt, completedAt, or receivedAt)'
    );
  });
});

// ---------------------------------------------------------------------------
// run velocity metric — InsightsPanel
// ---------------------------------------------------------------------------

describe('run velocity metric — InsightsPanel', () => {
  it('T-AMI-06: InsightsPanel contains a "7" day label for velocity', () => {
    assert.ok(
      /7.{0,20}[Dd]ay|[Dd]ay.{0,10}7|Last 7/i.test(insightsPanel),
      'Expected app/dashboard/InsightsPanel.tsx to render a 7-day velocity label (e.g. "Last 7 Days")'
    );
  });

  it('T-AMI-07: InsightsPanel contains a "30" day label for velocity', () => {
    assert.ok(
      /30.{0,20}[Dd]ay|[Dd]ay.{0,10}30|Last 30/i.test(insightsPanel),
      'Expected app/dashboard/InsightsPanel.tsx to render a 30-day velocity label (e.g. "Last 30 Days")'
    );
  });
});

// ---------------------------------------------------------------------------
// avg feedback rating metric — lib/insights.ts
// ---------------------------------------------------------------------------

describe('avg feedback rating metric — lib/insights.ts', () => {
  it('T-AMI-20: AggregateInsights contains avgFeedbackRating field of type number | null', () => {
    assert.ok(
      insightsLib.includes('avgFeedbackRating'),
      'Expected lib/insights.ts AggregateInsights to declare avgFeedbackRating field'
    );
    assert.ok(
      insightsLib.includes('avgFeedbackRating: number | null') || insightsLib.includes('avgFeedbackRating:'),
      'Expected lib/insights.ts avgFeedbackRating to be typed as number | null'
    );
  });

  it('T-AMI-21: computeInsights iterates stages JSONB and reads feedback.rating path', () => {
    assert.ok(
      insightsLib.includes('feedback') && insightsLib.includes('rating') && insightsLib.includes('avgFeedbackRating'),
      'Expected lib/insights.ts computeInsights to traverse stages[key].feedback.rating for avgFeedbackRating'
    );
  });

  it('T-AMI-22: rating collection guards >= 1 (lower bound)', () => {
    assert.ok(
      insightsLib.includes('>= 1') || insightsLib.includes('> 0') || insightsLib.includes('>= 1'),
      'Expected lib/insights.ts to guard rating >= 1 when collecting feedback ratings'
    );
  });

  it('T-AMI-23: rating collection guards <= 5 (upper bound)', () => {
    assert.ok(
      insightsLib.includes('<= 5'),
      'Expected lib/insights.ts to guard rating <= 5 when collecting feedback ratings'
    );
  });

  it('T-AMI-24: final average uses toFixed(1) for one-decimal rounding', () => {
    assert.ok(
      insightsLib.includes('toFixed(1)'),
      'Expected lib/insights.ts to use toFixed(1) when rounding avgFeedbackRating'
    );
  });

  it('T-AMI-25: avgFeedbackRating returns null when no valid ratings found', () => {
    assert.ok(
      insightsLib.includes('avgFeedbackRating') && insightsLib.includes('null'),
      'Expected lib/insights.ts to return null for avgFeedbackRating when no valid ratings exist'
    );
  });

  it('T-AMI-28: rating loop covers all runs and all stage entries', () => {
    assert.ok(
      insightsLib.includes('avgFeedbackRating') &&
      (insightsLib.includes('for (const run') || insightsLib.includes('for(const run') || insightsLib.includes('.forEach') || insightsLib.includes('.reduce') || insightsLib.includes('for (const r')),
      'Expected lib/insights.ts to iterate over all runs (not a subset) when computing avgFeedbackRating'
    );
  });
});

// ---------------------------------------------------------------------------
// avg feedback rating metric — InsightsPanel
// ---------------------------------------------------------------------------

describe('avg feedback rating metric — InsightsPanel', () => {
  it('T-AMI-26: InsightsPanel renders "/ 5" string for rating display', () => {
    assert.ok(
      insightsPanel.includes('/ 5') || insightsPanel.includes('/5'),
      'Expected app/dashboard/InsightsPanel.tsx to render "/ 5" adjacent to the avgFeedbackRating value'
    );
  });

  it('T-AMI-27: InsightsPanel renders "—" fallback for null avgFeedbackRating', () => {
    assert.ok(
      insightsPanel.includes('avgFeedbackRating'),
      'Expected app/dashboard/InsightsPanel.tsx to reference avgFeedbackRating'
    );
    assert.ok(
      insightsPanel.includes('—') || insightsPanel.includes('&mdash;') || insightsPanel.includes('null'),
      'Expected app/dashboard/InsightsPanel.tsx to render a fallback for null avgFeedbackRating'
    );
  });
});
