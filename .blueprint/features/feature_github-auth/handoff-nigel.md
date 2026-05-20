## Handoff Summary
**For:** Codey
**Feature:** github-auth

### Test Artifacts
- `test/artifacts/feature_github-auth/test-spec.md` — AC→Test ID mapping table
- `test/feature_github-auth.test.js` — executable tests (node --test)

### Current Baseline
- T-03, T-04, T-06, T-11, T-12, T-13, T-15 PASS (pure upsert logic, stateless)
- T-01, T-02, T-05, T-07–T-10, T-14 FAIL (files not yet implemented)

### Files Codey Must Create/Modify
1. `lib/prisma.ts` — singleton PrismaClient export
2. `auth.ts` — full NextAuth v5 config with PrismaAdapter, GitHub, signIn callback, ADMIN_GITHUB_ID check
3. `middleware.ts` — `export { auth as middleware }` with matcher config
4. `app/api/auth/[...nextauth]/route.ts` — `export const { GET, POST } = handlers`
5. `app/page.tsx` — replace placeholder with login page including "Sign in with GitHub" button
6. `app/dashboard/page.tsx` — minimal protected dashboard page

### Critical Constraints
- **NextAuth v5 ONLY**: `auth()` not `getServerSession`; session callback receives `{ session, user }` not `{ session, token }`
- **Database sessions**: must include `adapter: PrismaAdapter(prisma)` — do NOT use JWT strategy
- **isAdmin set once**: signIn callback creates User if not exists, checks ADMIN_GITHUB_ID; never updates existing User
- **Matcher**: must exclude `/api/auth/(.*)`, `/_next/(.*)`, `/favicon.ico`
- T-05 check: auth.ts must include a `pages` config with `signIn: "/"` to redirect unauthenticated users to root

### Test Runner
```
node --test test/feature_github-auth.test.js
```
No build required — tests use file-content inspection only.
