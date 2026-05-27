Refined: 2026-05-27 — new story

# Story: Feature Spec and User Stories Display

**As an** authenticated user,
**I want** to see the feature spec and user stories for a run on its detail page,
**so that** I can review what was planned and implemented.

---

## Acceptance Criteria

**AC1 — Feature spec is rendered as Markdown when present**
Given a run where `featureSpec` is non-null,
When I view the run detail page,
Then the content of `featureSpec` is rendered as Markdown in a clearly labelled "Feature Spec" section.

**AC2 — Feature spec shows a notice when absent**
Given a run where `featureSpec` is null,
When I view the run detail page,
Then the "Feature Spec" section displays a "Not available for this run" notice rather than an error or blank space.

**AC3 — User stories are displayed when present**
Given a run where `stories` is a non-null JSON array of `{ title, content }` objects,
When I view the run detail page,
Then each story is displayed with its `title` and `content` rendered in order.

**AC4 — User stories section shows a notice when absent**
Given a run where `stories` is null,
When I view the run detail page,
Then the stories section displays a "Not available for this run" notice rather than an error or blank space.

**AC5 — Telemetry API accepts featureSpec and stories fields**
Given a telemetry payload is POSTed to `/api/telemetry`,
When the payload includes `featureSpec` (string, optional) and/or `stories` (array of `{ title, content }`, optional),
Then the API persists those values to the corresponding `Run` record without error; runs without these fields continue to work unchanged.

**AC6 — Prisma Run model has featureSpec and stories fields**
Given the Prisma schema for the `Run` model,
When I inspect the schema,
Then it includes a nullable `featureSpec String?` field and a nullable `stories Json?` field.

---

## Out of Scope
- Editing or regenerating the spec or stories from the detail page
- Diff views between spec versions
- Markdown sanitisation beyond what the existing Markdown renderer provides
