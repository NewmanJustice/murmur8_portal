Refined: 2026-05-27 — new story

# Story: Site Nav Header on Run Detail Page

**As an** authenticated user,
**I want** to see the consistent site nav header on the run detail page,
**so that** I can navigate between sections of the portal without losing my place.

---

## Acceptance Criteria

**AC1 — murmur8 logo is present**
Given I navigate to `/dashboard/runs/[id]`,
When the page loads,
Then the murmur8 logo is visible in the header.

**AC2 — Run History nav link is present and functional**
Given I am on the run detail page,
When I view the nav header,
Then a "Run History" link is present and clicking it navigates me to `/dashboard/runs`.

**AC3 — Keys nav link is present and functional**
Given I am on the run detail page,
When I view the nav header,
Then a "Keys" link is present and clicking it navigates me to the keys page.

**AC4 — User avatar and sign-out button are present**
Given I am on the run detail page as an authenticated user,
When the page loads,
Then the user avatar and a sign-out button are visible in the nav header.

**AC5 — Nav matches dashboard appearance**
Given I compare the run detail page nav header with `app/dashboard/page.tsx`,
When both pages are rendered,
Then the nav header component, layout, and styling are identical between the two pages.

---

## Out of Scope
- Unauthenticated nav states (covered in story-access-control)
- Mobile/responsive nav variants
- Active link highlighting logic beyond what the existing nav component provides
