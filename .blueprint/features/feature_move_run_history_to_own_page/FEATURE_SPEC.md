---
featureId: move_run_history_to_own_page
title: Move Run History to Own Page
status: draft
date: 2026-05-21
author: Alex
---

# Feature Specification — Move Run History to Own Page

## 1. Feature Intent

**Why this feature exists.**

The dashboard (`/dashboard`) currently renders two unrelated concerns on a single page: an Insights Panel (aggregate statistics) and a full Run History table (filterable, paginated list of individual runs). As both sections grow, this creates visual clutter and cognitive overload. Users who want a quick health snapshot must scroll past the run table; users who want to browse runs must scroll past the metrics panel.

- **Problem**: Dashboard page conflates high-level insights with detailed run browsing on one scroll. Each audience (quick-check vs. deep-browse) competes for vertical space.
- **User need**: A dedicated route for run history gives focused browsing with its own URL, bookmarkability, and clear navigation intent.
- **System alignment**: The System Spec (§6.5) already names "Dashboard — Run History" and "Dashboard — Insights Panel" as distinct behaviours (§6.5 and §6.7). This feature aligns the implementation with that conceptual separation.

---

## 2. Scope

### In Scope

- Create a new page at route `/dashboard/runs` (file: `app/dashboard/runs/page.tsx`) containing:
  - A header with compact logo + "← Dashboard" back link, matching the pattern of the `/keys` page exactly.
  - The complete Run History section: page heading, run count, filter form, RunsTable, empty states, and pagination.
  - All filter query-param handling (`status`, `slug`, `dateFrom`, `dateTo`, `page`) previously on the dashboard page.
- Modify `app/dashboard/page.tsx` to:
  - Remove the Run History heading, filter form, RunsTable, empty states, pagination, and all associated data fetching (`getUserRuns`, `getPaginationParams`, `getFilterParams`, `SearchParams` type, `DashboardPageProps` type).
  - Retain the InsightsPanel and its data fetching (`getInsightsData`, `computeInsights`, `computeStageAverages`, `getMostCommonFailureStage`) unchanged.
  - Add a "Run History" nav link in the header nav, styled identically to the existing "API Keys" and "Admin Keys" nav links, pointing to `/dashboard/runs`.
- Update any "clear filters" and pagination hrefs inside the new runs page from `/dashboard` to `/dashboard/runs`.
- Update the "← Back to runs" link in `app/dashboard/runs/[id]/page.tsx` (currently hardcoded to `/dashboard/runs`) — no change needed as it already points to the correct target route.

### Out of Scope

- No changes to `RunsTable` component.
- No changes to `InsightsPanel` component.
- No changes to data-fetching library functions (`getUserRuns`, `getInsightsData`, etc.).
- No changes to `app/dashboard/runs/[id]/page.tsx` logic or data fetching.
- No "recent runs" widget or preview on the dashboard — Insights Panel only.
- No new API endpoints.
- No changes to navigation structure beyond adding the "Run History" link to the dashboard header.

---

## 3. Actors Involved

**User (authenticated)**
- Can navigate to `/dashboard` and see the Insights Panel only.
- Can click the "Run History" nav link in the dashboard header to go to `/dashboard/runs`.
- On `/dashboard/runs`, can filter, paginate, and click rows to open run detail — identical to current behaviour.
- Cannot view another user's run history (rule R1 is unchanged).

**Visitor (unauthenticated)**
- Cannot access `/dashboard/runs`; is redirected to login (same protection as all other dashboard routes; rule R7).

**Admin**
- Same as User above. Admin-specific behaviour (Admin Keys link in nav) is unaffected.

---

## 4. Behaviour Overview

**What the feature does, conceptually.**

1. **Dashboard simplification**: After the change, visiting `/dashboard` shows only the Insights Panel (aggregate stats, stage averages, most common failure stage). The page is shorter and purpose-focused.

2. **New Run History page**: Visiting `/dashboard/runs` shows the full run-browsing experience: filter form with status/slug/date controls, paginated RunsTable, empty-state messages, and pagination controls. Behaviour is identical to the current run-history section, except it lives at its own URL.

3. **Navigation addition**: The dashboard header's nav gains a "Run History" link alongside "API Keys" (and conditionally "Admin Keys"). Users can jump directly to run history from the dashboard or return to the dashboard via "← Dashboard" on the runs page.

4. **Deep-linking**: Because run history is now its own page, users can bookmark or share `/dashboard/runs?status=failed&slug=my-feature` links directly.

5. **"← Dashboard" back navigation**: The `/dashboard/runs` page header contains a "← Dashboard" link pointing to `/dashboard`, matching the pattern established by `/keys`.

---

## 5. State & Lifecycle Interactions

**How this feature touches the system lifecycle.**

- **State-neutral for data**: No Run records, API keys, or user records are created, modified, or deleted by this change. All data remains intact.
- **URL state**: The run history filter state (query params) transitions from being owned by `/dashboard` to being owned by `/dashboard/runs`. Any existing bookmarks to `/dashboard?status=...` will no longer show the run table; users will need to update to `/dashboard/runs?status=...`.
- **Navigation state**: The feature introduces a new navigation entry point ("Run History") in the dashboard header, creating a persistent path from dashboard to runs page.
- **Classification**: This feature is **state-neutral** (no domain state created/destroyed) and **route-restructuring** (moves UI surface to a new URL).

---

## 6. Rules & Decision Logic

**New or exercised rules.**

| Rule | Description | Inputs | Outputs | Type |
|------|-------------|--------|---------|------|
| **RN-1** | `/dashboard/runs` requires an active session | Incoming request | Redirect to `/` if unauthenticated | Deterministic |
| **RN-2** | `/dashboard/runs` shows only the authenticated user's runs | `userId` from session | Filtered `getUserRuns` query scoped to `userId` | Deterministic (exercises R1) |
| **RN-3** | "Run History" nav link is always visible to authenticated users | `session.user` present | Link rendered in dashboard header nav | Deterministic |
| **RN-4** | "Clear filters" link on runs page targets `/dashboard/runs` (not `/dashboard`) | `hasFilters === true` | `href="/dashboard/runs"` | Deterministic |
| **RN-5** | Pagination hrefs on runs page target `/dashboard/runs` | `pagination.page` | `href="/dashboard/runs?..."` | Deterministic |

---

## 7. Dependencies

**What this feature relies on.**

- `app/dashboard/RunsTable.tsx` — consumed unchanged by the new `/dashboard/runs` page.
- `app/dashboard/InsightsPanel.tsx` — retained unchanged on the dashboard page.
- `lib/runs.ts` — `getUserRuns` (used by runs page), `getInsightsData` (used by dashboard).
- `lib/dashboard.ts` — `getPaginationParams`, `getFilterParams` (moved to runs page, removed from dashboard page).
- `lib/insights.ts` — `computeInsights`, `computeStageAverages`, `getMostCommonFailureStage` (retained on dashboard page).
- `@/auth` — `getSession`, `signOut` (both pages need session).
- Next.js App Router file-system routing — new `app/dashboard/runs/page.tsx` co-exists with existing `app/dashboard/runs/[id]/page.tsx` without conflict (Next.js resolves `runs/page.tsx` as the index and `runs/[id]/page.tsx` as the dynamic segment).

---

## 8. Non-Functional Considerations

- **Performance**: The dashboard page data fetch is simplified — `getUserRuns` is no longer called on `/dashboard`, removing one DB query per dashboard load. The `/dashboard/runs` page retains the same query pattern.
- **Bookmarkability**: Run history now has a stable, shareable URL.
- **SEO / metadata**: The new runs page should export a `metadata` object (`title: 'Run History — murmur8 portal'`) consistent with the `/keys` page pattern.
- **No audit implications**: This is a UI restructuring; no security-relevant behaviour changes.
- **Routing coexistence**: `app/dashboard/runs/page.tsx` and `app/dashboard/runs/[id]/page.tsx` must coexist. Next.js App Router natively supports this — a `page.tsx` at a segment index does not conflict with dynamic child segments.

---

## 9. Assumptions & Open Questions

**Assumptions (treated as locked per confirmed design decisions):**

- A1: The `/dashboard/runs` page uses the same header pattern as `/keys`: compact logo left, "← Dashboard" link right. No full nav bar required.
- A2: The dashboard page retains the full nav bar header (logo, nav links, avatar, sign-out) so authenticated users can access all sections from one hub.
- A3: No "recent runs" preview widget is added to the dashboard. Insights Panel is the sole dashboard content.
- A4: The `/dashboard/runs/[id]` page already links back to `/dashboard/runs` (confirmed in source: `href="/dashboard/runs"`); no change required there.
- A5: `(dashboard)` route group is used for `/keys` and `/admin/keys`. The new `/dashboard/runs` page sits under `app/dashboard/runs/` (not inside the `(dashboard)` group) to match the existing `app/dashboard/` structure.

**Open questions:** None — design decisions are fully confirmed.

---

## 10. Impact on System Specification

**Alex-owned reconciliation section.**

- **Reinforces**: The System Spec (§6.5, §6.7) already conceptually separates "Run History" and "Insights Panel" as distinct dashboard behaviours. This feature aligns the implementation with that stated separation — it reinforces, not stretches, the spec.
- **Minor spec gap**: Section 6.5 describes "Run History" as part of "the dashboard" without specifying a URL. After this feature, the canonical URL for run history is `/dashboard/runs`. The system spec's §6.5 heading should eventually be updated to note this URL; however, no spec change is required to unblock implementation.
- **No contradictions identified.**

---

## 11. Handover to BA (Cass)

**What Cass should derive from this spec.**

- **Story themes**: Navigation (adding "Run History" link to dashboard nav); page creation (new `/dashboard/runs` page with filter/table/pagination); dashboard simplification (removing run history from `/dashboard`); URL update (clear-filters and pagination links point to new route).
- **Expected story boundaries**:
  1. User navigates from dashboard to run history via nav link.
  2. User views and filters run history on dedicated page.
  3. User returns to dashboard via "← Dashboard" back link on runs page.
  4. Unauthenticated user is redirected from `/dashboard/runs` to login.
- **Areas needing careful story framing**:
  - The "clear filters" and pagination links must target `/dashboard/runs`, not `/dashboard` — this is a subtle correctness detail worth a specific story acceptance criterion.
  - The absence of any run data on the dashboard post-change should be explicit in stories (dashboard shows only Insights Panel).

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-21 | Initial spec created | Feature commissioned to separate run history into its own page | Steve Newman |
