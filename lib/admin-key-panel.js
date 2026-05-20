/**
 * lib/admin-key-panel.js — Pure helper functions for the Admin Key Panel.
 * Compiled JS equivalent of lib/admin-key-panel.ts.
 * No Prisma, no Next.js, no side effects. Safe to import in tests.
 *
 * Exports:
 *   computeAdminStats(keys)           — derive stats object from key array
 *   checkAdminAccess(session)         — 'ok' | 'redirect-login' | 'redirect-keys'
 *   getAdminRevokeError(session, key) — null | error string
 */

// ---------------------------------------------------------------------------
// computeAdminStats(keys) — derives stats from full key array
// keys: Array<{ userId: string, revokedAt: Date | null | undefined }>
// Returns: { total, active, revoked, uniqueOwners }
// ---------------------------------------------------------------------------
export function computeAdminStats(keys) {
  const total = keys.length;
  const active = keys.filter((k) => k.revokedAt == null).length;
  const revoked = keys.filter((k) => k.revokedAt != null).length;
  const uniqueOwners = new Set(keys.map((k) => k.userId)).size;
  return { total, active, revoked, uniqueOwners };
}

// ---------------------------------------------------------------------------
// checkAdminAccess(session)
// Returns:
//   'redirect-login' — no session or no user.id
//   'redirect-keys'  — authenticated but isAdmin is falsy
//   'ok'             — isAdmin is true
// ---------------------------------------------------------------------------
export function checkAdminAccess(session) {
  if (!session?.user?.id) {
    return 'redirect-login';
  }
  if (!session.user.isAdmin) {
    return 'redirect-keys';
  }
  return 'ok';
}

// ---------------------------------------------------------------------------
// getAdminRevokeError(session, key)
// Returns null if the admin can revoke this key, or an error string if not.
// Checks:
//   1. session.user.isAdmin must be true
//   2. key.revokedAt must be null/undefined (not already revoked)
// ---------------------------------------------------------------------------
export function getAdminRevokeError(session, key) {
  if (!session?.user?.isAdmin) {
    return 'Forbidden: admin access required.';
  }
  if (key.revokedAt != null) {
    return 'This key has already been revoked.';
  }
  return null;
}
