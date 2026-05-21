/**
 * Tests for feature: copy_key
 * Test IDs: T-CK-01 through T-CK-15
 * Runner: node --test test/feature_copy_key.test.js
 *
 * All tests are pure file-content assertions — no browser, no DOM, no build step.
 * Tests read TSX source files from disk using fs.readFileSync.
 *
 * Expected state BEFORE Codey implements the feature: all tests FAIL.
 * Expected state AFTER Codey implements the feature: all tests PASS.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

const keysClientPath = path.join(projectRoot, 'app/(dashboard)/keys/KeysClient.tsx');
const adminKeysClientPath = path.join(projectRoot, 'app/admin/keys/AdminKeysClient.tsx');

// ---------------------------------------------------------------------------
// KeysClient copy button (T-CK-01 through T-CK-05)
// ---------------------------------------------------------------------------

describe('KeysClient copy button', () => {
  let content;
  try {
    content = fs.readFileSync(keysClientPath, 'utf8');
  } catch {
    content = '';
  }

  it('T-CK-01: KeysClient.tsx contains a copy button element per row', () => {
    // Expect a CopyButton component or an inline copy <button> within the row map
    const hasCopyButton =
      content.includes('CopyButton') ||
      (content.includes('copy') && content.includes('<button'));
    assert.ok(
      hasCopyButton,
      'Expected KeysClient.tsx to contain a CopyButton component or inline copy button element'
    );
  });

  it('T-CK-02: KeysClient.tsx calls navigator.clipboard.writeText with keyPrefix', () => {
    assert.ok(
      content.includes('navigator.clipboard.writeText'),
      'Expected KeysClient.tsx to call navigator.clipboard.writeText'
    );
    // The argument to writeText should reference keyPrefix, not rawKey
    // Look for writeText(...keyPrefix...) pattern
    const writeTextIndex = content.indexOf('navigator.clipboard.writeText');
    assert.ok(writeTextIndex !== -1, 'navigator.clipboard.writeText not found');
    const snippet = content.slice(writeTextIndex, writeTextIndex + 100);
    assert.ok(
      snippet.includes('keyPrefix') || snippet.includes('prefix'),
      `Expected writeText call in KeysClient.tsx to reference keyPrefix, got: ${snippet}`
    );
  });

  it('T-CK-03: KeysClient.tsx references a success/checkmark state after clipboard write', () => {
    // The CopyButton (or equivalent inline copy handler) must have its own copied/success state.
    // RevealModal already has a `copied` state but is unrelated to per-row copy.
    // We require: a CopyButton component exists AND it contains a state toggle for feedback.
    assert.ok(
      content.includes('CopyButton'),
      'Expected KeysClient.tsx to define or import a CopyButton component for per-row copy'
    );
    // Within the region of source after "CopyButton" there must be a setCopied or setSuccess call
    const copyButtonIndex = content.indexOf('CopyButton');
    const afterCopyButton = content.slice(copyButtonIndex);
    const hasIconSwap =
      afterCopyButton.includes('setCopied(true)') ||
      afterCopyButton.includes('setSuccess(true)') ||
      afterCopyButton.includes('setChecked(true)');
    assert.ok(
      hasIconSwap,
      'Expected the CopyButton in KeysClient.tsx to set a success state (setCopied/setSuccess) after writeText resolves'
    );
  });

  it('T-CK-04: KeysClient.tsx copy button is not gated behind a revokedAt check', () => {
    // The revoke button IS gated: `{!key.revokedAt && <RevokeButton .../>}`
    // The copy button must NOT be inside that same conditional.
    // Require CopyButton to exist in the file first.
    assert.ok(
      content.includes('CopyButton'),
      'Expected KeysClient.tsx to contain a CopyButton component reference for key rows'
    );
    // CopyButton must NOT be nested inside a {!key.revokedAt && ...} block
    const revokedGatedBlock = content.match(/\{!key\.revokedAt\s*&&[\s\S]{0,200}<CopyButton/);
    assert.ok(
      revokedGatedBlock === null,
      'CopyButton in KeysClient.tsx must NOT be gated by {!key.revokedAt && ...}; revoked rows must still show the copy button'
    );
  });

  it('T-CK-05: KeysClient.tsx copy path references keyPrefix, not rawKey', () => {
    // The copy handler must use keyPrefix. rawKey is only in RevealModal (which is acceptable).
    // Find the CopyButton component or inline copy handler and confirm it uses keyPrefix.
    assert.ok(
      content.includes('keyPrefix'),
      'Expected KeysClient.tsx copy handler to reference keyPrefix'
    );
    // Find where writeText is called and ensure rawKey is not passed
    const writeTextMatch = content.match(/navigator\.clipboard\.writeText\(([^)]+)\)/);
    assert.ok(
      writeTextMatch !== null,
      'Expected navigator.clipboard.writeText(...) call in KeysClient.tsx'
    );
    const arg = writeTextMatch[1];
    assert.ok(
      !arg.includes('rawKey'),
      `Expected writeText argument to not include rawKey, got: ${arg}`
    );
  });
});

// ---------------------------------------------------------------------------
// AdminKeysClient copy button (T-CK-06 through T-CK-10)
// ---------------------------------------------------------------------------

describe('AdminKeysClient copy button', () => {
  let content;
  try {
    content = fs.readFileSync(adminKeysClientPath, 'utf8');
  } catch {
    content = '';
  }

  it('T-CK-06: AdminKeysClient.tsx contains a copy button element per row', () => {
    const hasCopyButton =
      content.includes('CopyButton') ||
      (content.includes('copy') && content.includes('<button'));
    assert.ok(
      hasCopyButton,
      'Expected AdminKeysClient.tsx to contain a CopyButton component or inline copy button element'
    );
  });

  it('T-CK-07: AdminKeysClient.tsx calls navigator.clipboard.writeText with keyPrefix', () => {
    assert.ok(
      content.includes('navigator.clipboard.writeText'),
      'Expected AdminKeysClient.tsx to call navigator.clipboard.writeText'
    );
    const writeTextIndex = content.indexOf('navigator.clipboard.writeText');
    assert.ok(writeTextIndex !== -1, 'navigator.clipboard.writeText not found');
    const snippet = content.slice(writeTextIndex, writeTextIndex + 100);
    assert.ok(
      snippet.includes('keyPrefix') || snippet.includes('prefix'),
      `Expected writeText call in AdminKeysClient.tsx to reference keyPrefix, got: ${snippet}`
    );
  });

  it('T-CK-08: AdminKeysClient.tsx references a success/checkmark state after clipboard write', () => {
    const hasCopiedState =
      content.includes('copied') ||
      content.includes('setCopied') ||
      content.includes('success') ||
      content.includes('setSuccess');
    assert.ok(
      hasCopiedState,
      'Expected AdminKeysClient.tsx to have a "copied" or "success" state variable for icon-swap feedback'
    );
    const hasStateSetAfterWrite =
      content.includes('setCopied(true)') || content.includes('setSuccess(true)') ||
      (content.includes('success') && content.includes('writeText'));
    assert.ok(
      hasStateSetAfterWrite,
      'Expected AdminKeysClient.tsx to set a success/copied state after clipboard writeText resolves'
    );
  });

  it('T-CK-09: AdminKeysClient.tsx copy button is not gated by revokedAt check', () => {
    const copyButtonRef = content.match(/CopyButton|handleCopy|copyPrefix|onCopy/);
    assert.ok(
      copyButtonRef !== null,
      'Expected AdminKeysClient.tsx to contain a CopyButton reference or copy handler for key rows'
    );
    // Must not be gated inside {!key.revokedAt && <CopyButton
    const revokedGatedBlock = content.match(/\{!key\.revokedAt\s*&&\s*\(\s*<CopyButton/s);
    assert.ok(
      revokedGatedBlock === null,
      'CopyButton in AdminKeysClient.tsx must NOT be gated by {!key.revokedAt && ...}; revoked rows must still show the copy button'
    );
  });

  it('T-CK-10: AdminKeysClient.tsx copy path references keyPrefix, not rawKey', () => {
    assert.ok(
      content.includes('keyPrefix'),
      'Expected AdminKeysClient.tsx copy handler to reference keyPrefix'
    );
    const writeTextMatch = content.match(/navigator\.clipboard\.writeText\(([^)]+)\)/);
    assert.ok(
      writeTextMatch !== null,
      'Expected navigator.clipboard.writeText(...) call in AdminKeysClient.tsx'
    );
    const arg = writeTextMatch[1];
    assert.ok(
      !arg.includes('rawKey'),
      `Expected writeText argument to not include rawKey, got: ${arg}`
    );
  });
});

// ---------------------------------------------------------------------------
// copy button degradation and a11y (T-CK-11 through T-CK-15)
// ---------------------------------------------------------------------------

describe('copy button degradation and a11y', () => {
  let keysContent;
  let adminContent;
  try {
    keysContent = fs.readFileSync(keysClientPath, 'utf8');
  } catch {
    keysContent = '';
  }
  try {
    adminContent = fs.readFileSync(adminKeysClientPath, 'utf8');
  } catch {
    adminContent = '';
  }

  it('T-CK-11: copy handler guards against missing navigator.clipboard (optional chain or try/catch)', () => {
    // navigator.clipboard may be undefined; guard via optional chaining (?.) or try/catch
    const keysGuarded =
      keysContent.includes('navigator?.clipboard') ||
      keysContent.includes('navigator.clipboard?.writeText') ||
      (keysContent.includes('try') && keysContent.includes('navigator.clipboard'));
    assert.ok(
      keysGuarded,
      'Expected KeysClient.tsx copy handler to guard against missing navigator.clipboard via optional chaining or try/catch'
    );

    const adminGuarded =
      adminContent.includes('navigator?.clipboard') ||
      adminContent.includes('navigator.clipboard?.writeText') ||
      (adminContent.includes('try') && adminContent.includes('navigator.clipboard'));
    assert.ok(
      adminGuarded,
      'Expected AdminKeysClient.tsx copy handler to guard against missing navigator.clipboard via optional chaining or try/catch'
    );
  });

  it('T-CK-12: copy handler uses .catch or try/catch around writeText to handle rejection', () => {
    // Either .catch() on the promise or a try/catch block must wrap writeText
    const keysCatchesError =
      keysContent.includes('.catch(') ||
      (keysContent.includes('try') && keysContent.includes('catch') && keysContent.includes('writeText'));
    assert.ok(
      keysCatchesError,
      'Expected KeysClient.tsx copy handler to handle writeText rejection with .catch or try/catch'
    );

    const adminCatchesError =
      adminContent.includes('.catch(') ||
      (adminContent.includes('try') && adminContent.includes('catch') && adminContent.includes('writeText'));
    assert.ok(
      adminCatchesError,
      'Expected AdminKeysClient.tsx copy handler to handle writeText rejection with .catch or try/catch'
    );
  });

  it('T-CK-13: copy button has aria-label referencing "Copy key prefix"', () => {
    assert.ok(
      keysContent.includes('aria-label') && keysContent.includes('Copy key prefix'),
      'Expected KeysClient.tsx copy button to have aria-label="Copy key prefix"'
    );
    assert.ok(
      adminContent.includes('aria-label') && adminContent.includes('Copy key prefix'),
      'Expected AdminKeysClient.tsx copy button to have aria-label="Copy key prefix"'
    );
  });

  it('T-CK-14: copy button is a <button> element (keyboard-accessible by default)', () => {
    // The copy control must be rendered as a <button> (not a <div> or <span>)
    // We look for the copy-specific button — aria-label or CopyButton renders a <button>
    const keysHasButton =
      keysContent.includes('<button') &&
      (keysContent.includes('Copy key prefix') || keysContent.includes('CopyButton'));
    assert.ok(
      keysHasButton,
      'Expected KeysClient.tsx copy control to be a <button> element for keyboard accessibility'
    );

    const adminHasButton =
      adminContent.includes('<button') &&
      (adminContent.includes('Copy key prefix') || adminContent.includes('CopyButton'));
    assert.ok(
      adminHasButton,
      'Expected AdminKeysClient.tsx copy control to be a <button> element for keyboard accessibility'
    );
  });

  it('T-CK-15: copy button has a small icon sizing class (h-4 w-4, size-4, or similar Tailwind class)', () => {
    // Accept Tailwind utility classes only — not bare numeric literals — to avoid false positives
    const smallIconPattern = /h-4 w-4|w-4 h-4|size-4|h-3\.5 w-3\.5|w-3\.5 h-3\.5|size-3\.5|h-5 w-5|w-5 h-5/;
    assert.ok(
      smallIconPattern.test(keysContent),
      'Expected KeysClient.tsx copy icon to use a compact Tailwind size class (e.g. h-4 w-4, size-4)'
    );
    assert.ok(
      smallIconPattern.test(adminContent),
      'Expected AdminKeysClient.tsx copy icon to use a compact Tailwind size class (e.g. h-4 w-4, size-4)'
    );
  });
});
