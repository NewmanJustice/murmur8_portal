/**
 * Tests for feature: add-repo-fields
 * Test IDs: T-ARF-01 through T-ARF-11
 * Runner: node --test test/feature_add-repo-fields.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const prismaSchema = fs.readFileSync(path.join(projectRoot, 'prisma/schema.prisma'), 'utf8');
const telemetryLib = fs.readFileSync(path.join(projectRoot, 'lib/telemetry.ts'), 'utf8');

// ---------------------------------------------------------------------------
// T-ARF-01: Prisma schema contains gitHubUser field declaration
// ---------------------------------------------------------------------------
describe('T-ARF-01: Prisma schema — gitHubUser field exists', () => {
  it('schema contains gitHubUser field', () => {
    assert.ok(
      prismaSchema.includes('gitHubUser'),
      'Expected prisma/schema.prisma to contain a gitHubUser field declaration'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-02: Prisma schema contains repoName field declaration
// ---------------------------------------------------------------------------
describe('T-ARF-02: Prisma schema — repoName field exists', () => {
  it('schema contains repoName field', () => {
    assert.ok(
      prismaSchema.includes('repoName'),
      'Expected prisma/schema.prisma to contain a repoName field declaration'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-03: Prisma gitHubUser is nullable (String?)
// ---------------------------------------------------------------------------
describe('T-ARF-03: Prisma schema — gitHubUser is nullable', () => {
  it('gitHubUser is declared as String?', () => {
    const pattern = /gitHubUser\s+String\?/;
    assert.ok(
      pattern.test(prismaSchema),
      'Expected gitHubUser to be declared as nullable String? in prisma/schema.prisma'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-04: Prisma repoName is nullable (String?)
// ---------------------------------------------------------------------------
describe('T-ARF-04: Prisma schema — repoName is nullable', () => {
  it('repoName is declared as String?', () => {
    const pattern = /repoName\s+String\?/;
    assert.ok(
      pattern.test(prismaSchema),
      'Expected repoName to be declared as nullable String? in prisma/schema.prisma'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-05: ValidatedPayload type includes gitHubUser
// ---------------------------------------------------------------------------
describe('T-ARF-05: telemetry.ts — ValidatedPayload includes gitHubUser', () => {
  it('ValidatedPayload type contains gitHubUser property', () => {
    // Look for gitHubUser within the ValidatedPayload type block
    const typeBlock = telemetryLib.slice(
      telemetryLib.indexOf('type ValidatedPayload'),
      telemetryLib.indexOf('};', telemetryLib.indexOf('type ValidatedPayload')) + 2
    );
    assert.ok(
      typeBlock.includes('gitHubUser'),
      'Expected ValidatedPayload type to include gitHubUser field'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-06: ValidatedPayload type includes repoName
// ---------------------------------------------------------------------------
describe('T-ARF-06: telemetry.ts — ValidatedPayload includes repoName', () => {
  it('ValidatedPayload type contains repoName property', () => {
    const typeBlock = telemetryLib.slice(
      telemetryLib.indexOf('type ValidatedPayload'),
      telemetryLib.indexOf('};', telemetryLib.indexOf('type ValidatedPayload')) + 2
    );
    assert.ok(
      typeBlock.includes('repoName'),
      'Expected ValidatedPayload type to include repoName field'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-07: validatePayload handles gitHubUser field
// ---------------------------------------------------------------------------
describe('T-ARF-07: telemetry.ts — validatePayload handles gitHubUser', () => {
  it('validatePayload function references gitHubUser', () => {
    const fnStart = telemetryLib.indexOf('export function validatePayload');
    const fnEnd = telemetryLib.indexOf('export function buildRunData');
    const fnBody = telemetryLib.slice(fnStart, fnEnd);
    assert.ok(
      fnBody.includes('gitHubUser'),
      'Expected validatePayload to handle gitHubUser field'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-08: validatePayload handles repoName field
// ---------------------------------------------------------------------------
describe('T-ARF-08: telemetry.ts — validatePayload handles repoName', () => {
  it('validatePayload function references repoName', () => {
    const fnStart = telemetryLib.indexOf('export function validatePayload');
    const fnEnd = telemetryLib.indexOf('export function buildRunData');
    const fnBody = telemetryLib.slice(fnStart, fnEnd);
    assert.ok(
      fnBody.includes('repoName'),
      'Expected validatePayload to handle repoName field'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-09: Validation rejects empty-string values for repo fields
// ---------------------------------------------------------------------------
describe('T-ARF-09: telemetry.ts — empty-string rejection for repo fields', () => {
  it('validation checks for empty string on gitHubUser or repoName', () => {
    const fnStart = telemetryLib.indexOf('export function validatePayload');
    const fnEnd = telemetryLib.indexOf('export function buildRunData');
    const fnBody = telemetryLib.slice(fnStart, fnEnd);
    // Look for patterns that indicate empty-string checking for repo fields:
    // e.g., .trim() === '' or === '' or .length === 0
    const hasEmptyCheck =
      (fnBody.includes('gitHubUser') || fnBody.includes('repoName')) &&
      (fnBody.includes('.trim()') || fnBody.includes("=== ''") || fnBody.includes('.length'));
    assert.ok(
      hasEmptyCheck,
      'Expected validatePayload to reject empty-string values for repo fields (trim/length/empty check)'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-10: buildRunData output includes gitHubUser
// ---------------------------------------------------------------------------
describe('T-ARF-10: telemetry.ts — buildRunData includes gitHubUser', () => {
  it('buildRunData return object references gitHubUser', () => {
    const fnStart = telemetryLib.indexOf('export function buildRunData');
    const fnBody = telemetryLib.slice(fnStart);
    assert.ok(
      fnBody.includes('gitHubUser'),
      'Expected buildRunData to include gitHubUser in its return object'
    );
  });
});

// ---------------------------------------------------------------------------
// T-ARF-11: buildRunData output includes repoName
// ---------------------------------------------------------------------------
describe('T-ARF-11: telemetry.ts — buildRunData includes repoName', () => {
  it('buildRunData return object references repoName', () => {
    const fnStart = telemetryLib.indexOf('export function buildRunData');
    const fnBody = telemetryLib.slice(fnStart);
    assert.ok(
      fnBody.includes('repoName'),
      'Expected buildRunData to include repoName in its return object'
    );
  });
});
