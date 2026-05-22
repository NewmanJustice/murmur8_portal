/**
 * Tests for feature: adjust-stage-table
 * Test IDs: T-AST-01 through T-AST-18
 * Runner: node --test test/feature_adjust-stage-table.test.js
 *
 * All tests are pure file-content assertions or direct JS imports — no browser, no DOM, no build step.
 *
 * File-content tests read source files with fs.readFileSync and assert on string content.
 * Unit tests import computeStageAverages from lib/insights.js (plain-JS mirror of insights.ts).
 *
 * Expected state BEFORE Codey implements the feature: all tests FAIL.
 * Expected state AFTER Codey implements the feature: all tests PASS.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { computeStageAverages } from '../lib/insights.js';

const projectRoot = process.cwd();

const insightsPanelPath = path.join(projectRoot, 'app/dashboard/InsightsPanel.tsx');
const insightsTsPath    = path.join(projectRoot, 'lib/insights.ts');

const panelContent  = fs.readFileSync(insightsPanelPath, 'utf8');
const insightsTsContent = fs.readFileSync(insightsTsPath, 'utf8');

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function makeRun(overrides = {}) {
  return {
    status: 'success',
    totalDurationMs: null,
    totalCost: null,
    failedStage: null,
    stages: null,
    type: null,
    slug: null,
    stage: null,
    startedAt: null,
    repoName: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// T-AST-01 to T-AST-03: InsightsPanel layout (story tw-01)
// ---------------------------------------------------------------------------

describe('InsightsPanel — stage table full-width layout (tw-01)', () => {
  it('T-AST-01: stage table wrapper does NOT carry lg:col-span-2 class', () => {
    assert.ok(
      !panelContent.includes('lg:col-span-2'),
      'Expected InsightsPanel.tsx to NOT contain "lg:col-span-2" — stage table should be full width'
    );
  });

  it('T-AST-02: stage table is NOT inside a lg:grid-cols-3 wrapper', () => {
    assert.ok(
      !panelContent.includes('lg:grid-cols-3'),
      'Expected InsightsPanel.tsx to NOT contain "lg:grid-cols-3" — the 3-col grid wrapper should be removed'
    );
  });

  it('T-AST-03: overflow-x-auto is still present for narrow screen scrolling', () => {
    assert.ok(
      panelContent.includes('overflow-x-auto'),
      'Expected InsightsPanel.tsx to still contain "overflow-x-auto" for horizontal scroll on narrow screens'
    );
  });
});

// ---------------------------------------------------------------------------
// T-AST-04 to T-AST-08: InsightsPanel glyph prefix (story ag-01)
// ---------------------------------------------------------------------------

describe('InsightsPanel — agent glyph prefix on stage name cell (ag-01)', () => {
  it('T-AST-04: stage name <span> does NOT use border-l-2 or pl-2 CSS classes', () => {
    assert.ok(
      !panelContent.includes('border-l-2'),
      'Expected InsightsPanel.tsx to NOT contain "border-l-2" — replaced by glyph prefix'
    );
    assert.ok(
      !panelContent.includes(' pl-2'),
      'Expected InsightsPanel.tsx to NOT contain " pl-2" — replaced by glyph prefix'
    );
  });

  it('T-AST-05: glyph string "} alex" is present for alex stage (1 brace)', () => {
    assert.ok(
      panelContent.includes('} alex'),
      'Expected InsightsPanel.tsx to contain "} alex" as the glyph-prefixed label for the alex stage'
    );
  });

  it('T-AST-06: glyph string "}} cass" is present for cass stage (2 braces)', () => {
    assert.ok(
      panelContent.includes('}} cass'),
      'Expected InsightsPanel.tsx to contain "}} cass" as the glyph-prefixed label for the cass stage'
    );
  });

  it('T-AST-07: glyph prefix "}}} " is present for nigel stages (3 braces)', () => {
    assert.ok(
      panelContent.includes('}}} nigel'),
      'Expected InsightsPanel.tsx to contain "}}} nigel" prefix for nigel-spec / nigel-tests stages'
    );
  });

  it('T-AST-08: glyph prefix "}}}} " is present for codey stages (4 braces)', () => {
    assert.ok(
      panelContent.includes('}}}} codey'),
      'Expected InsightsPanel.tsx to contain "}}}} codey" prefix for codey-plan / codey-implement stages'
    );
  });
});

// ---------------------------------------------------------------------------
// T-AST-09 to T-AST-14: File-content tests for new columns (story nc-01)
// ---------------------------------------------------------------------------

describe('lib/insights.ts — StageAverage type and computeStageAverages source (nc-01)', () => {
  it('T-AST-09: StageAverage type declares avgTokens and avgFeedbackRating fields', () => {
    // Extract the StageAverage interface block and assert on its contents
    const interfaceMatch = insightsTsContent.match(/interface StageAverage\s*\{[^}]+\}/);
    assert.ok(
      interfaceMatch,
      'Expected to find "interface StageAverage {" in lib/insights.ts'
    );
    const interfaceBody = interfaceMatch[0];
    assert.ok(
      interfaceBody.includes('avgTokens'),
      `Expected StageAverage interface to declare "avgTokens" field. Interface body: ${interfaceBody}`
    );
    assert.ok(
      interfaceBody.includes('avgFeedbackRating'),
      `Expected StageAverage interface to declare "avgFeedbackRating" field. Interface body: ${interfaceBody}`
    );
  });

  it('T-AST-10: computeStageAverages function body reads tokens from stageData', () => {
    // Extract the computeStageAverages function body
    const fnStart = insightsTsContent.indexOf('function computeStageAverages');
    assert.ok(fnStart !== -1, 'Expected "function computeStageAverages" in lib/insights.ts');
    const fnBody = insightsTsContent.slice(fnStart);
    assert.ok(
      fnBody.includes('.tokens'),
      'Expected computeStageAverages body to reference ".tokens" on stageData for avgTokens computation'
    );
  });

  it('T-AST-11: computeStageAverages function body reads feedback.rating from stageData', () => {
    const fnStart = insightsTsContent.indexOf('function computeStageAverages');
    assert.ok(fnStart !== -1, 'Expected "function computeStageAverages" in lib/insights.ts');
    const fnBody = insightsTsContent.slice(fnStart);
    assert.ok(
      fnBody.includes('.feedback'),
      'Expected computeStageAverages body to reference ".feedback" on stageData for avgFeedbackRating computation'
    );
  });
});

describe('InsightsPanel.tsx — Avg Tokens and Avg Feedback Rating columns (nc-01)', () => {
  it('T-AST-12: table header row contains "Avg Total Tokens" and "Avg Feedback Rating" <th> cells', () => {
    assert.ok(
      panelContent.includes('Avg Total Tokens'),
      'Expected InsightsPanel.tsx to contain "Avg Total Tokens" as a table header'
    );
    assert.ok(
      panelContent.includes('Avg Feedback Rating'),
      'Expected InsightsPanel.tsx to contain "Avg Feedback Rating" as a table header'
    );
  });

  it('T-AST-13: table body renders avgTokens value (comma-grouped integer or dash fallback)', () => {
    // The cell should reference avgTokens and either format it or show the em-dash fallback
    assert.ok(
      panelContent.includes('avgTokens'),
      'Expected InsightsPanel.tsx to reference "avgTokens" in the table body <td> cell'
    );
    // Null fallback: em-dash '—'
    const hasEmDash = panelContent.includes('—') || panelContent.includes('&mdash;') || panelContent.includes('—');
    assert.ok(
      hasEmDash,
      'Expected InsightsPanel.tsx to use an em-dash (—) as the null fallback in avgTokens <td>'
    );
  });

  it('T-AST-14: table body renders avgFeedbackRating as a per-stage <td> cell (not just the global stat card)', () => {
    // The stage table body must destructure or reference avgFeedbackRating from a StageAverage entry.
    // We detect this by looking for avgFeedbackRating in the context of stageAverages.map (the per-row render).
    const stageMapIdx = panelContent.indexOf('stageAverages.map');
    assert.ok(
      stageMapIdx !== -1,
      'Expected InsightsPanel.tsx to have stageAverages.map(...) for the stage table rows'
    );
    // Extract from the map call onward to find the avgFeedbackRating reference inside the row renderer
    const afterMap = panelContent.slice(stageMapIdx);
    assert.ok(
      afterMap.includes('avgFeedbackRating'),
      'Expected InsightsPanel.tsx stage row renderer (after stageAverages.map) to reference "avgFeedbackRating" in a <td> cell'
    );
  });
});

// ---------------------------------------------------------------------------
// T-AST-15 to T-AST-18: computeStageAverages unit tests (story nc-01)
// ---------------------------------------------------------------------------

describe('computeStageAverages — avgTokens unit tests (nc-01)', () => {
  it('T-AST-15: avgTokens is arithmetic mean of stageData.tokens.input+output, rounded to nearest integer', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 1000, tokens: { input: 1000, output: 2000 } } } }),
      makeRun({ stages: { alex: { durationMs: 2000, tokens: { input: 2000, output: 3000 } } } }),
    ];
    const result = computeStageAverages(runs);
    const alex = result.find(r => r.key === 'alex');
    assert.ok(alex, 'Expected alex entry in results');
    // run1 total=3000, run2 total=5000, mean=4000
    assert.equal(
      alex.avgTokens,
      4000,
      `Expected avgTokens to be 4000 (mean of 3000 and 5000) but got ${alex.avgTokens}`
    );
  });

  it('T-AST-16: avgTokens is null when no runs have stageData.tokens for that stage', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 1000 } } }), // no tokens field
    ];
    const result = computeStageAverages(runs);
    const alex = result.find(r => r.key === 'alex');
    assert.ok(alex, 'Expected alex entry in results');
    assert.equal(
      alex.avgTokens,
      null,
      `Expected avgTokens to be null when stageData.tokens is absent, but got ${alex.avgTokens}`
    );
  });
});

describe('computeStageAverages — avgFeedbackRating unit tests (nc-01)', () => {
  it('T-AST-17: avgFeedbackRating is arithmetic mean of stageData.feedback.rating, to 1 decimal place', () => {
    const runs = [
      makeRun({ stages: { cass: { durationMs: 1000, feedback: { rating: 4 } } } }),
      makeRun({ stages: { cass: { durationMs: 2000, feedback: { rating: 5 } } } }),
      makeRun({ stages: { cass: { durationMs: 1500, feedback: { rating: 3 } } } }),
    ];
    const result = computeStageAverages(runs);
    const cass = result.find(r => r.key === 'cass');
    assert.ok(cass, 'Expected cass entry in results');
    // mean of 4, 5, 3 = 4.0
    assert.equal(
      cass.avgFeedbackRating,
      4.0,
      `Expected avgFeedbackRating 4.0 (mean of 4,5,3) but got ${cass.avgFeedbackRating}`
    );
  });

  it('T-AST-17b: avgFeedbackRating rounds correctly to 1 decimal place', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 1000, feedback: { rating: 4 } } } }),
      makeRun({ stages: { alex: { durationMs: 1000, feedback: { rating: 5 } } } }),
    ];
    const result = computeStageAverages(runs);
    const alex = result.find(r => r.key === 'alex');
    assert.ok(alex, 'Expected alex entry in results');
    // mean of 4,5 = 4.5
    assert.equal(
      alex.avgFeedbackRating,
      4.5,
      `Expected avgFeedbackRating 4.5 but got ${alex.avgFeedbackRating}`
    );
  });

  it('T-AST-18: avgFeedbackRating is null when no runs have stageData.feedback.rating for that stage', () => {
    const runs = [
      makeRun({ stages: { alex: { durationMs: 1000 } } }), // no feedback
      makeRun({ stages: { alex: { durationMs: 2000, feedback: null } } }), // null feedback
    ];
    const result = computeStageAverages(runs);
    const alex = result.find(r => r.key === 'alex');
    assert.ok(alex, 'Expected alex entry in results');
    assert.equal(
      alex.avgFeedbackRating,
      null,
      `Expected avgFeedbackRating to be null when feedback.rating is absent, but got ${alex.avgFeedbackRating}`
    );
  });
});
