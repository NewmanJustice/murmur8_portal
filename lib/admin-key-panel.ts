/**
 * lib/admin-key-panel.ts — Pure helper functions for the Admin Key Panel.
 * No Prisma, no Next.js, no side effects. Safe to import in tests.
 *
 * Exports:
 *   computeAdminStats(keys)       — derive stats object from key array
 *   checkAdminAccess(session)     — 'ok' | 'redirect-login' | 'redirect-keys'
 *   getAdminRevokeError(session, key) — null | error string
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeyLike {
  userId: string;
  revokedAt: Date | null | undefined;
}

export interface AdminStats {
  total: number;
  active: number;
  revoked: number;
  uniqueOwners: number;
}

export interface SessionLike {
  user?: {
    id?: string;
    isAdmin?: boolean;
  } | null;
}

// ---------------------------------------------------------------------------
// computeAdminStats(keys) — derives stats from full key array
// ---------------------------------------------------------------------------
export function computeAdminStats(keys: KeyLike[]): AdminStats {
  const total = keys.length;
  const active = keys.filter((k) => k.revokedAt == null).length;
  const revoked = keys.filter((k) => k.revokedAt != null).length;
  const uniqueOwners = new Set(keys.map((k) => k.userId)).size;
  return { total, active, revoked, uniqueOwners };
}

// ---------------------------------------------------------------------------
// checkAdminAccess(session)
// Returns:
//   'redirect-login' — no session
//   'redirect-keys'  — authenticated but not admin
//   'ok'             — admin
// ---------------------------------------------------------------------------
export function checkAdminAccess(
  session: SessionLike | null | undefined
): 'ok' | 'redirect-login' | 'redirect-keys' {
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
//   1. Session must belong to an admin
//   2. Key must not already be revoked
// ---------------------------------------------------------------------------
export function getAdminRevokeError(
  session: SessionLike | null | undefined,
  key: KeyLike
): string | null {
  if (!session?.user?.isAdmin) {
    return 'Forbidden: admin access required.';
  }
  if (key.revokedAt != null) {
    return 'This key has already been revoked.';
  }
  return null;
}
