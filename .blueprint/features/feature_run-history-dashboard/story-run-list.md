# Story: View Paginated Run List

**As an** authenticated user,
**I want** to see a paginated table of my pipeline runs sorted by most recent first,
**so that** I can quickly review my recent activity and track pipeline outcomes.

---

## Acceptance Criteria

**AC1 — Runs shown are mine only**
Given I am signed in and navigate to `/dashboard`,
When the page loads,
Then I see only runs where `userId` matches my session user ID — no other user's runs appear.

**AC2 — Default sort order**
Given I have multiple runs with different `completedAt` timestamps,
When I view the dashboard with no filters applied,
Then runs are displayed in descending `completedAt` order (most recent first).

**AC3 — Pagination at 20 per page**
Given I have more than 20 runs,
When I view page 1,
Then exactly 20 runs are shown and pagination controls indicate there are more pages.

**AC4 — Row columns present**
Given there are runs to display,
When I view any run row,
Then each row shows: slug, status badge, type badge, completedAt date, human-readable duration, and formatted cost.

**AC5 — Row navigates to detail**
Given I can see runs in the table,
When I click any row,
Then I am navigated to `/runs/[id]` for that specific run.

---

## Out of Scope
- Showing other users' runs
- Editing or deleting any run from this view
- Real-time updates or polling
- Cursor-based pagination
- Export of run data
