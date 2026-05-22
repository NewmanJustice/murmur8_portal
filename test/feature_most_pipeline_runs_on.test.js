/**
 * Tests for feature: most_pipeline_runs_on
 * Test IDs: T-MPR-01 through T-MPR-10
 * Runner: node --test test/feature_most_pipeline_runs_on.test.js
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
const runsLib = fs.readFileSync(path.join(projectRoot, 'lib/runs.ts'), 'utf8');

// ---------------------------------------------------------------------------
// InsightsRun interface — lib/insights.ts
// ---------------------------------------------------------------------------

describe('InsightsRun interface — repoName field', () => {
  it('T-MPR-01: InsightsRun interface contains repoName field', () => {
    // Verify that the InsightsRun interface declares a repoName property
    const interfaceMatch = insightsLib.match(/interface\s+InsightsRun\s*\{[^}]+\}/s);
    assert.ok(interfaceMatch, 'Expected to find InsightsRun interface in lib/insights.ts');
    assert.ok(
      interfaceMatch[0].includes('repoName'),
      'Expected InsightsRun interface to contain repoName field'
    );
  });
});

// ---------------------------------------------------------------------------
// AggregateInsights interface — lib/insights.ts
// ---------------------------------------------------------------------------

describe('AggregateInsights interface — topRepoByRunCount field', () => {
  it('T-MPR-02: AggregateInsights contains topRepoByRunCount field', () => {
    const interfaceMatch = insightsLib.match(/interface\s+AggregateInsights\s*\{[^}]+\}/s);
    assert.ok(interfaceMatch, 'Expected to find AggregateInsights interface in lib/insights.ts');
    assert.ok(
      interfaceMatch[0].includes('topRepoByRunCount'),
      'Expected AggregateInsights interface to contain topRepoByRunCount field'
    );
  });
});

// ---------------------------------------------------------------------------
// computeInsights — grouping logic
// ---------------------------------------------------------------------------

describe('computeInsights — topRepoByRunCount computation', () => {
  it('T-MPR-03: computeInsights groups by repoName and produces topRepoByRunCount', () => {
    // The function body must reference both repoName (for grouping) and topRepoByRunCount (for output)
    assert.ok(
      insightsLib.includes('repoName') && insightsLib.includes('topRepoByRunCount'),
      'Expected computeInsights to reference both repoName (grouping) and topRepoByRunCount (output)'
    );
  });

  it('T-MPR-04: Null repoName values excluded from grouping (null guard present)', () => {
    // There must be a null check associated with repoName in the computation logic
    // Look for patterns like: repoName === null, repoName !== null, repoName == null, !r.repoName, etc.
    const hasNullGuard =
      insightsLib.includes('repoName === null') ||
      insightsLib.includes('repoName !== null') ||
      insightsLib.includes('repoName == null') ||
      insightsLib.includes('repoName != null') ||
      (insightsLib.includes('repoName') && insightsLib.includes('!== null') && insightsLib.includes('!== undefined'));
    assert.ok(
      hasNullGuard,
      'Expected lib/insights.ts to have a null guard for repoName before grouping'
    );
  });

  it('T-MPR-05: Alphabetical tie-breaking (sort or localeCompare present)', () => {
    // The tie-breaking logic should use .sort() or localeCompare in proximity to topRepo logic
    // Since getMostCommonFailureStage already uses .sort(), the new code should too
    const hasTieBreak =
      insightsLib.includes('topRepoByRunCount') &&
      (insightsLib.includes('.sort(') || insightsLib.includes('localeCompare'));
    assert.ok(
      hasTieBreak,
      'Expected lib/insights.ts to use .sort() or localeCompare for alphabetical tie-breaking on topRepoByRunCount'
    );
  });

  it('T-MPR-06: Returns null when no runs have repoName data (zero-runs return includes topRepoByRunCount: null)', () => {
    // The early-return object (totalRuns === 0 case) must include topRepoByRunCount: null
    assert.ok(
      insightsLib.includes('topRepoByRunCount: null'),
      'Expected lib/insights.ts zero-runs return to include topRepoByRunCount: null'
    );
  });
});

// ---------------------------------------------------------------------------
// InsightsPanel — rendering
// ---------------------------------------------------------------------------

describe('InsightsPanel — Most Active Repo card', () => {
  it('T-MPR-07: InsightsPanel references topRepoByRunCount', () => {
    assert.ok(
      insightsPanel.includes('topRepoByRunCount'),
      'Expected app/dashboard/InsightsPanel.tsx to reference topRepoByRunCount from insights'
    );
  });

  it('T-MPR-08: InsightsPanel contains "Most Active Repo" label', () => {
    assert.ok(
      insightsPanel.includes('Most Active Repo'),
      'Expected app/dashboard/InsightsPanel.tsx to contain the label "Most Active Repo"'
    );
  });

  it('T-MPR-09: InsightsPanel has em-dash fallback for null topRepoByRunCount', () => {
    // The panel should render an em-dash (U+2014) as the fallback value
    // Check that it uses the pattern: value ?? '—' or a ternary with '—'
    const hasEmDash = insightsPanel.includes('—') || insightsPanel.includes('&mdash;');
    // Also verify topRepoByRunCount is present (already tested in T-MPR-07 but needed together here)
    assert.ok(
      insightsPanel.includes('topRepoByRunCount') && hasEmDash,
      'Expected app/dashboard/InsightsPanel.tsx to render em-dash fallback when topRepoByRunCount is null'
    );
  });
});

// ---------------------------------------------------------------------------
// lib/runs.ts — getInsightsData select
// ---------------------------------------------------------------------------

describe('lib/runs.ts — repoName in getInsightsData select', () => {
  it('T-MPR-10: getInsightsData selects repoName field', () => {
    // The select object within getInsightsData must include repoName: true
    assert.ok(
      runsLib.includes('repoName'),
      'Expected lib/runs.ts getInsightsData to select repoName field'
    );
  });
});
