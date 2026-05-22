/**
 * lib/telemetry.ts
 *
 * Pure functions for the telemetry ingestion endpoint.
 * No Prisma imports here — callers inject the db client.
 * This keeps all logic unit-testable without a database.
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValidatedPayload = {
  slug: string;
  status: 'success' | 'failed' | 'paused';
  type: 'feature' | 'refinement';
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  totalCost?: number | null;
  commitHash?: string | null;
  gitHubUser?: string | null;
  repoName?: string | null;
  failedStage?: string | null;
  pausedAfter?: string | null;
  parentRunId?: string | null;
  stages: Record<string, unknown>;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult =
  | { success: true; data: ValidatedPayload }
  | { success: false; errors: ValidationError[] };

export type ResolvedKey = {
  id: string;
  userId: string;
};

// ---------------------------------------------------------------------------
// hashKey — SHA-256 hex digest of a raw API key string
// ---------------------------------------------------------------------------

export function hashKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// ---------------------------------------------------------------------------
// validatePayload — schema validation for inbound telemetry body
// ---------------------------------------------------------------------------

const VALID_STATUSES = new Set(['success', 'failed', 'paused']);
const VALID_TYPES = new Set(['feature', 'refinement']);

export function validatePayload(body: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a JSON object' }],
    };
  }

  const b = body as Record<string, unknown>;

  // slug — required string
  if (typeof b.slug !== 'string' || b.slug.trim() === '') {
    errors.push({ field: 'slug', message: 'slug is required and must be a non-empty string' });
  }

  // status — required enum
  if (typeof b.status !== 'string' || !VALID_STATUSES.has(b.status)) {
    errors.push({
      field: 'status',
      message: `status is required and must be one of: ${[...VALID_STATUSES].join(', ')}`,
    });
  }

  // type — optional, defaults to 'feature', must be valid enum if present
  if (b.type !== undefined && (typeof b.type !== 'string' || !VALID_TYPES.has(b.type))) {
    errors.push({
      field: 'type',
      message: `type must be one of: ${[...VALID_TYPES].join(', ')}`,
    });
  }

  // startedAt — required string (ISO 8601)
  if (typeof b.startedAt !== 'string' || b.startedAt.trim() === '') {
    errors.push({ field: 'startedAt', message: 'startedAt is required and must be a string' });
  }

  // completedAt — required string (ISO 8601)
  if (typeof b.completedAt !== 'string' || b.completedAt.trim() === '') {
    errors.push({
      field: 'completedAt',
      message: 'completedAt is required and must be a string',
    });
  }

  // totalDurationMs — required non-negative integer
  if (
    typeof b.totalDurationMs !== 'number' ||
    !Number.isInteger(b.totalDurationMs) ||
    b.totalDurationMs < 0
  ) {
    errors.push({
      field: 'totalDurationMs',
      message: 'totalDurationMs is required and must be a non-negative integer',
    });
  }

  // stages — required plain object (not array, not null)
  if (
    typeof b.stages !== 'object' ||
    b.stages === null ||
    Array.isArray(b.stages)
  ) {
    errors.push({
      field: 'stages',
      message: 'stages is required and must be a plain object',
    });
  }

  // gitHubUser — optional non-empty string
  if (b.gitHubUser !== undefined && b.gitHubUser !== null) {
    if (typeof b.gitHubUser !== 'string' || b.gitHubUser.trim() === '') {
      errors.push({ field: 'gitHubUser', message: 'gitHubUser must be a non-empty string if provided' });
    }
  }

  // repoName — optional non-empty string
  if (b.repoName !== undefined && b.repoName !== null) {
    if (typeof b.repoName !== 'string' || b.repoName.trim() === '') {
      errors.push({ field: 'repoName', message: 'repoName must be a non-empty string if provided' });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Build the validated payload, applying defaults
  const data: ValidatedPayload = {
    slug: (b.slug as string).trim(),
    status: b.status as 'success' | 'failed' | 'paused',
    type: (b.type as 'feature' | 'refinement') ?? 'feature',
    startedAt: b.startedAt as string,
    completedAt: b.completedAt as string,
    totalDurationMs: b.totalDurationMs as number,
    totalCost: (b.totalCost as number | null | undefined) ?? null,
    commitHash: (b.commitHash as string | null | undefined) ?? null,
    gitHubUser: (b.gitHubUser as string | null | undefined) ?? null,
    repoName: (b.repoName as string | null | undefined) ?? null,
    failedStage: (b.failedStage as string | null | undefined) ?? null,
    pausedAfter: (b.pausedAfter as string | null | undefined) ?? null,
    parentRunId: (b.parentRunId as string | null | undefined) ?? null,
    stages: b.stages as Record<string, unknown>,
  };

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// buildRunData — construct Prisma create-input from resolved key + payload
// ---------------------------------------------------------------------------

export function buildRunData(
  key: ResolvedKey,
  payload: ValidatedPayload
): Omit<ValidatedPayload, 'type'> & {
  userId: string;
  apiKeyId: string;
  type: string;
  startedAt: Date;
  completedAt: Date;
} {
  return {
    userId: key.userId,
    apiKeyId: key.id,
    slug: payload.slug,
    status: payload.status,
    type: payload.type,
    startedAt: new Date(payload.startedAt),
    completedAt: new Date(payload.completedAt),
    totalDurationMs: payload.totalDurationMs,
    totalCost: payload.totalCost ?? null,
    commitHash: payload.commitHash ?? null,
    gitHubUser: payload.gitHubUser ?? null,
    repoName: payload.repoName ?? null,
    failedStage: payload.failedStage ?? null,
    pausedAfter: payload.pausedAfter ?? null,
    parentRunId: payload.parentRunId ?? null,
    stages: payload.stages,
  };
}
