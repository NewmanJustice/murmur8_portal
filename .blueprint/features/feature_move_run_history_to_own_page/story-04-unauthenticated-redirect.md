---
storyId: move_run_history_to_own_page-04
title: Unauthenticated User is Redirected from Runs Page
feature: move_run_history_to_own_page
---

# Story 04 — Unauthenticated User is Redirected from Runs Page

## User Story

As a visitor without an active session,
I want to be redirected to the login page when I attempt to access `/dashboard/runs`,
so that run history data is protected from unauthenticated access.

## Acceptance Criteria

**AC-01**: Given I am not authenticated (no active session),
When I navigate directly to `/dashboard/runs`,
Then I am redirected to the login page (route `/`).

**AC-02**: Given I am not authenticated,
When I navigate to `/dashboard/runs` with filter query params (e.g. `?status=failed`),
Then I am still redirected to login; no run data is exposed.

**AC-03**: Given I am authenticated,
When I navigate to `/dashboard/runs`,
Then I am NOT redirected and the run history page renders normally.

**AC-04**: Given I am authenticated,
When the run history page loads,
Then only runs belonging to my own user account are displayed (no other user's runs are visible).

## Out of Scope

- Post-login redirect back to the originally requested `/dashboard/runs` URL.
- Session expiry handling mid-browse.
- Changes to authentication logic beyond verifying the existing session check pattern applies to the new route.
