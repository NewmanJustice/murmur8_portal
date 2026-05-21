/**
 * Tests for feature: add-murmur8-logo-full-to-dashboard
 * Test IDs: T-FL-01 through T-FL-06
 * Runner: node --test test/feature_add-murmur8-logo-full-to-dashboard.test.js
 *
 * All tests are pure file-content assertions — no browser, no DOM, no build step.
 * Tests read app/dashboard/page.tsx directly from disk using fs.readFileSync.
 *
 * Expected state BEFORE Codey implements the feature: all 6 tests FAIL.
 * Expected state AFTER Codey implements the feature: all 6 tests PASS.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const dashboardPath = path.join(projectRoot, 'app/dashboard/page.tsx');

// ---------------------------------------------------------------------------
// Helper: return 1-based line number of first line matching a string,
// or -1 if not found.
// ---------------------------------------------------------------------------
function firstLineContaining(lines, needle) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) return i + 1; // 1-based
  }
  return -1;
}

// ---------------------------------------------------------------------------
// dashboard full logo hero
// ---------------------------------------------------------------------------

describe('dashboard full logo hero', () => {
  // Read file once; all tests share it.
  const content = fs.readFileSync(dashboardPath, 'utf8');
  const lines = content.split('\n');

  // -------------------------------------------------------------------------
  // T-FL-01 — AC-1: Full logo Image element present
  // -------------------------------------------------------------------------
  it('T-FL-01: dashboard page contains <Image src="/murmur8-logo-full.svg"', () => {
    assert.ok(
      content.includes('src="/murmur8-logo-full.svg"'),
      `Expected app/dashboard/page.tsx to contain src="/murmur8-logo-full.svg" but it was not found.\n` +
      `File path: ${dashboardPath}`
    );
  });

  // -------------------------------------------------------------------------
  // T-FL-02 — AC-2: Full-logo line appears before <InsightsPanel
  // -------------------------------------------------------------------------
  it('T-FL-02: full logo line appears before <InsightsPanel in source order', () => {
    const logoLine = firstLineContaining(lines, 'src="/murmur8-logo-full.svg"');
    const insightsPanelLine = firstLineContaining(lines, '<InsightsPanel');

    assert.ok(
      logoLine !== -1,
      `Expected src="/murmur8-logo-full.svg" to appear in app/dashboard/page.tsx but was not found`
    );
    assert.ok(
      insightsPanelLine !== -1,
      `Expected <InsightsPanel to appear in app/dashboard/page.tsx but was not found`
    );
    assert.ok(
      logoLine < insightsPanelLine,
      `Expected full-logo line (${logoLine}) to appear before <InsightsPanel line (${insightsPanelLine})`
    );
  });

  // -------------------------------------------------------------------------
  // T-FL-03 — AC-3: Full-logo is inside the content div, not the header.
  //           Order: </header> < logo < <InsightsPanel
  // -------------------------------------------------------------------------
  it('T-FL-03: full logo line appears after </header> and before <InsightsPanel', () => {
    const headerCloseLine = firstLineContaining(lines, '</header>');
    const logoLine = firstLineContaining(lines, 'src="/murmur8-logo-full.svg"');
    const insightsPanelLine = firstLineContaining(lines, '<InsightsPanel');

    assert.ok(
      headerCloseLine !== -1,
      `Expected </header> to appear in app/dashboard/page.tsx but was not found`
    );
    assert.ok(
      logoLine !== -1,
      `Expected src="/murmur8-logo-full.svg" to appear in app/dashboard/page.tsx but was not found`
    );
    assert.ok(
      insightsPanelLine !== -1,
      `Expected <InsightsPanel to appear in app/dashboard/page.tsx but was not found`
    );
    assert.ok(
      headerCloseLine < logoLine,
      `Expected full-logo line (${logoLine}) to appear after </header> line (${headerCloseLine})`
    );
    assert.ok(
      logoLine < insightsPanelLine,
      `Expected full-logo line (${logoLine}) to appear before <InsightsPanel line (${insightsPanelLine})`
    );
  });

  // -------------------------------------------------------------------------
  // T-FL-04 — AC-4: Centering class (mx-auto or justify-center) within 5 lines
  //           of the full-logo Image.
  // -------------------------------------------------------------------------
  it('T-FL-04: mx-auto or justify-center appears within 5 lines of the full-logo Image', () => {
    const logoLine = firstLineContaining(lines, 'src="/murmur8-logo-full.svg"');

    assert.ok(
      logoLine !== -1,
      `Expected src="/murmur8-logo-full.svg" to appear in app/dashboard/page.tsx but was not found`
    );

    const windowStart = Math.max(0, logoLine - 1 - 2);      // 0-based, 2 lines before
    const windowEnd   = Math.min(lines.length, logoLine + 3); // 0-based exclusive, 2 lines after
    const windowText  = lines.slice(windowStart, windowEnd).join('\n');

    const hasCentering =
      windowText.includes('mx-auto') || windowText.includes('justify-center');

    assert.ok(
      hasCentering,
      `Expected "mx-auto" or "justify-center" to appear within 5 lines of the full-logo Image (lines ${windowStart + 1}–${windowEnd}) but neither was found.\n` +
      `Window content:\n${windowText}`
    );
  });

  // -------------------------------------------------------------------------
  // T-FL-05 — AC-5: priority attribute on the full-logo Image element.
  //           Checks a 10-line window around the src= line to handle multi-line JSX.
  // -------------------------------------------------------------------------
  it('T-FL-05: full-logo <Image> element includes the priority attribute', () => {
    const logoLine = firstLineContaining(lines, 'src="/murmur8-logo-full.svg"');

    assert.ok(
      logoLine !== -1,
      `Expected src="/murmur8-logo-full.svg" to appear in app/dashboard/page.tsx but was not found`
    );

    const windowStart = Math.max(0, logoLine - 1 - 4);       // up to 4 lines before src=
    const windowEnd   = Math.min(lines.length, logoLine + 6); // up to 5 lines after src=
    const windowText  = lines.slice(windowStart, windowEnd).join('\n');

    assert.ok(
      windowText.includes('priority'),
      `Expected "priority" attribute to appear on the full-logo <Image> element (lines ${windowStart + 1}–${windowEnd}) but it was not found.\n` +
      `Window content:\n${windowText}`
    );
  });

  // -------------------------------------------------------------------------
  // T-FL-06 — AC-6: Compact nav logo still present and still inside <header>.
  //           Checks that compact-logo line < </header> line.
  // -------------------------------------------------------------------------
  it('T-FL-06: compact logo (/murmur8-logo-compact.svg) is still present inside <header>', () => {
    const compactLogoLine = firstLineContaining(lines, 'src="/murmur8-logo-compact.svg"');
    const headerCloseLine = firstLineContaining(lines, '</header>');

    assert.ok(
      compactLogoLine !== -1,
      `Expected src="/murmur8-logo-compact.svg" to appear in app/dashboard/page.tsx but was not found`
    );
    assert.ok(
      headerCloseLine !== -1,
      `Expected </header> to appear in app/dashboard/page.tsx but was not found`
    );
    assert.ok(
      compactLogoLine < headerCloseLine,
      `Expected compact-logo line (${compactLogoLine}) to appear before </header> line (${headerCloseLine}), ` +
      `i.e. inside the header block`
    );
  });
});
