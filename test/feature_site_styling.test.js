/**
 * Tests for feature: site_styling
 * Test IDs: T-SS-01 through T-SS-19
 * Runner: node --test test/feature_site_styling.test.js
 *
 * All tests are pure file-content assertions — no browser, no DOM, no build step.
 * Tests read files directly from disk using fs.readFileSync with paths relative
 * to the project root (process.cwd()).
 *
 * Expected state BEFORE Codey implements the fix: all tests FAIL.
 * Expected state AFTER Codey implements the fix: all tests PASS.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

// ---------------------------------------------------------------------------
// postcss.config.mjs — file existence and ESM plugin structure
// ---------------------------------------------------------------------------

describe('postcss.config.mjs', () => {
  const configPath = path.join(projectRoot, 'postcss.config.mjs');

  it('T-SS-01: postcss.config.mjs exists at project root', () => {
    assert.ok(
      fs.existsSync(configPath),
      `Expected postcss.config.mjs to exist at ${configPath}`
    );
  });

  it('T-SS-02: file content uses ESM "export default" syntax', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      content.includes('export default'),
      `Expected "export default" in postcss.config.mjs but got:\n${content}`
    );
  });

  it('T-SS-03: file does not use "module.exports" (no CJS leak)', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      !content.includes('module.exports'),
      `Expected no "module.exports" in postcss.config.mjs but found one`
    );
  });

  it('T-SS-04: "tailwindcss" is declared in the plugins object', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      content.includes('tailwindcss'),
      `Expected "tailwindcss" to appear in postcss.config.mjs but got:\n${content}`
    );
  });

  it('T-SS-05: "autoprefixer" is declared in the plugins object', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      content.includes('autoprefixer'),
      `Expected "autoprefixer" to appear in postcss.config.mjs but got:\n${content}`
    );
  });

  it('T-SS-06: plugins are inside a "plugins" key', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    // Accept either `plugins:` (object shorthand) or `"plugins"` (quoted key)
    const hasPluginsKey = content.includes('plugins:') || content.includes('"plugins"');
    assert.ok(
      hasPluginsKey,
      `Expected a "plugins" key in postcss.config.mjs but got:\n${content}`
    );
  });
});

// ---------------------------------------------------------------------------
// tailwind.config.ts — font CSS variable references and preserved tokens
// ---------------------------------------------------------------------------

describe('tailwind.config.ts font variables', () => {
  const configPath = path.join(projectRoot, 'tailwind.config.ts');

  it('T-SS-07: fontFamily.sans contains var(--font-inter)', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      content.includes('var(--font-inter)'),
      `Expected "var(--font-inter)" in tailwind.config.ts fontFamily.sans but got:\n${content}`
    );
  });

  it('T-SS-08: fontFamily.mono contains var(--font-jetbrains-mono)', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      content.includes('var(--font-jetbrains-mono)'),
      `Expected "var(--font-jetbrains-mono)" in tailwind.config.ts fontFamily.mono but got:\n${content}`
    );
  });

  it('T-SS-09: no Tailwind color tokens removed — starling-ink, starling-sky, and agent keys still present', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      content.includes('starling-ink') || content.includes('"ink"') || content.includes("ink:"),
      `Expected starling ink color token to remain in tailwind.config.ts`
    );
    assert.ok(
      content.includes('starling-sky') || content.includes('"sky"') || content.includes("sky:"),
      `Expected starling sky color token to remain in tailwind.config.ts`
    );
    assert.ok(
      content.includes('agent'),
      `Expected "agent" color key to remain in tailwind.config.ts`
    );
  });

  it('T-SS-10: no spacing/border config removed — borderRadius and boxShadow keys still present', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      content.includes('borderRadius'),
      `Expected "borderRadius" to remain in tailwind.config.ts`
    );
    assert.ok(
      content.includes('boxShadow'),
      `Expected "boxShadow" to remain in tailwind.config.ts`
    );
  });

  it('T-SS-11: bare string "Inter" no longer appears as the standalone first font entry', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    // The old config had "Inter" as a plain string literal (first array element).
    // After the fix the variable reference replaces it; the bare name must be gone.
    assert.ok(
      !content.includes('"Inter"'),
      `Expected bare string "Inter" to be removed from tailwind.config.ts but it is still present`
    );
  });

  it('T-SS-12: bare string "JetBrains Mono" no longer appears as the standalone first font entry', () => {
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(
      !content.includes('"JetBrains Mono"'),
      `Expected bare string "JetBrains Mono" to be removed from tailwind.config.ts but it is still present`
    );
  });
});

// ---------------------------------------------------------------------------
// logo and favicon wiring — app/layout.tsx and page-level Image usage
// ---------------------------------------------------------------------------

describe('logo and favicon wiring', () => {
  it('T-SS-13: app/layout.tsx references favicon.svg in its metadata export', () => {
    const filePath = path.join(projectRoot, 'app/layout.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes('favicon.svg'),
      `Expected "favicon.svg" to appear in app/layout.tsx metadata but got:\n${content}`
    );
  });

  it('T-SS-14: app/page.tsx (login page) uses Next.js Image component with /murmur8-logo-full.svg', () => {
    const filePath = path.join(projectRoot, 'app/page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes('murmur8-logo-full.svg'),
      `Expected "murmur8-logo-full.svg" to appear in app/page.tsx but got:\n${content}`
    );
    assert.ok(
      content.includes('Image'),
      `Expected Next.js "Image" import/usage to appear in app/page.tsx but got:\n${content}`
    );
  });

  it('T-SS-15: app/dashboard/page.tsx uses Next.js Image component with /murmur8-logo-compact.svg in the header', () => {
    const filePath = path.join(projectRoot, 'app/dashboard/page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes('murmur8-logo-compact.svg'),
      `Expected "murmur8-logo-compact.svg" to appear in app/dashboard/page.tsx but got:\n${content}`
    );
  });

  it('T-SS-16: app/dashboard/runs/[id]/page.tsx uses Next.js Image component with /murmur8-logo-compact.svg in the header', () => {
    const filePath = path.join(projectRoot, 'app/dashboard/runs/[id]/page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes('murmur8-logo-compact.svg'),
      `Expected "murmur8-logo-compact.svg" to appear in app/dashboard/runs/[id]/page.tsx but got:\n${content}`
    );
  });

  it('T-SS-17: app/admin/keys/page.tsx has a <header> element and uses Next.js Image with /murmur8-logo-compact.svg', () => {
    const filePath = path.join(projectRoot, 'app/admin/keys/page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes('<header'),
      `Expected a "<header" element in app/admin/keys/page.tsx but got:\n${content}`
    );
    assert.ok(
      content.includes('murmur8-logo-compact.svg'),
      `Expected "murmur8-logo-compact.svg" to appear in app/admin/keys/page.tsx but got:\n${content}`
    );
  });
});

// ---------------------------------------------------------------------------
// light theme on keys pages (RS10, RS9 updated) — matching dashboard theme
// ---------------------------------------------------------------------------

describe('keys pages light theme', () => {
  it('T-SS-18: app/(dashboard)/keys/page.tsx uses bg-starling-cloud (light page background)', () => {
    const filePath = path.join(projectRoot, 'app/(dashboard)/keys/page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes('bg-starling-cloud'),
      `Expected "bg-starling-cloud" in app/(dashboard)/keys/page.tsx but got:\n${content}`
    );
    assert.ok(
      !content.includes('bg-starling-night'),
      `Expected "bg-starling-night" to be absent from app/(dashboard)/keys/page.tsx (should use light theme)`
    );
  });

  it('T-SS-19: app/admin/keys/page.tsx uses bg-starling-cloud (light page background, not dark)', () => {
    const filePath = path.join(projectRoot, 'app/admin/keys/page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes('bg-starling-cloud'),
      `Expected "bg-starling-cloud" in app/admin/keys/page.tsx but got:\n${content}`
    );
    assert.ok(
      !content.includes('bg-starling-night'),
      `Expected "bg-starling-night" to be absent from app/admin/keys/page.tsx (should use light theme)`
    );
  });
});
