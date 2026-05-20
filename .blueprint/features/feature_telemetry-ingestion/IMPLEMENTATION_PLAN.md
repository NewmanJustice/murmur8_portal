# Implementation Plan — telemetry-ingestion

## Steps

1. [lib/prisma.ts] CREATE — Singleton PrismaClient export, prevents hot-reload connection leaks in Next.js | Tests: none (shared utility)

2. [lib/telemetry.ts] CREATE — Pure functions: hashKey(raw), validatePayload(body), buildRunData(key, payload) | Tests: T-TI-01, T-TI-02, T-TI-03, T-TI-04, T-TI-05, T-TI-06, T-TI-07, T-TI-08, T-TI-09, T-TI-10, T-TI-11, T-TI-12

3. [app/api/telemetry/route.ts] CREATE — Next.js Route Handler: extract Bearer token, hash, lookup ApiKey, validate payload, insert Run, update lastUsedAt, return 201/401/422 | Tests: T-TI-13, T-TI-14, T-TI-15
