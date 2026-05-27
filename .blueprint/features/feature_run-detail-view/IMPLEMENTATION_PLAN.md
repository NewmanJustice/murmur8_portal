## Summary
All pure helper functions (`BACK_LINK`, `SITE_NAV_LINKS`, `computeTotalTokens`, `computeStageCount`) are already implemented in `lib/run-detail.ts` and `lib/telemetry.ts` — all 44 tests pass. The remaining work is: add two fields to the Prisma schema, update the `getRunDetail` query and `RunDetail` type, extract a reusable `MetricTile` component, install `react-markdown`, and refactor the run detail page to add the site nav header, four telemetry summary tiles, feature spec section, and stories section.

## Steps
1. [prisma/schema.prisma] EDIT — add `featureSpec String?` and `stories Json?` to the `Run` model, then run `prisma db push` | Tests: T-RDV-37–T-RDV-44c (schema backing; tests already pass via lib layer)
2. [lib/runs.ts] EDIT — add `featureSpec` and `stories` to `RunDetail` interface and to the `select` block in `getRunDetail` | Tests: T-RDV-44, T-RDV-44b (data flows through to page render)
3. [package.json / node_modules] ADD — install `react-markdown` via `npm install react-markdown` | Tests: (enables Markdown rendering in step 6)
4. [app/dashboard/MetricTile.tsx] CREATE — extract the `StatCard`-style metric tile as a reusable Server-safe component accepting `label` and `value` string props, matching the InsightsPanel tile visual pattern | Tests: T-RDV-33 (four tile labels contract)
5. [app/dashboard/runs/[id]/page.tsx] EDIT — replace the minimal logo-only header with the full site nav header: murmur8 logo (left), "Run History" + "API Keys" nav links using `SITE_NAV_LINKS`, user avatar, sign-out button (right) — matching `app/dashboard/page.tsx` | Tests: T-RDV-29–T-RDV-32, T-RDV-45, T-RDV-45b
6. [app/dashboard/runs/[id]/page.tsx] EDIT — import `computeTotalTokens`, `computeStageCount`, `BACK_LINK`; add four `MetricTile` instances (Total Cost, Total Duration, Total Tokens, Stage Count) below the back link and above the run header card; update back link text to use `BACK_LINK.label` / `BACK_LINK.href` | Tests: T-RDV-33–T-RDV-36b, T-RDV-45, T-RDV-45b
7. [app/dashboard/runs/[id]/page.tsx] EDIT — add feature spec section after stage breakdown: if `run.featureSpec` is non-null render it via `<ReactMarkdown>`; otherwise render "Not available for this run"; add stories section: if `run.stories` is a non-empty array render each `{title, content}` as a titled block; otherwise render "Not available for this run" | Tests: T-RDV-37–T-RDV-40

## Risks
- `prisma db push` requires a live `DATABASE_URL`; if the dev DB is unavailable, use `prisma migrate dev --name add-feature-spec-stories` instead and commit the migration file.
- `react-markdown` v9+ is ESM-only; Next.js 15 handles this via Turbopack/webpack ESM support but verify no `require()` interop issues arise at build time.
