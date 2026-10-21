import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { readerPreferencesScript } from "@/lib/reader-state";
import "./globals.css";

const plex = localFont({
  src: [
    { path: "./fonts/ibmplexsansarabic/IBMPlexSansArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ibmplexsansarabic/IBMPlexSansArabic-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/ibmplexsansarabic/IBMPlexSansArabic-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/ibmplexsansarabic/IBMPlexSansArabic-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-plex", display: "swap", adjustFontFallback: "Arial",
});
const amiri = localFont({
  src: [
    { path: "./fonts/amiri/Amiri-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/amiri/Amiri-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri", display: "swap", adjustFontFallback: "Times New Roman",
});
const maghribi = localFont({ src: "./fonts/bouazzi-maghribi/BouazziMaghribi-Regular.woff2", weight: "400", style: "normal", variable: "--font-maghribi", display: "swap", adjustFontFallback: false });

export const metadata: Metadata = {
  title: { default: "الشفا: المكتبة الرقمية للسيرة النبوية", template: "%s | الشفا" },
  description: "من ذخائر التراث المغربي إلى تجربة قراءة رقمية معاصرة. مشروع مكتبة عربية للسيرة النبوية.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" data-scroll-behavior="smooth"><body className={`${plex.variable} ${amiri.variable} ${maghribi.variable}`}><Script id="reader-preferences" strategy="beforeInteractive">{readerPreferencesScript}</Script><ThemeProvider><a className="skip-link" href="#main">انتقل إلى المحتوى</a><Header />{children}<Footer /></ThemeProvider></body></html>;
}
