# Feature Specification — Add Repo Fields to Run Model

## 1. Feature Intent

Pipeline runs currently record `commitHash` but have no way to identify *which repository* the commit belongs to. As murmur8 usage grows across multiple repositories, the portal needs to associate each run with its source GitHub repository (`owner/name`).

- **Problem:** A user with pipeline runs from several repos cannot distinguish them by repo in the portal.
- **Need:** Store `gitHubUser` and `repoName` on each Run so future dashboard features can filter and group by repo.
- **System alignment:** Extends the Run domain concept (System Spec section 5, "Run") with optional provenance metadata. No conflict with existing invariants.

---

## 2. Scope

### In Scope

- Add two nullable string columns (`gitHubUser`, `repoName`) to the `Run` model in `prisma/schema.prisma`
- Generate and apply a Prisma migration
- Extend the `ValidatedPayload` type and `validatePayload` function in `lib/telemetry.ts` to accept (but not require) the new fields
- Extend `buildRunData` to pass the fields through to the Prisma create-input
- No changes to the dashboard UI or insights — those will come in a follow-up feature

### Out of Scope

- Sending these fields from the agent-workflow pipeline (handled separately)
- UI display, filtering, or grouping by repo
- Enforcing repo ownership or validating that the repo exists on GitHub
- Backfilling existing runs with repo data

---

## 3. Actors Involved

| Actor | Interaction |
|-------|-------------|
| **Pipeline Client** | May include `gitHubUser` and `repoName` in the telemetry POST body. Omission is valid. |
| **System (Telemetry Route)** | Accepts, validates (type-check only), and persists the new fields. |

No User or Admin interaction in this feature — it is purely a data-model and ingestion change.

---

## 4. Behaviour Overview

### Happy path (fields provided)

1. Pipeline Client sends a telemetry POST including `"gitHubUser": "NewmanJustice"` and `"repoName": "murmur8_portal"`.
2. `validatePayload` accepts both as optional strings; nulls out if missing.
3. `buildRunData` maps them into the Prisma create-input.
4. The Run row is stored with those values populated.
5. Response remains `201 { id }` — no change to response shape.

### Happy path (fields omitted)

1. Pipeline Client sends a telemetry POST without `gitHubUser`/`repoName`.
2. Validation passes (fields are optional).
3. Columns store `NULL`.
4. Response is the same `201 { id }`.

### Validation failure

- If `gitHubUser` is present but not a string, return a validation error.
- If `repoName` is present but not a string, return a validation error.
- These are reported alongside any other validation errors in the `422` response.

---

## 5. State & Lifecycle Interactions

- **State-creating:** The Run record may now be created with `gitHubUser` and `repoName` populated.
- No state transitions or constraints are altered — the fields are informational metadata.
- Existing Run records retain `NULL` for both fields; no backfill migration needed.

---

## 6. Rules & Decision Logic

| Rule | Description |
|------|-------------|
| **R-REPO-1** | `gitHubUser` and `repoName` are independently optional. Either, both, or neither may be provided. |
| **R-REPO-2** | If provided, each must be a non-empty string. Empty string (`""`) is rejected with a validation error. |
| **R-REPO-3** | No referential validation — the portal does not verify the repo exists on GitHub. |
| **R-REPO-4** | Values are stored as-is (trimmed). No normalisation to lowercase. |

---

## 7. Dependencies

| Dependency | Notes |
|------------|-------|
| Prisma schema (`prisma/schema.prisma`) | Column additions to `Run` model |
| Prisma migration CLI | `npx prisma migrate dev --name add-repo-fields` |
| `lib/telemetry.ts` | Validation and data-mapping changes |
| PostgreSQL database | Must be accessible to apply migration |

No external system or policy dependencies.

---

## 8. Non-Functional Considerations

- **Migration safety:** Adding nullable columns with no default is a non-breaking, online-safe migration in PostgreSQL — no table rewrite required.
- **Performance:** No index is needed on these columns in v1. If repo-based filtering is added later, a composite index `(userId, gitHubUser, repoName)` may be warranted.
- **Backwards compatibility:** Existing Pipeline Clients that omit the fields continue to work without modification.

---

## 9. Assumptions & Open Questions

### Assumptions

- The pipeline will be updated separately to send these fields; this feature only prepares the portal to receive them.
- `gitHubUser` corresponds to the GitHub user or organisation login (e.g. `"NewmanJustice"`).
- `repoName` is the repository name without the owner prefix (e.g. `"murmur8_portal"`, not `"NewmanJustice/murmur8_portal"`).

### Open Questions

- None — scope is intentionally minimal and self-contained.

---

## 10. Impact on System Specification

This feature **reinforces** existing system assumptions:

- The Run domain concept (System Spec section 5) lists key fields; `gitHubUser` and `repoName` are a natural extension of the provenance metadata already present (`commitHash`).
- No invariants or governing rules are affected.
- **Proposed system spec update (deferred):** Add `gitHubUser` (String?) and `repoName` (String?) to the Run field table in section 5. This should be applied after this feature lands.

---

## 11. Handover to BA (Cass)

### Story Themes

1. **Schema migration** — adding nullable columns and generating the Prisma migration
2. **Validation extension** — accepting the new fields in telemetry validation without requiring them
3. **Data mapping** — threading the fields from validated payload through to Prisma create-input
4. **Type safety** — updating the `ValidatedPayload` type to include the new fields

### Story Boundaries

- Each story should be independently testable via the telemetry POST endpoint.
- No UI stories are needed for this feature.

### Areas Needing Careful Framing

- Validation: must test that omission is fine, presence works, and invalid types are rejected — three distinct scenarios per field.

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-22 | Initial spec created | User requested repo provenance tracking on Run model | Alex |
