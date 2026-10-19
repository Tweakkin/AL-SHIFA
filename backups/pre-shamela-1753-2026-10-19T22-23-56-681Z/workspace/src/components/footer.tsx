import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";

export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-main">
      <div><Link href="/" className="footer-wordmark" aria-label="الشفا — الرئيسية">الشفا</Link><p>من ذخائر التراث المغربي، للسيرة النبوية.</p></div>
      <nav aria-label="روابط التذييل"><Link href="/">الرئيسية</Link><Link href="/library">المكتبة <ArrowUpLeft size={15} aria-hidden="true" /></Link></nav>
    </div>
    <div className="footer-bottom"><span>الشفا · المكتبة الرقمية للسيرة النبوية</span><span>نسخة أولية — قيد التطوير</span></div>
  </div></footer>;
}
