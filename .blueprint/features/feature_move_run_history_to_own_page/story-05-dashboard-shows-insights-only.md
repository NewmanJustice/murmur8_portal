---
storyId: move_run_history_to_own_page-05
title: Dashboard Shows Only the Insights Panel
feature: move_run_history_to_own_page
---

# Story 05 — Dashboard Shows Only the Insights Panel

## User Story

As an authenticated user,
I want the dashboard at `/dashboard` to show only the Insights Panel,
so that I get a focused high-level health overview without run history cluttering the page.

## Acceptance Criteria

**AC-01**: Given I am on `/dashboard` as an authenticated user,
When the page loads,
Then the InsightsPanel is rendered (aggregate stats, stage averages, most common failure stage are visible).

**AC-02**: Given I am on `/dashboard` as an authenticated user,
When the page loads,
Then no RunsTable, filter form, run count, empty-state run message, or pagination controls are present on the page.

**AC-03**: Given I am on `/dashboard` as an authenticated user,
When the page loads,
Then the page does not make a `getUserRuns` data-fetching call (run data is not fetched on the dashboard route).

**AC-04**: Given I am on `/dashboard` as an authenticated user,
When the page loads,
Then the full nav header is still rendered with the logo, nav links (including the new "Run History" link), avatar, and sign-out controls.

## Out of Scope

- Adding any "recent runs" preview widget to the dashboard.
- Changes to the InsightsPanel component or its data fetching.
- Changes to any other nav header elements beyond adding the "Run History" link (covered in Story 01).
