# Implementation Plan — github-auth

## Steps

1. [lib/prisma.ts] CREATE — Singleton PrismaClient export used by auth.ts and other server code | Tests: T-02, T-14

2. [auth.ts] REPLACE — Full NextAuth v5 config: PrismaAdapter, GitHub provider, signIn callback that upserts User with isAdmin from ADMIN_GITHUB_ID, pages config with signIn: "/" | Tests: T-02, T-04, T-05, T-06, T-14

3. [middleware.ts] CREATE — `export { auth as middleware }` from "./auth" with matcher excluding /api/auth, /_next, /favicon.ico | Tests: T-07, T-08, T-09, T-10

4. [app/api/auth/[...nextauth]/route.ts] CREATE — `export const { GET, POST } = handlers` from auth.ts | Tests: T-02 (handlers export)

5. [app/page.tsx] REPLACE — Login page with "Sign in with GitHub" button using signIn server action | Tests: T-01

6. [app/dashboard/page.tsx] CREATE — Minimal protected dashboard confirming signed-in session via auth() helper | Tests: T-02 (auth() usage)
