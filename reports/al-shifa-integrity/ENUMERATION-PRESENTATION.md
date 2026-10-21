# Reviewed enumeration presentation

Historical layout report. The later, explicit editorial display choice for the
first item's trailing colon is recorded in [ENUMERATION-COLON-OVERRIDE.md](ENUMERATION-COLON-OVERRIDE.md).

This is a presentation change only. No imported text, punctuation, passage ID,
source copy, reading order or stored progress has been corrected or replaced.

## Evidence and boundaries

- `scratch/shifa_raw.txt`, lines 955–962: the two general categories occur in
  one source paragraph (957–958). The lead-in beginning `ثم هي` is a separate
  source paragraph (959), merged into passage `sec-01-002` by the importer.
  The lettered categories are separate source paragraphs (960–961), retained
  as `sec-01-003` and `sec-01-004`. They were not incorrectly split apart.
- [The supplied commentary, page 148](https://www.islamarchive.cc/ketab_content/6985/p-148)
  explains the two classifications. It supports their relationship, not a
  wholesale substitution of this edition's wording, diacritics or punctuation.
- The attempted next commentary page (149) could not be retrieved. No claim of
  independent punctuation verification against that page is made.
- Raw source line 962 and passage `sec-01-005` both place a colon after
  `فأما الضروري المحض`, followed by an explanation. That colon is preserved.
- Raw lines 957–958 contain literal ellipses. Their existing verified display
  correction is retained; no ellipsis has been replaced by a comma or period.
- Raw lines 1312–1316 explicitly introduce three categories and give three
  consecutive marked paragraphs. This second enumeration reuses the renderer.

## Exact scope

All IDs below have prefix `al-shifa:chapter:qism-1-bab-2:passage:`.

- `sec-01-002`: display its two existing category lines as aligned items, then
  display the existing lead-in separately. The passage retains one original ID.
- `sec-01-003`, `sec-01-004`: one compact list, retaining the literal `أ-` and
  `ب-` markers and each original passage ID.
- `sec-08-002`, `sec-08-003`, `sec-08-004`: a second compact list, retaining
  each source hyphen, ellipsis and passage ID. Its lead-in remains unchanged.

Exact original text, IDs, sequence and lead-in guards must match before grouping.
Other colons, dashes, introductory outlines and ordinary prose are not detected
or changed by a generic punctuation rule. Future lists require reviewed metadata.

## Punctuation decisions

No new textual corrections were made, so there is no original/corrected text pair.
In particular, the trailing colon in `sec-01-003` is still present. It is an
inherited editorial punctuation choice; the supplied commentary does not provide
enough evidence to replace it with a full stop. The colon introducing the two
categories and the colon introducing the subsequent explanation remain intact.

## Validation

TypeScript and 29 focused reader/punctuation tests passed. Tests cover exact
display-text preservation, original dataset equality, unchanged passage IDs and
ordering, and failure to group changed or unreviewed content. Desktop and mobile
layouts, light and dark themes, the second three-item list, and paragraph focus
after grouping were checked in the existing development preview. No production
server was started and no content was re-imported.
