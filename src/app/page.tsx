import Link from "next/link";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { Ornament } from "@/components/ornament";
import { HeroTitleMark, HeroZellige } from "@/components/hero-zellige";
import { ZelligeBg } from "@/components/zellige-bg";
import { books } from "@/lib/books";

export default function HomePage() {
  return <main id="main">
    <section className="hero" aria-labelledby="hero-title">
      <HeroZellige />
      <div className="container hero-inner">
        <div className="eyebrow hero-heritage">من ذخائر التراث المغربي</div>
        <h1 id="hero-title" className="font-maghribi">الشفا</h1>
        <HeroTitleMark />
        <h2>المكتبة الرقمية للسيرة النبوية</h2>
        <p className="hero-description">تراثٌ يُقرأ، وأثرٌ يبقى — في تجربة قراءة رقمية معاصرة</p>
        <form action="/library" method="get" className="search-form" role="search" aria-label="البحث في المكتبة">
          <Search className="search-icon" size={21} aria-hidden="true" />
          <label htmlFor="library-search" className="sr-only">عنوان الكتاب أو اسم المؤلف</label>
          <input id="library-search" name="q" type="search" placeholder="ابحث عن كتاب أو مؤلّف..." maxLength={200} />
          <button type="submit">بحث <ArrowLeft size={17} aria-hidden="true" /></button>
        </form>
        <a href="#library-preview" className="hero-explore">تعرّف على كتب المكتبة <span aria-hidden="true">↓</span></a>
      </div>
    </section>

    <section className="featured-section container" aria-labelledby="featured-title">
      <div className="featured-panel">
        <ZelligeBg id="featured-zellige" />
        <div className="featured-copy">
          <span className="eyebrow section-eyebrow"><span /> في رحاب كتاب</span>
          <h2 id="featured-title">الشفا <span>بتعريف حقوق المصطفى</span></h2>
          <p className="featured-author">القاضي عياض</p>
          <p className="featured-description">يحمل مشروعنا اسم «الشفا»، ويضع هذا المؤلَّف في قلب مكتبته المرتقبة، إلى جانب كتب من التراث المغربي في السيرة النبوية.</p>
          <Link className="button-primary" href="/books/al-shifa">تعرّف على الكتاب <ArrowLeft size={18} aria-hidden="true" /></Link>
          <span className="availability">النسخة الرقمية قيد الإعداد</span>
        </div>
        <div className="featured-art"><span className="art-arch" aria-hidden="true" /><BookCover book={books[0]} featured /><span className="art-caption">من المؤلفات المقترحة للمكتبة</span></div>
      </div>
    </section>

    <section className="library-section container" id="library-preview" aria-labelledby="library-title">
      <div className="section-header"><div><span className="eyebrow section-eyebrow"><span /> من رفوف المكتبة</span><h2 id="library-title" className="font-maghribi">ذخائر من التراث المغربي</h2><p>أربعة مؤلفات، وبداية رحلة في السيرة النبوية.</p></div><Link className="text-link" href="/library">إلى المكتبة <ArrowLeft size={18} aria-hidden="true" /></Link></div>
      <div className="book-grid">{books.map((book, index) => <BookCard key={book.slug} book={book} index={index} />)}</div>
      <div className="library-note"><BookOpen size={17} aria-hidden="true" /><p>نعمل على تهيئة المكتبة. ستُتاح النصوص للقراءة بعد إعدادها ومراجعتها.</p></div>
    </section>
    <div className="closing-mark container" aria-hidden="true"><span /><Ornament /><span /></div>
  </main>;
}
