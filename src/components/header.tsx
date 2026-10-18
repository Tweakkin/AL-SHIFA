"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function Header() {
  const pathname = usePathname();
  const inLibrary = ["/library", "/books/", "/read/"].some((prefix) => pathname.startsWith(prefix));
  const [open, setOpen] = useState(false);
  const { preferences, ready, toggleAppearance } = useTheme();
  const dark = preferences.theme === "dark";
  const themeLabel = dark ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن";
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="الشفا — الرئيسية" onClick={() => setOpen(false)}>
          <span className="brand-mark font-maghribi">الشفا</span>
          <span className="brand-caption">المكتبة الرقمية<br />للسيرة النبوية</span>
        </Link>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>الرئيسية</Link>
          <Link href="/library" aria-current={inLibrary ? "page" : undefined}>المكتبة</Link>
        </nav>
        <div className="header-actions">
        <button type="button" className="theme-toggle" aria-label={themeLabel} title={themeLabel} disabled={!ready} onClick={toggleAppearance}>{dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</button>
        <button className="mobile-toggle" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav container" aria-label="التنقل على الهاتف">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} onClick={() => setOpen(false)}>الرئيسية</Link>
        <Link href="/library" aria-current={inLibrary ? "page" : undefined} onClick={() => setOpen(false)}>المكتبة</Link>
      </nav>}
    </header>
  );
}
