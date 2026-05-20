## Handoff Summary
**For:** Codey
**Feature:** project-scaffold

### Key Decisions
- 18 test cases across 2 tiers: 16 structural (fast, no server/DB) and 2 integration (tsc + next build).
- Prisma schema is validated by text-parsing schema.prisma — no live DB or prisma generate call needed.
- auth.ts is checked for file existence and env-var references only; no functional OAuth test.
- Integration tests (T-12, T-18) should be gated in CI behind a flag or separate job.
- T-15 (SVG assets in public/) will fail if OQ-SCAFFOLD-3 is unresolved — treat as a known blocker.

### Files to Create
- test/artifacts/feature_project-scaffold/test-spec.md (written)
- test/feature_project-scaffold.test.js (next step — Codey writes this)

### Test Structure
- describe("Tailwind brand theme", ...) — T-01 to T-04 (4 tests)
- describe("Prisma schema", ...) — T-05 to T-08 (4 tests)
- describe("NextAuth wiring", ...) — T-09 to T-10 (2 tests)
- describe("TypeScript config", ...) — T-11, T-12 (2 tests; T-12 integration)
- describe("Environment and secrets", ...) — T-13, T-17 (2 tests)
- describe("Package scripts", ...) — T-14 (1 test)
- describe("Static assets and pages", ...) — T-15, T-16 (2 tests)
- describe("Build hygiene", ...) — T-18 (1 integration test)
- Total: 18 tests across 8 describe blocks

### Open Questions
- OQ-SCAFFOLD-3: Brand SVG assets — if absent, T-15 fails; Codey should stub/skip or create placeholder SVGs.

### Critical Context
All structural tests use fs.existsSync and string matching on raw file content — no imports of the
app code. Integration tests call child_process.execSync("npx tsc --noEmit") and
child_process.execSync("npm run build"). Test file lives at test/feature_project-scaffold.test.js
and uses node:test + node:assert with no external test framework. Run with: node --test
test/feature_project-scaffold.test.js
