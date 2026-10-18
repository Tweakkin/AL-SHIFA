import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronDown, RotateCcw, Search } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { books } from "@/lib/books";
import { filterBooks } from "@/lib/catalog";

export const metadata: Metadata = { title: "المكتبة", description: "تصفّح كتب مكتبة الشفا، وابحث بعنوان الكتاب أو اسم المؤلف، وصفِّ النتائج حسب الموضوع والمؤلف." };

type SearchParams = { q?: string | string[]; category?: string | string[]; author?: string | string[] };
const single = (value: string | string[] | undefined) => typeof value === "string" ? value.trim() : "";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = single(params.q).slice(0, 200);
  const category = single(params.category);
  const author = single(params.author);
  const categories = [...new Set(books.map((book) => book.category))];
  const authors = [...new Set(books.map((book) => book.author))];
  const results = filterBooks(books, { query, category, author });
  // Unknown URL filters stay visible and resettable instead of silently showing all books.
  return <main id="main" className="container catalog-page">
    <header className="catalog-heading">
      <span className="eyebrow section-eyebrow"><span /> من رفوف الشفا</span>
      <h1>المكتبة الرقمية</h1>
      <p>تصفّح مؤلفات من التراث المغربي في السيرة النبوية، وابحث عن كتابك بعنوانه أو اسم مؤلّفه.</p>
    </header>
    <form key={JSON.stringify([query, category, author])} action="/library" method="get" className="catalog-filters" role="search" aria-label="البحث وتصفية الكتب">
      <div className="catalog-search-field">
        <label htmlFor="catalog-query">عنوان الكتاب أو اسم المؤلف</label>
        <div className="catalog-input"><Search size={19} aria-hidden="true" /><input id="catalog-query" type="search" name="q" defaultValue={query} placeholder="ابحث عن كتاب أو مؤلّف..." maxLength={200} /></div>
      </div>
      <div className="catalog-select-field"><label htmlFor="catalog-category">الموضوع</label><div className="catalog-select-control"><select id="catalog-category" name="category" defaultValue={category}>
        <option value="">جميع الموضوعات</option>
        {category && !categories.includes(category) && <option value={category}>موضوع غير موجود</option>}
        {categories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select><ChevronDown size={16} aria-hidden="true" /></div></div>
      <div className="catalog-select-field"><label htmlFor="catalog-author">المؤلف</label><div className="catalog-select-control"><select id="catalog-author" name="author" defaultValue={author}>
        <option value="">جميع المؤلفين</option>
        {author && !authors.includes(author) && <option value={author}>مؤلف غير موجود</option>}
        {authors.map((item) => <option key={item} value={item}>{item}</option>)}
      </select><ChevronDown size={16} aria-hidden="true" /></div></div>
      <button className="button-primary" type="submit">بحث وتصفية <ArrowLeft size={17} aria-hidden="true" /></button>
    </form>
    <div className="catalog-results-heading">
      <p role="status">عرض <strong>{results.length.toLocaleString("ar")}</strong> من <strong>{books.length.toLocaleString("ar")}</strong> كتب{query && <> — نتائج البحث عن «<bdi>{query}</bdi>»</>}</p>
      <Link className="text-link catalog-reset" href="/library"><RotateCcw size={15} aria-hidden="true" /> إعادة ضبط البحث والتصفية</Link>
    </div>
    {results.length > 0 ? <div className="book-grid">{results.map((book) => <BookCard key={book.slug} book={book} index={books.indexOf(book)} showCategory />)}</div> : <section className="catalog-empty" aria-labelledby="empty-title">
      <Search size={27} aria-hidden="true" /><h2 id="empty-title">لا توجد كتب مطابقة</h2>
      <p>جرّب عنوانًا أو اسم مؤلف آخر، أو وسّع اختيارات الموضوع والمؤلف.</p>
      <Link href="/library" className="button-primary">عرض جميع الكتب <RotateCcw size={16} aria-hidden="true" /></Link>
    </section>}
    <div className="library-note"><BookOpen size={17} aria-hidden="true" /><p>يمكنك البحث في عناوين الكتب وأسماء المؤلفين. يعرض القارئ حاليًا نصوصًا تجريبية؛ المتون الأصلية قيد الإعداد.</p></div>
  </main>;
}
