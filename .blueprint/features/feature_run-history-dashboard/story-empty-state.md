# Story: Empty State Display

**As an** authenticated user,
**I want** to see a meaningful message when no runs exist or no runs match my filters,
**so that** I understand the current state of my history and know what to do next.

---

## Acceptance Criteria

**AC1 — Zero runs (new user)**
Given I have never run a pipeline,
When I navigate to `/dashboard`,
Then I see a distinct zero-state message (e.g. "No runs yet — connect your pipeline and start building.") rather than an empty table.

**AC2 — No matching runs with active filters**
Given I have runs but apply a filter that matches none of them,
When the filtered page loads,
Then I see a no-results message distinct from the zero-runs state (e.g. "No runs match your filters. Try adjusting or clearing them.").

**AC3 — Filter controls remain visible during empty states**
Given either empty state is shown,
When I view the page,
Then the filter form is still visible so I can adjust or clear filters without navigating away.

**AC4 — Only my runs are considered**
Given another user has runs but I have none,
When I view my dashboard,
Then I see the zero-runs empty state — I do not see the other user's runs or a count that includes them.

**AC5 — Pagination controls hidden when no results**
Given an empty state is displayed,
When I view the page,
Then no pagination controls are rendered (there are no pages to navigate).

---

## Out of Scope
- Onboarding wizard or guided setup steps
- Animation or illustrated empty states
- Suggestions based on other users' activity
