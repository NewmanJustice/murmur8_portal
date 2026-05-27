# Feature Specification — github-auth

---
version: 0.1.0
date: 2026-05-20
status: draft
---

## 1. Feature Intent

**Why this feature exists.**

The murmur8 Portal is a private dashboard — anonymous visitors must never access any user data. This feature implements the authentication layer that makes every other feature safe to build.

- **Problem**: The scaffold from `project-scaffold` has NextAuth.js wired but non-functional — no User record is created, no routes are protected, and no session data is available to the application.
- **User need**: A developer must be able to sign in with their GitHub account, land on a protected dashboard, and sign out cleanly. The system must recognise one specific GitHub user as the Admin without any manual database intervention.
- **System need**: All downstream features (api-key-management, telemetry-ingestion, run-history-dashboard) depend on a reliable, persistent session and a populated User record.

> Aligns to System Spec §6.1 (Authentication) and §2 (Actors). See `.blueprint/system_specification/SYSTEM_SPEC.md`.

---

## 2. Scope

### In Scope

- GitHub OAuth sign-in via NextAuth.js v5 (Auth.js v5) using the existing `auth.ts` stub
- Connecting the Prisma adapter (`@auth/prisma-adapter`) so sessions are persisted in PostgreSQL
- Creating a `User` record on first sign-in, populated from GitHub OAuth profile data (`githubId`, `name`, `email`, `image`)
- The `@auth/prisma-adapter` owns User record creation; the `signIn` callback backfills the adapter-unaware fields (`githubId`, `isAdmin`, `image`) via `updateMany` after the adapter has created the record
- Setting `isAdmin = true` on first sign-in if the user's GitHub numeric ID matches the `ADMIN_GITHUB_ID` environment variable; all other users default to `isAdmin = false`
- Sign-out that clears the database session and redirects to the login page
- Route protection via `middleware.ts` using the `auth` export — all routes except `/` (the login/landing page) require an active session
- Unauthenticated requests to protected routes redirect to `/`
- A login page at `/` with a "Sign in with GitHub" button
- A minimal post-auth landing route (e.g. `/dashboard`) that confirms successful sign-in (placeholder for later features)
- Exposing the authenticated user's `id`, `name`, `image`, and `isAdmin` to server components via the `auth()` helper

### Out of Scope

- Any dashboard content beyond session confirmation (belongs to `run-history-dashboard`)
- API key management (belongs to `api-key-management`)
- Email/password or any OAuth provider other than GitHub
- Role changes after initial sign-in (Admin status is set once; no UI promotion)
- Self-serve account deletion
- Session expiry policy (uses NextAuth defaults)
- Public/shareable routes
- Fine-grained org team membership checks (org-level only, not team-level)

---

## 3. Actors Involved

### Visitor (unauthenticated)
- Can access `/` (login page) only
- Cannot access any other route — middleware redirects to `/`
- Initiates the GitHub OAuth flow by clicking "Sign in with GitHub"

### User (newly authenticated — first sign-in)
- Completes GitHub OAuth; `@auth/prisma-adapter` creates a new `User` record, then `signIn` callback backfills `githubId`, `image`, `isAdmin`
- `isAdmin` evaluated against `ADMIN_GITHUB_ID` during the backfill step
- Redirected to `/dashboard` after successful sign-in

### User (returning — subsequent sign-in)
- Completes GitHub OAuth; portal looks up existing `User` record via the NextAuth `Account` linkage
- No `User` fields are updated on re-sign-in (name/avatar drift is deferred)
- Redirected to `/dashboard` after successful sign-in

### Admin (a User whose GitHub ID matches `ADMIN_GITHUB_ID`)
- Same sign-in flow as a regular User
- `isAdmin = true` is set at first sign-in only
- No separate sign-in page or flow

---

## 4. Behaviour Overview

### Happy-path — first sign-in

1. Visitor opens `/` and sees the sign-in page.
2. Visitor clicks "Sign in with GitHub"; browser redirects to GitHub OAuth consent.
3. GitHub redirects back to `/api/auth/callback/github` with an authorisation code.
4. NextAuth exchanges the code for an access token and fetches the GitHub profile.
5. `@auth/prisma-adapter` creates the `User` (with `name`, `email`, `image`), `Account`, and `Session` records.
6. The `signIn` callback runs after the adapter. It backfills the fields the adapter does not know about:
   - Calls `prisma.user.updateMany({ where: { email, githubId: null }, data: { githubId, image, isAdmin } })`.
   - This is a no-op for returning users (their `githubId` is already set, so the `where` clause matches nothing).
   - `isAdmin` is evaluated as `String(profile.id) === process.env.ADMIN_GITHUB_ID` — only applied on first sign-in via the `githubId: null` guard.
7. A session cookie is set; user is redirected to `/dashboard`.

### Happy-path — return sign-in

1. Visitor opens `/` and signs in via GitHub (steps 2–5 as above).
2. `User` record already exists — no creation.
3. Session cookie set; redirected to `/dashboard`.

### Happy-path — sign-out

1. Authenticated user triggers sign-out (button on any protected page).
2. NextAuth deletes the `Session` record from the database.
3. Session cookie cleared; user redirected to `/`.

### Route protection

- Any request to a route not matching `/` or `/api/auth/*` is intercepted by `middleware.ts`.
- If no valid session: redirect to `/`.
- If valid session: request passes through unchanged.

### Key alternatives

- **OAuth error or user denies consent**: GitHub redirects back with an error parameter; NextAuth surfaces a generic error page or redirect — exact error UI is outside this feature's scope.
- **Database unreachable during sign-in**: NextAuth/Prisma will throw; user sees an error. No partial state is written.

---

## 5. State & Lifecycle Interactions

This feature is **state-creating** for the `User` entity and **state-transitioning** for the authentication lifecycle.

| State | Created / Entered | How |
|-------|-------------------|-----|
| `User` record (new) | First sign-in | `@auth/prisma-adapter` creates row; `signIn` callback backfills `githubId`, `image`, `isAdmin` via `updateMany` |
| `Account` record | First sign-in | `@auth/prisma-adapter` creates row |
| `Session` record (active) | Successful sign-in | `@auth/prisma-adapter` creates row |
| `Session` record (deleted) | Sign-out | `@auth/prisma-adapter` deletes row |
| `isAdmin = true` | First sign-in (if matching) | Set at `User` creation; never changed by auth |

The `User` record is permanent once created. The `signIn` callback's `updateMany` call uses a `githubId: null` guard so it is a no-op for returning users — no existing User fields are modified after first sign-in.

---

## 6. Rules & Decision Logic

### R-AUTH-1: Login-only public route
- **Rule**: Only `/` and the NextAuth internal routes (`/api/auth/*`) are accessible without authentication.
- **Inputs**: Incoming request path, session cookie presence/validity.
- **Output**: Pass through (authenticated) or redirect to `/` (unauthenticated).
- **Deterministic**: Yes — middleware always checks session.
- **Implementation**: `middleware.ts` MUST use the NextAuth v5 re-export pattern: `export { auth as middleware } from "./auth"`. This delegates all session validation to NextAuth — no custom middleware logic is needed.
- **DEV_AUTOLOGIN exception (dev only)**: When `DEV_AUTOLOGIN=true`, `middleware.ts` must detect this env var and call `NextResponse.next()` directly without invoking the `auth` export, because `getSession()` in that mode returns a fake session that bypasses NextAuth. This bypass MUST NOT be applied in production (i.e. when `DEV_AUTOLOGIN` is unset or `false`). The canonical implementation is a two-branch middleware function: the `DEV_AUTOLOGIN` branch returns early with `NextResponse.next()`; the production branch calls the NextAuth `auth` handler (or uses the re-export where the DEV branch is unreachable at runtime).

### R-AUTH-2: User record creation on first sign-in
- **Rule**: The `@auth/prisma-adapter` creates the `User` row using `name`, `email`, and `image` from the OAuth profile. The `signIn` callback then backfills `githubId`, `image`, and `isAdmin` via `updateMany` scoped to `{ email, githubId: null }` — ensuring it only fires on first sign-in.
- **Inputs**: GitHub OAuth profile (`id`, `name`, `email`, `avatar_url` → mapped to `image`).
- **Output**: `User` row fully populated; `isAdmin` evaluated per R-AUTH-3.
- **Constraint**: `githubId` is nullable on the `User` model to accommodate the window between adapter creation and callback backfill.
- **Deterministic**: Yes.

### R-AUTH-3: Admin elevation via environment variable
- **Rule**: At User creation time only, if `String(profile.id) === process.env.ADMIN_GITHUB_ID`, set `isAdmin = true`. Otherwise `isAdmin = false`.
- **Inputs**: GitHub profile numeric `id`, `ADMIN_GITHUB_ID` env var.
- **Output**: `isAdmin` boolean on the `User` record.
- **Deterministic**: Yes.
- **Constraint**: `isAdmin` is never modified by subsequent sign-ins (aligns to System Spec §6.3, R5).

### R-AUTH-4: Optional GitHub org membership restriction
- **Rule**: If `GITHUB_ORG_CHECK=true` AND `GITHUB_ORG` is set, the `signIn` callback must verify the authenticating user is a member of the specified GitHub org before allowing sign-in. Non-members receive a sign-in denial (`return false`).
- **Mechanism**: Call `GET https://api.github.com/user/orgs` with the user's OAuth access token (requires `read:org` scope, added to the authorization request only when `GITHUB_ORG_CHECK=true`). If the response is not OK or the org login is not present in the returned list, deny sign-in.
- **Default**: `GITHUB_ORG_CHECK` defaults to disabled — omitting either env var leaves sign-in open to all GitHub users.
- **Constraint**: GitHub org OAuth Apps must be approved by the org owner if the org enforces OAuth App access restrictions.

### R-AUTH-5: Session strategy — database sessions
- **Rule**: NextAuth must be configured for **database sessions** (not JWT), using `@auth/prisma-adapter`.
- **Rationale**: The portal needs server-side session invalidation (future key revocation may require session termination). Database sessions also allow `Session` records to be directly queried.
- **Resolves**: OQ1 from System Spec §9.

### R-AUTH-6: No cross-user data via session
- **Rule**: The session exposes only the authenticated user's own `User.id` (and optionally `name`, `image`, `isAdmin`). No other user's data is included.
- **Deterministic**: Yes — enforced by NextAuth session callback scope.

### R-AUTH-7: Prisma User model must satisfy the @auth/prisma-adapter field contract
- **Rule**: The Prisma `User` model MUST contain all fields required by `@auth/prisma-adapter`: `id`, `name`, `email`, `emailVerified`, `image`. Omitting any of these fields causes an `AdapterError` at runtime.
- **Constraint (testable)**: A test MUST assert that the Prisma `User` model schema contains all five fields — `id`, `name`, `email`, `emailVerified`, `image` — with the correct types (`String` / nullable `String` / nullable `DateTime`). This is the canonical adapter contract; any schema migration that removes or renames these fields is a breaking change.
- **Inputs**: `prisma/schema.prisma` `User` model definition.
- **Output**: Adapter can create `User` records without error.
- **Deterministic**: Yes.

---

## 7. Dependencies

### Internal
- **`project-scaffold`** (prerequisite, completed): Provides `auth.ts` stub, Prisma schema with `User`, `Account`, `Session`, `VerificationToken` models, Next.js App Router structure.
- **Prisma client**: Must be generated and connected to a live PostgreSQL database (`DATABASE_URL` env var).

### External systems
- **GitHub OAuth App**: Requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars. Callback URL must be registered as `<host>/api/auth/callback/github`.
- **PostgreSQL database**: Live and migrated before first sign-in attempt.

### Packages (already installed from scaffold)
- `next-auth@beta` (Auth.js v5)
- `@auth/prisma-adapter@2.11.2`
- `@prisma/client`

### Environment variables required
| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Prisma connection string |
| `AUTH_SECRET` | Yes | NextAuth signing secret (min 32 chars) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `ADMIN_GITHUB_ID` | No | GitHub numeric user ID for the admin user |
| `GITHUB_ORG_CHECK` | No | Set to `"true"` to enable org membership restriction (default: off) |
| `GITHUB_ORG` | No | GitHub org login name to restrict sign-in to (e.g. `"my-company"`) — only used when `GITHUB_ORG_CHECK=true` |

---

## 8. Non-Functional Considerations

### Security
- `AUTH_SECRET` must be a strong random value; never committed to source control.
- GitHub OAuth tokens are handled exclusively by NextAuth internals — the application never reads or stores the raw access token beyond the org membership check.
- Session cookies are `httpOnly` and `secure` in production (NextAuth defaults).
- CSRF protection is built into NextAuth's route handlers.
- The `ADMIN_GITHUB_ID` check is performed server-side at User creation; it is never exposed to the client.
- The org membership check (`GITHUB_ORG_CHECK`) is performed server-side in the `signIn` callback; if the GitHub API call fails (network error, bad token), sign-in is denied rather than allowed — fail closed.
- `read:org` scope is only requested when `GITHUB_ORG_CHECK=true`; the narrower scope is used by default.

### API version warning (critical for Codey)
**NextAuth v5 / Auth.js v5 uses a different API from v4.** Key differences:
- Session is retrieved via `const session = await auth()` — NOT `getServerSession(authOptions)`.
- Configuration is in `auth.ts` at the project root (not `pages/api/auth/[...nextauth].ts`).
- The route handler is exported from `app/api/auth/[...nextauth]/route.ts` as `export const { GET, POST } = handlers`.
- Middleware is exported as `export { auth as middleware } from "./auth"` from `middleware.ts`.
- The `session` callback receives `{ session, user }` (database sessions) — not `{ session, token }`.

### Error handling
- OAuth errors (user denies, GitHub down) surface via NextAuth's default error handling — the application does not need to implement custom OAuth error recovery in this feature.
- Database errors during `User` creation should propagate as 500 errors; no silent failure.

### Audit
- `User.createdAt` provides a lightweight record of first authentication time.
- `Session` records in the database provide an audit trail of active sessions.

---

## 9. Assumptions & Open Questions

### Assumptions
- The Prisma schema is already migrated against the target PostgreSQL database before this feature is tested (migration scripts from `project-scaffold`).
- `next-auth@beta` refers specifically to the Auth.js v5 beta — the codebase must not be accidentally downgraded to v4.
- The GitHub OAuth App callback URL will be configured per environment (`http://localhost:3000/api/auth/callback/github` for dev, production URL for prod).
- The `ADMIN_GITHUB_ID` env var holds the GitHub **numeric** user ID (e.g. `"12345678"`), not the username.

### Open Questions
| # | Question | Proposed Resolution |
|---|----------|-------------------|
| AQ1 | Should sign-in update `name`/`email`/`avatarUrl` on returning users? | Defer to a later feature or a profile-sync feature; keep auth minimal for now. |
| AQ2 | Where should unauthenticated users be redirected — `/` or a dedicated `/login`? | Use `/` as the combined landing/login page per current scaffold. |
| AQ3 | Should `middleware.ts` use the `auth` export directly, or add custom logic? | **Resolved.** Use `export { auth as middleware }` with a `config` matcher to skip static assets. Exception: when `DEV_AUTOLOGIN=true`, middleware must pass all requests through without invoking the `auth` export (fake session incompatibility). The two-branch pattern — early-return on `DEV_AUTOLOGIN=true`, otherwise delegate to `auth` — is the canonical implementation. No additional custom logic is needed beyond the DEV_AUTOLOGIN guard. |

---

## 10. Impact on System Specification

This feature **reinforces** existing System Spec assumptions:

- Resolves OQ1 (session strategy): **database sessions** selected (see R-AUTH-4). The System Spec should be updated to reflect this decision at `§9 OQ1`.
- Confirms the `ADMIN_GITHUB_ID` env var mechanism described in §6.3 and §9 OQ5.
- The Prisma schema has all required models (`User`, `Account`, `Session`, `VerificationToken`). The `User.avatarUrl` field must be renamed to `User.image` to align with the `@auth/prisma-adapter` contract (the adapter writes `image`, not `avatarUrl`). `githubId` must remain nullable (`String?`) to accommodate the adapter-first creation sequence.

**No contradictions with the System Spec.** No deferred changes required at this time.

---

## 11. Handover to BA (Cass)

### Story themes

1. **Sign-in flow** — Visitor sees login page, clicks GitHub sign-in, OAuth completes, redirected to dashboard.
2. **First-time User creation** — New GitHub user gets a `User` record with correct fields and `isAdmin` evaluation.
3. **Route protection** — Protected routes redirect unauthenticated visitors to login; authenticated users pass through.
4. **Sign-out** — Authenticated user signs out, session cleared, redirected to login.
5. **Admin elevation** — A user whose GitHub ID matches `ADMIN_GITHUB_ID` gets `isAdmin = true` at first sign-in.

### Expected story boundaries

- One story per theme above is appropriate.
- The admin elevation story should clarify the "set once at creation, never changed" invariant.
- Route protection stories should cover both the redirect case and the pass-through case.
- Stories should NOT describe specific UI elements — Codey will design the login page; stories should focus on observable behaviour.

### Areas needing careful story framing

- The NextAuth v5 vs v4 API distinction is a developer concern, not a story concern — Cass should frame stories behaviourally, but include a technical note for Nigel/Codey flagging the v5 API.
- The "no update on re-sign-in" non-behaviour (AQ1) should be explicitly captured as a constraint in the relevant story to prevent Codey from adding unwanted profile-sync logic.

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial draft | Feature created | Alex |
| 2026-05-20 | Added R-AUTH-4 (org restriction), updated env var table, security section | GITHUB_ORG_CHECK / GITHUB_ORG env vars added | Steve |
| 2026-05-27 | Renamed `avatarUrl` → `image` throughout spec (Bug 1: PrismaAdapter writes `image`, not `avatarUrl`) | AdapterError: Unknown argument `image` in production | Alex |
| 2026-05-27 | Revised User creation model: adapter owns creation, signIn callback backfills via `updateMany` (Bug 2: OAuthAccountNotLinked race condition) | Race between manual `prisma.user.create()` in signIn callback and adapter's own create caused OAuthAccountNotLinked | Alex |
| 2026-05-27 | Added R-AUTH-7: @auth/prisma-adapter field contract — User model must include id, name, email, emailVerified, image | Production AdapterError: emailVerified missing from User model; tests only checked image, not the full adapter contract | Steve |
| 2026-05-27 | R-AUTH-1 clarified: middleware.ts must use NextAuth v5 auth re-export for production route protection; DEV_AUTOLOGIN bypass documented as dev-only exception; AQ3 resolved | middleware.ts called NextResponse.next() in both branches, never protecting routes in production — T-07/T-08 failing because middleware.ts had no import from ./auth | Steve |
