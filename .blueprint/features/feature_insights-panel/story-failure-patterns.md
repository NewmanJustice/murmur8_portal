# Story: View Failure Patterns

**As an** authenticated user,
**I want** to see which pipeline stage fails most often,
**so that** I can prioritise where to improve my pipeline reliability.

---

## Acceptance Criteria

**AC1 — Most common failure stage shown when failures exist**
Given I have at least one run with `status = 'failed'` and a non-null `failedStage`,
When the insights panel loads,
Then I see a "Most Common Failure Stage" callout displaying the `failedStage` value that appears most frequently.

**AC2 — Tie-breaking is deterministic**
Given two or more `failedStage` values are tied for most common,
When the failure stage is shown,
Then the alphabetically first value is displayed (deterministic tie-break).

**AC3 — Failure section hidden when no failures**
Given I have zero failed runs (either no runs at all, or all runs succeeded/paused),
When the insights panel loads,
Then the "Most Common Failure Stage" section is not shown (not rendered as empty — fully absent).

**AC4 — Failed runs with null failedStage are excluded**
Given some failed runs have a null `failedStage`,
When computing the most common failure stage,
Then those runs are excluded from the calculation (only non-null `failedStage` values count).

---

## Out of Scope
- Full failure frequency table (only the top-1 is shown in v1)
- Failure rate % per stage
- Correlation between failure stage and other factors
