---
storyId: move_run_history_to_own_page-02
title: View, Filter, and Paginate Run History on Dedicated Page
feature: move_run_history_to_own_page
---

# Story 02 — View, Filter, and Paginate Run History on Dedicated Page

## User Story

As an authenticated user,
I want a dedicated page at `/dashboard/runs` that shows my full run history with filtering and pagination,
so that I can browse and search my runs without navigating away from a focused, bookmarkable URL.

## Acceptance Criteria

**AC-01**: Given I navigate to `/dashboard/runs` as an authenticated user,
When the page loads,
Then the page displays the run history section: a page heading, run count, filter form (status, slug, dateFrom, dateTo), the RunsTable, empty-state messages when applicable, and pagination controls.

**AC-02**: Given I am on `/dashboard/runs` and I apply filter query params (e.g. `?status=failed&slug=my-feature`),
When the page loads,
Then the RunsTable shows only runs matching the applied filters.

**AC-03**: Given I am on `/dashboard/runs` with active filters applied,
When the page has a visible "Clear filters" link,
Then that link's `href` targets `/dashboard/runs` (not `/dashboard`).

**AC-04**: Given I am on `/dashboard/runs` with multiple pages of results,
When the page renders pagination controls,
Then each pagination link's `href` includes `/dashboard/runs` as the base URL (e.g. `/dashboard/runs?page=2`).

**AC-05**: Given I am on `/dashboard/runs`,
When the page loads,
Then the page exports a `metadata` object with `title` equal to `'Run History — murmur8 portal'`.

**AC-06**: Given I am on `/dashboard/runs` as an authenticated user with no runs,
When the page loads,
Then an appropriate empty-state message is displayed and no RunsTable rows appear.

**AC-07**: Given I am on `/dashboard/runs` and I click a row in the RunsTable,
When the navigation occurs,
Then the browser navigates to the corresponding `/dashboard/runs/[id]` detail page.

## Out of Scope

- Changes to the RunsTable component itself.
- Changes to data-fetching library functions (`getUserRuns`, `getPaginationParams`, `getFilterParams`).
- Changes to the `/dashboard/runs/[id]` detail page.
- Adding a "recent runs" preview anywhere on the dashboard page.
