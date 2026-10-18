import type { BookContent } from "../lib/content-types";

// These are navigation fixtures, not transcriptions or authentic chapter lists.
// Keep originalText passages here, separate from editorial metadata in lib/books.ts.
function demonstrationContent(bookSlug: string): BookContent {
  return {
    bookSlug,
    chapters: [
      { id: `${bookSlug}:chapter:demo-01`, slug: "demo-01", title: "الفصل التجريبي الأول", kind: "demonstration", note: "رابط لاختبار الانتقال إلى صفحة القراءة فقط؛ ليس فصلًا من الكتاب الأصلي.", sections: [] },
      { id: `${bookSlug}:chapter:demo-02`, slug: "demo-02", title: "الفصل التجريبي الثاني", kind: "demonstration", note: "رابط لاختبار الانتقال إلى صفحة القراءة فقط؛ ليس فصلًا من الكتاب الأصلي.", sections: [] },
    ],
  };
}

export const bookContents: readonly BookContent[] = [
  demonstrationContent("al-shifa"),
  demonstrationContent("dalail-al-khayrat"),
  demonstrationContent("al-durr-al-munazzam"),
  demonstrationContent("dhakhirat-al-muhtaj"),
];
