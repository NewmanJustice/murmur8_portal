# Story: Sign-Out and Session Clearing

**As an** authenticated User of the murmur8 Portal,
**I want** to sign out of my session,
**so that** my account is protected when I leave the device or finish my session.

---

## Acceptance Criteria

**AC-SIGNOUT-1 — Sign-out clears the server-side session**
- Given I am authenticated with an active Session record in the database
- When I trigger sign-out
- Then the Session record is deleted from the database

**AC-SIGNOUT-2 — Sign-out clears the session cookie**
- Given I am authenticated
- When I trigger sign-out
- Then the session cookie is cleared from my browser

**AC-SIGNOUT-3 — Sign-out redirects to the login page**
- Given I have successfully signed out
- When the sign-out flow completes
- Then I am redirected to `/` (the login page)

**AC-SIGNOUT-4 — Accessing a protected route after sign-out redirects to login**
- Given I have signed out
- When I attempt to navigate to `/dashboard` or any other protected route
- Then I am redirected to `/`

**AC-SIGNOUT-5 — Sign-out does not delete the User record**
- Given I sign out
- Then my User record remains in the database — only the Session is removed

---

## Out of Scope

- Revoking all sessions for a user across multiple devices (future feature)
- "Are you sure you want to sign out?" confirmation dialogs
- Custom sign-out page design

---

## Technical Note for Nigel/Codey

NextAuth v5 sign-out is invoked via the `signOut()` server action exported from `auth.ts`. The Prisma adapter handles Session record deletion automatically.
