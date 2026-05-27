/**
 * app/api/telemetry/route.ts
 *
 * POST /api/telemetry — Telemetry ingestion endpoint.
 *
 * Flow:
 *  1. Extract Bearer token from Authorization header → 401 if missing
 *  2. Hash token (SHA-256), look up active ApiKey in DB → 401 if not found/revoked
 *  3. Validate request body → 422 with structured errors if invalid
 *  4. Insert Run record and update ApiKey.lastUsedAt (in transaction) → 201 { id }
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hashKey, validatePayload, buildRunData } from '@/lib/telemetry';

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ------------------------------------------------------------------
  // 1. Extract Bearer token
  // ------------------------------------------------------------------
  const authHeader = request.headers.get('authorization');
  const rawKey =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null;

  if (!rawKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ------------------------------------------------------------------
  // 2. Resolve active ApiKey by hash
  // ------------------------------------------------------------------
  const keyHash = hashKey(rawKey);

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      key: keyHash,
      revokedAt: null,
    },
    select: { id: true, userId: true },
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ------------------------------------------------------------------
  // 3. Parse and validate request body
  // ------------------------------------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ field: 'body', message: 'Request body must be valid JSON' }] },
      { status: 422 }
    );
  }

  const validation = validatePayload(body);
  if (!validation.success) {
    return NextResponse.json({ errors: validation.errors }, { status: 422 });
  }

  const runData = buildRunData(apiKey, validation.data);

  // ------------------------------------------------------------------
  // 4. Persist: insert Run + update ApiKey.lastUsedAt in one transaction
  // ------------------------------------------------------------------
  let runId: string;
  try {
    const [run] = await prisma.$transaction([
      prisma.run.create({ data: { ...runData, stages: runData.stages as Prisma.InputJsonValue, stories: runData.stories as Prisma.InputJsonValue ?? null }, select: { id: true } }),
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      }),
    ]);
    runId = run.id;
  } catch (err) {
    console.error('[telemetry] DB error during run insert:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ id: runId }, { status: 201 });
}
