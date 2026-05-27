## Test Changes

**Feature:** run-detail-view
**Refinement date:** 2026-05-27

### Files changed
- `test/feature_run-detail-view.test.js` — 24 new tests added (T-RDV-29 through T-RDV-45), header updated
- `lib/run-detail.ts` — added `BACK_LINK`, `SITE_NAV_LINKS`, `computeTotalTokens`, `computeStageCount` exports
- `lib/telemetry.ts` — added `featureSpec` and `stories` to `ValidatedPayload`, `validatePayload`, and `buildRunData`

### New test IDs (24 tests)

| Test ID | Story | AC | Description |
|---------|-------|----|-------------|
| T-RDV-29 | site-nav | AC1–AC2 | SITE_NAV_LINKS is an array with at least 2 entries |
| T-RDV-30 | site-nav | AC2 | "Run History" link present, href = /dashboard/runs |
| T-RDV-31 | site-nav | AC3 | "Keys" (API Keys) link present with non-empty href |
| T-RDV-32 | site-nav | AC1–AC4 | every nav link entry has non-empty label and href |
| T-RDV-33 | telemetry-tiles | AC1 | four expected tile label names defined |
| T-RDV-34 | telemetry-tiles | AC2 | computeTotalTokens sums inputTokens + outputTokens across stages |
| T-RDV-35 | telemetry-tiles | AC5 | computeStageCount returns number of JSONB stage keys |
| T-RDV-35b | telemetry-tiles | AC5 | empty stages object returns 0 |
| T-RDV-35c | telemetry-tiles | AC5 | null stages returns 0, no throw |
| T-RDV-36 | telemetry-tiles | AC4 | null/absent token fields treated as 0 |
| T-RDV-36b | telemetry-tiles | AC4 | null stages input to computeTotalTokens returns 0, no throw |
| T-RDV-37 | spec-and-stories | AC1 | featureSpec non-null passes through validatePayload |
| T-RDV-38 | spec-and-stories | AC2 | featureSpec absent → null/undefined in validated data |
| T-RDV-39 | spec-and-stories | AC3 | stories non-null array passes through validatePayload |
| T-RDV-40 | spec-and-stories | AC4 | stories absent → null/undefined in validated data |
| T-RDV-41 | spec-and-stories | AC5 | validatePayload accepts featureSpec as optional string |
| T-RDV-42 | spec-and-stories | AC5 | validatePayload accepts stories as optional array of {title, content} |
| T-RDV-43 | spec-and-stories | AC5 | validatePayload rejects malformed stories — non-array string |
| T-RDV-43b | spec-and-stories | AC5 | validatePayload rejects malformed stories — plain object |
| T-RDV-44 | spec-and-stories | AC5 | buildRunData passes featureSpec through to output |
| T-RDV-44b | spec-and-stories | AC5 | buildRunData passes stories through to output |
| T-RDV-44c | spec-and-stories | AC5 | buildRunData without featureSpec/stories still succeeds |
| T-RDV-45 | run-header | AC3 | BACK_LINK.label is "← Run History" |
| T-RDV-45b | run-header | AC3 | BACK_LINK.href is "/dashboard/runs" |

### Updated tests
- story-run-header AC3: replaced structural note with T-RDV-45 verifying `BACK_LINK.label === "← Run History"` (was "← Back to runs")

### Unaffected tests
- T-RDV-01 through T-RDV-18 (story-run-header, story-stage-breakdown) — unchanged
- T-RDV-19 through T-RDV-28 in feature_run-detail-view-edge.test.js (story-graceful-degradation, story-refinement-link) — unchanged

### Test run result
44 tests, 44 pass, 0 fail (`node --test --import tsx/esm test/feature_run-detail-view.test.js`)
