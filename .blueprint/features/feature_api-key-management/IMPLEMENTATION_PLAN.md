---
feature: api-key-management
author: Codey
date: 2026-05-20
---

# Implementation Plan — API Key Management

## Steps

1. [lib/api-keys.js] CREATE — Pure utility functions: generateKey(), hashKey(raw), maskKey(raw), validateKeyName(name), isRevoked(key) using Node.js crypto module | Tests: T-01, T-02, T-03, T-04, T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-14

2. [lib/prisma.ts] CREATE — Singleton PrismaClient export to prevent connection exhaustion in dev hot-reload and serverless | Tests: none (infrastructure)

3. [lib/api-keys-db.ts] CREATE — DB operations: createApiKey(userId, name), listApiKeys(userId), revokeApiKey(userId, keyId), adminListApiKeys(), adminRevokeApiKey(keyId) using Prisma; imports from lib/prisma.ts | Tests: none (requires DB)

4. [prisma/schema.prisma] UPDATE — Add keyPrefix String field to ApiKey model to store first 12 chars of raw key at creation | Tests: none (schema change)

5. [app/(dashboard)/keys/actions.ts] CREATE — Server actions: createKey(formData) validates name, generates key, stores hash+prefix, returns raw key once; revokeKey(keyId) sets revokedAt | Tests: none (requires session+DB)

6. [app/(dashboard)/keys/page.tsx] CREATE — Server component: fetch authenticated user's keys via listApiKeys, render key table with Name/Prefix/Created/LastUsed/Status columns, New Key form, Revoke buttons, one-time reveal modal | Tests: none (requires Next.js)

7. [app/admin/keys/actions.ts] CREATE — Admin server action: revokeAnyKey(keyId) checks session.user.isAdmin, returns error if not admin, sets revokedAt on any key | Tests: none (requires session+DB)

8. [app/admin/keys/page.tsx] CREATE — Admin server component: check session.user.isAdmin (redirect to /dashboard/keys if false), fetch all keys via adminListApiKeys with owner join, render table with Owner/Name/Prefix/Created/LastUsed/Status columns and Revoke buttons | Tests: none (requires Next.js)
