---
storyId: move_run_history_to_own_page-01
title: Navigate to Run History from Dashboard
feature: move_run_history_to_own_page
---

# Story 01 — Navigate to Run History from Dashboard

## User Story

As an authenticated user,
I want a "Run History" link in the dashboard navigation header,
so that I can jump directly to my run history page from the dashboard.

## Acceptance Criteria

**AC-01**: Given I am on `/dashboard` as an authenticated user,
When the page loads,
Then the dashboard header nav contains a "Run History" link pointing to `/dashboard/runs`.

**AC-02**: Given I am on `/dashboard` as an authenticated user,
When I click the "Run History" nav link,
Then the browser navigates to `/dashboard/runs`.

**AC-03**: Given I am on `/dashboard` as an authenticated user,
When the page loads,
Then the "Run History" link is styled identically to the existing "API Keys" nav link (same element type, same CSS classes).

**AC-04**: Given I am on `/dashboard` as an admin user,
When the page loads,
Then the "Run History" link is visible alongside both "API Keys" and "Admin Keys" links in the header nav.

**AC-05**: Given I am on `/dashboard` as an authenticated user,
When the page loads,
Then the dashboard page does not render a run history table, filter form, or pagination controls.

## Out of Scope

- Styling differentiation between the "Run History" link and other nav links (links must match, not differ).
- Active/selected state highlighting on the "Run History" link.
- Any changes to the "API Keys" or "Admin Keys" nav links.
