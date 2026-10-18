import { test } from "node:test";
import assert from "node:assert/strict";
import { books } from "../src/lib/books.ts";
import { bookContents } from "../src/content/books.ts";
import { getBookDocument, getChapterDocument } from "../src/lib/book-documents.ts";

test("each catalog book has exactly one content document and reuses the same metadata", () => {
  assert.equal(bookContents.length, books.length);
  assert.equal(new Set(bookContents.map((item) => item.bookSlug)).size, books.length);
  for (const book of books) {
    const document = getBookDocument(book.slug);
    assert.equal(document.book, book);
    assert.equal(document.content.bookSlug, book.slug);
    assert.ok(book.editorial.description);
    assert.ok(book.bibliography.metadataSource);
    assert.equal(book.bibliography.edition, undefined);
    assert.equal(book.bibliography.textSource, undefined);
  }
});

test("demonstration chapter identifiers are unique and their routes resolve in order", () => {
  const identifiers = new Set();
  for (const content of bookContents) {
    assert.deepEqual(content.chapters.map((chapter) => chapter.slug), ["demo-01", "demo-02"]);
    for (const chapter of content.chapters) {
      assert.ok(chapter.id.startsWith(content.bookSlug + ":chapter:"));
      assert.ok(!identifiers.has(chapter.id));
      identifiers.add(chapter.id);
      assert.equal(getChapterDocument(content.bookSlug, chapter.slug).chapter, chapter);
    }
  }
  assert.equal(identifiers.size, 8);
});

test("navigation fixtures are labeled demonstrations and contain no invented book passages", () => {
  for (const content of bookContents) {
    for (const chapter of content.chapters) {
      assert.equal(chapter.kind, "demonstration");
      assert.match(chapter.title, /تجريبي/);
      assert.match(chapter.note, /ليس فصلًا من الكتاب الأصلي/);
      assert.deepEqual(chapter.sections, []);
    }
  }
});

test("unknown books and chapters never resolve to a fallback book or chapter", () => {
  assert.equal(getBookDocument("unknown"), undefined);
  assert.equal(getChapterDocument("unknown", "demo-01"), undefined);
  assert.equal(getChapterDocument("al-shifa", "unknown"), undefined);
});
