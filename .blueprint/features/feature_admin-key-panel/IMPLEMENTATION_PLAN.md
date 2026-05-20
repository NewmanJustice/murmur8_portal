---
feature: admin-key-panel
author: Codey
date: 2026-05-20
---

# Implementation Plan — Admin Key Panel

## Steps

1. [lib/admin-key-panel.ts] CREATE — Export `computeAdminStats`, `checkAdminAccess`, `getAdminRevokeError` pure helper functions | Tests: T-01, T-02, T-03, T-04, T-05, T-08, T-09, T-10, T-11, T-12, T-13, T-14

2. [lib/admin-key-panel.js] CREATE — Compiled JS export of admin-key-panel pure helpers (mirrors .ts source for node:test compatibility) | Tests: T-01–T-14

3. [app/admin/keys/page.tsx] EDIT — Import and use `computeAdminStats` from `lib/admin-key-panel.js` in place of inline computation | Tests: T-01–T-05

4. [app/admin/keys/actions.ts] EDIT — Import and use `checkAdminAccess` and `getAdminRevokeError` from `lib/admin-key-panel.js` for guard logic | Tests: T-08–T-14
