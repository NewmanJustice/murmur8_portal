## Handoff Summary
**For:** Cass (skipped — see note) / Nigel (direct handoff)
**Feature:** project-scaffold

### Key Decisions
- Cass is **skipped** — this is a pure technical/infrastructure feature with no user-facing behaviour.
- The Prisma schema will include NextAuth adapter tables (`Session`, `Account`, `VerificationToken`) as a hedge against either session strategy (JWT or DB), pending resolution of OQ1.
- NextAuth is wired partially: `auth.ts` with GitHub provider configured but no middleware, no route protection, no session callbacks — those are `github-auth`'s responsibility.
- All Tailwind brand tokens from `.business_context/Tailwind-based_website_theme_suggestion.md` must be present verbatim — no omissions, no renames.
- Brand SVG assets are assumed present in `.business_context/`; if absent this is a **blocker** (OQ-SCAFFOLD-3).

### Files Created
- `.blueprint/features/feature_project-scaffold/FEATURE_SPEC.md`

### Open Questions
- OQ-SCAFFOLD-1: NextAuth session strategy (JWT vs DB) — must be resolved before `github-auth` is specced. Schema includes adapter tables as a precaution.
- OQ-SCAFFOLD-3: Are brand SVG assets already in the repo? If not, they must be sourced before `public/` asset step can complete.

### Critical Context
This is the P0 foundation. Every other feature depends on the directory structure, Prisma schema, and Tailwind theme this scaffold establishes. Nigel should treat schema completeness (all fields from System Spec §5), theme completeness (all tokens from the Tailwind theme doc), and clean build hygiene (`tsc`, `next build`, `eslint`) as the primary acceptance axes. The NextAuth partial wiring must compile but must not protect any routes.
