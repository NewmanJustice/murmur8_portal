# Story: Refinement Run — View Parent Link

**As an** authenticated user viewing a refinement run,
**I want** to see a link to the parent run that this refinement was based on,
**so that** I can navigate between related runs and understand the refinement context.

---

## Acceptance Criteria

**AC1 — Parent run link shown for refinement runs with a parentRunId**
Given I navigate to the detail page of a run where `type === "refinement"` and `parentRunId` is non-null,
When the page loads,
Then a contextual link labelled "View parent run →" (or equivalent) is visible and links to `/dashboard/runs/[parentRunId]`.

**AC2 — Parent run link absent for feature runs**
Given I navigate to the detail page of a run where `type === "feature"`,
When the page loads,
Then no parent run link is shown.

**AC3 — Parent run link absent when parentRunId is null**
Given I navigate to the detail page of a run where `type === "refinement"` but `parentRunId` is `null`,
When the page loads,
Then no parent run link is shown (both conditions must be true to display the link).

**AC4 — Parent run link navigates correctly**
Given the parent run link is displayed,
When I click it,
Then I am navigated to `/dashboard/runs/[parentRunId]` — the detail page for the parent run.

---

## Out of Scope
- Rendering a full breadcrumb chain of ancestor runs
- Showing child/sibling refinement runs from a parent run detail page
- Any mutation of the parent–child relationship
