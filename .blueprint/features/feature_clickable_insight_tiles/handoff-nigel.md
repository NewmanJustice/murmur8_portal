## Handoff Summary
**For:** Codey
**Feature:** clickable_insight_tiles

### Key Decisions
- 44 test cases mapped 1:1 to acceptance criteria across all 7 stories
- Data-layer tests (T19-T25, T37-T38) are pure unit tests against aggregation functions with seeded data
- Component tests (T01-T05, T12-T18, T26-T36, T40-T44) use React Testing Library with mocked router and data
- Chart assertions rely on Recharts component roles/test-ids, not visual output
- Auth/routing tests (T06-T11) mock Next.js middleware and session

### Files to Create
- test/artifacts/feature_clickable_insight_tiles/test-spec.md (written)
- test/feature_clickable_insight_tiles.test.js (next step)

### Test Structure
- `describe('Tile Click Affordance')` - 5 tests (T01-T05)
- `describe('Trend Page Shell')` - 6 tests (T06-T11)
- `describe('Time-Window Toggle')` - 7 tests (T12-T18)
- `describe('Metric Trend Data Layer')` - 7 tests (T19-T25)
- `describe('Chart Rendering')` - 7 tests (T26-T32)
- `describe('Compound/Categorical Metrics')` - 7 tests (T33-T39)
- `describe('Empty and Edge States')` - 5 tests (T40-T44)

### Open Questions
- None

### Critical Context
The 11 metric keys constant and data-layer function signatures are the primary contracts. Tests should validate shapes (`{ bucket, value }` vs `{ bucket, series }` vs `{ bucket, categories }`) and assert null-gap handling. Mock data needs at minimum: runs across multiple buckets, runs with failures, runs spanning >1 year for prior-year tests, and an empty-state scenario.
