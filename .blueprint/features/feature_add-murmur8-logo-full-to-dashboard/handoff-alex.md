## Handoff Summary
**For:** Cass
**Feature:** add-murmur8-logo-full-to-dashboard

### Key Decisions
- Full logo placed in content area above InsightsPanel — not in the nav header
- Uses Next.js `<Image>` with `priority`, horizontally centred
- Dashboard only — no other pages touched
- Compact nav logo retained unchanged

### Files Created
- .blueprint/features/feature_add-murmur8-logo-full-to-dashboard/FEATURE_SPEC.md

### Open Questions
- None

### Critical Context
Single-file change to app/dashboard/page.tsx. One story: authenticated user sees full logo above InsightsPanel. AC should verify logo src, Image component usage, placement above InsightsPanel in source order, and centring class.
