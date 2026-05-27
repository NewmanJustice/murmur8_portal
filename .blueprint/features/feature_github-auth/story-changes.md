# Story Impact — github-auth Bug Fixes (2026-05-27)

Two production bugs required spec updates. This file identifies which stories are affected and what must change in each.

---

## Bug 1 — `image` field conflict (AdapterError)

**Root cause**: `@auth/prisma-adapter` writes `image` to the User record. The schema had `avatarUrl` instead. Prisma rejected the adapter's create with "Unknown argument `image`".

**Fix**: Rename `User.avatarUrl` → `User.image` in schema and all code references.

### Affected stories

| Story | File | Impact |
|-------|------|--------|
| GitHub OAuth Sign-In Flow | story-signin.md | Technical Note references avatar field indirectly — no explicit `avatarUrl` mention, no change required |
| Admin Elevation via ADMIN_GITHUB_ID | story-admin-elevation.md | No field name reference — not affected |
| Unauthenticated Route Protection | story-route-protection.md | No field name reference — not affected |
| Sign-Out and Session Clearing | story-signout.md | No field name reference — not affected |

**Verdict**: No story files require edits for Bug 1. The field rename is a schema/implementation concern captured in the spec (§2 Scope, §5 State table, §6 R-AUTH-2, R-AUTH-6, §10).

---

## Bug 2 — signIn callback races with adapter (OAuthAccountNotLinked)

**Root cause**: The `signIn` callback manually called `prisma.user.create()`. The Prisma adapter also calls `prisma.user.create()`. On first sign-in the adapter ran second, found a User record with no linked Account, and threw `OAuthAccountNotLinked`.

**Fix**: Remove manual `prisma.user.create()` from `signIn` callback. Instead, use `prisma.user.updateMany({ where: { email, githubId: null }, data: { githubId, image, isAdmin } })` to backfill after the adapter has done its work.

### Affected stories

#### story-admin-elevation.md — REQUIRES UPDATE

The Technical Note states:
> "The admin check is performed server-side in the `signIn` callback … This is evaluated only when creating a new User record — **the existing User lookup must happen BEFORE this check**"

This is now incorrect. The callback no longer creates or looks up the User record. It calls `updateMany` with a `githubId: null` guard — the "set once" invariant is enforced by the WHERE clause, not by an explicit prior lookup.

**Required change to story-admin-elevation.md — Technical Note section:**

OLD:
```
The admin check is performed server-side in the `signIn` callback (or equivalent event hook) within `auth.ts`. The comparison is:
  isAdmin: String(profile.id) === process.env.ADMIN_GITHUB_ID
This is evaluated only when creating a new User record — the existing User lookup must happen BEFORE this check to ensure the "set once" invariant is upheld.
```

NEW:
```
The admin check is performed server-side in the `signIn` callback within `auth.ts`. The `@auth/prisma-adapter` creates the User record first; the callback then backfills adapter-unaware fields using:
  prisma.user.updateMany({
    where: { email: profile.email, githubId: null },
    data: { githubId, image, isAdmin }
  })
The `githubId: null` guard in the WHERE clause enforces the "set once" invariant: returning users already have `githubId` set, so the updateMany is a no-op for them and `isAdmin` is never overwritten.
```

#### story-signin.md — MINOR UPDATE RECOMMENDED

AC-SIGNIN-5 ("no duplicate User record is created") remains correct in behaviour. However the Technical Note does not describe the User creation mechanism, so no AC changes are needed. The note is silent on creation details — acceptable as-is.

#### story-route-protection.md — NOT AFFECTED

#### story-signout.md — NOT AFFECTED

---

## Summary

| Story file | Change needed? | What to change |
|------------|---------------|----------------|
| story-admin-elevation.md | YES | Technical Note — update to describe `updateMany` backfill pattern, replace "create" with adapter-first + backfill |
| story-signin.md | NO | Behaviour ACs remain correct; Technical Note is silent on creation detail |
| story-route-protection.md | NO | Not related to User creation or field names |
| story-signout.md | NO | Not related to User creation or field names |

---

## Bug 3 — emailVerified missing from User model (AdapterError in production)

**Root cause**: `@auth/prisma-adapter` requires five specific fields on the Prisma `User` model: `id`, `name`, `email`, `emailVerified`, `image`. The `emailVerified DateTime?` field was absent from the schema. The adapter attempted to write it on sign-in and threw an `AdapterError`. Tests only asserted that `image` was present; no test covered the full adapter field contract.

**Fix**: Add `emailVerified DateTime?` to the Prisma `User` model. Add spec rule R-AUTH-7 documenting the full adapter field contract as a testable constraint.

**Nature of change**: Technical constraint addition — this is a schema/implementation concern, not a user-facing behaviour change.

### Affected stories

| Story | File | Impact |
|-------|------|--------|
| GitHub OAuth Sign-In Flow | story-signin.md | No user-visible behaviour change — not affected |
| Admin Elevation via ADMIN_GITHUB_ID | story-admin-elevation.md | No field contract reference — not affected |
| Unauthenticated Route Protection | story-route-protection.md | Not affected |
| Sign-Out and Session Clearing | story-signout.md | Not affected |

**Verdict**: No existing story files require edits. The fix is a schema change (`prisma/schema.prisma`) plus a new spec rule (R-AUTH-7 in FEATURE_SPEC.md). Nigel must add a test that asserts all five adapter-required fields are present on the `User` model with correct types — this test gap was the root cause of the production failure.

### Test gap to close (for Nigel)

The following assertion must be added to the test suite (can be a schema-parse test against `prisma/schema.prisma`):

- `User` model contains field `id` (String, @id)
- `User` model contains field `name` (String?)
- `User` model contains field `email` (String, @unique)
- `User` model contains field `emailVerified` (DateTime?)
- `User` model contains field `image` (String?)

This assertion is the canonical adapter contract (R-AUTH-7) and must fail if any of these fields are removed or their nullability changed to non-nullable.
