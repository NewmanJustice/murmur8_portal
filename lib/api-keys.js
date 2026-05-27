// Mirror of lib/api-keys.ts for node --test runner (no TypeScript transform needed)
import { createHash, randomBytes } from 'node:crypto';

export function generateKey() {
  const hex = randomBytes(32).toString('hex');
  return `mm8_${hex}`;
}

export function hashKey(raw) {
  return createHash('sha256').update(raw).digest('hex');
}

export function maskKey(raw) {
  return raw.slice(0, 12) + '...';
}

export function validateKeyName(name) {
  if (!name || name.trim().length === 0) return 'Name is required';
  if (name.trim().length > 64) return 'Name must be 64 characters or fewer';
  return null;
}

export function isRevoked(key) {
  return key.revokedAt != null;
}
