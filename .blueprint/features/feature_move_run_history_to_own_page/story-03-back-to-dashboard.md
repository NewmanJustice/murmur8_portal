---
storyId: move_run_history_to_own_page-03
title: Return to Dashboard via Back Link on Runs Page
feature: move_run_history_to_own_page
---

# Story 03 — Return to Dashboard via Back Link on Runs Page

## User Story

As an authenticated user viewing run history,
I want a "← Dashboard" link in the runs page header,
so that I can return to the dashboard without using the browser back button.

## Acceptance Criteria

**AC-01**: Given I am on `/dashboard/runs`,
When the page loads,
Then the page header contains a "← Dashboard" link.

**AC-02**: Given I am on `/dashboard/runs`,
When I click the "← Dashboard" link,
Then the browser navigates to `/dashboard`.

**AC-03**: Given I am on `/dashboard/runs`,
When the page loads,
Then the header layout matches the `/keys` page pattern: compact logo on the left and "← Dashboard" back link on the right side of the header.

**AC-04**: Given I am on `/dashboard/runs`,
When the page loads,
Then the header does NOT contain the full dashboard nav bar (no "API Keys", "Admin Keys", avatar, or sign-out controls in the runs page header).

## Out of Scope

- Breadcrumb trails or multi-level navigation.
- Changes to the "← Back to runs" link on `/dashboard/runs/[id]` (already points to `/dashboard/runs` and requires no change).
- Browser history stack manipulation.
