/**
 * lib/telemetry.js
 *
 * Pure functions for the telemetry ingestion endpoint.
 * Compiled-equivalent of lib/telemetry.ts — used by node:test runner.
 * No Prisma imports — callers inject the db client.
 */

import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_STATUSES = new Set(['success', 'failed', 'paused']);
const VALID_TYPES = new Set(['feature', 'refinement']);

// ---------------------------------------------------------------------------
// hashKey — SHA-256 hex digest of a raw API key string
// ---------------------------------------------------------------------------

export function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// ---------------------------------------------------------------------------
// validatePayload — schema validation for inbound telemetry body
// ---------------------------------------------------------------------------

export function validatePayload(body) {
  const errors = [];

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a JSON object' }],
    };
  }

  // slug — required string
  if (typeof body.slug !== 'string' || body.slug.trim() === '') {
    errors.push({ field: 'slug', message: 'slug is required and must be a non-empty string' });
  }

  // status — required enum
  if (typeof body.status !== 'string' || !VALID_STATUSES.has(body.status)) {
    errors.push({
      field: 'status',
      message: `status is required and must be one of: ${[...VALID_STATUSES].join(', ')}`,
    });
  }

  // type — optional, defaults to 'feature', must be valid enum if present
  if (body.type !== undefined && (typeof body.type !== 'string' || !VALID_TYPES.has(body.type))) {
    errors.push({
      field: 'type',
      message: `type must be one of: ${[...VALID_TYPES].join(', ')}`,
    });
  }

  // startedAt — required string
  if (typeof body.startedAt !== 'string' || body.startedAt.trim() === '') {
    errors.push({ field: 'startedAt', message: 'startedAt is required and must be a string' });
  }

  // completedAt — required string
  if (typeof body.completedAt !== 'string' || body.completedAt.trim() === '') {
    errors.push({
      field: 'completedAt',
      message: 'completedAt is required and must be a string',
    });
  }

  // totalDurationMs — required non-negative integer
  if (
    typeof body.totalDurationMs !== 'number' ||
    !Number.isInteger(body.totalDurationMs) ||
    body.totalDurationMs < 0
  ) {
    errors.push({
      field: 'totalDurationMs',
      message: 'totalDurationMs is required and must be a non-negative integer',
    });
  }

  // stages — required plain object (not array, not null)
  if (
    typeof body.stages !== 'object' ||
    body.stages === null ||
    Array.isArray(body.stages)
  ) {
    errors.push({
      field: 'stages',
      message: 'stages is required and must be a plain object',
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Build the validated payload, applying defaults
  const data = {
    slug: body.slug.trim(),
    status: body.status,
    type: body.type ?? 'feature',
    startedAt: body.startedAt,
    completedAt: body.completedAt,
    totalDurationMs: body.totalDurationMs,
    totalCost: body.totalCost ?? null,
    commitHash: body.commitHash ?? null,
    failedStage: body.failedStage ?? null,
    pausedAfter: body.pausedAfter ?? null,
    parentRunId: body.parentRunId ?? null,
    stages: body.stages,
  };

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// buildRunData — construct Prisma create-input from resolved key + payload
// ---------------------------------------------------------------------------

export function buildRunData(key, payload) {
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
    failedStage: payload.failedStage ?? null,
    pausedAfter: payload.pausedAfter ?? null,
    parentRunId: payload.parentRunId ?? null,
    stages: payload.stages,
  };
}
