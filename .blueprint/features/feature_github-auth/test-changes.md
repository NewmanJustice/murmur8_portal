# Test Changes — github-auth Bug Fixes (2026-05-27)

## Summary

Two production bugs required updates to the test suite:
1. `User.avatarUrl` → `User.image` field rename
2. `signIn` callback changed from `user.create` to `user.updateMany` (backfill pattern)

---

## Tests modified (existing T-01 through T-15)

### `upsertDecision` pure function — signature change

The function was rewritten to model the **backfill** decision rather than the create decision.

| Old | New |
|-----|-----|
| Input: `existingUserId` (null = not found) | Input: `existingGithubId` (null = adapter just created user) |
| Output: `shouldCreate: boolean` | Output: `shouldBackfill: boolean` |

Rationale: The Prisma adapter now owns User creation. The `signIn` callback only backfills adapter-unaware fields (`githubId`, `image`, `isAdmin`) using `updateMany` with a `githubId: null` WHERE guard.

### Affected test cases

| Test ID | Change |
|---------|--------|
| T-03 | `existingUserId` → `existingGithubId`; `shouldCreate` → `shouldBackfill` in both assertions |
| T-11 | `existingUserId: null` → `existingGithubId: null`; `shouldCreate` → `shouldBackfill` |
| T-12 | `existingUserId: null` → `existingGithubId: null`; `shouldCreate` → `shouldBackfill` |
| T-13 | `existingUserId: 'user-abc'` → `existingGithubId: '12345678'`; `shouldCreate` → `shouldBackfill` |
| T-14 | `existingUserId: null` → `existingGithubId: null` (upsertDecision call in second `it`) |
| T-15 | `existingUserId: null` → `existingGithubId: null` in both `it` blocks |

T-01 through T-10 were **not touched** — they test file existence, NextAuth exports, middleware config, and session management; none reference the upsert logic or avatar field.

---

## New tests added

### T-GA-NEW-1: `upsertDecision` returns `shouldBackfill=true` for new user
- Input: `existingGithubId: null`
- Expected: `shouldBackfill === true`
- Rationale: Adapter just created the User row with `githubId: null`; backfill must fire.

### T-GA-NEW-2: `upsertDecision` returns `shouldBackfill=false` for returning user
- Input: `existingGithubId: '55555'` (already set)
- Expected: `shouldBackfill === false`
- Rationale: `updateMany` WHERE `githubId: null` is a no-op; `isAdmin` is never overwritten.

### T-GA-NEW-3: `prisma/schema.prisma` — User model uses `image` (not `avatarUrl`)
- Two assertions: User model contains `image` field; User model does NOT contain `avatarUrl`
- **Currently failing** — schema still has `avatarUrl`; test catches the unfixed bug.

### T-GA-NEW-4: `auth.ts` — `signIn` callback uses `updateMany` (not `create`)
- Two assertions: `updateMany` is present; `user.create(` is absent
- Currently passing — `updateMany` is already in place.

### T-GA-NEW-5: `auth.ts` — `updateMany` data block uses `image` field (not `avatarUrl`)
- Two assertions: `image` appears after `updateMany` in data block; `avatarUrl` does NOT appear in the `updateMany` call
- **Currently failing** — `auth.ts` still passes `avatarUrl` in the data object; test catches the unfixed bug.

---

## Test run status after changes

| Status | Count |
|--------|-------|
| Pass | 27 |
| Fail | 5 |

Failing tests and their cause:

| Test | Reason |
|------|--------|
| T-07 "imports from ./auth" | Pre-existing failure unrelated to these bugs (middleware.ts import path) |
| T-GA-NEW-3 (×2) | Bug unfixed: `schema.prisma` still has `avatarUrl` instead of `image` |
| T-GA-NEW-5 (×2) | Bug unfixed: `auth.ts` updateMany still passes `avatarUrl` instead of `image` |

T-GA-NEW-3 and T-GA-NEW-5 will pass once Codey applies the schema and auth.ts fixes.

---

## Refinement 2026-05-27 — NextAuth adapter contract: all five User model fields

### Why

The previous test pass (T-GA-NEW-3) only asserted the presence of `image` in the User model. This was insufficient — when `emailVerified DateTime?` was missing from the schema the tests still passed, because no test verified its presence. The gap was only discovered at runtime when `@auth/prisma-adapter` failed to find the required field.

### New describe block added

`"NextAuth adapter contract — User model fields"` (added after T-GA-NEW-2, before T-GA-NEW-5)

| ID | Assertion |
|----|-----------|
| T-GA-NEW-6 | `id  String  @id` present in User model |
| T-GA-NEW-7 | `name  String?` present in User model |
| T-GA-NEW-8 | `email  String?  @unique` present in User model |
| T-GA-NEW-9 | `emailVerified  DateTime?` present in User model |
| T-GA-NEW-10 | `image  String?` present in User model (stricter regex than T-GA-NEW-3) |

T-GA-NEW-10 complements T-GA-NEW-3 (which is retained unchanged) with a tighter word-boundary regex.

### Test run status after this refinement

| Status | Count |
|--------|-------|
| Pass | 36 |
| Fail | 1 (pre-existing: T-07 "imports from ./auth") |

All five new tests T-GA-NEW-6 through T-GA-NEW-10 pass against the current schema (which now contains `emailVerified DateTime?`).
