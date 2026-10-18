import { test } from "node:test";
import assert from "node:assert/strict";
import { books } from "../src/lib/books.ts";
import { normalizeArabic, filterBooks } from "../src/lib/catalog.ts";

test("Arabic normalization removes marks, Alef variants, tatweel and surplus whitespace", () => {
  assert.equal(normalizeArabic("  أ إ آ ٱ  الشِّفَــا  \n عِيَاض  "), "ا ا ا ا الشفا عياض");
});

test("title and author searches accept Arabic variants", () => {
  for (const query of ["الشِّفَا", "الشــفا", "  الشفا  عياض  ", "عِيَاض", "إلشفا"]) {
    assert.deepEqual(filterBooks(books, { query }).map((book) => book.slug), ["al-shifa"], query);
  }
  for (const query of ["الامام الجزولي", "الإِمَام الجَزُولِي", "آبو العباس", "ٱبو العباس"]) {
    assert.equal(filterBooks(books, { query }).length, 1, query);
  }
});

test("every author and category filter returns exactly its matching books", () => {
  for (const author of new Set(books.map((book) => book.author))) {
    assert.deepEqual(filterBooks(books, { author }), books.filter((book) => book.author === author));
  }
  for (const category of new Set(books.map((book) => book.category))) {
    assert.deepEqual(filterBooks(books, { category }), books.filter((book) => book.category === category));
  }
});

test("query, author and category intersect; conflicting filters produce no results", () => {
  const category = books[1].category;
  assert.deepEqual(filterBooks(books, { query: "دَلَائِل", category, author: books[1].author }), [books[1]]);
  assert.deepEqual(filterBooks(books, { query: "الشفا", category }), []);
  assert.deepEqual(filterBooks(books, { category, author: books[0].author }), []);
});

test("empty search and reset return all books; unmatched and unknown filters return none", () => {
  assert.deepEqual(filterBooks(books, {}), books);
  assert.deepEqual(filterBooks(books, { query: "  ـَ  " }), books);
  for (const filters of [{ query: "عنوان غير موجود" }, { category: "unknown" }, { author: "unknown" }]) {
    assert.deepEqual(filterBooks(books, filters), []);
  }
});
