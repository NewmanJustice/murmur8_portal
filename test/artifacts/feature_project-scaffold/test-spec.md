---
feature: project-scaffold
tester: Nigel
date: 2026-05-20
---

# Test Specification — project-scaffold

## Understanding

This is a pure infrastructure feature; no runtime user behaviour exists to test. Tests verify
structural correctness: files exist, configs are valid JSON/TS-parseable, the package scripts
are declared, the Prisma schema covers every required field, the Tailwind config contains every
brand token, and the project compiles cleanly. All tests run in Node.js (node:test + node:assert)
using fs.existsSync, JSON.parse, and child_process.execSync. No real database, no OAuth app,
and no running server are required. Build hygiene tests (tsc, next build) are marked as
integration-level and may be skipped in fast-feedback CI; the rest are unit-level structural checks
that run in milliseconds.

## AC → Test ID Mapping

| AC / Rule           | Description                                       | Test IDs              | Type        |
|---------------------|---------------------------------------------------|-----------------------|-------------|
| R-SCAFFOLD-1        | All starling.* and agent.* colour tokens present  | T-01, T-02            | structural  |
| R-SCAFFOLD-1        | fontFamily, borderRadius, boxShadow, bgImage keys | T-03                  | structural  |
| R-SCAFFOLD-1        | globals.css includes all CSS variables            | T-04                  | structural  |
| R-SCAFFOLD-2        | schema.prisma defines User model + all fields     | T-05                  | structural  |
| R-SCAFFOLD-2        | schema.prisma defines ApiKey model + all fields   | T-06                  | structural  |
| R-SCAFFOLD-2        | schema.prisma defines Run model + all fields      | T-07                  | structural  |
| R-SCAFFOLD-2        | schema.prisma defines NextAuth adapter models     | T-08                  | structural  |
| R-SCAFFOLD-3        | auth.ts exists and references GitHub provider env vars | T-09             | structural  |
| R-SCAFFOLD-3        | No middleware.ts protecting routes                | T-10                  | structural  |
| R-SCAFFOLD-4        | tsconfig.json has "strict": true                  | T-11                  | structural  |
| R-SCAFFOLD-4        | Project compiles without type errors              | T-12                  | integration |
| R-SCAFFOLD-5        | .env.example exists and lists required vars       | T-13                  | structural  |
| Scope / §4          | package.json scripts: dev, build, start, lint, db:generate, db:migrate | T-14 | structural |
| Scope / §4          | Brand SVG assets present in public/               | T-15                  | structural  |
| Scope               | app/layout.tsx and app/page.tsx exist             | T-16                  | structural  |
| §8 Non-functional   | .env.local listed in .gitignore                   | T-17                  | structural  |
| §8 Non-functional   | next build passes cleanly                         | T-18                  | integration |

## Key Assumptions

- ASSUMPTION: Node.js 20+ and npm are available in the CI environment at test time.
- ASSUMPTION: Brand SVG assets (.business_context/murmur8-*.svg, favicon.svg) exist in the repo when Codey runs the scaffold; T-15 will fail otherwise (known blocker OQ-SCAFFOLD-3).
- ASSUMPTION: Tests T-12 and T-18 (compile / next build) require npm install to have been run first; they are integration tests and should be gated behind a dedicated CI job or skipped with --skip-integration.
- ASSUMPTION: Prisma client generation (npm run db:generate) does not require a live database — the test for T-07/T-08 parses schema.prisma as text rather than invoking prisma generate.
- ASSUMPTION: auth.ts is located at the project root or src/ root (e.g., auth.ts or src/auth.ts); the test will check both locations.
