import Link from "next/link";
export default function NotFound() {
  return <main id="main" className="container placeholder-page"><span className="eyebrow">404</span><h1>الصفحة غير موجودة</h1><p>يمكنك العودة إلى المكتبة لتصفّح الكتب المتاحة.</p><Link href="/library" className="button-primary">العودة إلى المكتبة</Link><Link href="/" className="text-link">العودة إلى الرئيسية</Link></main>;
}
