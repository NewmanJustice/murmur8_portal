/**
 * Tests for feature: run-history-dashboard
 * Test IDs: T-RHD-01 through T-RHD-20
 * Runner: node --test test/feature_run-history-dashboard.test.js
 *
 * All tests are pure unit tests — no DB, no HTTP server, no Next.js.
 * Tests target pure helper functions from lib/dashboard.js (compiled .ts output).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getPaginationParams,
  getFilterParams,
  formatDuration,
  formatCost,
  statusBadgeClass,
  typeBadgeClass,
} from '../lib/dashboard.js';

// ---------------------------------------------------------------------------
// getPaginationParams
// ---------------------------------------------------------------------------

describe('getPaginationParams', () => {
  it('T-RHD-01: defaults to page 1, limit 20, offset 0 when params are empty', () => {
    const result = getPaginationParams({});
    assert.deepEqual(result, { page: 1, limit: 20, offset: 0 });
  });

  it('T-RHD-02: reads page from params and computes correct offset', () => {
    const result = getPaginationParams({ page: '3' });
    assert.deepEqual(result, { page: 3, limit: 20, offset: 40 });
  });

  it('T-RHD-03a: clamps page 0 to page 1', () => {
    const result = getPaginationParams({ page: '0' });
    assert.deepEqual(result, { page: 1, limit: 20, offset: 0 });
  });

  it('T-RHD-03b: clamps negative page to page 1', () => {
    const result = getPaginationParams({ page: '-5' });
    assert.deepEqual(result, { page: 1, limit: 20, offset: 0 });
  });

  it('T-RHD-04: ignores non-numeric page and defaults to page 1', () => {
    const result = getPaginationParams({ page: 'abc' });
    assert.deepEqual(result, { page: 1, limit: 20, offset: 0 });
  });
});

// ---------------------------------------------------------------------------
// getFilterParams
// ---------------------------------------------------------------------------

describe('getFilterParams', () => {
  it('T-RHD-05: returns empty object for empty params', () => {
    const result = getFilterParams({});
    assert.deepEqual(result, {});
  });

  it('T-RHD-06a: accepts "success" status', () => {
    const result = getFilterParams({ status: 'success' });
    assert.equal(result.status, 'success');
  });

  it('T-RHD-06b: accepts "failed" status', () => {
    const result = getFilterParams({ status: 'failed' });
    assert.equal(result.status, 'failed');
  });

  it('T-RHD-06c: accepts "paused" status', () => {
    const result = getFilterParams({ status: 'paused' });
    assert.equal(result.status, 'paused');
  });

  it('T-RHD-07: ignores invalid status value', () => {
    const result = getFilterParams({ status: 'pending' });
    assert.equal(result.status, undefined);
    assert.ok(!Object.prototype.hasOwnProperty.call(result, 'status'), 'status key should be absent');
  });

  it('T-RHD-08: includes slug when non-empty', () => {
    const result = getFilterParams({ slug: 'user-auth' });
    assert.equal(result.slug, 'user-auth');
  });

  it('T-RHD-09a: ignores empty slug string', () => {
    const result = getFilterParams({ slug: '' });
    assert.ok(!Object.prototype.hasOwnProperty.call(result, 'slug'), 'slug key should be absent');
  });

  it('T-RHD-09b: ignores whitespace-only slug', () => {
    const result = getFilterParams({ slug: '   ' });
    assert.ok(!Object.prototype.hasOwnProperty.call(result, 'slug'), 'slug key should be absent for whitespace');
  });

  it('T-RHD-10: parses dateFrom and dateTo', () => {
    const result = getFilterParams({ dateFrom: '2026-01-01', dateTo: '2026-03-31' });
    assert.equal(result.dateFrom, '2026-01-01');
    assert.equal(result.dateTo, '2026-03-31');
  });

  it('T-RHD-11a: dateFrom is independent of dateTo', () => {
    const result = getFilterParams({ dateFrom: '2026-01-01' });
    assert.equal(result.dateFrom, '2026-01-01');
    assert.ok(!Object.prototype.hasOwnProperty.call(result, 'dateTo'), 'dateTo should be absent');
  });

  it('T-RHD-11b: dateTo is independent of dateFrom', () => {
    const result = getFilterParams({ dateTo: '2026-03-31' });
    assert.equal(result.dateTo, '2026-03-31');
    assert.ok(!Object.prototype.hasOwnProperty.call(result, 'dateFrom'), 'dateFrom should be absent');
  });
});

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------

describe('formatDuration', () => {
  it('T-RHD-12: renders seconds only for < 60s', () => {
    assert.equal(formatDuration(45000), '45s');
  });

  it('T-RHD-13: renders minutes and seconds', () => {
    assert.equal(formatDuration(874000), '14m 34s');
  });

  it('T-RHD-14: renders hours and minutes (drops seconds when >= 1 hour)', () => {
    assert.equal(formatDuration(7500000), '2h 5m');
  });

  it('T-RHD-15: handles zero ms', () => {
    assert.equal(formatDuration(0), '0s');
  });
});

// ---------------------------------------------------------------------------
// formatCost
// ---------------------------------------------------------------------------

describe('formatCost', () => {
  it('T-RHD-16a: formats 1.5 as $1.500', () => {
    assert.equal(formatCost(1.5), '$1.500');
  });

  it('T-RHD-16b: formats 0 as $0.000', () => {
    assert.equal(formatCost(0), '$0.000');
  });

  it('T-RHD-16c: formats 0.001 as $0.001', () => {
    assert.equal(formatCost(0.001), '$0.001');
  });

  it('T-RHD-16d: truncates to 3 decimal places (10.1234 → $10.123)', () => {
    assert.equal(formatCost(10.1234), '$10.123');
  });
});

// ---------------------------------------------------------------------------
// statusBadgeClass
// ---------------------------------------------------------------------------

describe('statusBadgeClass', () => {
  it('T-RHD-17a: success → green badge classes', () => {
    const cls = statusBadgeClass('success');
    assert.ok(cls.includes('text-green-600'), `Expected text-green-600 in "${cls}"`);
    assert.ok(cls.includes('bg-green-50'), `Expected bg-green-50 in "${cls}"`);
  });

  it('T-RHD-17b: failed → red badge classes', () => {
    const cls = statusBadgeClass('failed');
    assert.ok(cls.includes('text-red-600'), `Expected text-red-600 in "${cls}"`);
    assert.ok(cls.includes('bg-red-50'), `Expected bg-red-50 in "${cls}"`);
  });

  it('T-RHD-17c: paused → yellow/amber badge classes', () => {
    const cls = statusBadgeClass('paused');
    assert.ok(cls.includes('text-yellow-600'), `Expected text-yellow-600 in "${cls}"`);
    assert.ok(cls.includes('bg-yellow-50'), `Expected bg-yellow-50 in "${cls}"`);
  });

  it('T-RHD-18: unknown status → non-empty fallback string (no crash)', () => {
    const cls = statusBadgeClass('unknown');
    assert.ok(typeof cls === 'string' && cls.length > 0, 'Expected non-empty string for unknown status');
  });
});

// ---------------------------------------------------------------------------
// typeBadgeClass
// ---------------------------------------------------------------------------

describe('typeBadgeClass', () => {
  it('T-RHD-19: feature type → sky/blue badge class', () => {
    const cls = typeBadgeClass('feature');
    const hasBlue = cls.includes('sky') || cls.includes('blue') || cls.includes('agent-alex');
    assert.ok(hasBlue, `Expected sky/blue colour in "${cls}"`);
  });

  it('T-RHD-20: refinement type → violet/purple badge class', () => {
    const cls = typeBadgeClass('refinement');
    const hasPurple = cls.includes('violet') || cls.includes('purple') || cls.includes('agent-cass');
    assert.ok(hasPurple, `Expected violet/purple colour in "${cls}"`);
  });
});
