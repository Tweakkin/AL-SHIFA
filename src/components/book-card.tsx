import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import type { Book } from "@/lib/books";
import { BookCover } from "./book-cover";

export function BookCard({ book, index, showCategory = false }: { book: Book; index: number; showCategory?: boolean }) {
  return <article className="book-card">
    <Link className={`book-stage stage-${book.color}`} href={`/books/${book.slug}`} aria-label={`تعرّف على ${book.title} — ${book.author}`}>
      <span className="book-index" aria-hidden="true">{String(index + 1).padStart(2, "0").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)])}</span>
      <BookCover book={book} />
      <span className="stage-arrow" aria-hidden="true"><ArrowUpLeft size={18} /></span>
    </Link>
    <div className="book-info">
      <span className="book-status">{showCategory ? book.category : "النص الرقمي قيد الإعداد"}</span>
      <h3><Link href={`/books/${book.slug}`}>{book.title}</Link></h3>
      <p>{book.author}</p>
    </div>
  </article>;
}
