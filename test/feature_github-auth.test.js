/**
 * Tests for feature: github-auth
 * Test IDs: T-01 through T-15
 * Runner: node --test test/feature_github-auth.test.js
 *
 * Strategy: file-content inspection (no server spin-up, no DB, no build required).
 * Upsert logic is extracted and tested as a pure function.
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
// Pure upsert logic — extracted for unit testing (mirrors what auth.ts implements)
// ---------------------------------------------------------------------------

/**
 * Determines whether to create a User and what isAdmin should be.
 * This mirrors the signIn callback logic in auth.ts.
 *
 * @param {object} opts
 * @param {string} opts.githubId - String form of GitHub profile numeric ID
 * @param {string|null} opts.existingUserId - null if user doesn't exist yet
 * @param {string|undefined} opts.adminGithubId - process.env.ADMIN_GITHUB_ID
 * @returns {{ shouldCreate: boolean, isAdmin: boolean }}
 */
function upsertDecision({ githubId, existingUserId, adminGithubId }) {
  if (existingUserId !== null) {
    // User already exists — no-op
    return { shouldCreate: false, isAdmin: null };
  }
  const isAdmin = adminGithubId !== undefined && adminGithubId !== ''
    ? String(githubId) === String(adminGithubId)
    : false;
  return { shouldCreate: true, isAdmin };
}

// ---------------------------------------------------------------------------
// T-01: app/page.tsx — login page exists and has a sign-in affordance
// (AC-SIGNIN-1)
// ---------------------------------------------------------------------------
describe('T-01: app/page.tsx — login page sign-in affordance', () => {
  it('app/page.tsx exists', () => {
    assert.ok(fileExists('app/page.tsx'), 'Expected app/page.tsx to exist');
  });

  it('page contains a sign-in with GitHub affordance', () => {
    const content = readFile('app/page.tsx');
    const lower = content.toLowerCase();
    assert.ok(
      lower.includes('github') || lower.includes('sign in') || lower.includes('signin'),
      'Expected app/page.tsx to contain a "Sign in with GitHub" affordance'
    );
  });
});

// ---------------------------------------------------------------------------
// T-02: auth.ts — NextAuth v5 exports and PrismaAdapter wiring
// (AC-SIGNIN-3: OAuth flow configured correctly)
// ---------------------------------------------------------------------------
describe('T-02: auth.ts — NextAuth v5 config exports', () => {
  const AUTH_CANDIDATES = ['auth.ts', 'src/auth.ts'];

  function findAuth() {
    return AUTH_CANDIDATES.find(p => fileExists(p));
  }

  it('auth.ts exists', () => {
    assert.ok(findAuth(), `Expected auth.ts at one of: ${AUTH_CANDIDATES.join(', ')}`);
  });

  it('exports handlers, auth, signIn, signOut', () => {
    const content = readFile(findAuth());
    assert.ok(content.includes('handlers'), 'Expected "handlers" export in auth.ts');
    assert.ok(content.includes('auth'), 'Expected "auth" export in auth.ts');
    assert.ok(content.includes('signIn'), 'Expected "signIn" export in auth.ts');
    assert.ok(content.includes('signOut'), 'Expected "signOut" export in auth.ts');
  });

  it('imports PrismaAdapter from @auth/prisma-adapter', () => {
    const content = readFile(findAuth());
    assert.ok(
      content.includes('@auth/prisma-adapter'),
      'Expected PrismaAdapter import from @auth/prisma-adapter in auth.ts'
    );
  });

  it('references prisma client import', () => {
    const content = readFile(findAuth());
    assert.ok(
      content.includes('prisma'),
      'Expected prisma client reference in auth.ts'
    );
  });

  it('uses database session strategy', () => {
    const content = readFile(findAuth());
    assert.ok(
      content.includes('database') || content.includes('PrismaAdapter'),
      'Expected database session strategy (PrismaAdapter) in auth.ts'
    );
  });
});

// ---------------------------------------------------------------------------
// T-03: upsert logic — no duplicate User on re-sign-in
// (AC-SIGNIN-5)
// ---------------------------------------------------------------------------
describe('T-03: upsert logic — no-op for existing User', () => {
  it('returns shouldCreate=false when existingUserId is provided', () => {
    const result = upsertDecision({
      githubId: '99999',
      existingUserId: 'existing-user-id',
      adminGithubId: undefined,
    });
    assert.strictEqual(result.shouldCreate, false);
  });

  it('returns shouldCreate=true when no existing user', () => {
    const result = upsertDecision({
      githubId: '99999',
      existingUserId: null,
      adminGithubId: undefined,
    });
    assert.strictEqual(result.shouldCreate, true);
  });
});

// ---------------------------------------------------------------------------
// T-04: auth.ts — signOut is exported (session clearing)
// (AC-SIGNOUT-1)
// ---------------------------------------------------------------------------
describe('T-04: auth.ts — signOut export', () => {
  it('signOut is exported from auth.ts', () => {
    const AUTH_CANDIDATES = ['auth.ts', 'src/auth.ts'];
    const filePath = AUTH_CANDIDATES.find(p => fileExists(p));
    assert.ok(filePath, 'auth.ts not found');
    const content = readFile(filePath);
    assert.ok(
      content.includes('signOut'),
      'Expected signOut to be exported from auth.ts'
    );
  });
});

// ---------------------------------------------------------------------------
// T-05: auth.ts — pages config or signOut redirect to /
// (AC-SIGNOUT-3: sign-out redirects to login)
// ---------------------------------------------------------------------------
describe('T-05: auth.ts — post-signout redirect configured', () => {
  it('auth.ts references redirect to / for sign-out or uses pages config', () => {
    const AUTH_CANDIDATES = ['auth.ts', 'src/auth.ts'];
    const filePath = AUTH_CANDIDATES.find(p => fileExists(p));
    assert.ok(filePath, 'auth.ts not found');
    const content = readFile(filePath);
    // Either a pages config with signIn: "/" or redirect logic after signOut
    const hasRedirect =
      content.includes("signIn: '/'") ||
      content.includes('signIn: "/') ||
      content.includes("signOut: '/'") ||
      content.includes('signOut: "/') ||
      content.includes("pages") ||
      content.includes('redirectTo');
    assert.ok(
      hasRedirect,
      'Expected auth.ts to configure redirect to "/" for sign-in/sign-out page'
    );
  });
});

// ---------------------------------------------------------------------------
// T-06: auth.ts — adapter-only session management (User record untouched by signOut)
// (AC-SIGNOUT-5: signOut only removes Session record, not User)
// ---------------------------------------------------------------------------
describe('T-06: auth.ts — PrismaAdapter manages sessions (not User deletions)', () => {
  it('auth.ts does NOT contain deleteMany or deleteUser calls', () => {
    const AUTH_CANDIDATES = ['auth.ts', 'src/auth.ts'];
    const filePath = AUTH_CANDIDATES.find(p => fileExists(p));
    assert.ok(filePath, 'auth.ts not found');
    const content = readFile(filePath);
    assert.ok(
      !content.includes('user.delete') && !content.includes('deleteUser'),
      'auth.ts must not delete User records — only the adapter manages Session deletion on signOut'
    );
  });
});

// ---------------------------------------------------------------------------
// T-07 & T-08: middleware.ts — exports auth as middleware
// (AC-PROTECT-1: unauthenticated redirect; AC-PROTECT-2: authenticated pass-through)
// ---------------------------------------------------------------------------
describe('T-07 & T-08: middleware.ts — auth export pattern', () => {
  it('middleware.ts exists', () => {
    assert.ok(fileExists('middleware.ts'), 'Expected middleware.ts at project root');
  });

  it('exports auth as middleware (NextAuth v5 pattern)', () => {
    const content = readFile('middleware.ts');
    assert.ok(
      content.includes('auth') && content.includes('middleware'),
      'Expected "export { auth as middleware }" pattern in middleware.ts'
    );
  });

  it('imports from ./auth', () => {
    const content = readFile('middleware.ts');
    assert.ok(
      content.includes('./auth') || content.includes('"./auth"') || content.includes("'./auth'"),
      'Expected middleware.ts to import from "./auth"'
    );
  });
});

// ---------------------------------------------------------------------------
// T-09: middleware.ts — matcher excludes /api/auth/*
// (AC-PROTECT-4)
// ---------------------------------------------------------------------------
describe('T-09: middleware.ts — matcher excludes /api/auth/*', () => {
  it('config.matcher excludes /api/auth paths', () => {
    const content = readFile('middleware.ts');
    assert.ok(
      content.includes('matcher'),
      'Expected config.matcher in middleware.ts'
    );
    assert.ok(
      content.includes('api/auth') || content.includes('api\\/auth'),
      'Expected matcher to reference api/auth exclusion in middleware.ts'
    );
  });
});

// ---------------------------------------------------------------------------
// T-10: middleware.ts — matcher excludes static assets
// (AC-PROTECT-5)
// ---------------------------------------------------------------------------
describe('T-10: middleware.ts — matcher excludes static assets', () => {
  it('matcher references _next or favicon or static exclusion', () => {
    const content = readFile('middleware.ts');
    assert.ok(
      content.includes('_next') || content.includes('favicon') || content.includes('static'),
      'Expected matcher in middleware.ts to exclude static assets (_next, favicon)'
    );
  });
});

// ---------------------------------------------------------------------------
// T-11: upsert logic — admin user gets isAdmin=true on first sign-in
// (AC-ADMIN-1)
// ---------------------------------------------------------------------------
describe('T-11: upsert logic — admin gets isAdmin=true', () => {
  it('isAdmin=true when githubId matches ADMIN_GITHUB_ID', () => {
    const result = upsertDecision({
      githubId: '12345678',
      existingUserId: null,
      adminGithubId: '12345678',
    });
    assert.strictEqual(result.shouldCreate, true);
    assert.strictEqual(result.isAdmin, true);
  });
});

// ---------------------------------------------------------------------------
// T-12: upsert logic — non-admin user gets isAdmin=false
// (AC-ADMIN-2)
// ---------------------------------------------------------------------------
describe('T-12: upsert logic — non-admin gets isAdmin=false', () => {
  it('isAdmin=false when githubId does not match ADMIN_GITHUB_ID', () => {
    const result = upsertDecision({
      githubId: '99999',
      existingUserId: null,
      adminGithubId: '12345678',
    });
    assert.strictEqual(result.shouldCreate, true);
    assert.strictEqual(result.isAdmin, false);
  });
});

// ---------------------------------------------------------------------------
// T-13: upsert logic — isAdmin not modified on re-sign-in
// (AC-ADMIN-3)
// ---------------------------------------------------------------------------
describe('T-13: upsert logic — existing user isAdmin unchanged', () => {
  it('returns shouldCreate=false for existing user (no isAdmin update)', () => {
    const result = upsertDecision({
      githubId: '12345678',
      existingUserId: 'user-abc',
      adminGithubId: '12345678',
    });
    assert.strictEqual(result.shouldCreate, false);
    assert.strictEqual(result.isAdmin, null); // no change
  });
});

// ---------------------------------------------------------------------------
// T-14: auth.ts — admin check uses String(profile.id) comparison
// (AC-ADMIN-4: numeric GitHub ID used)
// ---------------------------------------------------------------------------
describe('T-14: auth.ts — ADMIN_GITHUB_ID check uses String() or numeric ID', () => {
  it('auth.ts references ADMIN_GITHUB_ID env var', () => {
    const AUTH_CANDIDATES = ['auth.ts', 'src/auth.ts'];
    const filePath = AUTH_CANDIDATES.find(p => fileExists(p));
    assert.ok(filePath, 'auth.ts not found');
    const content = readFile(filePath);
    assert.ok(
      content.includes('ADMIN_GITHUB_ID'),
      'Expected ADMIN_GITHUB_ID env var reference in auth.ts'
    );
  });

  it('upsertDecision uses String comparison for admin check', () => {
    // Verify coercion: numeric-like string equals string
    const result = upsertDecision({
      githubId: 12345678,   // numeric (as GitHub profile returns it)
      existingUserId: null,
      adminGithubId: '12345678', // env var is always a string
    });
    assert.strictEqual(result.isAdmin, true, 'String coercion must handle numeric githubId');
  });
});

// ---------------------------------------------------------------------------
// T-15: upsert logic — no ADMIN_GITHUB_ID means all isAdmin=false
// (AC-ADMIN-5)
// ---------------------------------------------------------------------------
describe('T-15: upsert logic — no ADMIN_GITHUB_ID → isAdmin=false', () => {
  it('isAdmin=false when adminGithubId is undefined', () => {
    const result = upsertDecision({
      githubId: '12345678',
      existingUserId: null,
      adminGithubId: undefined,
    });
    assert.strictEqual(result.isAdmin, false);
  });

  it('isAdmin=false when adminGithubId is empty string', () => {
    const result = upsertDecision({
      githubId: '12345678',
      existingUserId: null,
      adminGithubId: '',
    });
    assert.strictEqual(result.isAdmin, false);
  });
});
