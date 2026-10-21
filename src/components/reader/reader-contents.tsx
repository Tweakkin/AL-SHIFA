import Link from "next/link";
import { contentsGroups } from "./contents-model";

export function ReaderContents({ chapters, bookSlug, currentId, onNavigate }: {
  chapters: readonly { id: string; slug: string; title: string }[];
  bookSlug: string;
  currentId: string;
  onNavigate: () => void;
}) {
  return <nav className="reader-toc-scroll" aria-label="فصول الكتاب">
    {contentsGroups(chapters).map((group, groupIndex) => <section className="reader-toc-group" key={groupIndex} aria-labelledby={group.division ? `reader-toc-group-${groupIndex}` : undefined}>
      {group.division && <h3 id={`reader-toc-group-${groupIndex}`} className="reader-toc-group-title">{group.division}</h3>}
      <ol className="reader-toc-entries">{group.entries.map(({ chapter, number, identifier, subject }) => {
        const current = chapter.id === currentId;
        return <li key={chapter.id}><Link href={`/read/${bookSlug}/${chapter.slug}?start=1`} scroll={false} onClick={onNavigate} aria-current={current ? "page" : undefined}>
          <span className="reader-toc-index" aria-hidden="true">{number}</span>
          <span className="reader-toc-copy">
            {(identifier || current) && <span className="reader-toc-entry-heading">{identifier && <span className="reader-toc-label">{identifier}</span>}{current && <small className="reader-toc-current">تقرأ الآن</small>}</span>}
            <span className="reader-toc-subject">{subject}</span>
          </span>
        </Link></li>;
      })}</ol>
    </section>)}
  </nav>;
}
