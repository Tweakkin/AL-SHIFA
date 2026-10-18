import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Chapter } from "@/lib/content-types";

export function TableOfContents({ bookSlug, chapters }: { bookSlug: string; chapters: readonly Chapter[] }) {
  const hasDemonstration = chapters.some((chapter) => chapter.kind === "demonstration");
  return <section className="book-detail-section" aria-labelledby="contents-heading">
    <div className="detail-section-heading"><h2 id="contents-heading">فهرس الكتاب</h2><span>{hasDemonstration ? "فهرس تجريبي" : "فصول الكتاب"}</span></div>
    {chapters.length ? <nav aria-label="فهرس محتويات الكتاب" aria-describedby={hasDemonstration ? "reading-availability" : undefined}>
      <ol className="contents-list">{chapters.map((chapter, index) => <li key={chapter.id}>
        <Link className="contents-link" href={`/read/${bookSlug}/${chapter.slug}`}>
          <span className="contents-number" aria-hidden="true">{String(index + 1).padStart(2, "0").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)])}</span>
          <span className="contents-title">{chapter.title}{chapter.kind === "demonstration" && <span className="contents-label">محتوى تجريبي للاختبار</span>}</span>
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
      </li>)}</ol>
    </nav> : <p className="contents-notice">لم يتوفر فهرس لهذا الكتاب بعد.</p>}
  </section>;
}
