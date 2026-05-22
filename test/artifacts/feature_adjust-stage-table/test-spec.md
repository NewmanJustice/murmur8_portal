# Test Spec — adjust-stage-table

## Understanding

Three bounded changes to InsightsPanel.tsx and lib/insights.ts:
1. **Layout:** Remove the `grid grid-cols-1 lg:grid-cols-3` wrapper and `lg:col-span-2` from the
   stage table div so it occupies full width below the stat cards.
2. **Glyphs:** Replace the `border-l-2 pl-2` CSS border treatment on stage name `<span>` with
   explicit `}` character prefixes (1–4 chars depending on agent depth).
3. **New columns:** Extend `StageAverage` type with `avgTokens` and `avgFeedbackRating`; compute
   them in `computeStageAverages` from `stageData.tokens` and `stageData.feedback.rating`; render
   two new `<th>`/`<td>` columns in the table.

Tests use pure file-content assertions (fs.readFileSync) for TSX and direct import of `lib/insights.js`
for unit tests. No DOM, no build step.

## AC to Test ID Mapping

| Story | AC                                                         | Test ID     |
|-------|------------------------------------------------------------|-------------|
| tw-01 | No `lg:col-span-2` class on table wrapper                  | T-AST-01    |
| tw-01 | No `grid grid-cols-1 lg:grid-cols-3` wrapper div           | T-AST-02    |
| tw-01 | `overflow-x-auto` still present for narrow screens         | T-AST-03    |
| ag-01 | No `border-l-2` or `pl-2` on stage name `<span>`          | T-AST-04    |
| ag-01 | Glyph string `} alex` present in TSX                       | T-AST-05    |
| ag-01 | Glyph string `}} cass` present in TSX                      | T-AST-06    |
| ag-01 | Glyph string `}}} nigel` prefix present in TSX             | T-AST-07    |
| ag-01 | Glyph string `}}}} codey` prefix present in TSX            | T-AST-08    |
| nc-01 | `StageAverage` type has `avgTokens` and `avgFeedbackRating`| T-AST-09    |
| nc-01 | `computeStageAverages` reads `stageData.tokens`            | T-AST-10    |
| nc-01 | `computeStageAverages` reads `stageData.feedback`          | T-AST-11    |
| nc-01 | New `<th>` headers present in TSX                          | T-AST-12    |
| nc-01 | New `<td>` cells for avgTokens present in TSX              | T-AST-13    |
| nc-01 | New `<td>` cells for avgFeedbackRating present in TSX      | T-AST-14    |
| nc-01 | avgTokens: numeric values averaged, rounded to integer     | T-AST-15    |
| nc-01 | avgTokens: null when no data                               | T-AST-16    |
| nc-01 | avgFeedbackRating: numeric values averaged to 1 decimal    | T-AST-17    |
| nc-01 | avgFeedbackRating: null when no data                       | T-AST-18    |

## Key Assumptions

- Tests run from the `murmur8_portal` directory (`process.cwd()` = portal root).
- `lib/insights.js` is the plain-JS mirror of `lib/insights.ts`; Codey must keep both in sync.
- The glyph map applies to the lowercase stage keys (e.g. `alex`, not `Alex`).
- `avgTokens` is rounded via `Math.round`; `avgFeedbackRating` via `toFixed(1)`.
