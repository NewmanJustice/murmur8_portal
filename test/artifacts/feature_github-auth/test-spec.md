# Test Spec — github-auth

## AC → Test ID Mapping

| AC ID | Description | Test ID | Test Type |
|-------|-------------|---------|-----------|
| AC-SIGNIN-1 | Login page publicly accessible | T-01 | Unit (page exports) |
| AC-SIGNIN-3 | Successful OAuth redirects to dashboard | T-02 | Unit (auth config) |
| AC-SIGNIN-5 | No duplicate User on re-sign-in | T-03 | Unit (upsert logic) |
| AC-SIGNOUT-1 | Sign-out clears server-side session | T-04 | Unit (signOut export) |
| AC-SIGNOUT-3 | Sign-out redirects to `/` | T-05 | Unit (signOut config) |
| AC-SIGNOUT-5 | Sign-out does not delete User record | T-06 | Unit (adapter scope) |
| AC-PROTECT-1 | Unauthenticated → redirected to `/` | T-07 | Unit (middleware export) |
| AC-PROTECT-2 | Authenticated → passes through | T-08 | Unit (middleware export) |
| AC-PROTECT-4 | `/api/auth/*` not intercepted by middleware | T-09 | Unit (matcher config) |
| AC-PROTECT-5 | Static assets not intercepted | T-10 | Unit (matcher config) |
| AC-ADMIN-1 | Admin user gets isAdmin=true on first sign-in | T-11 | Unit (upsert logic) |
| AC-ADMIN-2 | Non-admin user gets isAdmin=false | T-12 | Unit (upsert logic) |
| AC-ADMIN-3 | isAdmin not modified on re-sign-in | T-13 | Unit (upsert logic) |
| AC-ADMIN-4 | Admin check uses numeric GitHub ID | T-14 | Unit (upsert logic) |
| AC-ADMIN-5 | No ADMIN_GITHUB_ID → all isAdmin=false | T-15 | Unit (upsert logic) |

## Test Approach

**What is tested:** Unit-testable logic extracted from auth.ts:
- The User upsert function (create on first sign-in, skip on return)
- The isAdmin determination logic
- The middleware.ts exports and matcher config shape
- The auth.ts exports (handlers, auth, signIn, signOut)

**What is NOT tested (and why):**
- Full OAuth redirect flow — requires real GitHub OAuth + running server
- Database session creation/deletion — requires live PostgreSQL
- Cookie behaviour — requires running Next.js server

**Mocking strategy:**
- Prisma client is stubbed with in-memory state (plain JS object)
- NextAuth module is not imported in unit tests — the upsert logic is extracted and tested independently
- Middleware matcher config is tested by importing and inspecting the exported `config` object
