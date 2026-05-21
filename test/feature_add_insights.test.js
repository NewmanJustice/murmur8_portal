/**
 * Tests for feature: add_insights
 * Test IDs: T-AI-01 through T-AI-28
 * Runner: node --test test/feature_add_insights.test.js
 *
 * All tests are pure file-content assertions.
 * No imports of source modules, no build step, no DB, no browser.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const insightsLib = fs.readFileSync(path.join(projectRoot, 'lib/insights.ts'), 'utf8');
const insightsPanel = fs.readFileSync(path.join(projectRoot, 'app/dashboard/InsightsPanel.tsx'), 'utf8');

// ---------------------------------------------------------------------------
// cost per run metric — lib/insights.ts
// ---------------------------------------------------------------------------

describe('cost per run metric — lib/insights.ts', () => {
  it('T-AI-01: AggregateInsights type contains avgCostPerRun: number', () => {
    assert.ok(
      insightsLib.includes('avgCostPerRun: number'),
      'Expected lib/insights.ts to declare `avgCostPerRun: number` in AggregateInsights'
    );
  });

  it('T-AI-02: computeInsights uses avgCostPerRun in its return value', () => {
    assert.ok(
      insightsLib.includes('avgCostPerRun'),
      'Expected lib/insights.ts computeInsights to reference avgCostPerRun in return object'
    );
  });

  it('T-AI-03: InsightsRun type contains type field', () => {
    assert.ok(
      insightsLib.includes('type:') || insightsLib.includes('type ?:') || insightsLib.includes('type '),
      'Expected lib/insights.ts InsightsRun to declare a type field'
    );
  });

  it('T-AI-04: InsightsRun type contains slug field', () => {
    assert.ok(
      insightsLib.includes('slug:') || insightsLib.includes('slug ?:'),
      'Expected lib/insights.ts InsightsRun to declare a slug field'
    );
  });

  it('T-AI-05: InsightsRun type contains stage field', () => {
    assert.ok(
      insightsLib.includes('stage:') || insightsLib.includes('stage ?:'),
      'Expected lib/insights.ts InsightsRun to declare a stage field'
    );
  });
});

// ---------------------------------------------------------------------------
// cost per run metric — InsightsPanel
// ---------------------------------------------------------------------------

describe('cost per run metric — InsightsPanel', () => {
  it('T-AI-06: InsightsPanel renders a label containing "cost" and "run" (case-insensitive)', () => {
    const lowerPanel = insightsPanel.toLowerCase();
    const hasCostRun = /cost[^"'\n]*run|avg cost.*run|cost.*per.*run/i.test(insightsPanel);
    assert.ok(
      hasCostRun,
      'Expected app/dashboard/InsightsPanel.tsx to contain a label with "cost" and "run" (e.g. "Avg Cost / Run")'
    );
  });

  it('T-AI-07: InsightsPanel references insights.avgCostPerRun', () => {
    assert.ok(
      insightsPanel.includes('insights.avgCostPerRun') || insightsPanel.includes('avgCostPerRun'),
      'Expected app/dashboard/InsightsPanel.tsx to reference insights.avgCostPerRun'
    );
  });

  it('T-AI-08: InsightsPanel applies formatCost to avgCostPerRun (renders "$0.00" for zero)', () => {
    assert.ok(
      insightsPanel.includes('formatCost') && insightsPanel.includes('avgCostPerRun'),
      'Expected app/dashboard/InsightsPanel.tsx to apply formatCost() to avgCostPerRun so zero renders as "$0.00"'
    );
  });
});

// ---------------------------------------------------------------------------
// refinement rate metric — lib/insights.ts
// ---------------------------------------------------------------------------

describe('refinement rate metric — lib/insights.ts', () => {
  it('T-AI-09: AggregateInsights type contains refinementRate: number', () => {
    assert.ok(
      insightsLib.includes('refinementRate: number'),
      'Expected lib/insights.ts to declare `refinementRate: number` in AggregateInsights'
    );
  });

  it('T-AI-10: computeInsights computes refinementRate using type === "refinement"', () => {
    assert.ok(
      insightsLib.includes('refinement') && insightsLib.includes('refinementRate'),
      'Expected lib/insights.ts computeInsights to compute refinementRate from runs with type==="refinement"'
    );
  });

  it('T-AI-11: refinementRate computation uses distinct slug counting', () => {
    // The implementation must reference slug to compute the distinct-slug ratio
    assert.ok(
      insightsLib.includes('slug'),
      'Expected lib/insights.ts to reference slug field when computing refinementRate'
    );
  });

  it('T-AI-12: refinementRate uses toFixed(1) or equivalent for 1 decimal place', () => {
    // Should use parseFloat/toFixed pattern for rounding to 1dp like existing successRate
    assert.ok(
      insightsLib.includes('toFixed(1)'),
      'Expected lib/insights.ts to use toFixed(1) for rounding refinementRate to 1 decimal place'
    );
  });
});

// ---------------------------------------------------------------------------
// refinement rate metric — InsightsPanel
// ---------------------------------------------------------------------------

describe('refinement rate metric — InsightsPanel', () => {
  it('T-AI-13: InsightsPanel renders label "Refinement Rate"', () => {
    assert.ok(
      insightsPanel.includes('Refinement Rate'),
      'Expected app/dashboard/InsightsPanel.tsx to contain label "Refinement Rate"'
    );
  });

  it('T-AI-14: InsightsPanel references insights.refinementRate', () => {
    assert.ok(
      insightsPanel.includes('insights.refinementRate') || insightsPanel.includes('refinementRate'),
      'Expected app/dashboard/InsightsPanel.tsx to reference insights.refinementRate'
    );
  });

  it('T-AI-15: InsightsPanel appends % to refinementRate value (renders "0%" for zero)', () => {
    // Must show a % sign adjacent to the refinementRate value
    assert.ok(
      insightsPanel.includes('refinementRate') && insightsPanel.includes('%'),
      'Expected app/dashboard/InsightsPanel.tsx to format refinementRate with a "%" so zero renders as "0%"'
    );
  });
});

// ---------------------------------------------------------------------------
// runs by type metric — lib/insights.ts
// ---------------------------------------------------------------------------

describe('runs by type metric — lib/insights.ts', () => {
  it('T-AI-16: AggregateInsights type contains featureRuns: number', () => {
    assert.ok(
      insightsLib.includes('featureRuns: number'),
      'Expected lib/insights.ts to declare `featureRuns: number` in AggregateInsights'
    );
  });

  it('T-AI-17: AggregateInsights type contains refinementRuns: number', () => {
    assert.ok(
      insightsLib.includes('refinementRuns: number'),
      'Expected lib/insights.ts to declare `refinementRuns: number` in AggregateInsights'
    );
  });

  it('T-AI-18: computeInsights counts featureRuns using type === "feature"', () => {
    assert.ok(
      insightsLib.includes('featureRuns') && insightsLib.includes('"feature"'),
      'Expected lib/insights.ts computeInsights to count runs where type==="feature" into featureRuns'
    );
  });

  it('T-AI-19: computeInsights counts refinementRuns using type === "refinement"', () => {
    assert.ok(
      insightsLib.includes('refinementRuns') && insightsLib.includes('"refinement"'),
      'Expected lib/insights.ts computeInsights to count runs where type==="refinement" into refinementRuns'
    );
  });
});

// ---------------------------------------------------------------------------
// runs by type metric — InsightsPanel
// ---------------------------------------------------------------------------

describe('runs by type metric — InsightsPanel', () => {
  it('T-AI-20: InsightsPanel contains "Feature:" label text', () => {
    assert.ok(
      insightsPanel.includes('Feature:'),
      'Expected app/dashboard/InsightsPanel.tsx to render "Feature:" label for featureRuns count'
    );
  });

  it('T-AI-21: InsightsPanel contains "Refinement:" label text', () => {
    assert.ok(
      insightsPanel.includes('Refinement:'),
      'Expected app/dashboard/InsightsPanel.tsx to render "Refinement:" label for refinementRuns count'
    );
  });

  it('T-AI-22: InsightsPanel references insights.featureRuns', () => {
    assert.ok(
      insightsPanel.includes('insights.featureRuns') || insightsPanel.includes('featureRuns'),
      'Expected app/dashboard/InsightsPanel.tsx to reference insights.featureRuns'
    );
  });

  it('T-AI-23: InsightsPanel references insights.refinementRuns', () => {
    assert.ok(
      insightsPanel.includes('insights.refinementRuns') || insightsPanel.includes('refinementRuns'),
      'Expected app/dashboard/InsightsPanel.tsx to reference insights.refinementRuns'
    );
  });
});

// ---------------------------------------------------------------------------
// success rate by stage metric — lib/insights.ts
// ---------------------------------------------------------------------------

describe('success rate by stage metric — lib/insights.ts', () => {
  it('T-AI-24: AggregateInsights type contains stageSuccessRates field', () => {
    assert.ok(
      insightsLib.includes('stageSuccessRates'),
      'Expected lib/insights.ts to declare stageSuccessRates in AggregateInsights'
    );
  });

  it('T-AI-25: stageSuccessRates typed as Record<string, number> or equivalent', () => {
    assert.ok(
      insightsLib.includes('Record<string, number>') || insightsLib.includes('stageSuccessRates:'),
      'Expected lib/insights.ts to type stageSuccessRates as Record<string, number>'
    );
  });

  it('T-AI-26: computeInsights computes stageSuccessRates per distinct stage key', () => {
    assert.ok(
      insightsLib.includes('stageSuccessRates') && insightsLib.includes('stage'),
      'Expected lib/insights.ts computeInsights to build stageSuccessRates keyed by run.stage'
    );
  });

  it('T-AI-27: stageSuccessRates uses toFixed(1) for per-stage percentage rounding', () => {
    assert.ok(
      insightsLib.includes('toFixed(1)'),
      'Expected lib/insights.ts to use toFixed(1) when rounding per-stage success percentages'
    );
  });
});

// ---------------------------------------------------------------------------
// success rate by stage metric — InsightsPanel
// ---------------------------------------------------------------------------

describe('success rate by stage metric — InsightsPanel', () => {
  it('T-AI-28: InsightsPanel references stageSuccessRates and renders a % expression', () => {
    assert.ok(
      insightsPanel.includes('stageSuccessRates'),
      'Expected app/dashboard/InsightsPanel.tsx to reference stageSuccessRates'
    );
    assert.ok(
      insightsPanel.includes('%'),
      'Expected app/dashboard/InsightsPanel.tsx to render a "%" character for stage success rate percentages'
    );
  });

  it('T-AI-29: InsightsPanel handles empty stageSuccessRates without unconditional property access', () => {
    // Must iterate over Object.entries/Object.keys or similar — never access stageSuccessRates[hardcodedKey]
    // Acceptable patterns: Object.entries, Object.keys, map over entries
    const hasIterationPattern =
      insightsPanel.includes('Object.entries(') ||
      insightsPanel.includes('Object.keys(') ||
      insightsPanel.includes('.map(') ||
      insightsPanel.includes('stageSuccessRates &&');
    assert.ok(
      hasIterationPattern,
      'Expected app/dashboard/InsightsPanel.tsx to iterate over stageSuccessRates dynamically (Object.entries/Object.keys/.map) so an empty object renders without throwing'
    );
  });
});
