---
version: 0.1.0
date: 2026-05-20
status: draft
---

# murmur8 Portal — System Specification

## 1. Purpose

The murmur8 Portal is a web application that:

1. **Receives pipeline telemetry** from murmur8 pipeline runs via an authenticated REST API
2. **Displays run history and insights** to each authenticated user through a private dashboard
3. **Manages API keys** — users generate and revoke their own keys; admins can manage all keys

The portal is the canonical destination for teams and individuals to inspect, analyse, and audit their murmur8 pipeline activity.

---

## 2. Actors

| Actor | Description |
|-------|-------------|
| **Visitor** | Unauthenticated user. Can only access the login page. |
| **User** | Authenticated via GitHub OAuth. Sees their own run history and manages their own API keys. |
| **Admin** | A User with elevated privileges. Can view all users' keys and revoke any key. |
| **Pipeline Client** | The murmur8 CLI/skill running on a developer's machine. Sends telemetry to the portal API using an API key. |

---

## 3. System Boundaries

### In scope
- GitHub OAuth authentication (sign in / sign out)
- API key lifecycle: generate, list, revoke (user scope); view all, revoke any (admin scope)
- Telemetry ingestion endpoint: validate key, store run record, associate with owning user
- Dashboard: run history list, run detail view, per-stage breakdown
- Basic aggregate insights: success rate, average duration, cost summary
- Admin panel: view all keys with owner, revoke any key

### Out of scope (v1)
- Public / shareable run links
- Real-time dashboard updates (WebSockets or SSE)
- Per-project API key scoping
- Email notifications or webhooks
- Data export from the portal UI
- Custom user roles beyond User / Admin
- Self-serve account deletion

---

## 4. Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14+ (App Router) | TypeScript throughout |
| Auth | NextAuth.js v5 (Auth.js) | GitHub OAuth provider |
| Database | PostgreSQL via Prisma ORM | Hosted on Supabase or Railway |
| Styling | Tailwind CSS | murmur8 brand theme — see `.business_context/branding_notes.md`, `Tailwind-based_website_theme_suggestion.md` |
| Brand assets | SVG logos + favicon | `.business_context/murmur8-logo-full.svg`, `murmur8-logo-compact.svg`, `murmur8-npm-icon.svg`, `favicon.svg` |
| API | Next.js Route Handlers | REST, JSON |
| Deployment | Vercel (target) | Env vars for secrets |

---

## 5. Core Domain Concepts

### User
A person authenticated via GitHub OAuth. Identified by their GitHub `id` (stable). Stores: `id`, `githubId`, `name`, `email`, `avatarUrl`, `isAdmin`, `createdAt`.

### API Key
A credential that authorises a Pipeline Client to POST telemetry on behalf of a User. Properties:
- `id` — internal UUID
- `key` — the secret token shown once at creation (hashed in DB)
- `name` — user-supplied label (e.g. "my-saas project")
- `userId` — owning user
- `createdAt`, `lastUsedAt`, `revokedAt` (null = active)

A key is **active** when `revokedAt IS NULL`. Revocation is permanent (no re-activation).

### Run
A single murmur8 pipeline execution. Received via POST from a Pipeline Client. Properties mirror the murmur8 telemetry schema (see `.business_context/murmur8-framework-understanding.md` §3). Key fields:

| Field | Type |
|-------|------|
| `id` | UUID (portal-generated) |
| `userId` | FK to User |
| `apiKeyId` | FK to ApiKey used to ingest |
| `slug` | string — feature identifier |
| `status` | enum: `success`, `failed`, `paused` |
| `type` | enum: `feature`, `refinement` |
| `startedAt` | timestamp |
| `completedAt` | timestamp |
| `totalDurationMs` | integer |
| `totalCost` | decimal |
| `commitHash` | string or null |
| `failedStage` | string or null |
| `pausedAfter` | string or null |
| `parentRunId` | UUID or null (refinement link) |
| `stages` | JSONB — full per-stage breakdown |
| `receivedAt` | timestamp — when portal ingested it |

Data is stored indefinitely; no purge policy at this stage.

---

## 6. Key Behaviours

### 6.1 Authentication

- All routes except `/` (landing/login) require an authenticated session.
- Unauthenticated requests to protected routes redirect to the login page.
- Login is via GitHub OAuth only. No email/password.
- On first OAuth sign-in, a User record is created automatically.
- Sessions are managed by NextAuth (JWT or database sessions — TBD at feature spec stage).
- Sign-out clears the session and redirects to the login page.

### 6.2 API Key Management (User)

- A user may create multiple API keys, each with a unique user-supplied name.
- The raw key value is shown **once** immediately after creation and never again.
- Keys are stored hashed (bcrypt or SHA-256) in the database.
- A user can revoke any of their own keys. Revoked keys reject telemetry immediately.
- A user sees: key name, masked key prefix, creation date, last-used date, and status (active / revoked).

### 6.3 API Key Management (Admin)

- Admins see all users' keys (with owner name/avatar).
- Admins can revoke any active key.
- Admins cannot create keys on behalf of other users.
- Admin status is set via a database flag (`isAdmin`); no self-promotion is possible via the UI.
- On first sign-in, if the user's GitHub ID matches the `ADMIN_GITHUB_ID` environment variable, `isAdmin` is set to `true` automatically. All other users default to `isAdmin: false`.
- Optionally, sign-in can be restricted to members of a specific GitHub organisation by setting `GITHUB_ORG_CHECK=true` and `GITHUB_ORG=<org-login>`. Non-members are denied sign-in. Fails closed (GitHub API error = deny).

### 6.4 Telemetry Ingestion

Endpoint: `POST /api/telemetry`

- Authentication: `Authorization: Bearer <api-key>` header.
- The full raw key is looked up by hashing the inbound value and comparing to stored hashes.
- If the key is not found or is revoked: return `401 Unauthorized`.
- If the payload fails schema validation: return `422 Unprocessable Entity` with error details.
- On success: store the Run record, update `lastUsedAt` on the key, return `201 Created` with `{ id: "<run-uuid>" }`.
- The endpoint is stateless and idempotent-safe (duplicate `slug`+`startedAt` from same key may warn but will still store).

### 6.5 Dashboard — Run History

- Users see only their own runs.
- Default view: runs sorted by `completedAt` descending, paginated (20 per page).
- Each row shows: slug, status badge, type (feature / refinement), date, duration, cost.
- Clicking a row opens the run detail view.
- Filtering: by status, by slug (text search), by date range.

### 6.6 Dashboard — Run Detail

- Full breakdown of the run: all top-level fields plus per-stage accordion/table.
- Per stage: duration, status, feedback rating (1–5), issue codes, token counts, estimated cost.
- Refinement runs show a link back to the parent run.

### 6.7 Dashboard — Insights Panel

- Aggregate stats across all of the user's runs: total runs, success rate %, average duration, total cost.
- Stage breakdown table: average duration per stage.
- Most common failure stage (if any failures exist).
- Note: no live updates; user refreshes to see new data.

---

## 7. Governing Rules & Invariants

| Rule | Description |
|------|-------------|
| **R1** | A user may only view their own runs and keys via the UI. No cross-user data access. |
| **R2** | The raw API key value is never stored; only a hash is persisted. |
| **R3** | The raw key is displayed exactly once — at creation time — then never again. |
| **R4** | Revocation is permanent. A revoked key cannot be re-activated. |
| **R5** | Admin status cannot be set or changed via the application UI. |
| **R6** | Telemetry from a revoked key is rejected with `401`; no partial storage. |
| **R7** | All web UI routes (except login) require an active session. |
| **R8** | Run data is not deleted or purged (indefinite retention, v1). |

---

## 8. Non-Functional Considerations

- **Security**: API key hashing (never plaintext in DB), HTTPS in production, CSRF protection via NextAuth, no sensitive data in client-side state.
- **Auditability**: Every Run record includes `receivedAt` and `apiKeyId`, making it traceable to the originating key and user.
- **Simplicity**: No real-time updates in v1; no worker queues; all ingestion is synchronous in the Route Handler.
- **Extensibility**: The `stages` field is JSONB to accommodate murmur8 schema evolution without portal migrations.

---

## 9. Open Questions & Deferred Decisions

| # | Question | Status |
|---|----------|--------|
| OQ1 | NextAuth session strategy: JWT vs database sessions? | Defer to feature spec |
| OQ2 | Specific PostgreSQL host (Supabase vs Railway vs other)? | Defer to deployment feature |
| OQ3 | API key hashing algorithm: bcrypt (slow, safe) vs SHA-256 (fast, deterministic)? | Defer to api-key-management feature spec |
| OQ4 | Pagination strategy: cursor-based or page-number? | Defer to dashboard feature spec |
| OQ5 | How is the first Admin user created? | **Resolved**: `ADMIN_GITHUB_ID` env var — matched on first sign-in |

---

## 10. Proposed Feature Backlog

Initial feature breakdown, in suggested implementation order:

| Status | P | E | Slug | Description |
|--------|---|---|------|-------------|
| ⏳ | P0 | M | `project-scaffold` | Next.js app, Tailwind brand theme, Prisma schema, NextAuth wiring |
| ⏳ | P0 | M | `github-auth` | GitHub OAuth sign-in/out, User record creation, session protection |
| ⏳ | P0 | M | `api-key-management` | Generate, list, revoke keys; hashed storage; one-time reveal |
| ⏳ | P0 | M | `telemetry-ingestion` | POST /api/telemetry endpoint, key validation, Run record storage |
| ⏳ | P1 | M | `run-history-dashboard` | Paginated run list, status badges, filtering |
| ⏳ | P1 | M | `run-detail-view` | Per-stage breakdown, feedback, tokens, cost |
| ⏳ | P1 | S | `insights-panel` | Aggregate stats — success rate, duration, cost, failure patterns |
| ⏳ | P2 | S | `admin-key-panel` | Admin view of all keys with owner; revoke any key |
