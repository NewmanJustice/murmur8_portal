# Story: Admin Elevation via ADMIN_GITHUB_ID

**As a** designated Admin user whose GitHub account ID matches the `ADMIN_GITHUB_ID` environment variable,
**I want** my account to automatically receive admin privileges when I first sign in,
**so that** no manual database intervention is required to grant me administrative access.

---

## Acceptance Criteria

**AC-ADMIN-1 — Admin user receives isAdmin=true on first sign-in**
- Given the `ADMIN_GITHUB_ID` environment variable is set to my GitHub numeric user ID
- When I sign in for the first time
- Then my User record is created with `isAdmin = true`

**AC-ADMIN-2 — Non-admin user receives isAdmin=false on first sign-in**
- Given my GitHub numeric ID does NOT match `ADMIN_GITHUB_ID`
- When I sign in for the first time
- Then my User record is created with `isAdmin = false`

**AC-ADMIN-3 — isAdmin is set at User creation only — never modified by subsequent sign-ins**
- Given my User record already exists (returning user)
- When I sign in again (whether or not my GitHub ID matches `ADMIN_GITHUB_ID`)
- Then my existing `isAdmin` value is unchanged

**AC-ADMIN-4 — Admin check uses GitHub numeric ID, not username**
- Given `ADMIN_GITHUB_ID` is set to a numeric string (e.g., `"12345678"`)
- When the system evaluates admin status
- Then it compares `String(profile.id)` against `ADMIN_GITHUB_ID` — the GitHub username is not used

**AC-ADMIN-5 — Missing or unset ADMIN_GITHUB_ID results in no admin users**
- Given `ADMIN_GITHUB_ID` is not set in the environment
- When any user signs in for the first time
- Then all User records are created with `isAdmin = false`

---

## Out of Scope

- UI for promoting/demoting admin status
- Multiple admin users (only one `ADMIN_GITHUB_ID` is supported)
- Admin privilege changes after initial User record creation (this is a one-time, immutable assignment)
- Any permission enforcement beyond the `isAdmin` boolean (role-based access control belongs to a future feature)

---

## Technical Note for Nigel/Codey

The admin check is performed server-side in the `signIn` callback (or equivalent event hook) within `auth.ts`. The comparison is:
```
isAdmin: String(profile.id) === process.env.ADMIN_GITHUB_ID
```
This is evaluated only when creating a new User record — the existing User lookup must happen BEFORE this check to ensure the "set once" invariant is upheld.
