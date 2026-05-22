# Test Specification: add-repo-fields

## Understanding

This feature adds two nullable string fields (`repoOwner` and `repoName`) to the `Run` model in `prisma/schema.prisma` and integrates them into the telemetry ingestion pipeline in `lib/telemetry.ts`. Both fields are independently optional. If provided, each must be a non-empty string (empty string `""` is rejected). Values are stored as-is without normalisation.

The scope is limited to the data layer and ingestion validation — no UI changes.

## Test ID Mapping

| Test ID   | Description                                              |
|-----------|----------------------------------------------------------|
| T-ARF-01  | Prisma schema contains `repoOwner` field declaration     |
| T-ARF-02  | Prisma schema contains `repoName` field declaration      |
| T-ARF-03  | Prisma `repoOwner` is nullable (`String?`)               |
| T-ARF-04  | Prisma `repoName` is nullable (`String?`)                |
| T-ARF-05  | ValidatedPayload type includes `repoOwner`               |
| T-ARF-06  | ValidatedPayload type includes `repoName`                |
| T-ARF-07  | validatePayload handles `repoOwner` field                |
| T-ARF-08  | validatePayload handles `repoName` field                 |
| T-ARF-09  | Validation rejects empty-string values                   |
| T-ARF-10  | buildRunData output includes `repoOwner`                 |
| T-ARF-11  | buildRunData output includes `repoName`                  |

## Key Assumptions

- Fields are appended to the existing Run model (position within model does not matter).
- Empty-string rejection is implemented via `.trim() === ''` or equivalent pattern.
- `buildRunData` passes through both fields to its return object for Prisma create-input.
- No database migration test is needed — only schema declaration presence is verified.
