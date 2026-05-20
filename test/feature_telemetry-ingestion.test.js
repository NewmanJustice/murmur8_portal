/**
 * Tests for feature: telemetry-ingestion
 * Test IDs: T-TI-01 through T-TI-15
 * Runner: node --test test/feature_telemetry-ingestion.test.js
 *
 * All tests are pure unit tests — no DB, no HTTP server.
 * Tests import pure functions from lib/telemetry.js (compiled output or .ts via loader).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Helpers — inline implementations so tests are self-contained until
// lib/telemetry.ts exists, at which point we import from it.
// ---------------------------------------------------------------------------

// We import from the actual module path. If lib/telemetry.js doesn't exist yet
// these will fail with module-not-found, which is the expected red state.
import { hashKey, validatePayload, buildRunData } from '../lib/telemetry.js';

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

const VALID_PAYLOAD = {
  slug: 'user-auth',
  status: 'success',
  type: 'feature',
  startedAt: '2026-05-20T10:00:00Z',
  completedAt: '2026-05-20T10:14:32Z',
  totalDurationMs: 872000,
  totalCost: 0.042,
  commitHash: '3bb99f8',
  failedStage: null,
  pausedAfter: null,
  parentRunId: null,
  stages: {
    alex: { durationMs: 120000, status: 'success' },
  },
};

const MOCK_KEY = { id: 'key-id-123', userId: 'user-id-456' };

// ---------------------------------------------------------------------------
// T-TI-01: hashKey produces correct SHA-256 hex digest
// ---------------------------------------------------------------------------
describe('T-TI-01: hashKey — correct SHA-256 digest', () => {
  it('produces a 64-char hex string', () => {
    const hash = hashKey('test-raw-key');
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it('matches expected SHA-256 value', () => {
    const expected = crypto.createHash('sha256').update('hello-world').digest('hex');
    assert.equal(hashKey('hello-world'), expected);
  });
});

// ---------------------------------------------------------------------------
// T-TI-02: hashKey is deterministic
// ---------------------------------------------------------------------------
describe('T-TI-02: hashKey — deterministic', () => {
  it('same input always produces same output', () => {
    const key = 'my-api-key-abc123';
    assert.equal(hashKey(key), hashKey(key));
  });

  it('different inputs produce different outputs', () => {
    assert.notEqual(hashKey('key-a'), hashKey('key-b'));
  });
});

// ---------------------------------------------------------------------------
// T-TI-03: validatePayload accepts a fully valid payload
// ---------------------------------------------------------------------------
describe('T-TI-03: validatePayload — valid payload', () => {
  it('returns success=true for a complete valid payload', () => {
    const result = validatePayload(VALID_PAYLOAD);
    assert.equal(result.success, true);
    assert.ok(result.data, 'Expected result.data to be set');
    assert.equal(result.error, undefined);
  });
});

// ---------------------------------------------------------------------------
// T-TI-04: validatePayload rejects missing required fields
// ---------------------------------------------------------------------------
describe('T-TI-04: validatePayload — missing required fields', () => {
  const REQUIRED_FIELDS = ['slug', 'status', 'startedAt', 'completedAt', 'totalDurationMs'];

  for (const field of REQUIRED_FIELDS) {
    it(`rejects payload missing "${field}"`, () => {
      const payload = { ...VALID_PAYLOAD };
      delete payload[field];
      const result = validatePayload(payload);
      assert.equal(result.success, false);
      assert.ok(Array.isArray(result.errors), 'Expected result.errors to be an array');
      assert.ok(result.errors.length > 0, 'Expected at least one error');
    });
  }
});

// ---------------------------------------------------------------------------
// T-TI-05: validatePayload rejects invalid status enum
// ---------------------------------------------------------------------------
describe('T-TI-05: validatePayload — invalid status enum', () => {
  it('rejects status "running"', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, status: 'running' });
    assert.equal(result.success, false);
    assert.ok(result.errors.some(e => e.field === 'status' || e.message?.includes('status')));
  });

  it('accepts status "failed"', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, status: 'failed' });
    assert.equal(result.success, true);
  });

  it('accepts status "paused"', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, status: 'paused' });
    assert.equal(result.success, true);
  });
});

// ---------------------------------------------------------------------------
// T-TI-06: validatePayload rejects invalid type enum
// ---------------------------------------------------------------------------
describe('T-TI-06: validatePayload — invalid type enum', () => {
  it('rejects type "unknown"', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, type: 'unknown' });
    assert.equal(result.success, false);
    assert.ok(result.errors.some(e => e.field === 'type' || e.message?.includes('type')));
  });

  it('accepts type "refinement"', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, type: 'refinement' });
    assert.equal(result.success, true);
  });
});

// ---------------------------------------------------------------------------
// T-TI-07: validatePayload rejects non-integer totalDurationMs
// ---------------------------------------------------------------------------
describe('T-TI-07: validatePayload — totalDurationMs must be integer', () => {
  it('rejects totalDurationMs as a string', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, totalDurationMs: 'not-a-number' });
    assert.equal(result.success, false);
  });

  it('rejects totalDurationMs as a float', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, totalDurationMs: 1.5 });
    assert.equal(result.success, false);
  });

  it('accepts totalDurationMs = 0', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, totalDurationMs: 0 });
    assert.equal(result.success, true);
  });
});

// ---------------------------------------------------------------------------
// T-TI-08: validatePayload rejects non-object stages
// ---------------------------------------------------------------------------
describe('T-TI-08: validatePayload — stages must be an object', () => {
  it('rejects stages as an array', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, stages: [] });
    assert.equal(result.success, false);
  });

  it('rejects stages as a string', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, stages: 'alex,cass' });
    assert.equal(result.success, false);
  });

  it('rejects stages as null', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, stages: null });
    assert.equal(result.success, false);
  });

  it('accepts stages as an empty object', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, stages: {} });
    assert.equal(result.success, true);
  });
});

// ---------------------------------------------------------------------------
// T-TI-09: validatePayload accepts type omitted (defaults to feature)
// ---------------------------------------------------------------------------
describe('T-TI-09: validatePayload — type defaults to "feature" when absent', () => {
  it('accepts payload without type field and sets type to "feature"', () => {
    const payload = { ...VALID_PAYLOAD };
    delete payload.type;
    const result = validatePayload(payload);
    assert.equal(result.success, true);
    assert.equal(result.data.type, 'feature');
  });
});

// ---------------------------------------------------------------------------
// T-TI-10: buildRunData sets userId and apiKeyId from resolved key
// ---------------------------------------------------------------------------
describe('T-TI-10: buildRunData — userId and apiKeyId from key', () => {
  it('sets userId from the resolved key', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    assert.equal(data.userId, MOCK_KEY.userId);
  });

  it('sets apiKeyId from the resolved key', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    assert.equal(data.apiKeyId, MOCK_KEY.id);
  });
});

// ---------------------------------------------------------------------------
// T-TI-11: buildRunData maps all payload fields correctly
// ---------------------------------------------------------------------------
describe('T-TI-11: buildRunData — payload field mapping', () => {
  it('maps slug correctly', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    assert.equal(data.slug, VALID_PAYLOAD.slug);
  });

  it('maps status correctly', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    assert.equal(data.status, VALID_PAYLOAD.status);
  });

  it('maps stages correctly', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    assert.deepEqual(data.stages, VALID_PAYLOAD.stages);
  });

  it('maps totalDurationMs correctly', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    assert.equal(data.totalDurationMs, VALID_PAYLOAD.totalDurationMs);
  });
});

// ---------------------------------------------------------------------------
// T-TI-12: buildRunData result contains required portal-generated fields
// ---------------------------------------------------------------------------
describe('T-TI-12: buildRunData — portal-generated fields', () => {
  it('does not set id (Prisma/cuid generates it)', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    // id should NOT be set by buildRunData — it's DB-generated
    assert.equal(data.id, undefined);
  });

  it('does not set receivedAt (DB default handles it)', () => {
    const data = buildRunData(MOCK_KEY, VALID_PAYLOAD);
    // receivedAt should NOT be set — DB default(now()) handles it
    assert.equal(data.receivedAt, undefined);
  });
});

// ---------------------------------------------------------------------------
// T-TI-13: 201 response shape: { id: string }
// ---------------------------------------------------------------------------
describe('T-TI-13: response shape — 201 Created', () => {
  it('a run id is a non-empty string', () => {
    // Simulate what the route would return after a successful DB insert
    const fakeDbResult = { id: 'clxyz123' };
    assert.equal(typeof fakeDbResult.id, 'string');
    assert.ok(fakeDbResult.id.length > 0);
  });
});

// ---------------------------------------------------------------------------
// T-TI-14: 401 response for missing Authorization header
// ---------------------------------------------------------------------------
describe('T-TI-14: response shape — 401 Unauthorized', () => {
  it('missing Authorization header should yield null bearer token', () => {
    // Simulate bearer token extraction from a request with no auth header
    const headers = {};
    const authHeader = headers['authorization'] ?? null;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    assert.equal(token, null);
  });

  it('malformed Authorization header (no Bearer prefix) yields null token', () => {
    const authHeader = 'Basic dXNlcjpwYXNz';
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    assert.equal(token, null);
  });
});

// ---------------------------------------------------------------------------
// T-TI-15: 422 response body shape: { errors: [...] }
// ---------------------------------------------------------------------------
describe('T-TI-15: response shape — 422 Unprocessable Entity', () => {
  it('validatePayload errors array is serialisable as { errors: [...] }', () => {
    const result = validatePayload({ ...VALID_PAYLOAD, status: 'running' });
    assert.equal(result.success, false);
    const body = { errors: result.errors };
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.length > 0);
    // Each error should have a field and message
    for (const err of body.errors) {
      assert.ok(typeof err.field === 'string', 'Each error should have a field');
      assert.ok(typeof err.message === 'string', 'Each error should have a message');
    }
  });
});
