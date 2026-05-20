/**
 * Tests for admin-key-panel feature
 * Target modules:
 *   lib/admin-key-panel.js  (computeAdminStats, checkAdminAccess, getAdminRevokeError)
 *   lib/api-keys.js         (isRevoked — reused)
 * Run with: node --test test/feature_admin-key-panel.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const worktreeRoot = path.resolve(__dirname, '..');

const adminPanelPath = path.join(worktreeRoot, 'lib', 'admin-key-panel.js');
const apiKeysPath = path.join(worktreeRoot, 'lib', 'api-keys.js');

const { computeAdminStats, checkAdminAccess, getAdminRevokeError } = await import(adminPanelPath);
const { isRevoked } = await import(apiKeysPath);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeKey({ revokedAt = null, userId = 'user-1' } = {}) {
  return { id: 'key-' + Math.random(), name: 'test', keyPrefix: 'mm8_abc...', userId, revokedAt };
}

function makeAdminSession() {
  return { user: { id: 'admin-1', isAdmin: true } };
}

function makeUserSession() {
  return { user: { id: 'user-1', isAdmin: false } };
}

// ---------------------------------------------------------------------------
// T-01: computeAdminStats total count
// ---------------------------------------------------------------------------
test('T-01: computeAdminStats returns correct total count', () => {
  const keys = [makeKey(), makeKey(), makeKey({ revokedAt: new Date() })];
  const stats = computeAdminStats(keys);
  assert.strictEqual(stats.total, 3, 'total should be 3');
});

// ---------------------------------------------------------------------------
// T-02: computeAdminStats active count
// ---------------------------------------------------------------------------
test('T-02: computeAdminStats returns correct active count', () => {
  const keys = [makeKey(), makeKey(), makeKey({ revokedAt: new Date() })];
  const stats = computeAdminStats(keys);
  assert.strictEqual(stats.active, 2, 'active should be 2');
});

// ---------------------------------------------------------------------------
// T-03: computeAdminStats revoked count
// ---------------------------------------------------------------------------
test('T-03: computeAdminStats returns correct revoked count', () => {
  const keys = [makeKey(), makeKey({ revokedAt: new Date() }), makeKey({ revokedAt: new Date() })];
  const stats = computeAdminStats(keys);
  assert.strictEqual(stats.revoked, 2, 'revoked should be 2');
});

// ---------------------------------------------------------------------------
// T-04: computeAdminStats unique owner count
// ---------------------------------------------------------------------------
test('T-04: computeAdminStats returns correct unique owner count', () => {
  const keys = [
    makeKey({ userId: 'alice' }),
    makeKey({ userId: 'alice' }),
    makeKey({ userId: 'bob' }),
    makeKey({ userId: 'carol' }),
  ];
  const stats = computeAdminStats(keys);
  assert.strictEqual(stats.uniqueOwners, 3, 'unique owners should be 3');
});

// ---------------------------------------------------------------------------
// T-05: computeAdminStats empty array returns zeros
// ---------------------------------------------------------------------------
test('T-05: computeAdminStats returns zeros for empty array', () => {
  const stats = computeAdminStats([]);
  assert.strictEqual(stats.total, 0, 'total should be 0');
  assert.strictEqual(stats.active, 0, 'active should be 0');
  assert.strictEqual(stats.revoked, 0, 'revoked should be 0');
  assert.strictEqual(stats.uniqueOwners, 0, 'uniqueOwners should be 0');
});

// ---------------------------------------------------------------------------
// T-06: isRevoked returns false when revokedAt is null
// ---------------------------------------------------------------------------
test('T-06: isRevoked returns false when revokedAt is null', () => {
  assert.strictEqual(isRevoked({ revokedAt: null }), false, 'active key should not be revoked');
});

// ---------------------------------------------------------------------------
// T-07: isRevoked returns true when revokedAt is set
// ---------------------------------------------------------------------------
test('T-07: isRevoked returns true when revokedAt is set', () => {
  assert.strictEqual(isRevoked({ revokedAt: new Date() }), true, 'revoked key should return true');
});

// ---------------------------------------------------------------------------
// T-08: checkAdminAccess returns 'redirect-login' when no session
// ---------------------------------------------------------------------------
test('T-08: checkAdminAccess returns redirect-login for null session', () => {
  assert.strictEqual(checkAdminAccess(null), 'redirect-login');
});

test('T-08b: checkAdminAccess returns redirect-login for undefined session', () => {
  assert.strictEqual(checkAdminAccess(undefined), 'redirect-login');
});

// ---------------------------------------------------------------------------
// T-09: checkAdminAccess returns 'redirect-keys' for non-admin
// ---------------------------------------------------------------------------
test('T-09: checkAdminAccess returns redirect-keys for non-admin user', () => {
  assert.strictEqual(checkAdminAccess(makeUserSession()), 'redirect-keys');
});

// ---------------------------------------------------------------------------
// T-10: checkAdminAccess returns 'ok' for admin
// ---------------------------------------------------------------------------
test('T-10: checkAdminAccess returns ok for admin user', () => {
  assert.strictEqual(checkAdminAccess(makeAdminSession()), 'ok');
});

// ---------------------------------------------------------------------------
// T-11: getAdminRevokeError returns Forbidden for non-admin
// ---------------------------------------------------------------------------
test('T-11: getAdminRevokeError returns Forbidden for non-admin session', () => {
  const key = makeKey();
  const err = getAdminRevokeError(makeUserSession(), key);
  assert.ok(err !== null, 'should return an error for non-admin');
  assert.ok(err.toLowerCase().includes('forbidden') || err.toLowerCase().includes('admin'), `error should mention forbidden or admin, got: "${err}"`);
});

// ---------------------------------------------------------------------------
// T-12: getAdminRevokeError returns null for admin + active key
// ---------------------------------------------------------------------------
test('T-12: getAdminRevokeError returns null for admin with active key', () => {
  const key = makeKey({ revokedAt: null });
  const err = getAdminRevokeError(makeAdminSession(), key);
  assert.strictEqual(err, null, 'admin revoking active key should have no error');
});

// ---------------------------------------------------------------------------
// T-13: getAdminRevokeError returns already-revoked error for revoked key
// ---------------------------------------------------------------------------
test('T-13: getAdminRevokeError returns already-revoked error for revoked key', () => {
  const key = makeKey({ revokedAt: new Date() });
  const err = getAdminRevokeError(makeAdminSession(), key);
  assert.ok(err !== null, 'should return error for already-revoked key');
  assert.ok(
    err.toLowerCase().includes('already') || err.toLowerCase().includes('revoked'),
    `error should mention already revoked, got: "${err}"`
  );
});

// ---------------------------------------------------------------------------
// T-14: Active key has no revoke error (admin session)
// ---------------------------------------------------------------------------
test('T-14: getAdminRevokeError returns null for active key with admin session', () => {
  const key = makeKey({ revokedAt: null });
  const result = getAdminRevokeError(makeAdminSession(), key);
  assert.strictEqual(result, null, 'active key with admin session should have no error');
});
