# Al-Shifa text-integrity audit

Date: 2026-10-20. Scope: the current imported Al-Shifa dataset only.

**Result:** every imported passage was compared programmatically with its recorded digital input after reproducing the documented import transformations. This establishes import fidelity to that input, not accuracy against a printed or manuscript witness. This audit does **not** certify an unabridged, fully verified scholarly edition.

## Coverage and outcome

- 4 divisions, 14 reading-route chapters (including the author's introduction), 170 sections, 4,831 passages.
- 13,047 raw source lines examined; all selected source body lines are accounted for.
- 4,480 confirmed page-reference errors corrected. **Zero Arabic passage-text corrections.**
- 36 finding records classified as legitimate source features.
- 531 finding records remain unresolved. These are review candidates, not 531 proven textual errors.
- 567 findings remain in the post-correction scan; the separate correction log preserves all 4,480 resolved findings. Total recorded observations across these files: 5,047.
- Findings can overlap: one passage can have more than one category, and a separator can trigger both a short-text and a duplicate-text finding.

## Precisely identified source

Local input: `scratch/shifa_raw.txt`.

Official OpenITI text: [Shamela0023645-ara1.completed, pinned revision](https://raw.githubusercontent.com/OpenITI/0550AH/a22f6bb581f740ba93c7995ba6900d5e1ef8e47b/data/0544QadiCiyad/0544QadiCiyad.Shifa/0544QadiCiyad.Shifa.Shamela0023645-ara1.completed).

Revision: `a22f6bb581f740ba93c7995ba6900d5e1ef8e47b` (file-history revision dated 2025-11-27). The official text was retrieved for the audit. Its bytes differ from the local copy only by LF/CRLF line endings; their normalized contents are identical.

Official/LF-normalized SHA-256:
`77c0ea56402ba3e854d58906e9c1f8fcd166a25d0b4ed641df2197c1b220ccc1`.

Local unchanged CRLF source SHA-256:
`aee86770fe07de72884b5399de60d43859001146ddecd38eb49a2b0bb448f7ac`.

[Shamela's edition record](https://shamela.ws/book/23645) identifies Dar al-Fayha, Amman, second edition, 1407 AH / 1986, two volumes. It names Muhammad Amin Qurra Ali, Usama al-Rifa'i, Jamal al-Sirwan, Nur al-Din Qurra Ali, and Abd al-Fattah al-Sayyid as editors. It explicitly states that the editors explained unfamiliar vocabulary and **removed the isnads**. Therefore, completeness relative to this digital source must not be represented as completeness of the unabridged authorial work.

The [official OpenITI version metadata](https://raw.githubusercontent.com/OpenITI/0550AH/a22f6bb581f740ba93c7995ba6900d5e1ef8e47b/data/0544QadiCiyad/0544QadiCiyad.Shifa/0544QadiCiyad.Shifa.Shamela0023645-ara1.yml) is preserved in `official-version-metadata.yml`. Its notes identify the cleaned version, describe removal of paratext in 2023, and say the matching print witness used for collation is behind account/payment access. That note is provenance information, not our own certification of its collation. No complete printed or manuscript witness was collated in this audit.

## Method and completeness

The reusable scanner is `scripts/audit-al-shifa.mjs`; run `npm run audit:shifa`.

It loads the actual TypeScript content, independently reproduces the transformations in `scratch/test_full_generation.py`, compares every resulting passage and section title, checks identifiers and order, inventories headings and chapter numbering, scans suspicious characters and repetitions, and independently reconstructs page references using end-of-page markers. It does not execute the old content generator or re-import the book.

Results:

- All 4,831 passage texts match the legacy import replay exactly, in order.
- All 170 section titles match the import replay; chapter metadata matches its recorded manifest.
- All stable IDs are unique and in their expected sequence. No import-introduced duplicate IDs, empty passages, missing selected body lines, or extra passages were found.
- All four division groups and the 13 bab routes, plus the introduction, remain present.
- Two explicitly excluded raw ranges, lines 148–157 and 6287–6709, contain editorial/paratextual material. They are recorded rather than treated as accidental body-text omissions. Blank line 38 is not an issue.
- Thirteen consecutive source headings are not separate section records: the importer keeps the following heading while chapter metadata represents some of the higher structure. Their exact source titles are retained in the findings; adequacy of this representation remains unresolved. No hierarchy was silently reconstructed.
- The legacy importer removes 7,796 numeric guillemet markers and 408 milestone markers from the raw file, normalizes punctuation spacing, and merges 1,135 source `#` paragraph starts into other passages. It retains 5,966 source paragraph starts across 4,831 imported passages. These are inherited import policies, not changes made by this audit. The result is **not** a verbatim/diplomatic reproduction of source formatting.

## Findings by category

Counts refer to finding records, not necessarily individual marks or distinct passages.

| Category | Detected | Corrected | Legitimate | Unresolved |
|---|---:|---:|---:|---:|
| Incorrect first-page reference | 4,480 | 4,480 | 0 | 0 |
| Unbalanced or reversed guillemets | 429 | 0 | 0 | 429 |
| Unbalanced parentheses per passage | 19 | 0 | 6 | 13 |
| Possible adjacent repeated words | 60 | 0 | 0 | 60 |
| Possible joined Arabic words, narrow review lexicon | 2 | 0 | 0 | 2 |
| Short text / possible fragment | 16 | 0 | 14 | 2 |
| Identical passage text | 20 | 0 | 14 | 6 |
| Repeated introductory bab label | 1 | 0 | 0 | 1 |
| Source-declared subsection count discrepancy | 2 | 0 | 0 | 2 |
| Higher source heading folded into following heading | 13 | 0 | 0 | 13 |
| Unbounded final page reference | 3 | 0 | 0 | 3 |
| Deliberately excluded editorial source ranges | 2 | 0 | 2 | 0 |
| **Total** | **5,047** | **4,480** | **36** | **531** |

Zero candidates were found for replacement characters, unexpected Latin text/import markers, Arabic presentation-form characters, invisible/control/direction characters, literal HTML entities, literal escape sequences/HTML markup, isolated or identically repeated Arabic combining marks, unbalanced straight quotes, square/curly brackets, very long unbroken tokens, adjacent duplicated full sentences, or missing spaces directly after the scanned punctuation. These checks do not establish absence of semantic transcription errors or every kind of missing Arabic word boundary.

Book-wide delimiters: 2,453 opening / 2,399 closing guillemets; 55 opening / 52 closing parentheses; 2 opening / 2 closing square brackets. Some quotation boundaries span passages. Automatic per-passage imbalance is not itself proof that punctuation should be removed.

## Confirmed corrections and evidence

Only `source.locator` fields in the 14 chapter files were changed. Each corrected locator identifies the **opening page** of the passage, not its entire page span.

Cause: the previous parser updates a rolling page variable from preceding page markers. [OpenITI's format documentation](https://alraqmiyyat.github.io/mARkdown/#--page-numbers) specifies that a `PageVxxPxxx` marker occurs at the **end** of its page. The opening words must therefore be associated with the first following marker. This also fixes stale volume/page values carried across excluded editorial material and chapter transitions.

Example: `al-shifa:chapter:muqaddima:passage:sec-01-002` changed from `ج 1، ص 26` to `ج 1، ص 27`. Its opening words occur on [Shamela volume 1, page 27](https://shamela.ws/book/23645/22), and its raw source lines map to the same page. The preceding [page 26](https://shamela.ws/book/23645/21) contains the earlier continuation of the first passage. [Volume 2's opening](https://shamela.ws/book/23645/748) also supports the source's volume transition.

`corrections.json` records every affected passage ID, original locator, corrected locator, raw line references, source URL/hash, documentation, and reason. `original-content.json` and `passage-baseline.json` preserve the pre-correction content and references. The scanner never overwrites these baseline files during ordinary reruns.

After correction, 4,828 passages have a reference matching their first available following page marker, and none disagree. The final three passages have no following marker in the raw input: their existing references remain unchanged and explicitly unresolved. An attempted direct retrieval of the expected final Shamela page was unavailable through the browsing tool; no page number was extrapolated.

## Investigation of unresolved and legitimate findings

Every textual candidate is linked to its complete imported text, source citation, raw source lines, and replay evidence in `findings.json`. All candidates were compared programmatically with the pinned digital input. Selected cases were additionally inspected in context and against live Shamela pages. This is **not** individual printed-witness verification of every candidate.

- **The reported mark near الظاهر:** the stored character sequence is `الظاهر»`, a closing U+00BB guillemet in logical text order. It appears in raw line 41 and on [Shamela's first introduction page](https://shamela.ws/book/23645/20). The surrounding numbered apparatus suggests a damaged reference marker, but that does not establish its exact intended form. It was not introduced by this importer. It remains unchanged and unresolved; RTL placement alone is not evidence for deleting it.
- **Other guillemets and parentheses:** inherited digital readings were preserved. Six parenthesis findings are three explicitly reviewed, adjacent parenthetical continuations: qism-2-bab-3 sec-04 passages 011/012 and 018/019, and qism-3-bab-1 sec-16 passages 138/139. These require no punctuation removal. Other cases remain pending printed collation.
- **Separators:** fourteen passages consist of `***`. Their short-text and duplicate-text flags account for 28 legitimate finding records; they are source separators, not invented missing prose.
- **Repeated text:** other identical passages include repeated quotations and one adjacent repeated prose sentence in qism-3-bab-1 sec-11 passages 038/039. Both occurrences exist in separate raw-source locations; none was duplicated by the current import replay. Their scholarly correctness remains unresolved, so nothing was deleted.
- **Repeated words:** emphatic repetitions, quotation formulas and possible transcription duplicates coexist in this category. The 60 records retain their exact matched words and offsets. They were not automatically deduplicated.
- **Word spacing:** `لاعدما` and `لاخفاء` trigger only a deliberately narrow review lexicon. Both occur in the digital source. No universal Arabic word-segmentation correction was attempted.
- **Introduction numbering:** muqaddima passage sec-01-019 repeats the label for the second bab. The raw input has the same reading; the intended ordinal was not substituted.
- **Declared counts:** qism-1-bab-2's raw heading declares 27 fasls while its numbered headings run to 26. Qism-1-bab-3's raw heading declares 12 while 15 numbered headings are tagged. No intervening numbered fasl gap was found in either imported sequence. These are source-structure discrepancies, not evidence sufficient to invent or delete a chapter.
- **Thirteen folded headings:** exact higher-level titles remain in the source and audit evidence, but not all survive verbatim in shortened editorial route titles. A scholarly hierarchy review is needed before claiming that all source headings are fully represented.

## Validation and remaining limits

- Post-correction whole-book scanner: passed import replay, selected-body coverage, identifier/order and bounded citation checks. Unresolved findings remain as counted above.
- TypeScript: passed.
- Full existing test suite plus four new integrity tests: **33 passed**.
- Tests preserve all passage wording, punctuation, diacritics, IDs and ordering; restrict changes to logged citation fields; compare representative affected passage markup across every chapter; verify the pinned raw-source hash; and demonstrate detection with deliberately corrupted fixtures.
- No browser layout claims are made: reader UI/CSS, routes, progress storage, preferences and other books were not changed by this audit. No server was started.
- An existing Node module-type warning remains. No diagnostics were suppressed.

The cleaned OpenITI witness does not reproduce all live Shamela vocalization or editorial apparatus. Its own source is an edition with isnads removed. Agreement with that witness cannot establish unabridged completeness, correct Quran/hadith transcription, manuscript authenticity, or publication/reuse clearance. Full printed-witness collation and expert Arabic review are still needed for the unresolved readings. No uncertain religious text, missing wording or diacritics were generated.

## Files and rerunning

- `scripts/audit-al-shifa.mjs`: reproducible whole-book scanner; default operation writes reports, not book content.
- `reports/al-shifa-integrity/summary.json`: machine-readable scope, counts, hashes and chapter inventory.
- `reports/al-shifa-integrity/findings.json`: detailed remaining candidates with exact text and evidence.
- `reports/al-shifa-integrity/corrections.json`: permanent citation correction log.
- `reports/al-shifa-integrity/source-verification.json` and `official-version-metadata.yml`: official provenance evidence.
- `reports/al-shifa-integrity/original-content.json` and `passage-baseline.json`: pre-correction comparison copies.
- `tests/text-integrity.test.mjs`: integrity and corruption-detection checks. `tests/content.test.mjs` only changes a misleading test title that previously called inventory checks scholarly verification.
- `package.json`: adds `audit:shifa` and includes integrity tests in the normal test command.
- `src/content/al-shifa/chapters/chapter-01.ts` through `chapter-14.ts`: citation fields only, exactly 4,480 line replacements.

Run `npm run audit:shifa`, `npm run typecheck`, and `npm test`. The optional explicit `--apply-confirmed-citations` scanner mode is guarded by the pinned-source hash and replay/order checks; it must not be used to apply speculative textual corrections.
