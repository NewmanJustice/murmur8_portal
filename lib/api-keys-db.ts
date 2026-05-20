/**
 * lib/api-keys-db.ts — Database operations for API key management.
 * Depends on lib/prisma.ts and lib/api-keys.js.
 *
 * Separation from pure utils allows testing pure logic without a DB connection.
 */

import { prisma } from './prisma.js';
import { generateKey, hashKey, maskKey } from './api-keys.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

export interface AdminApiKeyRecord extends ApiKeyRecord {
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateApiKeyResult {
  record: ApiKeyRecord;
  rawKey: string; // returned ONCE — never stored
}

// ---------------------------------------------------------------------------
// createApiKey(userId, name) — generates key, stores hash + prefix
// ---------------------------------------------------------------------------
export async function createApiKey(
  userId: string,
  name: string
): Promise<CreateApiKeyResult> {
  const rawKey = generateKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = maskKey(rawKey); // "mm8_a1b2c3d4..." (12 chars + "...")

  const record = await prisma.apiKey.create({
    data: {
      key: keyHash,
      name: name.trim(),
      userId,
      keyPrefix,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
  });

  // rawKey returned only here — never re-retrievable
  return { record, rawKey };
}

// ---------------------------------------------------------------------------
// listApiKeys(userId) — returns user's own keys, newest first
// ---------------------------------------------------------------------------
export async function listApiKeys(userId: string): Promise<ApiKeyRecord[]> {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
  });
}

// ---------------------------------------------------------------------------
// revokeApiKey(userId, keyId) — sets revokedAt; user can only revoke own keys
// ---------------------------------------------------------------------------
export async function revokeApiKey(userId: string, keyId: string): Promise<void> {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!key) {
    throw new Error('Key not found or not owned by user');
  }

  if (key.revokedAt != null) {
    const err = new Error('Key is already revoked');
    (err as NodeJS.ErrnoException).code = '409';
    throw err;
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// adminListApiKeys() — all keys across all users, with owner info
// ---------------------------------------------------------------------------
export async function adminListApiKeys(): Promise<AdminApiKeyRecord[]> {
  return prisma.apiKey.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// adminRevokeApiKey(keyId) — revoke any active key (admin only — caller must
// verify isAdmin before calling this function)
// ---------------------------------------------------------------------------
export async function adminRevokeApiKey(keyId: string): Promise<void> {
  const key = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });

  if (!key) {
    throw new Error('Key not found');
  }

  if (key.revokedAt != null) {
    const err = new Error('Key is already revoked');
    (err as NodeJS.ErrnoException).code = '409';
    throw err;
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });
}
