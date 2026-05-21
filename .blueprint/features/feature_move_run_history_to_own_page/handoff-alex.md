# Handoff to Cass — move_run_history_to_own_page

Hi Cass,

This feature is a focused UI restructuring: move the Run History section out of the dashboard and onto its own page at `/dashboard/runs`, leaving the dashboard with the Insights Panel only.

## What's changing

- **New page**: `app/dashboard/runs/page.tsx` — full run history (filter form, RunsTable, pagination). Header: compact logo + "← Dashboard" link (same pattern as `/keys`).
- **Dashboard trimmed**: `app/dashboard/page.tsx` loses run history entirely. Retains InsightsPanel + full nav header (logo, nav links, avatar, sign-out).
- **Nav addition**: Dashboard header gains a "Run History" link styled identically to the existing "API Keys" and "Admin Keys" links.
- **Link updates**: Clear-filters and pagination hrefs inside the runs page must point to `/dashboard/runs` (not `/dashboard`).
- **Nothing else changes**: RunsTable, InsightsPanel, lib functions, and `/dashboard/runs/[id]` are untouched.

## Story themes to cover

1. User navigates to run history from dashboard via new nav link.
2. User views, filters, and paginates run history on the dedicated page.
3. User returns to dashboard via "← Dashboard" back link.
4. Unauthenticated user is redirected from `/dashboard/runs` to login.
5. Dashboard shows only the Insights Panel — no run table.

## Key acceptance details

- "Clear filters" link on `/dashboard/runs` targets `/dashboard/runs` (not `/dashboard`).
- Pagination links on `/dashboard/runs` include `/dashboard/runs` as the base URL.
- Dashboard page has no run data, no filter form, no RunsTable after the change.

Full spec: `.blueprint/features/feature_move_run_history_to_own_page/FEATURE_SPEC.md`
