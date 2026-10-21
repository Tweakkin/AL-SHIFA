# Whole-book punctuation review and display repairs

> Repository maintenance: generated inventories mentioned below are no longer committed. Source snapshots, correction logs, reference evidence, summaries and the post-correction regression fixture remain. The scanners regenerate omitted findings/inventories; historical review outputs and screenshots have verified copies outside the repository. Screenshot examples remain identified by passage IDs below.


Date: 2026-10-20. Edition: the current Shamela 23645 / OpenITI import. **All 4,831 original passage texts remain unchanged.** This is a source-supported punctuation repair pass, not certification that every remaining reading is correct.

## Outcome

| Finding records | Count |
|---|---:|
| Detected before display repairs | 4,515 |
| Resolved by verified display repairs | 1,717 |
| Reviewed legitimate source features retained | 30 |
| Remaining unresolved review records | 2,768 |

These are **category-per-passage review records**, not 4,515 proven textual errors or individual symbols. Categories overlap. There are 3,278 distinct flagged passages. Conservative quotation checks include legitimate nested/continued quotations; uncertain cases were not automatically corrected.

Repairs affect the presentation of **1,714 passages**: contiguous source period runs restored in 1,710 passages, plus four damaged note-marker remnants. One of those four remnants, `الظاهر»`, was already hidden by the previous reader fix; this pass retains and strengthens its documentation. Thus 1,713 passage displays receive new repairs. There are three new note-marker removals and one additional classification line break within an already corrected passage. The log has 3,261 individual whitespace/marker edits. Three secondary warning records disappear as a consequence of the repairs, accounting for the difference between corrected passages and resolved finding records.

**Zero stored-content corrections. Zero Arabic words, letters, diacritics, digits, narrator names or quotation wording changed.**

## Evidence-supported repairs

### 1. Import-added spaces inside source period runs

The legacy import's punctuation-spacing expression `([،؛.؟!:])(?=[^\s\d»\)])` inserts a space after each period even when the next character is another period. A raw `...` consequently becomes `. . .`; `..` becomes `. .`.

The audit reuses the existing import replay and source-fragment mapping. For each affected passage it protects only period runs that are **contiguous in those exact raw source fragments**, reproduces the rest of the legacy cleanup, and restores those runs in the display. Every period is retained. No two-dot sequence is guessed to be three dots; no ellipsis is removed or replaced with a new sentence boundary. Source-spaced periods, other repeated punctuation and unrelated whitespace are not globally normalized.

Example: `qism-1-bab-1:passage:sec-01-003` ends with source `...` at raw line 171; its imported display `. . .` is restored to `...`. All 1,710 affected passages have their exact original/corrected strings, raw fragments and line numbers in the correction log.

### 2. Four damaged numbered-note markers

Direct inspection of the existing edition's digital pages and their numbered notes establishes the missing apparatus slots. The live transcription itself contains the damaged closer, so source inheritance alone was not treated as proof of correctness. Each orphan closer is next to the word/formula addressed by the missing numbered note, between intact neighboring note markers. Only that character is hidden; no new note number or quotation boundary is invented.

| Exact passage ID suffix (prefix `al-shifa:chapter:`) | Display change | Existing-edition evidence |
|---|---|---|
| `muqaddima:passage:sec-01-001` | `الظاهر»` → `الظاهر` | [v1 p25, note 7](https://shamela.ws/book/23645/20); earlier display fix retained |
| `muqaddima:passage:sec-01-009` | `بصدده»` → `بصدده` | [v1 p32, note 2](https://shamela.ws/book/23645/27) |
| `muqaddima:passage:sec-01-020` | `لموعدته»` → `لموعدته` | [v1 p36, note 3](https://shamela.ws/book/23645/31) |
| `qism-1-bab-2:passage:sec-03-013` | `وقال» علي` → `وقال علي` | [v1 p150, note 6](https://shamela.ws/book/23645/138) |

Short retrieved evidence excerpts, retrieval times, actual page titles and SHA-256 hashes of retrieved HTML are in `punctuation-reference-evidence.json`. These establish the note-marker repairs; they do not establish printed-witness accuracy of the entire edition. Some web-tool cached page titles disagreed with live pagination, so actual retrieved page titles and note contents were checked instead of extrapolating URLs from printed page numbers.

### 3. First screenshot: two types in one crowded paragraph

`al-shifa:chapter:qism-1-bab-2:passage:sec-01-002` explicitly describes two types after `نوعان:`. [The same edition's page 139](https://shamela.ws/book/23645/127) confirms both clauses and their dash markers. A single display line break now separates `الدنيا` from the following `- مكتسب`. Both source dashes and every word remain. This is one line break **inside the same passage**, not an invented paragraph, reordered text or changed hierarchy.

## The supplied screenshots

**Screenshot 1:** `sec-01-001` through `sec-01-004` of qism-1-bab-2. Colons after `نوعان` and `فنين أيضا` introduce classifications, and the colon after the first named alternative is present in the reference. They are retained. Compact source ellipses are restored and the two named types are visually separated. The original list labels `أ-` and `ب-` are preserved. The historical screenshot is retained outside the repository.

**Screenshot 2:** qism-1-bab-2 sec-03 passages 009–018. The colons following Umm Ma'bad's description, Ibn Abi Hala's report and Ali's description introduce the immediately following text and are retained. The closer after `وقال` is repaired as above. The leading dashes on the concluding editorial paragraphs are attested in the same digital edition ([p150](https://shamela.ws/book/23645/138), [p151](https://shamela.ws/book/23645/139)); they are not removed merely because they look unusual. The historical screenshot is retained outside the repository.

Both cases were checked through actual React rendering tests and in the browser. The displayed first example has two list lines and compact ellipses; the second displays `وقال علي في آخر وصفه له:` with no stray guillemet.

## Coverage, causes and remaining uncertainty

- **Entire stored dataset:** 4 divisions, 14 chapter routes, 170 sections, 4,831 passages; the 13,047-line original digital input was replayed using the existing audit. Passage wording, section titles, hierarchy, order and identifiers match. No selected body lines are missing from that replay.
- **Quotation boundaries:** every mark is inventoried in logical Unicode order. Guillemets are compared both across the book and within chapters; passage/section breaks do not reset the stack. ASCII and curly Western quotes and brackets also cross paragraph boundaries. Nesting/restarted quotation conventions mean mechanical pairing is not scholarly adjudication.
- **Residual quote candidates:** displayed guillemets are 2,453 opening / 2,395 closing, compared with 2,453 / 2,399 in stored data. Chapter scans retain 120 unmatched-opening and 62 unmatched-closing candidates; these are not instructions to insert/delete those counts of marks. Exact occurrence offsets, contexts and paired endpoints are saved. A missing earlier marker can distort later matches.
- **Parentheses:** six earlier false-positive records are retained as verified cross-passage continuations. Seven passage-level records still have chapter-unmatched delimiter events. They are not silently repaired.
- **Colons and other punctuation:** 4 mixed-colon records remain unresolved. Examples include `حكاه السمرقندي. :` (`qism-1-bab-1:passage:sec-03-042`) and `وروى أبو مصعب عن مالك. :` (`qism-4-bab-3:passage:sec-10-027`). Their raw input also contains the readings; deciding whether to remove a period or colon needs direct reference evidence. The other two exact IDs are in the findings file. No classical punctuation is normalized by taste.
- **Leading/trailing punctuation, dash attachment, repeated punctuation, spacing and encoding:** full-book patterns were scanned; exact text, offsets and raw-source comparisons are recorded for every candidate. Four reviewed leading-dash/list cases, six colon-introduction cases, fourteen source separators and six parenthetical-continuation records account for the 30 retained source-feature records. The remaining candidates are not automatically all errors.
- **Segmentation:** the importer merged 1,135 source `#` paragraph starts into 864 existing passages. Every merged start, raw line and exact passage text is inventoried separately in `punctuation-segmentation-review.json`. None was silently split into new passages. All words are accounted for, but adequate scholarly paragraph structure remains a review question. The old audit's 13 folded higher headings also remain unresolved. Segmentation records are separately reported, not added to the 4,515 punctuation counts.
- **Rendering/BiDi:** actual body punctuation mostly comes directly from `originalText`. The renderer's `dir="auto"` can mirror a guillemet's visual shape, but does not create its Unicode character. The repaired closers exist in the logical source, so these four are not merely screen-order problems. No bidi control characters were added, and the encoding scan found no such anomalies in current passages.
- **Source versus import:** damaged note delimiters are inherited digital-transcription problems; split dot runs are demonstrable importer formatting problems. Valid quote-introduction colons and source list dashes are source features. Crowded classification layout is handled only in presentation. No authorial or religious wording was inferred from AI knowledge.

The 2,768 unresolved records are a conservative queue requiring contextual Arabic review and, where intended punctuation is unclear, printed-edition collation. They include false-positive candidates as well as possible source errors. The older audit's 531 unresolved records include nonpunctuation/structure matters and overlap this queue; the counts must **not** be summed. The older original report/findings/citation log remain historical evidence, with this supplement documenting current display repairs.

## Traceability and implementation

- `punctuation-original-content.json`: frozen current dataset before this pass, never overwritten on rerun. Its serialized SHA-256 is `3fe8a36200f31d5671aef4d4bf7f3f633102f56bc226d20809098dcba416285b`.
- Original `scratch/shifa_raw.txt` remains unchanged: SHA-256 `aee86770fe07de72884b5399de60d43859001146ddecd38eb49a2b0bb448f7ac`. Earlier `original-content.json`, baseline and 4,480-citation correction log remain intact.
- `punctuation-corrections.json`: full original/corrected strings, exact edits, reason, display/content classification and evidence for each changed passage.
- `punctuation-findings.json`, `punctuation-post-findings.json`, `punctuation-occurrences.json`, `punctuation-summary.json`: before/after findings, complete symbol inventory, logical quote pairings and reproducible totals. Quotation pair indices reference the explicitly saved quote occurrence arrays.
- `scripts/audit-shifa-punctuation.mjs`: lightweight read-only source replay plus guarded display-errata generation and report output. Run `node scripts/audit-shifa-punctuation.mjs`; it aborts if the current dataset differs from the preserved baseline. It does not execute a book generator, re-import text, download anything or modify chapter files.
- `scripts/audit-al-shifa.mjs`: optional source-map return added for reuse; original audit reports are not overwritten by the punctuation script.
- `src/lib/reader-punctuation-errata.ts`: generated, reviewable per-passage edit spans. `reader-display-text.ts` checks the ID, source length, expected text and surrounding contexts before applying edits; any mismatch leaves the original presentation intact. No global reader regex normalizes arbitrary text.
- `src/components/reader/intro-outline.ts`: uses the verified display text for ordinary paragraphs and existing outline descriptions; renders the one verified line break without changing passage IDs or progress anchors.
- Tests cover source-run provenance, preservation of original content and all identifiers, exact allowed marker removals, screenshot cases, guarded fallback, cross-paragraph quote handling and an independent full presentation rescan. `package.json` includes the focused regression tests in the regular test command.

## Validation

- Full source replay, chapter/section/passages order and IDs: passed.
- Independent full-book rescan through the actual `readerDisplayText` implementation: matches recorded post-repair results; zero import-split dot-run findings remain.
- TypeScript: passed.
- `npm test`: **42 passed, 0 failed**, including source integrity, reader navigation/progress/preferences and new punctuation regression checks.
- Both screenshot passages: browser and rendering tests passed. No new server was started; an existing local preview was used.
- No book data/source files, routes, settings/progress logic, reader styles or unrelated UI were changed by this pass. Existing uncommitted work was preserved. No new dependency or OCR process was introduced.
- The existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning remains; no diagnostics were suppressed. No claim of a completely error-free scholarly text is made.
