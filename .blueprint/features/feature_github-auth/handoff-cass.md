## Handoff Summary
**For:** Nigel
**Feature:** github-auth

### Stories Written
- `story-signin.md` — GitHub OAuth sign-in flow, first-time and returning User (AC-SIGNIN-1 through AC-SIGNIN-5)
- `story-signout.md` — Sign-out, Session record deletion, redirect to login (AC-SIGNOUT-1 through AC-SIGNOUT-5)
- `story-route-protection.md` — Middleware-based route protection, redirect and pass-through cases (AC-PROTECT-1 through AC-PROTECT-5)
- `story-admin-elevation.md` — ADMIN_GITHUB_ID env var grants isAdmin at first sign-in only (AC-ADMIN-1 through AC-ADMIN-5)

### Key Constraints for Nigel
- Tests CANNOT use a real database or spin up a Next.js server — all Prisma and NextAuth interactions must be mocked
- **NextAuth v5 API ONLY**: `auth()` not `getServerSession`; `export { auth as middleware }` not custom middleware; route handler in `app/api/auth/[...nextauth]/route.ts`
- The "set once" invariant for `isAdmin` is critical — tests should verify existing User records are not modified on re-sign-in
- Admin check uses `String(profile.id)` comparison against `ADMIN_GITHUB_ID` env var — numeric ID only

### AC Summary Table
| Story | ACs |
|-------|-----|
| sign-in | AC-SIGNIN-1 to AC-SIGNIN-5 |
| sign-out | AC-SIGNOUT-1 to AC-SIGNOUT-5 |
| route-protection | AC-PROTECT-1 to AC-PROTECT-5 |
| admin-elevation | AC-ADMIN-1 to AC-ADMIN-5 |

### Out-of-Scope (do not test)
- Custom OAuth error pages
- Profile field updates on re-sign-in
- Multi-device session revocation
- UI styling/layout details
