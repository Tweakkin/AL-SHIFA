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
    if (book.slug === "al-shifa") {
      assert.ok(book.bibliography.edition);
      assert.ok(book.bibliography.edition.label.includes("دار الفيحاء"));
      assert.ok(book.bibliography.textSource);
      assert.ok(book.bibliography.textSource.url);
    } else {
      assert.equal(book.bibliography.edition, undefined);
      assert.equal(book.bibliography.textSource, undefined);
    }
  }
});

test("demonstration chapter identifiers are unique and their routes resolve in order", () => {
  const demoContents = bookContents.filter((item) => item.bookSlug !== "al-shifa");
  const identifiers = new Set();
  for (const content of demoContents) {
    assert.deepEqual(content.chapters.map((chapter) => chapter.slug), ["demo-01", "demo-02"]);
    for (const chapter of content.chapters) {
      assert.ok(chapter.id.startsWith(content.bookSlug + ":chapter:"));
      assert.ok(!identifiers.has(chapter.id));
      identifiers.add(chapter.id);
      assert.equal(getChapterDocument(content.bookSlug, chapter.slug).chapter, chapter);
    }
  }
  assert.equal(identifiers.size, 6);
});

test("navigation fixtures are labeled demonstrations and contain no invented book passages", () => {
  const demoContents = bookContents.filter((item) => item.bookSlug !== "al-shifa");
  for (const content of demoContents) {
    for (const chapter of content.chapters) {
      assert.equal(chapter.kind, "demonstration");
      assert.match(chapter.title, /تجريبي/);
      assert.match(chapter.note, /ليس فصلًا من الكتاب الأصلي/);
      assert.deepEqual(chapter.sections, []);
    }
  }
});

test("al-shifa has complete authentic content: 14 chapters, 170 sections, and 4,831 verified passages", () => {
  const shifa = getBookDocument("al-shifa");
  assert.ok(shifa);
  assert.equal(shifa.content.chapters.length, 14);

  const expectedSlugs = [
    "muqaddima",
    "qism-1-bab-1",
    "qism-1-bab-2",
    "qism-1-bab-3",
    "qism-1-bab-4",
    "qism-2-bab-1",
    "qism-2-bab-2",
    "qism-2-bab-3",
    "qism-2-bab-4",
    "qism-3-bab-1",
    "qism-3-bab-2",
    "qism-4-bab-1",
    "qism-4-bab-2",
    "qism-4-bab-3",
  ];
  assert.deepEqual(shifa.content.chapters.map((c) => c.slug), expectedSlugs);

  const allPassageIds = new Set();
  const allSectionIds = new Set();
  let totalSections = 0;
  let totalPassages = 0;

  for (const chapter of shifa.content.chapters) {
    assert.equal(chapter.kind, "original");
    assert.ok(chapter.source.label.includes("دار الفيحاء"));
    assert.ok(chapter.sections.length > 0);
    assert.equal(getChapterDocument("al-shifa", chapter.slug).chapter, chapter);

    for (const section of chapter.sections) {
      assert.ok(!allSectionIds.has(section.id), `Duplicate section ID: ${section.id}`);
      allSectionIds.add(section.id);
      assert.ok(section.id.startsWith(chapter.id + ":section:"));
      assert.ok(section.title.trim().length > 0);
      assert.ok(section.passages.length > 0);
      totalSections++;

      for (const passage of section.passages) {
        assert.ok(!allPassageIds.has(passage.id), `Duplicate passage ID: ${passage.id}`);
        allPassageIds.add(passage.id);
        assert.ok(passage.id.startsWith(chapter.id + ":passage:"));
        assert.ok(passage.originalText.trim().length > 0);
        assert.ok(passage.source.locator.startsWith("ج "));
        totalPassages++;
      }
    }
  }

  assert.equal(totalSections, 170);
  assert.equal(totalPassages, 4831);

  // Check opening and closing text
  const firstPassage = shifa.content.chapters[0].sections[0].passages[0];
  assert.ok(firstPassage.originalText.startsWith("الحمد لله المتفرد باسمه الأسمى"));
  assert.equal(firstPassage.source.locator, "ج 1، ص 25");

  const lastChapter = shifa.content.chapters[13];
  const lastSection = lastChapter.sections[lastChapter.sections.length - 1];
  const lastPassage = lastSection.passages[lastSection.passages.length - 1];
  assert.ok(lastPassage.originalText.includes("والحمد لله رب العالمين"));
  assert.equal(lastPassage.source.locator, "ج 2، ص 659");
});

test("unknown books and chapters never resolve to a fallback book or chapter", () => {
  assert.equal(getBookDocument("unknown"), undefined);
  assert.equal(getChapterDocument("unknown", "demo-01"), undefined);
  assert.equal(getChapterDocument("al-shifa", "unknown"), undefined);
});
