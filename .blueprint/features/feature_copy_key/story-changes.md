# Story Changes — copy_key refinement 2026-05-21

## Summary

The copy button must be placed inline in the Key Prefix cell, immediately after the prefix text — not in a separate action column.

## Stories affected

### story-user-copy-key-prefix.md

**Reason:** AC already states "inline with the key prefix cell" but implementation placed the button in the action column. No AC text change needed — the existing criterion is correct and implementation must match it.

### story-admin-copy-key-prefix.md

**Reason:** Same as above. AC already states "inline with the key prefix cell".

## Stories NOT affected

- `story-copy-key-degradation-and-a11y.md` — no change; accessibility and degradation ACs are placement-agnostic.
