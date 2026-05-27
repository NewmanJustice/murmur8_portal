/**
 * Tests for api-key-management feature
 * Target module: lib/api-keys.ts (pure logic functions only)
 * Run with: node --test test/feature_api-key-management.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const worktreeRoot = path.resolve(__dirname, '..');

// Dynamically import the compiled/source module.
// lib/api-keys.ts will be imported as JS after tsx/ts-node transforms it,
// or we import the .js output. We use a path-based dynamic import.
const libPath = path.join(worktreeRoot, 'lib', 'api-keys.js');
const { generateKey, hashKey, maskKey, validateKeyName, isRevoked } = await import(libPath);

// ---------------------------------------------------------------------------
// T-01: generateKey() returns string starting with "mm8_"
// ---------------------------------------------------------------------------
test('T-01: generateKey returns key with mm8_ prefix', () => {
  const key = generateKey();
  assert.ok(typeof key === 'string', 'key should be a string');
  assert.ok(key.startsWith('mm8_'), `key should start with "mm8_", got: ${key.substring(0, 10)}`);
});

// ---------------------------------------------------------------------------
// T-02: generateKey() suffix is 64 lowercase hex chars
// ---------------------------------------------------------------------------
test('T-02: generateKey suffix is 64 lowercase hex characters', () => {
  const key = generateKey();
  const suffix = key.slice(4); // remove "mm8_"
  assert.strictEqual(suffix.length, 64, `suffix should be 64 chars, got ${suffix.length}`);
  assert.ok(/^[0-9a-f]{64}$/.test(suffix), `suffix should be lowercase hex, got: ${suffix}`);
});

// ---------------------------------------------------------------------------
// T-03: generateKey() produces unique values each call
// ---------------------------------------------------------------------------
test('T-03: generateKey produces unique values', () => {
  const keys = new Set();
  for (let i = 0; i < 10; i++) {
    keys.add(generateKey());
  }
  assert.strictEqual(keys.size, 10, 'All 10 generated keys should be unique');
});

// ---------------------------------------------------------------------------
// T-04: hashKey(raw) returns 64-char lowercase hex SHA-256
// ---------------------------------------------------------------------------
test('T-04: hashKey returns 64-char lowercase hex string', () => {
  const raw = generateKey();
  const hash = hashKey(raw);
  assert.strictEqual(typeof hash, 'string');
  assert.strictEqual(hash.length, 64, `SHA-256 hex digest should be 64 chars, got ${hash.length}`);
  assert.ok(/^[0-9a-f]{64}$/.test(hash), `hash should be lowercase hex`);
});

// ---------------------------------------------------------------------------
// T-05: hashKey(raw) is deterministic for same input
// ---------------------------------------------------------------------------
test('T-05: hashKey is deterministic', () => {
  const raw = 'mm8_testinputvalue1234567890abcdef1234567890abcdef1234567890abcd';
  const hash1 = hashKey(raw);
  const hash2 = hashKey(raw);
  assert.strictEqual(hash1, hash2, 'Same input should always produce same hash');
});

// ---------------------------------------------------------------------------
// T-06: hashKey(raw) differs for different inputs
// ---------------------------------------------------------------------------
test('T-06: hashKey produces different output for different inputs', () => {
  const raw1 = generateKey();
  const raw2 = generateKey();
  const hash1 = hashKey(raw1);
  const hash2 = hashKey(raw2);
  assert.notStrictEqual(hash1, hash2, 'Different keys should produce different hashes');
});

// ---------------------------------------------------------------------------
// T-07: maskKey(raw) returns first 12 chars + "..."
// ---------------------------------------------------------------------------
test('T-07: maskKey returns first 12 chars followed by ...', () => {
  const raw = 'mm8_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0';
  const masked = maskKey(raw);
  assert.strictEqual(masked, 'mm8_a1b2c3d4...', `Expected "mm8_a1b2c3d4...", got "${masked}"`);
});

// ---------------------------------------------------------------------------
// T-08: maskKey(raw) works for any key of sufficient length
// ---------------------------------------------------------------------------
test('T-08: maskKey works for any key length >= 12', () => {
  const raw = generateKey(); // always 68 chars (mm8_ + 64 hex)
  const masked = maskKey(raw);
  assert.ok(masked.endsWith('...'), 'masked key should end with ...');
  assert.strictEqual(masked.slice(0, 12), raw.slice(0, 12), 'first 12 chars should match raw key');
  assert.strictEqual(masked.length, 15, 'masked key should be 15 chars (12 + 3)');
});

// ---------------------------------------------------------------------------
// T-09: validateKeyName('') returns error (name required)
// ---------------------------------------------------------------------------
test('T-09: validateKeyName returns error for empty string', () => {
  const error = validateKeyName('');
  assert.ok(error !== null && error !== undefined, 'empty name should return an error');
  assert.ok(typeof error === 'string' && error.length > 0, 'error should be a non-empty string');
});

// ---------------------------------------------------------------------------
// T-10: validateKeyName(65-char string) returns error
// ---------------------------------------------------------------------------
test('T-10: validateKeyName returns error for name > 64 chars', () => {
  const longName = 'a'.repeat(65);
  const error = validateKeyName(longName);
  assert.ok(error !== null && error !== undefined, '65-char name should return an error');
  assert.ok(typeof error === 'string' && error.length > 0, 'error should be a non-empty string');
});

// ---------------------------------------------------------------------------
// T-11: validateKeyName(valid name) returns null
// ---------------------------------------------------------------------------
test('T-11: validateKeyName returns null for valid name', () => {
  const error = validateKeyName('my-saas-project');
  assert.strictEqual(error, null, 'valid name should return null');
});

// ---------------------------------------------------------------------------
// T-12: validateKeyName(64-char string) returns null (boundary)
// ---------------------------------------------------------------------------
test('T-12: validateKeyName accepts exactly 64-char name (boundary)', () => {
  const maxName = 'a'.repeat(64);
  const error = validateKeyName(maxName);
  assert.strictEqual(error, null, '64-char name should be valid (boundary)');
});

// ---------------------------------------------------------------------------
// T-13: isRevoked returns true when revokedAt is set
// ---------------------------------------------------------------------------
test('T-13: isRevoked returns true when revokedAt is set', () => {
  const key = { revokedAt: new Date() };
  assert.strictEqual(isRevoked(key), true, 'key with revokedAt set should be revoked');
});

// ---------------------------------------------------------------------------
// T-14: isRevoked returns false when revokedAt is null
// ---------------------------------------------------------------------------
test('T-14: isRevoked returns false when revokedAt is null', () => {
  const key = { revokedAt: null };
  assert.strictEqual(isRevoked(key), false, 'key with revokedAt null should not be revoked');
});

// ---------------------------------------------------------------------------
// T-15: KeysClient.tsx table must not render CopyButton next to keyPrefix
// AC6 — prefix is read-only; clipboard icon removed from table rows
// ---------------------------------------------------------------------------
test('T-15: KeysClient table rows must not render CopyButton next to keyPrefix', async () => {
  const fs = await import('node:fs');
  const keysClientPath = path.join(worktreeRoot, 'app', '(dashboard)', 'keys', 'KeysClient.tsx');
  const src = fs.readFileSync(keysClientPath, 'utf8');

  // CopyButton component must not appear inside the keys table rows
  // (it may still exist in the file if shared, but must not be used in the table)
  const tableSection = src.slice(src.indexOf('Keys table'));
  assert.ok(
    !tableSection.includes('<CopyButton'),
    'CopyButton must not be rendered in the keys table rows'
  );
});

// ---------------------------------------------------------------------------
// T-16: AdminKeysClient.tsx table must not render CopyButton next to keyPrefix
// AC4 (admin-view) — prefix is read-only in the admin table too
// ---------------------------------------------------------------------------
test('T-16: AdminKeysClient table must not render CopyButton next to keyPrefix', async () => {
  const fs = await import('node:fs');
  const adminClientPath = path.join(worktreeRoot, 'app', 'admin', 'keys', 'AdminKeysClient.tsx');
  const src = fs.readFileSync(adminClientPath, 'utf8');

  const tableSection = src.slice(src.indexOf('<tbody>'));
  assert.ok(
    !tableSection.includes('<CopyButton'),
    'CopyButton must not be rendered in the admin keys table rows'
  );
});

// ---------------------------------------------------------------------------
// T-17: RevealModal copy button must write the rawKey (not keyPrefix) to clipboard
// AC3 — the modal copy button copies the full raw key value
// ---------------------------------------------------------------------------
test('T-17: RevealModal copy button writes rawKey to clipboard', async () => {
  const fs = await import('node:fs');
  const keysClientPath = path.join(worktreeRoot, 'app', '(dashboard)', 'keys', 'KeysClient.tsx');
  const src = fs.readFileSync(keysClientPath, 'utf8');

  // RevealModal must use rawKey (not keyPrefix) in its clipboard.writeText call
  const modalSection = src.slice(src.indexOf('RevealModal'), src.indexOf('RevokeButton'));
  assert.ok(
    modalSection.includes('clipboard.writeText(rawKey)'),
    'RevealModal must call navigator.clipboard.writeText(rawKey)'
  );
});
