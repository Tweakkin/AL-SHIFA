import { books, type Book } from "./books.ts";
import { bookContents } from "../content/books.ts";
import type { BookContent } from "./content-types";

export type BookDocument = { book: Book; content: BookContent };

export function getBookDocument(slug: string): BookDocument | undefined {
  const book = books.find((item) => item.slug === slug);
  const content = bookContents.find((item) => item.bookSlug === slug);
  return book && content ? { book, content } : undefined;
}

export function getChapterDocument(slug: string, chapterSlug: string) {
  const document = getBookDocument(slug);
  const chapter = document?.content.chapters.find((item) => item.slug === chapterSlug);
  return document && chapter ? { ...document, chapter } : undefined;
}
