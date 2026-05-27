# Feature Specification — Run Detail View

---
version: 0.1.0
date: 2026-05-27
status: draft
---

## 1. Feature Intent

**Why this feature exists.**

- Users need to inspect a single pipeline run in full fidelity — not just the summary row visible on the run-history dashboard, but every per-stage metric, feedback signal, token usage, and cost.
- This supports auditability: developers and teams can trace exactly what each agent did, how long it took, what quality it self-reported, and what issues were flagged.
- Directly fulfils System Spec §6.6 and supports the portal's core mission: allowing users to inspect, analyse, and audit their murmur8 pipeline activity.

> Alignment: fully consistent with System Spec §3, §5, §6.6, and governing rule R1.

---

## 2. Scope

### In Scope
- Server-rendered page at route `app/dashboard/runs/[id]/page.tsx`
- Fetching a single Run record from Prisma by `id`, with session-user ownership check
- Rendering all top-level run fields: `slug`, `status`, `type`, `startedAt`, `completedAt`, `totalDurationMs`, `totalCost`, `commitHash`, `failedStage`, `pausedAfter`, `receivedAt`
- Deserialising the `stages` JSONB field and rendering a card per known stage: `alex`, `cass`, `nigel-spec`, `nigel-tests`, `codey-plan`, `codey-implement`
- Per-stage display: stage name, duration (ms → human-readable), status badge, feedback rating (1–5 stars or numeric), feedback issues (array of strings), token counts (input / output), estimated cost
- Link back to parent run when `type === "refinement"` and `parentRunId` is set
- Status badges consistent with run-history-dashboard: `success`=green, `failed`=red, `paused`=yellow
- Agent accent colour applied to each stage card (Alex=sky `#38BDF8`, Cass=violet `#A78BFA`, Nigel=amber `#F59E0B`, Codey=teal `#2DD4BF`)
- 404 response if run does not exist or belongs to a different user (R1 enforcement)
- Navigation: back link labelled "← Run History" to `/dashboard/runs` (run-history-dashboard)
- Consistent site nav header: murmur8 logo (left), nav links "Run History" → `/dashboard/runs` and "Keys" → `/(dashboard)/keys` (centre/right), user avatar and sign-out button (right) — matching `app/dashboard/page.tsx`
- Telemetry summary tiles: four metric tiles (Total Cost, Total Duration, Total Tokens derived from stages JSONB at render time, Stage Count) reusing InsightsPanel tile visual pattern
- Feature spec display: render `run.featureSpec` as Markdown if non-null; "Not available for this run" if null
- Stories display: render `run.stories` (JSON array of `{title, content}`) if non-null; "Not available for this run" if null
- Schema: add `featureSpec` (String?, nullable) and `stories` (Json?, nullable) to Prisma `Run` model
- API: extend `ValidatedPayload` and `buildRunData` in telemetry ingestion to accept and persist `featureSpec` and `stories`

### Out of Scope
- Mutations of any kind (no delete, retry, flag, or share actions)
- Real-time or polling updates (§3 out-of-scope: no WebSockets/SSE)
- Public or shareable run links (§3 out-of-scope)
- Stage-level drill-down beyond the fields defined in the telemetry schema (§3)
- Rendering unknown/future stage keys from JSONB (render only the six known stages; ignore others gracefully)
- Data export from the run detail page
- Rendering `featureSpec` or `stories` for runs ingested before this change — those fields will be null; the graceful "not available" state covers this

---

## 3. Actors Involved

**User (authenticated)**
- Can navigate to the detail page for any of their own runs (via a row click on the run-history dashboard).
- Views all run fields and per-stage breakdown.
- Cannot view another user's run — receives a 404.
- Cannot modify any data (read-only).

**Visitor (unauthenticated)**
- Redirected to the login page by the session guard (§6.1, R7).
- Never reaches this page.

**Admin**
- Has no elevated access on this page. Admins see only their own runs via this route, same as a regular User (R1 applies; admin panel is a separate feature).

---

## 4. Behaviour Overview

**Happy path:**
1. User clicks a run row on the run-history dashboard.
2. Browser navigates to `/dashboard/runs/[id]`.
3. Server Component fetches the run from Prisma using `id` from the URL parameter.
4. Session userId is compared to `run.userId`. If they match, the page renders.
5. Site nav header renders: murmur8 logo (left), "Run History" and "Keys" nav links (centre/right), user avatar and sign-out button (right).
6. Four telemetry summary tiles render: Total Cost, Total Duration, Total Tokens (derived from stages JSONB), Stage Count.
7. Top-level run metadata is displayed in a summary header section.
8. The `stages` JSONB field is deserialised; one card is rendered per known stage in pipeline order: `alex` → `cass` → `nigel-spec` → `nigel-tests` → `codey-plan` → `codey-implement`.
9. Each stage card shows: name, duration, status badge, feedback rating, feedback issues (if any), input tokens, output tokens, cost.
10. If the stage key is absent from the JSONB (e.g. Cass was skipped), the card is either omitted or shown in a "skipped" state.
11. If `type === "refinement"` and `parentRunId` is non-null, a contextual link "View parent run →" links to `/dashboard/runs/[parentRunId]`.
12. A back link labelled "← Run History" returns the user to the run-history dashboard.
13. If `run.featureSpec` is non-null, it is rendered as Markdown below the stage breakdown; otherwise "Not available for this run" is shown.
14. If `run.stories` is non-null, each story's `title` and `content` are rendered below the feature spec section; otherwise "Not available for this run" is shown.

**Error paths:**
- Run ID not found in DB → 404 page.
- Run found but `run.userId !== session.userId` → 404 page (no information leakage about existence).
- Session absent → middleware redirects to login before the page renders.
- `stages` field is null or malformed → render the header section gracefully with a notice; do not throw.

---

## 5. State & Lifecycle Interactions

This feature is **state-constraining and read-only**:
- No new state is created.
- No state transitions are triggered.
- It reads an existing `Run` record (and implicitly the owning `User` via session).
- The only side-effect is a read query to PostgreSQL.

Relevant lifecycle states (from System Spec §5):
- `Run.status`: `success`, `failed`, `paused` — all are viewable; status drives badge colour only.
- `Run.type`: `feature` or `refinement` — drives whether the parent run link is shown.

---

## 6. Rules & Decision Logic

| Rule | Description | Inputs | Output | Type |
|------|-------------|--------|--------|------|
| **R1-enforce** | User may only view their own run. `run.userId` must equal `session.userId`. | `run.userId`, `session.userId` | Render page or 404 | Deterministic |
| **R7-enforce** | Active session required. | Session presence | Allow or redirect to `/` | Deterministic |
| **Stage presence** | If a stage key is absent from JSONB, render it as "skipped" or omit — do not error. | `stages[key]` | Card shown / omitted | Deterministic |
| **Parent link** | Show parent run link only when `type === "refinement"` AND `parentRunId !== null`. | `type`, `parentRunId` | Conditional link render | Deterministic |
| **404 parity** | Return 404 for both "run not found" and "run belongs to another user" — no distinction exposed to the client. | DB result, userId check | `notFound()` | Deterministic |

---

## 7. Dependencies

| Dependency | Detail |
|------------|--------|
| **`run-history-dashboard`** | Entry point; this page is navigated to from that dashboard's row-click. The `[id]` param must be a valid portal Run UUID. |
| **`project-scaffold`** | Provides Next.js 15 App Router, Prisma client, Tailwind brand theme, layout/auth middleware. |
| **`github-auth`** | Provides session with `userId`; session must be available in the Server Component via `auth()`. |
| **`telemetry-ingestion`** | Populates the `Run` records and `stages` JSONB that this page reads. |
| **Prisma `Run` model** | Must include all fields listed in §5 of the System Spec, with `stages` typed as `Json`, and the new `featureSpec` (String?) and `stories` (Json?) fields. |
| **murmur8 telemetry schema** | `.business_context/murmur8-framework-understanding.md` §3 defines stage keys and field names. |
| **`InsightsPanel` / tile component** | Dashboard feature metric tile visual pattern; reused on this page for the four telemetry summary tiles. |

---

## 8. Non-Functional Considerations

- **Security**: The userId ownership check is the only access-control gate. It must run server-side before any data is sent to the client. Using `notFound()` (not a 403) prevents enumeration of other users' run IDs.
- **Performance**: Single-record Prisma query by primary key — no pagination, no joins beyond reading the run row. Expected to be fast; no caching needed at this stage.
- **JSONB resilience**: `stages` may contain unknown keys from future murmur8 schema evolution. The renderer must not crash on unexpected keys; it renders only the six known stages and ignores extras.
- **Null safety**: Any per-stage field (feedback, tokens, cost) may be absent if the run was incomplete. UI must handle `undefined`/`null` gracefully with sensible fallbacks (e.g. "—").
- **Auditability**: `receivedAt` is displayed, supporting traceability (System Spec §8).

---

## 9. Assumptions & Open Questions

**Assumptions:**
- The `run-history-dashboard` feature is complete and navigates to `/dashboard/runs/[id]` on row click.
- The `stages` JSONB field is stored as-is from the telemetry payload; no server-side normalisation is needed before rendering.
- Next.js `notFound()` is used to emit a 404 response from a Server Component.
- Session is accessed via `auth()` from NextAuth v5 inside the Server Component.
- The six known stage keys are fixed for v1: `alex`, `cass`, `nigel-spec`, `nigel-tests`, `codey-plan`, `codey-implement`.
- `featureSpec` is a plain Markdown string; no special sanitisation needed for v1.
- `stories` is stored as a JSON array of `{title: string, content: string}`; the portal validates the shape on receipt.
- Runs before this migration have `featureSpec = null` and `stories = null`; the graceful "not available" state covers this.

**Open Questions:**
- AQ1: Should a "skipped" stage (e.g. Cass for technical features) be shown as a dimmed card, or omitted entirely? Recommend omit for clarity — confirm with product.
- AQ2: For `codey-implement`, the schema includes `stepsCompleted`. Should this be shown on the detail page? Not specified in §6.6 — recommend include if present, ignore if absent.
- AQ3: Feedback `recommendation` field (e.g. "proceed") exists in the telemetry schema. Include on stage cards? Not mentioned in §6.6 — treat as stretch; include if Cass adds a story for it.

---

## 10. Impact on System Specification

- **Reinforces** §6.6 (Run Detail), §5 (Run domain concept), §7 (R1, R7), §8 (auditability).
- **No contradictions** identified.
- The spec is silent on how to handle a `stages` field that is null (e.g. a run ingested with no stage data). This feature handles it gracefully; the System Spec should be updated to note that `stages` may be null for malformed or partial telemetry — proposed addition to §5, deferred to system spec maintainer.

---

## 11. Handover to BA (Cass)

**Story themes Cass should derive:**
1. **View run header** — user sees slug, status, type, dates, duration, cost, commit hash on the detail page.
2. **View stage breakdown** — user sees one card per stage with all per-stage fields rendered correctly.
3. **Refinement run link** — user on a refinement run detail page sees and can follow a link to the parent run.
4. **Access control** — user cannot view another user's run; receives 404.
5. **Graceful degradation** — stages with missing fields or absent stage keys render without errors.
6. **Site nav header** — the detail page renders the consistent site-wide nav header (logo, nav links, user avatar, sign-out) matching the dashboard.
7. **Telemetry summary tiles** — four metric tiles (Total Cost, Total Duration, Total Tokens, Stage Count) render on the detail page reusing the InsightsPanel tile visual pattern.
8. **Feature spec and stories display** — `featureSpec` renders as Markdown when present; `stories` renders as titled sections when present; both show "Not available for this run" when null; telemetry ingest API persists both fields.

**Expected story boundaries:** one story per theme above; AQ1 (skipped stage display) and AQ2 (`stepsCompleted`) should be confirmed before Cass writes those stories.

**Areas needing careful framing:**
- The 404-for-both-cases pattern (not-found vs unauthorised) — Cass should write a story that explicitly tests both triggers produce a 404, not a 403 or an error page.
- Stage card rendering with partial data — acceptance criteria must cover null token counts, absent feedback, etc.

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial draft | Feature spec created by Alex | Alex |
| 2026-05-27 | Refinement: site nav header, telemetry tiles, featureSpec/stories in DB | User feedback | User |
