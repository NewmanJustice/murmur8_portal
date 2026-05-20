---
version: 0.1.0
date: 2026-05-20
status: draft
feature: project-scaffold
priority: P0
effort: M
---

# Feature Specification — project-scaffold

## 1. Feature Intent

**Why this feature exists.**

The murmur8 Portal cannot be developed, tested, or deployed without a coherent foundational project structure. Every subsequent feature (`github-auth`, `api-key-management`, etc.) depends on the runtime, styling system, database layer, and auth wiring that this feature establishes.

- **Problem**: There is no runnable Next.js application yet; the repo contains only framework documentation and specs.
- **System need**: A working base that enforces the technology choices mandated in the System Spec (§4) — App Router, TypeScript, Tailwind + brand theme, Prisma schema, NextAuth v5 — so that all downstream features share a single coherent foundation.
- **How it supports system purpose**: The portal exists to display run history and manage API keys for murmur8 users. That purpose requires a deployable web application. This feature creates that application skeleton.

> This feature aligns directly with System Spec §4 (Technology Stack) and is listed as the P0 prerequisite in §10. No contradiction exists.

---

## 2. Scope

### In Scope

- Initialise a Next.js 14+ project with App Router and TypeScript strict mode
- Install and configure Tailwind CSS with the full murmur8 brand theme (token set, font stack, custom utilities) as specified in `.business_context/Tailwind-based_website_theme_suggestion.md`
- Apply brand CSS variables in `globals.css`
- Install Prisma ORM and define the initial database schema covering all core domain entities: `User`, `ApiKey`, `Run`
- Wire NextAuth.js v5 with the GitHub OAuth provider registered but **not** functional (no callback routes, no session middleware enforcement — deferred to `github-auth` feature)
- Provide a minimal root layout (`app/layout.tsx`) and a placeholder home page (`app/page.tsx`) that renders on-brand and confirms the theme is working
- Establish the project directory structure expected by all subsequent features
- Add brand SVG assets (`murmur8-logo-full.svg`, `murmur8-logo-compact.svg`, `murmur8-npm-icon.svg`, `favicon.svg`) to `public/`
- Configure `package.json` scripts: `dev`, `build`, `start`, `lint`, `db:generate`, `db:migrate`
- Provide a `.env.example` documenting all required environment variables without real values

### Out of Scope

- Functional GitHub OAuth sign-in/out — deferred to `github-auth`
- Session-protected routing and middleware — deferred to `github-auth`
- Any application pages beyond the placeholder home page
- Prisma database migrations run against a real database instance — scaffold defines the schema; actual migration is part of deployment or `github-auth` feature setup
- API route handlers — deferred to their respective feature specs
- Admin flag bootstrapping (`ADMIN_GITHUB_ID` logic) — deferred to `github-auth`
- Real-time features, WebSockets — out of scope v1 per System Spec §3

---

## 3. Actors Involved

**Developer (project contributor)**

- Can clone the repo, copy `.env.example` to `.env.local`, run `npm install`, and start the dev server (`npm run dev`) to see a working branded page.
- Can run `npm run db:generate` to generate the Prisma client from the schema.
- Cannot sign in, access a dashboard, or post telemetry — those capabilities do not yet exist.

No end-user actors (Visitor, User, Admin, Pipeline Client) interact with this feature. It is a purely technical/infrastructure feature.

---

## 4. Behaviour Overview

**What the feature does, conceptually.**

Happy path — a developer sets up the project:

1. Developer clones the repository and runs `npm install`.
2. Developer copies `.env.example` to `.env.local` and populates the required values (database URL, GitHub OAuth credentials, NextAuth secret).
3. Developer runs `npm run dev`; the dev server starts without errors.
4. Navigating to `localhost:3000` renders the branded placeholder home page confirming the Tailwind theme, fonts, and brand colours are active.
5. Developer runs `npm run db:generate`; Prisma client generates successfully against the defined schema.

No branching behaviour or alternative flows exist at this level — the feature either scaffolds correctly or it does not.

User-visible outcomes:
- A running development server with a recognisable murmur8-branded page.
- No TypeScript errors, no lint errors.
- Prisma schema that accurately pre-shapes the data model for all planned domain entities.

---

## 5. State & Lifecycle Interactions

This feature is **state-creating** — it creates the foundational runtime state of the application.

- **States entered**: project exists and is runnable; brand theme is active; Prisma schema is defined; NextAuth is installed and minimally wired.
- **States exited**: none (this is the first feature; there is no prior state to exit).
- **States modified**: the repository transitions from a documentation-only state to a runnable Next.js application.

NextAuth wiring creates a partial state: the dependency is installed and a minimal `auth.ts` config file exists referencing the GitHub provider, but no routes or session middleware are active. This intentional partial state is a handoff point for the `github-auth` feature.

---

## 6. Rules & Decision Logic

### R-SCAFFOLD-1: Brand theme completeness
The Tailwind config must include every token defined in `.business_context/Tailwind-based_website_theme_suggestion.md` (all `starling.*` and `agent.*` colour tokens, font families, border radius variants, box shadow variants, background image utilities). No token may be omitted or renamed.

- Input: `tailwind.config.ts`
- Output: all brand tokens available as Tailwind classes
- Deterministic: yes

### R-SCAFFOLD-2: Prisma schema must cover all System Spec domain entities
The `schema.prisma` file must define models for `User`, `ApiKey`, and `Run` with all fields listed in System Spec §5. Field types, nullability, and relationships must match the spec exactly.

- Input: System Spec §5 field tables
- Output: valid `schema.prisma` that generates a Prisma client without errors
- Deterministic: yes

### R-SCAFFOLD-3: NextAuth partial wiring — no functional auth
`auth.ts` must import and configure the NextAuth GitHub provider using environment variable references (`process.env.GITHUB_CLIENT_ID`, `process.env.GITHUB_CLIENT_SECRET`). No session callbacks, no `middleware.ts`, no route protection are introduced here.

- Input: environment variables (not validated at scaffold time)
- Output: `auth.ts` file that compiles without errors
- Deterministic: yes

### R-SCAFFOLD-4: TypeScript strict mode
`tsconfig.json` must enable `"strict": true`. No `any` types permitted in scaffold files. The project must compile cleanly (`npm run build` passes or `tsc --noEmit` passes).

- Input: TypeScript source files
- Output: zero type errors
- Deterministic: yes

### R-SCAFFOLD-5: Environment variable documentation
`.env.example` must list every environment variable the application will ever need (across all planned features), grouped by concern, with descriptive comments. No real values.

- Input: System Spec §4 and §6 (auth, DB, API keys)
- Output: `.env.example` file
- Deterministic: yes

---

## 7. Dependencies

### System components
- Node.js runtime (version compatible with Next.js 14+)
- npm package registry (for dependency installation)

### External systems
- GitHub OAuth application registration — credentials needed in `.env.local` for NextAuth to compile cleanly at runtime, but no OAuth flow is exercised in this feature
- PostgreSQL-compatible database — connection string needed for Prisma client generation and future migration; scaffold does not run migrations

### Policy/operational
- Brand assets (`murmur8-logo-full.svg`, etc.) must be present in `.business_context/` or provided alongside this feature; they are copied to `public/` during scaffold
- Font files: Inter and JetBrains Mono are loaded via Google Fonts CDN or Next.js `next/font` — no self-hosting required at this stage

### Downstream feature dependencies (created by this feature)
All subsequent features (`github-auth`, `api-key-management`, `telemetry-ingestion`, etc.) depend on this feature being complete and its file structure being stable.

---

## 8. Non-Functional Considerations

**Security**
- `.env.example` must never contain real secrets. `.env.local` must be listed in `.gitignore`.
- The `auth.ts` partial wiring must not expose any unprotected routes or leak session data.

**Auditability**
- No audit logging is required at this stage; the scaffold introduces no data-mutating behaviour.

**Performance**
- No performance-sensitive paths exist in the scaffold. The placeholder page should be a static render.

**Error tolerance**
- The project must start and build cleanly in the absence of a real database connection (Prisma client generation does not require a live DB; only `db:migrate` does).

**Extensibility**
- The `stages` field on the `Run` model must be typed as `Json` (JSONB in PostgreSQL) to accommodate murmur8 schema evolution without future migrations, per System Spec §8.

---

## 9. Assumptions & Open Questions

### Assumptions
- A1: Node.js 20+ is available in the development environment.
- A2: The brand SVG assets referenced in System Spec §4 are already present at `.business_context/murmur8-logo-full.svg`, `murmur8-logo-compact.svg`, `murmur8-npm-icon.svg`, `favicon.svg`. If not, they must be sourced before this feature can be fully completed.
- A3: Next.js `next/font` will be used for Inter and JetBrains Mono to avoid external CDN dependency (Vercel deployment target aligns with this).
- A4: The Prisma provider is `postgresql`. This is consistent with System Spec §4 but the specific host (Supabase/Railway) is deferred (OQ2).

### Open Questions
- OQ-SCAFFOLD-1 (inherits OQ1): NextAuth session strategy — JWT or database sessions? This determines whether the Prisma schema needs a `Session` and `VerificationToken` model (required for database sessions). **Decision needed before `github-auth` feature spec is written.** For this scaffold, the schema will include the NextAuth adapter tables (`Session`, `Account`, `VerificationToken`) as optional/commented models so either strategy is possible without a migration.
- OQ-SCAFFOLD-2: Should the root layout include a `SessionProvider` wrapper (required if using client-side `useSession`)? This is a NextAuth v5 architectural question. Deferring to `github-auth` feature; scaffold will not add a `SessionProvider`.
- OQ-SCAFFOLD-3: Are the brand SVG assets already committed to the repository, or do they need to be created? If absent, this is a blocker for the `public/` asset step.

---

## 10. Impact on System Specification

This feature **reinforces** existing system assumptions. It does not stretch or contradict the System Spec.

The one area of tension worth flagging:

**OQ1 (session strategy) affects the Prisma schema scope.** If database sessions are chosen, the scaffold schema should include `Session`, `Account`, and `VerificationToken` models to avoid a structural migration later. The System Spec defers this decision to feature-spec stage (OQ1). This spec proposes including the NextAuth adapter models in the schema as a precautionary measure, even if database sessions are not ultimately selected. This is additive and not contradictory, but should be confirmed.

**Proposed system spec note (not a change):** Add a note to System Spec §4 or §9 that the NextAuth session strategy decision must be made before `github-auth` is specced, and that the scaffold schema will include adapter tables as a hedge.

---

## 11. Handover to BA (Cass)

**Note:** `project-scaffold` is a technical/infrastructure feature. Per the pipeline rules, Cass is skipped automatically — there are no user-facing behaviours to translate into user stories. Nigel will work directly from this spec to define technical acceptance criteria.

Story themes (for reference if Cass is consulted):
- "As a developer, I can clone and run the project without additional configuration beyond environment variables."
- "As a developer, the database schema matches the domain model described in the system spec."
- "As a developer, the Tailwind theme renders the correct murmur8 brand colours and typography."

Expected story boundaries: not applicable (infrastructure feature, Cass skipped).

Areas needing careful framing for Nigel:
- Schema completeness: Nigel should verify every field from System Spec §5 is present with correct type/nullability.
- Theme completeness: Nigel should verify all brand tokens are accessible as Tailwind classes.
- Build hygiene: `tsc --noEmit`, `next build`, and `eslint` must all pass cleanly.
- Asset presence: Logo SVG files must exist at `public/`.
- NextAuth partial wiring: `auth.ts` must compile but must not enforce any routes.

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial draft | Feature spec creation | Alex |
