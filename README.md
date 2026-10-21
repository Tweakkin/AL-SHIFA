# Al-Shifa · الشفا

An Arabic RTL digital library built with Next.js, TypeScript and locally hosted fonts.

## Run and check

Use Node.js 22.18+ or 24+ so the existing tests can import TypeScript directly.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

The default preview is http://127.0.0.1:3000. Use `npm run dev -- --port 3001` if another port is required; reuse an existing preview when one is already running.

Current reader example: `/read/al-shifa/qism-1-bab-2`.

Fonts are loaded from `src/app/fonts/` with `next/font/local`; builds do not download Google Fonts. The font source and license notices remain beside the files and under `public/licenses/`.

## Current application

- Four catalog records, Arabic-aware title/author search, category/author filters and a conditional reset action. Query state is reflected in the library URL.
- Book details, a structured table of contents and local resume links. Older `/library/[slug]` links redirect to `/books/[slug]`.
- The retained Al-Shifa dataset has 14 chapters, 170 sections and 4,831 original passages. Other books use clearly labeled demonstration content.
- Reader: IBM Plex Sans Arabic by default, optional Amiri, selective Bouazzi Maghribi headings, a 700px reading column, white/ivory/dark themes, font-size preferences and local reading progress.
- A responsive right-side contents drawer groups divisions and chapter subjects. Previous/next navigation and the first chapter's scroll-to-start action retain established routes.
- Paragraph focus opens on desktop clicks or keyboard activation; touch devices have a dedicated control. Drag-selection and copying remain available. Immediate click opening takes precedence over double-click selection in the main reader.
- Reviewed quotation emphasis, enumeration presentation and guarded display corrections preserve the stored Arabic text and passage IDs.
- Global light/dark appearance and reader themes share the existing preference record. Font size, font choice and reading progress persist locally; there is no database or account requirement.

## Where things belong

| Location | Purpose |
| --- | --- |
| `src/app/` | Routes, global/reader styles and local fonts |
| `src/components/` | Shared interface and reader components |
| `src/content/al-shifa/` | Retained original Arabic dataset; preserve IDs and order |
| `src/content/reader-demonstration.ts` | Separate, explicitly editorial test prose |
| `src/lib/reader-display-text.ts` | Shared normal-reader/focus display correction path |
| `src/lib/reader-punctuation-errata.ts` | Guarded transcription/display repairs |
| `src/lib/reader-editorial-overrides.ts` | Explicit, separately documented editorial choices |
| `scratch/` | Current edition's pinned source and essential import/verification tools; see its README |
| `scripts/` and `tests/` | Active integrity checks and application regression tests |
| `reports/al-shifa-integrity/` | Original snapshots, source evidence, active corrections and regression fixtures |

Original passages and editorial presentation are separate. The retained edition has documented limitations; do not treat demonstration prose as original text or silently change source punctuation. Existing integrity reports explain the provenance and review decisions.

## Maintenance

All application components and declared packages currently have active references. Keep dynamic book-cover colors, heading classes and font license copies even when a simple text search does not find their complete generated class names.

Generated `.next/`, dependencies, local environment files, screenshot output, Python bytecode, logs and future local backups are ignored. Do not put recovery copies or abandoned scans inside the active source tree.

The repository is self-contained for development, builds and tests. Historical research, recovery copies and development screenshots stay outside it. Generated audit inventories are ignored; `npm run audit:shifa` can regenerate source findings. Keep committed source snapshots, correction evidence and test fixtures. The punctuation audit also regenerates display rules and correction logs: run it only when deliberately reviewing those records.

Progress and preferences are local to a browser/device. Scroll restoration is approximate after font or viewport changes. No migration, OCR work or new feature is implied by maintenance tasks.
