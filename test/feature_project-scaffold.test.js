/**
 * Tests for feature: project-scaffold (core)
 * Test IDs: T-01 through T-09
 * Runner: node --test test/feature_project-scaffold.test.js
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
// T-01: starling.* colour tokens present in tailwind.config.ts
// ---------------------------------------------------------------------------
describe('T-01: tailwind.config.ts — starling colour tokens', () => {
  const STARLING_TOKENS = [
    'ink', 'night', 'dusk', 'blue', 'slate', 'silver', 'cloud', 'mist', 'sky', 'cyan',
  ];

  it('tailwind.config.ts exists', () => {
    assert.ok(
      fileExists('tailwind.config.ts'),
      'Expected tailwind.config.ts at project root'
    );
  });

  for (const token of STARLING_TOKENS) {
    it(`starling.${token} token is present`, () => {
      const content = readFile('tailwind.config.ts');
      assert.ok(
        content.includes(token),
        `Expected starling.${token} token in tailwind.config.ts`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-02: agent.* colour tokens present in tailwind.config.ts
// ---------------------------------------------------------------------------
describe('T-02: tailwind.config.ts — agent colour tokens', () => {
  const AGENT_TOKENS = ['alex', 'cass', 'nigel', 'codey'];

  for (const token of AGENT_TOKENS) {
    it(`agent.${token} token is present`, () => {
      const content = readFile('tailwind.config.ts');
      assert.ok(
        content.includes(token),
        `Expected agent.${token} token in tailwind.config.ts`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-03: fontFamily, borderRadius, boxShadow, backgroundImage keys present
// ---------------------------------------------------------------------------
describe('T-03: tailwind.config.ts — extended theme keys', () => {
  it('fontFamily key present', () => {
    const content = readFile('tailwind.config.ts');
    assert.ok(content.includes('fontFamily'), 'Expected fontFamily in tailwind.config.ts');
  });

  it('borderRadius brand variant present', () => {
    const content = readFile('tailwind.config.ts');
    assert.ok(content.includes('brand'), 'Expected borderRadius brand variant in tailwind.config.ts');
  });

  it('boxShadow brand/glow variants present', () => {
    const content = readFile('tailwind.config.ts');
    assert.ok(content.includes('boxShadow'), 'Expected boxShadow in tailwind.config.ts');
    assert.ok(content.includes('glow'), 'Expected glow shadow variant in tailwind.config.ts');
  });

  it('backgroundImage utilities present', () => {
    const content = readFile('tailwind.config.ts');
    assert.ok(
      content.includes('backgroundImage') || content.includes('starling-radial'),
      'Expected backgroundImage utilities in tailwind.config.ts'
    );
  });
});

// ---------------------------------------------------------------------------
// T-04: globals.css includes all required CSS variables
// ---------------------------------------------------------------------------
describe('T-04: globals.css — CSS custom properties', () => {
  const CSS_VARS = [
    '--starling-ink',
    '--starling-night',
    '--starling-dusk',
    '--starling-blue',
    '--starling-slate',
    '--starling-silver',
    '--starling-cloud',
    '--starling-mist',
    '--starling-sky',
    '--starling-cyan',
    '--agent-alex',
    '--agent-cass',
    '--agent-nigel',
    '--agent-codey',
  ];

  const GLOBALS_CANDIDATES = [
    'app/globals.css',
    'src/app/globals.css',
    'styles/globals.css',
  ];

  function findGlobals() {
    return GLOBALS_CANDIDATES.find(p => fileExists(p));
  }

  it('globals.css exists', () => {
    const found = findGlobals();
    assert.ok(found, `Expected globals.css at one of: ${GLOBALS_CANDIDATES.join(', ')}`);
  });

  for (const varName of CSS_VARS) {
    it(`${varName} is declared`, () => {
      const filePath = findGlobals();
      assert.ok(filePath, `globals.css not found; cannot check ${varName}`);
      const content = readFile(filePath);
      assert.ok(
        content.includes(varName),
        `Expected CSS variable ${varName} in ${filePath}`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-05: schema.prisma — User model with all required fields
// ---------------------------------------------------------------------------
describe('T-05: schema.prisma — User model', () => {
  const USER_FIELDS = ['githubId', 'name', 'email', 'avatarUrl', 'isAdmin', 'createdAt'];

  it('schema.prisma exists', () => {
    assert.ok(
      fileExists('prisma/schema.prisma'),
      'Expected prisma/schema.prisma to exist'
    );
  });

  it('User model is defined', () => {
    const content = readFile('prisma/schema.prisma');
    assert.ok(content.includes('model User'), 'Expected "model User" in prisma/schema.prisma');
  });

  for (const field of USER_FIELDS) {
    it(`User.${field} field is present`, () => {
      const content = readFile('prisma/schema.prisma');
      assert.ok(
        content.includes(field),
        `Expected field "${field}" in User model in prisma/schema.prisma`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-06: schema.prisma — ApiKey model with all required fields
// ---------------------------------------------------------------------------
describe('T-06: schema.prisma — ApiKey model', () => {
  const APIKEY_FIELDS = ['key', 'name', 'userId', 'createdAt', 'lastUsedAt', 'revokedAt'];

  it('ApiKey model is defined', () => {
    const content = readFile('prisma/schema.prisma');
    assert.ok(
      content.includes('model ApiKey'),
      'Expected "model ApiKey" in prisma/schema.prisma'
    );
  });

  for (const field of APIKEY_FIELDS) {
    it(`ApiKey.${field} field is present`, () => {
      const content = readFile('prisma/schema.prisma');
      assert.ok(
        content.includes(field),
        `Expected field "${field}" in ApiKey model in prisma/schema.prisma`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-07: schema.prisma — Run model with all required fields
// ---------------------------------------------------------------------------
describe('T-07: schema.prisma — Run model', () => {
  const RUN_FIELDS = [
    'userId', 'apiKeyId', 'slug', 'status', 'type',
    'startedAt', 'completedAt', 'totalDurationMs', 'totalCost',
    'commitHash', 'failedStage', 'pausedAfter', 'parentRunId',
    'stages', 'receivedAt',
  ];

  it('Run model is defined', () => {
    const content = readFile('prisma/schema.prisma');
    assert.ok(
      content.includes('model Run'),
      'Expected "model Run" in prisma/schema.prisma'
    );
  });

  it('stages field uses Json type (JSONB)', () => {
    const content = readFile('prisma/schema.prisma');
    assert.ok(
      content.includes('stages') && content.includes('Json'),
      'Expected stages field with Json type in Run model (required for JSONB extensibility)'
    );
  });

  for (const field of RUN_FIELDS) {
    it(`Run.${field} field is present`, () => {
      const content = readFile('prisma/schema.prisma');
      assert.ok(
        content.includes(field),
        `Expected field "${field}" in Run model in prisma/schema.prisma`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-08: schema.prisma — NextAuth adapter models present
// ---------------------------------------------------------------------------
describe('T-08: schema.prisma — NextAuth adapter models', () => {
  const ADAPTER_MODELS = ['Account', 'Session', 'VerificationToken'];

  for (const model of ADAPTER_MODELS) {
    it(`${model} adapter model is defined`, () => {
      const content = readFile('prisma/schema.prisma');
      assert.ok(
        content.includes(`model ${model}`),
        `Expected "model ${model}" in prisma/schema.prisma (NextAuth adapter tables)`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// T-09: auth.ts exists and references GitHub provider env vars
// ---------------------------------------------------------------------------
describe('T-09: auth.ts — NextAuth GitHub provider wiring', () => {
  const AUTH_CANDIDATES = ['auth.ts', 'src/auth.ts'];

  function findAuth() {
    return AUTH_CANDIDATES.find(p => fileExists(p));
  }

  it('auth.ts exists at project root or src/', () => {
    const found = findAuth();
    assert.ok(found, `Expected auth.ts at one of: ${AUTH_CANDIDATES.join(', ')}`);
  });

  it('references GITHUB_CLIENT_ID env var', () => {
    const filePath = findAuth();
    assert.ok(filePath, 'auth.ts not found');
    const content = readFile(filePath);
    assert.ok(
      content.includes('GITHUB_CLIENT_ID'),
      `Expected GITHUB_CLIENT_ID env var reference in ${filePath}`
    );
  });

  it('references GITHUB_CLIENT_SECRET env var', () => {
    const filePath = findAuth();
    assert.ok(filePath, 'auth.ts not found');
    const content = readFile(filePath);
    assert.ok(
      content.includes('GITHUB_CLIENT_SECRET'),
      `Expected GITHUB_CLIENT_SECRET env var reference in ${filePath}`
    );
  });

  it('references GitHub provider', () => {
    const filePath = findAuth();
    assert.ok(filePath, 'auth.ts not found');
    const content = readFile(filePath);
    assert.ok(
      content.toLowerCase().includes('github'),
      `Expected GitHub provider reference in ${filePath}`
    );
  });
});
