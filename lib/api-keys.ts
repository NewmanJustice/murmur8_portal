/**
 * lib/api-keys.ts — Pure utility functions for API key management.
 * No Prisma, no Next.js, no side effects. Safe to import in tests.
 *
 * Key format  : "mm8_" + 64 lowercase hex chars (32 random bytes)
 * Masked display: first 12 chars of raw key + "..."
 * Hash        : SHA-256 (hex digest) of raw key — stored in DB
 * keyPrefix   : first 12 chars of raw key — stored in DB for display
 */

import { createHash, randomBytes } from 'node:crypto';

// ---------------------------------------------------------------------------
// generateKey() → "mm8_<64 hex chars>"
// ---------------------------------------------------------------------------
export function generateKey(): string {
  const hex = randomBytes(32).toString('hex'); // 64 lowercase hex chars
  return `mm8_${hex}`;
}

// ---------------------------------------------------------------------------
// hashKey(raw) → 64-char lowercase hex SHA-256 digest
// ---------------------------------------------------------------------------
export function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

// ---------------------------------------------------------------------------
// maskKey(raw) → first 12 chars + "..."
// e.g. "mm8_a1b2c3d4..." (12 chars of raw key + literal "...")
// ---------------------------------------------------------------------------
export function maskKey(raw: string): string {
  return raw.slice(0, 12) + '...';
}

// ---------------------------------------------------------------------------
// validateKeyName(name) → null if valid, error string if invalid
// Rules: required (non-empty after trim), max 64 characters
// ---------------------------------------------------------------------------
export function validateKeyName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.trim().length > 64) {
    return 'Name must be 64 characters or fewer';
  }
  return null;
}

// ---------------------------------------------------------------------------
// isRevoked(key) → boolean
// key: object with revokedAt field (Date | null | undefined)
// ---------------------------------------------------------------------------
export function isRevoked(key: { revokedAt: Date | null | undefined }): boolean {
  return key.revokedAt != null;
}
