import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { TableOfContents } from "@/components/table-of-contents";
import { ResumeReading } from "@/components/reader/resume-reading";
import { books } from "@/lib/books";
import { getBookDocument } from "@/lib/book-documents";
import type { SourceCitation } from "@/lib/content-types";

type PageProps = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return books.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getBookDocument(slug);
  if (!document) return { title: "الكتاب غير موجود" };
  return { title: document.book.title, description: document.book.editorial.description, alternates: { canonical: `/books/${slug}` } };
}

function SourceLabel({ source }: { source: SourceCitation }) {
  return <>{source.url ? <a className="source-link" href={source.url}>{source.label}</a> : source.label}{source.locator && <> — {source.locator}</>}</>;
}

export default async function BookDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const document = getBookDocument(slug);
  if (!document) notFound();
  const { book, content } = document;
  const firstChapter = content.chapters[0];
  const introduction = book.editorial.description.match(/^.*?[.؟!](?:\s|$)/u)?.[0].trim() ?? book.editorial.description;
  const hasOriginalText = content.chapters.some((chapter) => chapter.kind === "original" && chapter.sections.some((section) => section.passages.some((passage) => passage.originalText.trim())));
  return <main id="main" className="container book-detail-page">
    <Link className="text-link detail-back" href="/library"><ArrowRight size={17} aria-hidden="true" /> العودة إلى المكتبة</Link>
    <div className="book-detail-intro">
      <div className="book-detail-copy">
        <span className="eyebrow section-eyebrow"><span /> {book.category}</span>
        <h1>{book.title}</h1>
        <p className="detail-author">{book.author}</p>
        <span className="detail-divider" aria-hidden="true" />
        <p className="detail-description">{introduction}</p>
        <div className="reading-actions">{firstChapter ? <Link className="button-primary" aria-describedby="reading-availability" href={`/read/${book.slug}/${firstChapter.slug}?start=1`}><BookOpen size={18} aria-hidden="true" /> ابدأ القراءة</Link> : <p className="availability">لم تتوفر فصول للقراءة بعد.</p>}<ResumeReading bookSlug={book.slug} chapters={content.chapters.map(({ id, slug, title }) => ({ id, slug, title }))} /></div>
        <p id="reading-availability" className="detail-reading-note">{firstChapter?.kind === "original" ? "تُتاح القراءة من البداية، أو من موضعك المحفوظ في هذا المتصفح." : "النص الأصلي الموثّق غير متاح بعد؛ القراءة الحالية محتوى تحريري تجريبي، وليست من متن الكتاب."}</p>
      </div>
      <div className="book-detail-art"><BookCover book={book} featured /><span className="art-caption">غلاف تصوّري من تصميم المكتبة</span></div>
    </div>
    <section className="book-detail-section book-information" aria-labelledby="bibliography-heading">
      <div className="detail-section-heading"><h2 id="bibliography-heading">معلومات عن الكتاب</h2></div>
      <dl className="bibliography-grid">
        <div><dt>العنوان</dt><dd>{book.title}</dd></div>
        <div><dt>المؤلف</dt><dd>{book.author}</dd></div>
        <div><dt>التصنيف</dt><dd>{book.category}</dd></div>
        <div><dt>الطبعة المعتمدة</dt><dd>{book.bibliography.edition ? <>{book.bibliography.edition.label}<small>المصدر: <SourceLabel source={book.bibliography.edition.source} /></small></> : "لم تُحدَّد طبعة معتمدة بعد."}</dd></div>
        <div><dt>حالة النص</dt><dd>{hasOriginalText ? "نص أصلي متاح للقراءة" : "النص الأصلي غير متاح بعد"}</dd></div>
        <div><dt>مصدر النص</dt><dd>{book.bibliography.textSource ? <SourceLabel source={book.bibliography.textSource} /> : "لم يُقدَّم مصدر معتمد بعد."}</dd></div>
        <div className="bibliography-provenance"><dt>مصدر بيانات التعريف</dt><dd>{book.bibliography.metadataSource}</dd></div>
      </dl>
    </section>
    <div className="book-profile-body">
      <section className="book-detail-section book-about" aria-labelledby="about-heading">
        <div className="detail-section-heading"><h2 id="about-heading">عن الكتاب</h2></div>
        <p className="book-about-description">{book.editorial.description}</p>
        <p className="detail-editorial-label">تعريف تحريري من المكتبة، وليس مقتطفًا من الكتاب.</p>
      </section>
    <TableOfContents bookSlug={book.slug} chapters={content.chapters} />
    </div>
  </main>;
}
