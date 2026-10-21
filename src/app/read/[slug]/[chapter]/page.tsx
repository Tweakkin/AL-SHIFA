import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bookContents } from "@/content/books";
import { getChapterDocument } from "@/lib/book-documents";
import { getReadingSections } from "@/content/reader-demonstration";
import { BookReader } from "@/components/reader/book-reader";
import { editorialChapterTitle } from "@/lib/editorial-text";

type PageProps = { params: Promise<{ slug: string; chapter: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return bookContents.flatMap((content) => content.chapters.map((chapter) => ({ slug: content.bookSlug, chapter: chapter.slug })));
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const document = getChapterDocument(slug, chapter);
  return { title: document ? `${editorialChapterTitle(document.chapter.title)} | ${document.book.title}` : "الفصل غير موجود", robots: { index: false } };
}

export default async function ReadingPage({ params }: PageProps) {
  const { slug, chapter: chapterSlug } = await params;
  const document = getChapterDocument(slug, chapterSlug);
  if (!document) notFound();
  const { book, chapter, content } = document;
  return <BookReader key={chapter.id} bookSlug={book.slug} bookTitle={book.title}
    chapter={{ id: chapter.id, slug: chapter.slug, title: chapter.title, kind: chapter.kind }}
    chapters={content.chapters.map(({ id, slug, title }) => ({ id, slug, title }))}
    sections={getReadingSections(chapter)} />;
}
