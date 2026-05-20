## Summary

Scaffold a Next.js 14 App Router + TypeScript + Tailwind + Prisma + NextAuth v5 project onto the existing repo, which currently has only a minimal `package.json` (one dependency) and a `.gitignore`. All required files must be created from scratch. Steps are ordered so structural tests pass first, integration tests last.

## Steps

1. [package.json] UPDATE — add Next.js 14, React, TypeScript, Tailwind, Prisma, NextAuth v5, and all dev deps; add scripts: dev, build, start, lint, db:generate, db:migrate | Tests: T-14
2. [tsconfig.json] CREATE — Next.js-compatible tsconfig with `"strict": true`, `moduleResolution: bundler`, `jsx: preserve` | Tests: T-11, T-12
3. [tailwind.config.ts] CREATE — full brand theme: starling.* colours, agent.* colours, fontFamily, borderRadius brand, boxShadow glow, backgroundImage starling-radial; copied verbatim from `.business_context/Tailwind-based_website_theme_suggestion.md` | Tests: T-01, T-02, T-03
4. [app/globals.css] CREATE — CSS custom properties for all --starling-* and --agent-* vars, Tailwind directives (@tailwind base/components/utilities) | Tests: T-04
5. [prisma/schema.prisma] CREATE — PostgreSQL datasource, Prisma client generator, models: User (githubId, name, email, avatarUrl, isAdmin, createdAt), ApiKey (key, name, userId, createdAt, lastUsedAt, revokedAt), Run (all fields including stages Json, receivedAt, failedStage, pausedAfter, parentRunId), NextAuth adapter models (Account, Session, VerificationToken) | Tests: T-05, T-06, T-07, T-08
6. [auth.ts] CREATE — NextAuth v5 stub: imports GitHub provider, references `process.env.GITHUB_CLIENT_ID` and `process.env.GITHUB_CLIENT_SECRET`; no middleware, no callbacks | Tests: T-09, T-10
7. [app/layout.tsx] CREATE — root layout with `<html>` and `<body>`, imports globals.css, uses next/font for Inter and JetBrains Mono | Tests: T-16
8. [app/page.tsx] CREATE — branded placeholder home page using starling/agent Tailwind classes; static render only | Tests: T-16, T-18
9. [.env.example] CREATE — documents DATABASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET with placeholder values only, grouped with comments | Tests: T-13, T-17
10. [public/] COPY — copy murmur8-logo-full.svg, murmur8-logo-compact.svg, murmur8-npm-icon.svg, favicon.svg from `.business_context/` to `public/` | Tests: T-15

## Risks

- OQ-SCAFFOLD-3: Brand SVGs exist at `.business_context/` (confirmed by directory listing) — Step 10 is unblocked.
- T-17 (.env.local in .gitignore): `.gitignore` already has `.env*.local` pattern — this test will pass without any change to `.gitignore`.
- T-12 / T-18 (tsc + next build): These integration tests require `npm install` to complete successfully; they should be gated in CI behind a separate job per Nigel's guidance.
