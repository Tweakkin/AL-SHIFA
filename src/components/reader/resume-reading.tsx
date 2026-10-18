"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { arabicNumber, parseProgress, progressKey, type ChapterReference, type ReadingProgress } from "@/lib/reader-state";

export function ResumeReading({ bookSlug, chapters }: { bookSlug: string; chapters: readonly ChapterReference[] }) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  useEffect(() => {
    const refresh = () => {
      try { setProgress(parseProgress(localStorage.getItem(progressKey(bookSlug)), chapters)); }
      catch { setProgress(null); }
    };
    refresh();
    window.addEventListener("pageshow", refresh);
    return () => window.removeEventListener("pageshow", refresh);
  }, [bookSlug, chapters]);

  return progress ? <Link className="button-secondary resume-reading" title={`${chapters.find((chapter) => chapter.id === progress.chapterId)?.title} — ${arabicNumber(Math.round(progress.ratio * 100))}٪`} href={`/read/${bookSlug}/${progress.chapterSlug}?resume=1`}><RotateCcw size={16} aria-hidden="true" /> استئناف القراءة</Link>
    : <button className="button-secondary resume-reading" type="button" disabled aria-label="استئناف القراءة — لا يوجد موضع محفوظ بعد"><RotateCcw size={16} aria-hidden="true" /> استئناف القراءة</button>;
}
