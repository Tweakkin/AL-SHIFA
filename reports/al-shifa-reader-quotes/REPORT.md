# Reader quotation-mark presentation review

Date: 2026-10-20. Current edition retained; no source data edited or import performed.

## Result and correction

The first introduction passage contains `الظاهر» لا تخيلا`. U+00BB is a literal closing guillemet at UTF-16 offset 94 in `al-shifa:chapter:muqaddima:passage:sec-01-001`. It is the first guillemet anywhere in the book, with no preceding opener. The introduction has no quotation enclosing this opening praise. It is a stray closing delimiter in the displayed prose, not merely an RTL mirroring effect. The old audit verifies that it also occurs in the digital source; that fact is preserved, not rewritten.

One presentation-only erratum hides that one character. The reader now displays `الظاهر لا تخيلا` while stored `originalText` still contains `الظاهر»`. A passage ID, exact prefix and following-text guard restrict the correction; changed source context or demonstration content bypasses it. No replacement opener or inferred footnote number is supplied. The intended historical apparatus remains unknown: this is a documented display cleanup, not a claim to reconstruct the printed source. The other two unpaired introduction closers are preserved for review:

- `al-shifa:chapter:muqaddima:passage:sec-01-009`, offset 98: `بصدده»`.
- `al-shifa:chapter:muqaddima:passage:sec-01-020`, offset 403: `لموعدته»`.

Their intended punctuation is ambiguous; missing opening punctuation and damaged apparatus cannot be distinguished confidently from this digital text alone. No broad punctuation cleanup is applied.

## Whole-text inventory

Every one of 4,852 guillemets across the 4,831 current passages was inventoried: 2,453 `«` and 2,399 `»`, occurring in 1,934 passages. Logical Unicode-order stack scans were performed both across the entire book and within each reading chapter. Passage and section boundaries do not reset matching. Chapter-independent scans provide a second view rather than assuming all quotations terminate at route boundaries.

- Chapter scans: 120 unmatched opening candidates and 66 unmatched closing candidates; 135 mechanically matched pairs span passages.
- Book scan: 84 unmatched opening candidates and 30 unmatched closing candidates. Some chapter-level candidates pair across chapters, but that alone does not establish a genuine quotation.
- 2,534 occurrences receive conservative review flags: unmatched boundaries, repeated/nested openings, consecutive same-direction events, per-passage imbalance, or matches crossing structural boundaries. This deliberately includes legitimate nested/multiparagraph quotations; it is **not** a count of erroneous marks. An unclosed earlier quote can distort later stack matches. No mechanically paired mark is certified correct solely by this algorithm.

`inventory.json` records every mark, logical offset, exact passage/section/chapter IDs, source reference, context and mechanical pairing. `review.json` records every suspicious occurrence and whether it was preserved. `UNMATCHED-REVIEW.md` lists the union of unmatched candidates from both scans with exact IDs, offsets and context. These files identify the remaining review queue exhaustively under the stated rules; they do not pretend to adjudicate thousands of punctuation positions without a reliable printed witness.

The prior audit's 429 per-passage imbalance/reversal findings were candidates, not proof of 429 stray marks. Cross-passage matching avoids deleting genuine quotation boundaries merely because each paragraph is individually unbalanced. No marks were switched on the basis of their screen position. Arabic bidi rendering can mirror glyphs visually; it cannot explain away the first stored U+00BB with no prior opener. The current `dir="auto"` behavior is preserved.

## Implementation and verification

- Added `src/lib/reader-display-text.ts`: one guarded erratum, no global regex replacements.
- Updated `src/components/reader/intro-outline.ts`: ordinary paragraph presentation calls that helper. Existing outline splitting, paragraph IDs, DOM progress anchors and layout remain intact.
- Added `scripts/inspect-reader-quotes.mjs`: reproducible read-only whole-source inventory, writing only these reports.
- Added `tests/reader-quotes.test.mjs`: checks all current passages and proves precisely one character changes in precisely one displayed passage; stored content remains byte-for-byte identical in serialization. Tests also exercise changed-context safeguards, actual rendered output/progress anchors, cross-paragraph pairs and chapter-boundary ambiguity.

Checks: `node --test tests/reader-quotes.test.mjs tests/reader.test.mjs` — **21 passed, 0 failed**. `npm run typecheck` — **passed**. No production build or server was needed for this isolated text presentation change. No browser visual inspection was performed; actual React static rendering was tested. Node prints the existing MODULE_TYPELESS_PACKAGE_JSON warning when directly loading TypeScript modules; it was not suppressed or addressed with unrelated package changes.

All other quotation marks, Arabic letters/diacritics, source citations, source files, IDs, routes, reader settings and progress logic remain unchanged. Existing uncommitted work was preserved. The inventory includes a SHA-256 of the inspected content object for traceability.
