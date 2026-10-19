# Al-Shifa · الشفا

Arabic-first digital library — Milestones 1 through 4.

## Preview

Requires Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Stop the server with Ctrl+C.

Reader preview: http://127.0.0.1:3000/read/al-shifa/demo-01. If a preview is already running, restart it after building to load the current version. You can use another port with `npm run dev -- --port 3002`.

```sh
npm run typecheck
npm test
npm run build
npm start
```

The first installation and production build need internet access to download packages and the Google fonts. Next.js serves the downloaded fonts locally in production.

## Scope

- Next.js App Router, strict TypeScript, Tailwind CSS 4, Lucide icons.
- Arabic language and RTL layout; IBM Plex Sans Arabic interface and Amiri display/reading font.
- Responsive homepage, mobile navigation, featured volume, four CSS book covers, footer.
- `/library` is a working local-data catalog. A GET form combines title/author search (`q`), subject (`category`), and author (`author`); submit with «بحث وتصفية». URLs preserve the selected controls, and the reset link clears all three. Search ignores Arabic marks, Alef variants, tatweel and extra whitespace. Search terms can match across the title and author.
- Subject labels are broad editorial groupings based on the supplied proposal, not additional edition or publication metadata.
- `/books/[slug]` contains four book detail pages, using the existing records, covers and editorial categories. Edition and original-text source information are explicitly marked as not supplied. Definitions are editorial descriptions, not excerpts from the books.
- `/library/[slug]` permanently redirects to the corresponding book detail page, preserving older links.
- Each book has two explicitly labeled demonstration chapter links. No authentic table of contents was supplied; these chapter names and ordering are navigation fixtures only.
- `/read/[slug]/[chapter]` is a complete reading interface with Amiri text, a compact toolbar, desktop contents sidebar, native modal contents drawer on mobile, current-chapter highlighting and previous/next links. The page itself contains no imported original book text.
- Font size is 22px by default on desktop and 20px on mobile, adjustable from 18px to 34px. White, warm ivory and dark themes cover both text and controls. A root-level `next/script` with `beforeInteractive` applies saved preferences through a temporary CSSOM stylesheet on every initial page load, without changing React-owned HTML attributes before hydration. The shared theme provider applies validated preferences and removes that temporary sheet; it remains mounted through client navigation. No hydration-warning suppression is used.
- Global light/dark appearance covers the homepage, header/footer, catalog, forms, cards and book details. The header moon/sun toggle has an Arabic accessible name and tooltip on desktop/mobile. One existing local preference record is shared with the reader: dark means global dark; white/ivory mean global light. Header toggles explicitly select dark or ivory; choosing white inside the reader persists white across navigation until another theme is chosen. Font size and progress are independent. Open tabs synchronize appearance through storage events.
- RTL toolbar order is back/contents on the right, centered book/chapter titles, and settings/progress on the left. The contents pane opens from the right. At compact desktop widths it overlays the page rather than narrowing the text; wider screens reserve space while retaining the full 730px reading column.
- Reader preferences and last chapter/scroll position are saved locally in the current browser. The book page includes a resume action, enabled after a reading position exists. Paragraph anchors improve restoration across font/viewport changes; a scroll ratio provides a fallback. Explicit chapter/start links begin at the top. The one-time start/resume URL flags are consumed so a subsequent reload resumes normally.
- Unknown routes show an Arabic not-found page.

The proposal is background context. Institutional relationships and official endorsements described there have not been represented as established facts. No religious quotations or book text have been generated.

## Structure

`src/app/` contains routes, metadata and global styles. `src/components/` contains the shared header, footer, ornament, book cover, book card and table of contents. The homepage and catalog reuse the same card and cover. `src/lib/books.ts` stores the four supplied books, editorial descriptions, categories and bibliographic source status; `src/lib/catalog.ts` handles Arabic matching and combined filters. Global appearance tokens and synchronization policy live in `src/lib/reader-state.ts`; `src/app/globals.css` supplies the light fallback and consumes those tokens. `src/components/theme-provider.tsx` is the single preference owner used by the header and reader.

`src/lib/content-types.ts` models BookContent → Chapter → Section → Passage. Each chapter, section and passage has a permanent ID; chapter route slugs are independent of array position. `src/content/books.ts` holds the content documents separately from editorial metadata; chapter array order defines navigation order. Original-text records remain empty. Future original chapters and passages require source citations. `src/lib/book-documents.ts` joins records to content by book slug, without copying bibliographic records. Keep established IDs when inserting, reordering or revising content.

`src/content/reader-demonstration.ts` stores neutral interface-testing prose separately from `Passage.originalText`. Its explicit section/paragraph keys remain stable when content is reordered. A rendering adapter also supports the existing original section/passage structure and preserves original IDs, text and source citations. No religious quotations or claims are used as sample reading content.

`src/components/reader/book-reader.tsx` contains the reader controls, accessible contents navigation and lifecycle handling. `resume-reading.tsx` is the book-page entry point. `src/lib/reader-state.ts` validates stored data and owns the preference/progress policy; `reader-position.ts` captures/restores approximate positions. `src/app/reader.css` retains the three reader palettes independently of site surfaces. Global chrome is hidden only while a valid reader surface is present.

`npm test` requires Node.js 22.18+ or 24+ for native TypeScript stripping. The 19 checks cover catalog matching/filters, content lookup and metadata reuse, missing slugs, preference validation and pre-paint application, progress parsing and chapter isolation, restoration policy, scroll bounds, stable demonstration IDs and original passage/source preservation, shared appearance mapping and contrast across both site palettes. No test dependencies are required.

Browser verification includes theme and font persistence after reload; 18/34px limits; leaving and resuming a mid-chapter position; reloading that position; deliberate chapter changes starting at the top; previous/next and contents links; mobile focus trapping/Escape/focus return; 320px mobile and desktop layouts; theme contrast; and browser errors/hydration warnings.

The original proposal is retained in the project root. Milestone 5 is not started. To replace demonstration contents later, supply a verified edition, an authentic ordered chapter list and source-attributed original text; the current demonstration data must never be represented as an authentic chapter structure. There are no accounts, backend, in-book search, bookmark controls, footnote/citation tools, PDF/audio features or real content imports.

Progress and settings are per browser/device; appearance synchronizes between open tabs on the same origin, not across devices. Clearing browser data removes them; blocking local storage prevents persistence but leaves reader controls usable. Restored scroll positions are approximate, especially after viewport or font changes. Demo prose is only for testing the interface and is not a scholarly edition.
