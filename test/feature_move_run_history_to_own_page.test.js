/**
 * Tests for feature: move_run_history_to_own_page
 * Test IDs: T-RH-01 through T-RH-19
 * Runner: node --test test/feature_move_run_history_to_own_page.test.js
 *
 * All tests are pure file-content assertions — no browser, no DOM, no build step.
 * Tests read files directly from disk using fs.readFileSync with paths relative
 * to the project root (process.cwd()).
 *
 * Expected state BEFORE Codey implements the feature: all tests FAIL.
 * Expected state AFTER Codey implements the feature: all tests PASS.
 *
 * Note: Tests targeting app/dashboard/runs/page.tsx gracefully handle the case
 * where that file does not yet exist (content defaults to '' on read error).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

// Helper: read a file, return '' if it does not exist yet.
function readOrEmpty(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

const dashPath = path.join(projectRoot, 'app/dashboard/page.tsx');
const runsPath = path.join(projectRoot, 'app/dashboard/runs/page.tsx');

// ---------------------------------------------------------------------------
// dashboard page — run history removed
// ---------------------------------------------------------------------------

describe('dashboard page — run history removed', () => {
  it('T-RH-01: "Run History" nav link present with href /dashboard/runs', () => {
    const content = fs.readFileSync(dashPath, 'utf8');
    assert.ok(
      content.includes('href="/dashboard/runs"'),
      `Expected dashboard page to contain href="/dashboard/runs" for the Run History nav link`
    );
    assert.ok(
      content.includes('Run History'),
      `Expected dashboard page to contain the text "Run History" in a nav link`
    );
  });

  it('T-RH-02: "Run History" link shares identical className with "API Keys" link', () => {
    const content = fs.readFileSync(dashPath, 'utf8');
    // Extract className values from all <a> elements inside the nav
    // Strategy: both links must share the same className string value.
    // We extract the className attribute from the "API Keys" anchor and verify
    // the "Run History" anchor uses the exact same value.
    const apiKeysMatch = content.match(/<a\s[^>]*href="\/keys"[^>]*className="([^"]+)"/);
    const apiKeysClassFromEnd = content.match(/href="\/keys"\s[^>]*className="([^"]+)"/);
    const apiKeysClass = (apiKeysMatch && apiKeysMatch[1]) || (apiKeysClassFromEnd && apiKeysClassFromEnd[1]);

    const runHistoryMatch = content.match(/<a\s[^>]*href="\/dashboard\/runs"[^>]*className="([^"]+)"/);
    const runHistoryClassFromEnd = content.match(/href="\/dashboard\/runs"\s[^>]*className="([^"]+)"/);
    const runHistoryClass = (runHistoryMatch && runHistoryMatch[1]) || (runHistoryClassFromEnd && runHistoryClassFromEnd[1]);

    assert.ok(
      apiKeysClass !== undefined && apiKeysClass !== null,
      `Could not extract className from the "API Keys" anchor in dashboard page`
    );
    assert.ok(
      runHistoryClass !== undefined && runHistoryClass !== null,
      `Could not extract className from the "Run History" anchor in dashboard page`
    );
    assert.equal(
      runHistoryClass,
      apiKeysClass,
      `Expected "Run History" link to have the same className as the "API Keys" link, but got:\n  API Keys: "${apiKeysClass}"\n  Run History: "${runHistoryClass}"`
    );
  });

  it('T-RH-03: RunsTable is NOT imported or used on the dashboard page', () => {
    const content = fs.readFileSync(dashPath, 'utf8');
    assert.ok(
      !content.includes('RunsTable'),
      `Expected "RunsTable" to be absent from app/dashboard/page.tsx but it is still present`
    );
  });

  it('T-RH-04: No filter form with status/slug inputs on the dashboard page', () => {
    const content = fs.readFileSync(dashPath, 'utf8');
    // The filter form has <form with inputs named "status" and "slug"
    const hasFilterForm = content.includes('name="status"') || content.includes('name="slug"');
    assert.ok(
      !hasFilterForm,
      `Expected no filter inputs (name="status" / name="slug") on app/dashboard/page.tsx but found some`
    );
  });

  it('T-RH-05: No pagination controls on the dashboard page', () => {
    const content = fs.readFileSync(dashPath, 'utf8');
    assert.ok(
      !content.includes('← Previous'),
      `Expected "← Previous" pagination anchor to be absent from app/dashboard/page.tsx`
    );
    assert.ok(
      !content.includes('Next →'),
      `Expected "Next →" pagination anchor to be absent from app/dashboard/page.tsx`
    );
  });

  it('T-RH-06: getUserRuns is NOT called on the dashboard page', () => {
    const content = fs.readFileSync(dashPath, 'utf8');
    assert.ok(
      !content.includes('getUserRuns'),
      `Expected "getUserRuns" to be absent from app/dashboard/page.tsx but it is still present`
    );
  });

  it('T-RH-07: InsightsPanel is still rendered on the dashboard page', () => {
    const content = fs.readFileSync(dashPath, 'utf8');
    assert.ok(
      content.includes('<InsightsPanel'),
      `Expected "<InsightsPanel" to remain in app/dashboard/page.tsx`
    );
  });
});

// ---------------------------------------------------------------------------
// runs page — dedicated page
// ---------------------------------------------------------------------------

describe('runs page — dedicated page', () => {
  it('T-RH-08: RunsTable is rendered on the runs page', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('<RunsTable'),
      `Expected "<RunsTable" to appear in app/dashboard/runs/page.tsx (file may not exist yet)`
    );
  });

  it('T-RH-09: Filter form present with status, slug, dateFrom, dateTo inputs', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('name="status"'),
      `Expected name="status" filter input in app/dashboard/runs/page.tsx`
    );
    assert.ok(
      content.includes('name="slug"'),
      `Expected name="slug" filter input in app/dashboard/runs/page.tsx`
    );
    assert.ok(
      content.includes('name="dateFrom"'),
      `Expected name="dateFrom" filter input in app/dashboard/runs/page.tsx`
    );
    assert.ok(
      content.includes('name="dateTo"'),
      `Expected name="dateTo" filter input in app/dashboard/runs/page.tsx`
    );
  });

  it('T-RH-10: Pagination controls present on the runs page', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('← Previous') || content.includes('Next →'),
      `Expected pagination controls ("← Previous" or "Next →") in app/dashboard/runs/page.tsx`
    );
  });

  it('T-RH-11: Clear-filters link targets /dashboard/runs (not /dashboard)', () => {
    const content = readOrEmpty(runsPath);
    // The Clear link and empty-state "clearing your filters" link must use /dashboard/runs
    assert.ok(
      content.includes('href="/dashboard/runs"'),
      `Expected at least one href="/dashboard/runs" (clear-filters or empty-state link) in app/dashboard/runs/page.tsx`
    );
    // Count occurrences: there should be more than one /dashboard/runs href
    // (clear filters button + empty state link + possibly pagination base)
    const runHrefCount = (content.match(/href="\/dashboard\/runs/g) || []).length;
    assert.ok(
      runHrefCount >= 2,
      `Expected multiple href="/dashboard/runs..." links in runs page (clear filters + empty state), found ${runHrefCount}`
    );
  });

  it('T-RH-12: Pagination hrefs use /dashboard/runs as the base URL', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('/dashboard/runs?'),
      `Expected pagination href templates to use "/dashboard/runs?" as the base in app/dashboard/runs/page.tsx`
    );
  });

  it('T-RH-13: metadata title is "Run History — murmur8 portal"', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes("'Run History — murmur8 portal'") ||
      content.includes('"Run History — murmur8 portal"'),
      `Expected metadata title 'Run History — murmur8 portal' in app/dashboard/runs/page.tsx`
    );
  });
});

// ---------------------------------------------------------------------------
// runs page — header and nav
// ---------------------------------------------------------------------------

describe('runs page — header and nav', () => {
  it('T-RH-14: "← Dashboard" back link present in the runs page header', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('← Dashboard'),
      `Expected "← Dashboard" back link text in app/dashboard/runs/page.tsx`
    );
  });

  it('T-RH-15: Back link href is /dashboard', () => {
    const content = readOrEmpty(runsPath);
    // The "← Dashboard" link must point to /dashboard
    assert.ok(
      content.includes('href="/dashboard"'),
      `Expected href="/dashboard" adjacent to the "← Dashboard" back link in app/dashboard/runs/page.tsx`
    );
  });

  it('T-RH-16: No full nav bar (no /keys nav link inside a <nav> element)', () => {
    const content = readOrEmpty(runsPath);
    // Check: the file must not contain href="/keys" inside a <nav block.
    // Simple approach: if the file has a <nav element, it must not also contain href="/keys".
    const hasNav = content.includes('<nav');
    if (hasNav) {
      // Extract content inside nav elements (rough heuristic: between <nav and </nav>)
      const navBlocks = [];
      let idx = 0;
      while (true) {
        const start = content.indexOf('<nav', idx);
        if (start === -1) break;
        const end = content.indexOf('</nav>', start);
        if (end === -1) break;
        navBlocks.push(content.slice(start, end + 6));
        idx = end + 6;
      }
      const navContent = navBlocks.join('\n');
      assert.ok(
        !navContent.includes('href="/keys"'),
        `Expected no href="/keys" inside a <nav> element in app/dashboard/runs/page.tsx (runs page should not have the full dashboard nav)`
      );
    }
    // If no <nav> element at all, the test passes (no nav bar present)
  });

  it('T-RH-17: Compact logo (murmur8-logo-compact.svg) present on the runs page', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('murmur8-logo-compact.svg'),
      `Expected "murmur8-logo-compact.svg" to appear in app/dashboard/runs/page.tsx`
    );
  });
});

// ---------------------------------------------------------------------------
// runs page — auth and metadata
// ---------------------------------------------------------------------------

describe('runs page — auth and metadata', () => {
  it('T-RH-18: Auth guard redirects unauthenticated users to "/"', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('redirect("/")') || content.includes("redirect('/')"),
      `Expected redirect("/") or redirect('/') after session check in app/dashboard/runs/page.tsx`
    );
  });

  it('T-RH-19: getUserRuns called with userId as first argument', () => {
    const content = readOrEmpty(runsPath);
    assert.ok(
      content.includes('getUserRuns(userId') || content.includes('getUserRuns(userId,'),
      `Expected getUserRuns(userId... call in app/dashboard/runs/page.tsx`
    );
  });
});
