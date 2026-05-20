# Story: GitHub OAuth Sign-In Flow

**As a** Visitor to the murmur8 Portal,
**I want** to sign in using my GitHub account,
**so that** I can access the protected dashboard without managing a separate password.

---

## Acceptance Criteria

**AC-SIGNIN-1 — Login page is publicly accessible**
- Given I am unauthenticated
- When I navigate to `/`
- Then I see a page with a "Sign in with GitHub" button

**AC-SIGNIN-2 — Sign-in initiates GitHub OAuth flow**
- Given I am on the login page at `/`
- When I click "Sign in with GitHub"
- Then my browser is redirected to GitHub's OAuth consent screen

**AC-SIGNIN-3 — Successful OAuth redirects to dashboard**
- Given I have authorised the murmur8 app on GitHub
- When GitHub redirects back to `/api/auth/callback/github` with a valid code
- Then I am redirected to `/dashboard` with an active session

**AC-SIGNIN-4 — Session cookie is set after sign-in**
- Given I have successfully signed in
- When I make a subsequent request to any protected route
- Then the server recognises my session without requiring me to sign in again

**AC-SIGNIN-5 — Returning user is not prompted to create an account**
- Given my User record already exists from a previous sign-in
- When I complete the GitHub OAuth flow again
- Then I am signed in and redirected to `/dashboard` — no duplicate User record is created

---

## Out of Scope

- UI design and styling of the login page (Codey decides layout)
- Custom OAuth error pages
- Profile field updates on re-sign-in (deferred per AQ1)
- Any OAuth provider other than GitHub

---

## Technical Note for Nigel/Codey

This story is implemented using NextAuth v5 (Auth.js v5). Session retrieval uses `const session = await auth()` — NOT `getServerSession`. See FEATURE_SPEC.md §8 for the full v5 API reference.
