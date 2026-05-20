## Handoff Summary
**For:** Cass
**Feature:** github-auth

### Key Decisions
- Database sessions selected (not JWT) — enables server-side session invalidation needed by future features; resolves OQ1 from the System Spec.
- `User` record is created once on first sign-in; subsequent sign-ins do not update `name`/`email`/`avatarUrl` (kept minimal, deferred).
- Admin elevation is a one-time check at User creation: `githubId === ADMIN_GITHUB_ID` env var — never changeable via the UI (System Spec R5).
- Route protection is handled entirely by `middleware.ts` using `export { auth as middleware }` — no per-page auth checks needed.
- **CRITICAL API NOTE**: This uses NextAuth v5 / Auth.js v5. The `auth()` helper replaces `getServerSession`. Nigel and Codey must NOT use the v4 pattern. See FEATURE_SPEC.md §8 for the full list of v5 differences.

### Files Created
- `.blueprint/features/feature_github-auth/FEATURE_SPEC.md`

### Open Questions
- AQ1: Should re-sign-in update profile fields (name, avatar)? Currently deferred — no update on return sign-in.
- AQ3: Middleware matcher config — should skip `/api/auth/*` and static assets.

### Critical Context
The project scaffold (`project-scaffold`) already provides: `auth.ts` stub (NextAuth v5 configured with GitHub provider), Prisma schema with all required NextAuth adapter models (`Account`, `Session`, `VerificationToken`) plus the `User` domain model with `isAdmin` field. The app has Next.js 15 App Router with Tailwind. No `middleware.ts` exists yet — this feature creates it. Story themes map 1:1 to the five behaviours: sign-in flow, User record creation, route protection, sign-out, and admin elevation.
