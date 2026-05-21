---
name: project-test-pattern
description: "How tests work in this project — pure file-content assertions, no imports"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3bfd0fb3-e15c-4271-9cf7-8bdae66d8f89
---

All feature tests in `test/feature_*.test.js` are **pure file-content assertions** — they read source files with `fs.readFileSync` and assert string patterns. No module imports, no build step, no DB, no browser.

Runner: `node --test test/feature_<slug>.test.js`

There is also a `lib/insights.js` plain-ESM mirror of `lib/insights.ts` that must be kept in sync manually whenever `lib/insights.ts` changes. The test runner uses the `.ts` file directly for string assertions, but the `.js` mirror matters for any future tests that might import the functions.

**Why:** The project avoids TypeScript compilation in the test pipeline for speed.

**How to apply:** When adding compute logic to `lib/insights.ts`, always mirror the same changes to `lib/insights.js`. When writing tests, assert on string patterns in the `.ts` file — field names, label strings in JSX, computation keywords.
