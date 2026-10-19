# Abandoned replacement-edition experiments

Cleanup date: 2026-10-20. The current Shamela 23645 dataset is retained unchanged.

## Sources, findings and decisions

- **Shamela 1753:** https://shamela.ws/book/1753 — record identifies Dar al-Kutub al-Ilmiyyah, Beirut, 1399 AH / 1979, two volumes, with al-Shumni commentary. Sample pages contain isnads and separate commentary blocks. Applicable republication permission was not established, and whole-book completeness/commentary separation were not validated. Stopped before import.
- **Ottoman 1312 AH edition:** previous research associated the historical printing with https://archive.org/details/shtahoFP and a Waqfeya catalogue record. Five archived pages were used for OCR feasibility work. The previous report claimed approximately 603 main-text pages, poor Tesseract performance (99.6% WER / 70.6% CER), and >98%/>99% multimodal accuracy. Its claims of universal public-domain status, complete edition coverage and multimodal accuracy were not independently established. No replacement was approved.
- **Independent five-page vision benchmark:** all five images were transcribed before exposure to the earlier references. Weighted normalized disagreement with legacy references was WER 6.18%, CER 2.56%; retaining diacritics/punctuation gave WER 16.23%, CER 4.48%. References themselves contained errors, so these are not certified scan-accuracy rates. Confirmed fresh errors included narrator-name substitution and Quranic wording changes. Recommendation: NO-GO pending independent reference verification and resolution of critical errors. No full-book transcription or migration occurred.

## Archive

External location: `C:\Users\user\Desktop\AL-SHIFA-Research-Archive\2026-10-20-abandoned-editions`.

Archived 74 files / 14,605,867 bytes, preserving their project-relative paths:

- `reports/al-shifa-1753-migration/` — migration preflight report.
- `reports/al-shifa-historical-ocr/` — historical source/feasibility notes, scans, raw OCR, legacy references, independent transcription outputs, review crops, metrics, measurement script and reports.
- `scratch/compare_versions.py` — unused replacement-edition comparison script.

Every source and destination SHA-256 was checked before removing the project copies. `archive-manifest.json` records every file, size, hash and external location; the external archive also contains its own manifest. Nothing was deleted without a verified archived copy. No copies in the external archive were removed.

## What remains protected

- Entire current dataset, all application code, public assets, fonts, reader/navigation/settings/progress implementation, routes and UI.
- `reports/al-shifa-integrity/`, including source baseline and correction history.
- `reports/al-shifa-reader-quotes/` and its display-only correction, inventory, script and tests.
- Existing source/import/audit helpers in `scratch/` and `scripts/`; unclear-purpose scratch files were left untouched.
- Verified 105-file project checkpoint: `backups/pre-shamela-1753-2026-10-19T22-23-56-681Z/`. All checkpoint files were checked against its manifest during cleanup. This historical checkpoint may contain earlier copies of research; it was retained intact as a recovery backup.

Reference search found no dependency on the archived items from application code, active scripts, tests or package scripts. References within the archived research remain together. No external source was revisited.

Git's preexisting edits remain. The intentional new tracked deletion is `scratch/compare_versions.py`; the two archived report folders were untracked. New cleanup documentation is under this directory. No reset, checkout, staging or commit was performed. `git-status-before.txt` records the starting status; `protected-files.json` records pre-cleanup hashes of the 111 protected working files.

Verification: all 111 protected working-file hashes matched after cleanup; 105 backup files verified; all 74 external archive files verified. Reader tests: 21 passed. Application behavior was checked through these existing reader tests and unchanged source hashes; no browser session or server was started and no full production build was needed.
