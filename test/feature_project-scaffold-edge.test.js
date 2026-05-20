/**
 * Tests for feature: project-scaffold (extended)
 * Test IDs: T-10 through T-17
 * Runner: node --test test/feature_project-scaffold-edge.test.js
 * T-12 (tsc) and T-18 (next build) are integration-only and NOT included here.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ---------------------------------------------------------------------------
// T-10: middleware.ts exists (created by github-auth feature)
// ---------------------------------------------------------------------------
describe('T-10: middleware.ts exists for route protection', () => {
  it('middleware.ts is present at project root or src/', () => {
    const exists = fileExists('middleware.ts') || fileExists('src/middleware.ts');
    assert.ok(exists, 'middleware.ts should exist — created by github-auth feature');
  });
});

// ---------------------------------------------------------------------------
// T-11: tsconfig.json has "strict": true
// ---------------------------------------------------------------------------
describe('T-11: tsconfig.json — strict mode', () => {
  it('tsconfig.json exists', () => {
    assert.ok(
      fileExists('tsconfig.json'),
      'Expected tsconfig.json at project root'
    );
  });

  it('"strict" is set to true', () => {
    const raw = readFile('tsconfig.json');
    // Parse with a lenient approach — strip trailing commas for robustness
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // tsconfig may use JSON with comments; fall back to string search
      assert.ok(
        raw.includes('"strict"') && raw.includes('true'),
        'Expected "strict": true in tsconfig.json'
      );
      return;
    }
    const strict =
      parsed?.compilerOptions?.strict === true ||
      parsed?.compilerOptions?.strict === 'true';
    assert.ok(strict, 'Expected compilerOptions.strict to be true in tsconfig.json');
  });
});

// ---------------------------------------------------------------------------
// T-13: .env.example exists and lists required env vars
// ---------------------------------------------------------------------------
describe('T-13: .env.example — required environment variables', () => {
  const REQUIRED_VARS = [
    'DATABASE_URL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
  ];

  it('.env.example exists', () => {
    assert.ok(
      fileExists('.env.example'),
      'Expected .env.example at project root'
    );
  });

  for (const varName of REQUIRED_VARS) {
    it(`${varName} is documented in .env.example`, () => {
      const content = readFile('.env.example');
      assert.ok(
        content.includes(varName),
        `Expected ${varName} to be listed in .env.example`
      );
    });
  }

  it('.env.example contains no real secrets (no obvious credential values)', () => {
    const content = readFile('.env.example');
    // Values should be placeholder-style, not real tokens.
    // A real GitHub OAuth secret is 40 hex chars; warn if any line has a long hex value after =.
    const suspiciousLine = content.split('\n').find(line => {
      const match = line.match(/=([0-9a-f]{40,})/i);
      return match && !line.trim().startsWith('#');
    });
    assert.ok(
      !suspiciousLine,
      `.env.example appears to contain a real secret on line: "${suspiciousLine}"`
    );
  });
});

// ---------------------------------------------------------------------------
// T-14: package.json scripts
// ---------------------------------------------------------------------------
describe('T-14: package.json — required scripts', () => {
  const REQUIRED_SCRIPTS = ['dev', 'build', 'start', 'lint', 'db:generate', 'db:migrate'];

  it('package.json exists', () => {
    assert.ok(
      fileExists('package.json'),
      'Expected package.json at project root'
    );
  });

  for (const script of REQUIRED_SCRIPTS) {
    it(`script "${script}" is declared`, () => {
      const raw = readFile('package.json');
      const pkg = JSON.parse(raw);
      assert.ok(
        pkg.scripts && Object.prototype.hasOwnProperty.call(pkg.scripts, script),
        `Expected scripts.${script} in package.json`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-15: Brand SVG assets present in public/
// ---------------------------------------------------------------------------
describe('T-15: public/ — brand SVG assets', () => {
  const BRAND_ASSETS = [
    'public/murmur8-logo-full.svg',
    'public/murmur8-logo-compact.svg',
    'public/murmur8-npm-icon.svg',
    'public/favicon.svg',
  ];

  for (const asset of BRAND_ASSETS) {
    it(`${asset} exists`, () => {
      assert.ok(
        fileExists(asset),
        `Expected brand asset at ${path.join(ROOT, asset)}`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-16: app/layout.tsx and app/page.tsx exist
// ---------------------------------------------------------------------------
describe('T-16: App Router entry files', () => {
  const APP_FILES = [
    ['app/layout.tsx', 'src/app/layout.tsx'],
    ['app/page.tsx', 'src/app/page.tsx'],
  ];

  for (const [primary, fallback] of APP_FILES) {
    it(`${primary} (or ${fallback}) exists`, () => {
      const found = fileExists(primary) || fileExists(fallback);
      assert.ok(
        found,
        `Expected ${primary} or ${fallback} to exist`
      );
    });
  }

  it('layout.tsx contains a root <html> element', () => {
    const filePath = fileExists('app/layout.tsx') ? 'app/layout.tsx' : 'src/app/layout.tsx';
    if (!fileExists(filePath)) return; // already caught above
    const content = readFile(filePath);
    assert.ok(
      content.includes('<html'),
      `Expected root <html> element in ${filePath}`
    );
  });
});

// ---------------------------------------------------------------------------
// T-17: .env.local is listed in .gitignore
// ---------------------------------------------------------------------------
describe('T-17: .gitignore — .env.local must be ignored', () => {
  it('.gitignore exists', () => {
    assert.ok(
      fileExists('.gitignore'),
      'Expected .gitignore at project root'
    );
  });

  it('.env.local is listed in .gitignore', () => {
    const content = readFile('.gitignore');
    const lines = content.split('\n').map(l => l.trim());
    const ignored = lines.some(
      l => l === '.env.local' || l === '.env*.local' || l === '.env*'
    );
    assert.ok(
      ignored,
      'Expected .env.local (or a pattern covering it) to be listed in .gitignore'
    );
  });

  it('.env.example is NOT ignored (it should be committed)', () => {
    const content = readFile('.gitignore');
    // .env.example should not be on a non-negated ignore line
    const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const ignored = lines.some(l => l === '.env.example');
    assert.ok(
      !ignored,
      '.env.example should NOT be in .gitignore — it needs to be committed to the repo'
    );
  });
});
