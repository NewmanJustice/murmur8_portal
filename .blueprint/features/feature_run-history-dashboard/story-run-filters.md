# Story: Filter Runs by Status, Slug, and Date Range

**As an** authenticated user,
**I want** to filter my run list by status, slug text, and date range using URL search params,
**so that** I can quickly find specific past runs without scrolling through my entire history.

---

## Acceptance Criteria

**AC1 — Status filter applied**
Given I select "failed" from the status dropdown and submit the filter form,
When the page reloads,
Then only my runs with `status = "failed"` are shown, and all shown runs still belong to me.

**AC2 — Slug text search (case-insensitive contains)**
Given I enter "user-auth" in the slug search field and submit,
When the page reloads,
Then only my runs whose `slug` contains "user-auth" (case-insensitively) are shown.

**AC3 — Date range filter**
Given I enter a `dateFrom` and `dateTo` (ISO date strings) and submit,
When the page reloads,
Then only my runs where `completedAt` falls within [dateFrom, dateTo] inclusive are shown.

**AC4 — Filters reflected in URL and persist on refresh**
Given I apply any combination of status, slug, and date filters,
When the browser URL updates,
Then the filter values appear as search params (`?status=...&slug=...&dateFrom=...&dateTo=...&page=1`) and reloading the page preserves the same filtered view.

**AC5 — No JavaScript required for filtering**
Given the filter form is rendered,
When I submit the form in a browser with JavaScript disabled,
Then the filter applies correctly via standard HTML GET form submission.

---

## Out of Scope
- Saving filter presets
- Combining filters with OR logic (all filters are AND)
- Filtering on fields other than status, slug, or date range
- Client-side live filtering without page reload
