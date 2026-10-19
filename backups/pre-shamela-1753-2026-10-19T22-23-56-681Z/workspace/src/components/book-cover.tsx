import type { Book } from "@/lib/books";
import { Ornament } from "./ornament";

export function BookCover({ book, featured = false }: { book: Book; featured?: boolean }) {
  return (
    <div className={`book-cover cover-${book.color}${featured ? " book-cover-featured" : ""}`} aria-hidden="true">
      <div className="cover-frame">
        <span className="cover-series">من ذخائر التراث المغربي</span>
        <Ornament />
        <div className={`cover-name${featured && book.slug === "al-shifa" ? " font-maghribi" : ""}`}>{book.coverTitle}</div>
        {book.coverSubtitle && <div className="cover-subtitle">{book.coverSubtitle}</div>}
        <span className="cover-rule" />
        <div className="cover-author">{book.author}</div>
        <span className="cover-imprint">الشفا <span>المكتبة الرقمية</span></span>
      </div>
    </div>
  );
}
