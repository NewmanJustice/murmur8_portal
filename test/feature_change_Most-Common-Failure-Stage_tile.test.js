/**
 * Tests for feature: change_Most-Common-Failure-Stage_tile
 * Test IDs: T-MCFS-01 through T-MCFS-12
 * Runner: node --test test/feature_change_Most-Common-Failure-Stage_tile.test.js
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
const insightsPanel = fs.readFileSync(path.join(projectRoot, 'app/dashboard/InsightsPanel.tsx'), 'utf8');

// ---------------------------------------------------------------------------
// Old red styles removed
// ---------------------------------------------------------------------------

describe('Most Common Failure Stage tile — old red styles removed', () => {
  it('T-MCFS-01: file does NOT contain border-red-200', () => {
    assert.ok(
      !insightsPanel.includes('border-red-200'),
      'Expected InsightsPanel.tsx to NOT contain border-red-200'
    );
  });

  it('T-MCFS-02: file does NOT contain bg-red-50', () => {
    assert.ok(
      !insightsPanel.includes('bg-red-50'),
      'Expected InsightsPanel.tsx to NOT contain bg-red-50'
    );
  });

  it('T-MCFS-03: file does NOT contain text-red-500', () => {
    assert.ok(
      !insightsPanel.includes('text-red-500'),
      'Expected InsightsPanel.tsx to NOT contain text-red-500'
    );
  });

  it('T-MCFS-04: file does NOT contain text-red-700', () => {
    assert.ok(
      !insightsPanel.includes('text-red-700'),
      'Expected InsightsPanel.tsx to NOT contain text-red-700'
    );
  });

  it('T-MCFS-05: file does NOT contain text-red-400', () => {
    assert.ok(
      !insightsPanel.includes('text-red-400'),
      'Expected InsightsPanel.tsx to NOT contain text-red-400'
    );
  });

  it('T-MCFS-06: file does NOT contain subtitle text', () => {
    assert.ok(
      !insightsPanel.includes('This stage fails more often'),
      'Expected InsightsPanel.tsx to NOT contain the old subtitle text'
    );
  });
});

// ---------------------------------------------------------------------------
// New standard stat card styles applied
// ---------------------------------------------------------------------------

describe('Most Common Failure Stage tile — new stat card styles applied', () => {
  it('T-MCFS-07: conditional rendering preserved (mostCommonFailureStage !== null)', () => {
    assert.ok(
      insightsPanel.includes('mostCommonFailureStage !== null'),
      'Expected conditional guard mostCommonFailureStage !== null to be present'
    );
  });

  it('T-MCFS-08: tile uses rounded-brand class', () => {
    // Extract the failure callout block (between the conditional and its closing)
    const conditionalIdx = insightsPanel.indexOf('mostCommonFailureStage !== null');
    const blockAfter = insightsPanel.slice(conditionalIdx, conditionalIdx + 400);
    assert.ok(
      blockAfter.includes('rounded-brand'),
      'Expected failure tile block to contain rounded-brand'
    );
  });

  it('T-MCFS-09: tile uses border-starling-cyan/30 and bg-white', () => {
    const conditionalIdx = insightsPanel.indexOf('mostCommonFailureStage !== null');
    const blockAfter = insightsPanel.slice(conditionalIdx, conditionalIdx + 400);
    assert.ok(
      blockAfter.includes('border-starling-cyan/30'),
      'Expected failure tile block to contain border-starling-cyan/30'
    );
    assert.ok(
      blockAfter.includes('bg-white'),
      'Expected failure tile block to contain bg-white'
    );
  });

  it('T-MCFS-10: tile label uses text-starling-slate', () => {
    const conditionalIdx = insightsPanel.indexOf('mostCommonFailureStage !== null');
    const blockAfter = insightsPanel.slice(conditionalIdx, conditionalIdx + 400);
    assert.ok(
      blockAfter.includes('text-starling-slate'),
      'Expected failure tile label to use text-starling-slate'
    );
  });

  it('T-MCFS-11: tile value uses text-starling-ink', () => {
    const conditionalIdx = insightsPanel.indexOf('mostCommonFailureStage !== null');
    const blockAfter = insightsPanel.slice(conditionalIdx, conditionalIdx + 400);
    assert.ok(
      blockAfter.includes('text-starling-ink'),
      'Expected failure tile value to use text-starling-ink'
    );
  });

  it('T-MCFS-12: label text "Most Common Failure Stage" is preserved', () => {
    assert.ok(
      insightsPanel.includes('Most Common Failure Stage'),
      'Expected label text "Most Common Failure Stage" to remain in the file'
    );
  });

  it('T-MCFS-13: tile is inside the upper stat cards grid (sm:grid-cols-4)', () => {
    const upperGridStart = insightsPanel.indexOf('sm:grid-cols-4');
    const upperGridEnd = insightsPanel.indexOf('</div>', insightsPanel.indexOf('</div>', upperGridStart + 1));
    const failureTileIdx = insightsPanel.indexOf('Most Common Failure Stage');
    assert.ok(
      failureTileIdx > upperGridStart,
      'Expected Most Common Failure Stage tile to appear after the sm:grid-cols-4 grid opens'
    );
    // Ensure it's NOT in the lower lg:grid-cols-3 section
    const lowerGridStart = insightsPanel.indexOf('lg:grid-cols-3');
    assert.ok(
      failureTileIdx < lowerGridStart || lowerGridStart === -1,
      'Expected Most Common Failure Stage tile to NOT be in the lower lg:grid-cols-3 section'
    );
  });
});
