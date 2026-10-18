"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, List, Minus, Plus, Settings2, X } from "lucide-react";
import type { ReadingSection } from "@/content/reader-demonstration";
import { capturePosition, restorePosition } from "@/lib/reader-position";
import { useTheme } from "@/components/theme-provider";
import {
  arabicNumber, MAX_FONT_SIZE, MIN_FONT_SIZE, parseProgress,
  progressKey, shouldRestoreProgress,
  type ChapterReference, type ReaderPreferences, type ReadingTheme,
} from "@/lib/reader-state";

type ReaderProps = {
  bookSlug: string;
  bookTitle: string;
  chapter: ChapterReference & { kind: "original" | "demonstration" };
  chapters: readonly ChapterReference[];
  sections: readonly ReadingSection[];
};

export function BookReader({ bookSlug, bookTitle, chapter, chapters, sections }: ReaderProps) {
  const { preferences, ready, canPersist: preferencesCanPersist, updatePreferences: savePreferences } = useTheme();
  const [positionReady, setPositionReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [canPersist, setCanPersist] = useState(true);
  const [ratio, setRatio] = useState(0);
  const articleRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const contentsButtonRef = useRef<HTMLButtonElement>(null);
  const flushRef = useRef<() => void>(() => {});
  const currentIndex = chapters.findIndex((item) => item.id === chapter.id);
  const previous = chapters[currentIndex - 1];
  const next = chapters[currentIndex + 1];
  const fontSize = preferences.fontSize ?? (mobile ? 20 : 22);
  const percentComplete = Math.round(ratio * 100);

  useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (!ready || !articleRef.current) return;
    const article = articleRef.current;
    let disposed = false;
    let active = false;
    let interrupted = false;
    let frame = 0;
    let timer = 0;
    let lastPosition: ReturnType<typeof capturePosition> | null = null;
    let stored = null;
    try { stored = parseProgress(localStorage.getItem(progressKey(bookSlug)), chapters); }
    catch { setCanPersist(false); }
    const parameters = new URLSearchParams(window.location.search);
    const restore = shouldRestoreProgress(stored, chapter.id, parameters.get("start") === "1", window.location.hash);
    const persist = (position: ReturnType<typeof capturePosition>) => {
      try {
        localStorage.setItem(progressKey(bookSlug), JSON.stringify({ version: 1, chapterId: chapter.id, chapterSlug: chapter.slug, ...position, updatedAt: Date.now() }));
      } catch { if (!disposed) setCanPersist(false); }
    };
    const save = () => {
      if (!active || !article.isConnected) return;
      lastPosition = capturePosition(article, toolbarRef.current);
      setRatio(lastPosition.ratio);
      persist(lastPosition);
    };
    flushRef.current = save;
    const onScroll = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        lastPosition = capturePosition(article, toolbarRef.current);
        setRatio(lastPosition.ratio);
        window.clearTimeout(timer);
        timer = window.setTimeout(save, 220);
      });
    };
    const interrupt = () => { interrupted = true; };
    const onVisibility = () => { if (document.visibilityState === "hidden") save(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    document.addEventListener("visibilitychange", onVisibility);
    // The article stays reserved but hidden until fonts/preferences and restoration
    // settle, avoiding a flash at the wrong font size or an old chapter position.
    void document.fonts.ready.then(() => {
      if (disposed) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (restore && stored && !interrupted) restorePosition(article, toolbarRef.current, stored);
        else if (!window.location.hash && !interrupted) window.scrollTo({ top: 0, behavior: "instant" });
        // Start/resume are one-time navigation intents. A subsequent reload of
        // this chapter should resume normally, rather than repeatedly reset it.
        if (parameters.get("start") === "1" || parameters.get("resume") === "1") {
          const url = new URL(window.location.href);
          url.searchParams.delete("start");
          url.searchParams.delete("resume");
          window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
        }
        active = true;
        setPositionReady(true);
        save();
      });
    });
    return () => {
      // Next.js can reset window scroll during route commits. Persist the last
      // live observation, never measure an article while its route is unmounting.
      if (active && lastPosition) persist(lastPosition);
      disposed = true;
      flushRef.current = () => {};
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", interrupt);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready, bookSlug, chapter.id, chapter.slug, chapters]);

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const update = () => shellRef.current?.style.setProperty("--reader-toolbar-height", `${toolbar.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setTocOpen(false);
  }, [mobile]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (dialogRef.current?.open) return; // Native modal Escape handling owns focus.
      if (settingsOpen) { setSettingsOpen(false); settingsButtonRef.current?.focus(); return; }
      if (!mobile && tocOpen) { setTocOpen(false); contentsButtonRef.current?.focus(); }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [settingsOpen, mobile, tocOpen]);

  function updatePreferences(nextPreferences: ReaderPreferences) {
    const position = articleRef.current ? capturePosition(articleRef.current, toolbarRef.current) : null;
    savePreferences(nextPreferences);
    if (position && articleRef.current && nextPreferences.fontSize !== preferences.fontSize) {
      window.requestAnimationFrame(() => {
        if (articleRef.current) restorePosition(articleRef.current, toolbarRef.current, position);
        flushRef.current();
      });
    }
  }

  function closeContents() {
    if (dialogRef.current?.open) dialogRef.current.close();
    setTocOpen(false);
    if (!mobile) contentsButtonRef.current?.focus();
  }
  function navigateChapter() { flushRef.current(); closeContents(); }
  function toggleContents() {
    if (mobile) { if (dialogRef.current?.open) closeContents(); else { dialogRef.current?.showModal(); setTocOpen(true); } }
    else setTocOpen((open) => !open);
  }
  function chapterLinks() {
    return <nav aria-label="فصول الكتاب"><ol>{chapters.map((item, index) => <li key={item.id}><Link href={`/read/${bookSlug}/${item.slug}?start=1`} scroll={false} onClick={navigateChapter} aria-current={item.id === chapter.id ? "page" : undefined}>
      <span className="reader-toc-index" aria-hidden="true">{arabicNumber(index + 1)}</span><span>{item.title}</span>
    </Link></li>)}</ol></nav>;
  }

  return <main id="main" tabIndex={-1} ref={shellRef} className="reader-shell" data-ready={ready} data-position-ready={positionReady} data-toc-open={tocOpen && !mobile}>
    <header className="reader-topbar" ref={toolbarRef}>
      <div className="reader-toolbar">
        <div className="reader-toolbar-start">
          <Link className="reader-navigation-button" href={`/books/${bookSlug}`} onClick={() => flushRef.current()} aria-label="العودة للكتاب" title="العودة للكتاب"><ArrowRight size={19} aria-hidden="true" /><span>العودة للكتاب</span></Link>
          <button type="button" ref={contentsButtonRef} className="reader-navigation-button" aria-label="فهرس الكتاب" title="فهرس الكتاب" aria-expanded={tocOpen} aria-controls={mobile ? "reader-mobile-contents" : "reader-desktop-contents"} aria-haspopup={mobile ? "dialog" : undefined} disabled={!ready} onClick={toggleContents}><List size={19} aria-hidden="true" /><span>فهرس الكتاب</span></button>
        </div>
        <div className="reader-toolbar-title"><span>{bookTitle}</span><small>{chapter.title} · {arabicNumber(currentIndex + 1)} / {arabicNumber(chapters.length)}</small></div>
        <div className="reader-toolbar-actions">
          <button type="button" ref={settingsButtonRef} className="reader-icon-button" aria-label="إعدادات القراءة" aria-expanded={settingsOpen} aria-controls="reader-settings" disabled={!ready} onClick={() => setSettingsOpen(!settingsOpen)}><Settings2 size={20} aria-hidden="true" /></button>
          <span className="reader-progress" role="progressbar" aria-label="التقدم في الفصل الحالي" title="نسبة اكتمال الفصل الحالي" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentComplete} aria-valuetext={`${arabicNumber(percentComplete)}٪ مكتمل من الفصل الحالي`}><bdi>{arabicNumber(percentComplete)}٪</bdi><span>مكتمل</span></span>
        </div>
      </div>
      <section id="reader-settings" className="reader-settings" aria-label="تخصيص القراءة" hidden={!settingsOpen}>
        <div className="reader-setting-group" role="group" aria-label="حجم خط القراءة"><span>حجم الخط</span><button type="button" aria-label="تصغير الخط" disabled={!ready || fontSize <= MIN_FONT_SIZE} onClick={() => updatePreferences({ ...preferences, fontSize: Math.max(MIN_FONT_SIZE, fontSize - 2) })}><Minus size={18} aria-hidden="true" /></button><output className="reader-font-output" aria-label="حجم الخط بالبكسل">{ready ? arabicNumber(fontSize) : "—"}</output><button type="button" aria-label="تكبير الخط" disabled={!ready || fontSize >= MAX_FONT_SIZE} onClick={() => updatePreferences({ ...preferences, fontSize: Math.min(MAX_FONT_SIZE, fontSize + 2) })}><Plus size={18} aria-hidden="true" /></button></div>
        <div className="reader-setting-group reader-theme-group" role="group" aria-label="مظهر القراءة">{([ ["white", "أبيض"], ["ivory", "عاجي"], ["dark", "داكن"] ] as const).map(([theme, label]) => <button type="button" key={theme} aria-label={`المظهر ${label}`} aria-pressed={preferences.theme === theme} onClick={() => updatePreferences({ ...preferences, theme: theme as ReadingTheme })}><span className={`reader-theme-dot reader-theme-${theme}`} aria-hidden="true" />{label}</button>)}</div>
        {(!canPersist || !preferencesCanPersist) && <p className="reader-storage-note" role="status">الحفظ المحلي غير متاح في هذا المتصفح؛ قد لا تبقى إعداداتك وموضعك بعد المغادرة.</p>}
      </section>
    </header>

    <aside id="reader-desktop-contents" className="reader-contents" hidden={!tocOpen || mobile} aria-labelledby="reader-contents-title">
      <div className="reader-contents-heading"><h2 id="reader-contents-title">فهرس الكتاب</h2><button className="reader-icon-button" type="button" aria-label="إغلاق الفهرس" onClick={closeContents}><X size={19} aria-hidden="true" /></button></div>
      <p className="reader-contents-book">{bookTitle}</p>{chapter.kind === "demonstration" && <p className="reader-contents-note">فهرس تجريبي للاختبار</p>}{chapterLinks()}
    </aside>
    <dialog id="reader-mobile-contents" className="reader-dialog" ref={dialogRef} aria-labelledby="reader-dialog-title" onCancel={() => setTocOpen(false)} onClose={() => setTocOpen(false)}>
      <div className="reader-contents-heading"><h2 id="reader-dialog-title">فهرس الكتاب</h2><button className="reader-icon-button" autoFocus type="button" aria-label="إغلاق الفهرس" onClick={closeContents}><X size={20} aria-hidden="true" /></button></div>
      <p className="reader-contents-book">{bookTitle}</p>{chapter.kind === "demonstration" && <p className="reader-contents-note">فهرس تجريبي للاختبار</p>}{chapterLinks()}
    </dialog>

    <div className="reader-main">
      <article className="reader-document" ref={articleRef} aria-labelledby="reader-chapter-title" data-chapter-id={chapter.id}>
        <div className="reader-chapter-heading"><p>{arabicNumber(currentIndex + 1)} / {arabicNumber(chapters.length)}</p><h1 id="reader-chapter-title">{chapter.title}</h1></div>
        {chapter.kind === "demonstration" && <p className="reader-demo-notice">نص تحريري لتجربة واجهة القراءة، وليس من الكتاب الأصلي أو من طبعة علمية معتمدة.</p>}
        {sections.map((section) => <section className="reader-section" key={section.id} aria-labelledby={`${section.id}:heading`}><h2 id={`${section.id}:heading`}>{section.title}</h2>{section.passages.map((passage) => <p key={passage.id} id={passage.id} data-reader-passage data-content-kind={passage.kind} dir="auto">{passage.text}</p>)}</section>)}
        {!sections.length && <p className="reader-demo-notice">لم يتوفر نص لهذا الفصل بعد.</p>}
        <p className="reader-chapter-end">{chapter.kind === "demonstration" ? "نهاية الفصل التجريبي" : "نهاية الفصل"}</p>
      </article>
      <nav className="reader-chapter-navigation" aria-label="التنقل بين الفصول">
        {previous ? <Link href={`/read/${bookSlug}/${previous.slug}?start=1`} onClick={navigateChapter} scroll={false}><ArrowRight size={19} aria-hidden="true" /><span><small>الفصل السابق</small>{previous.title}</span></Link> : <span className="reader-navigation-disabled">بداية الكتاب</span>}
        {next ? <Link href={`/read/${bookSlug}/${next.slug}?start=1`} onClick={navigateChapter} scroll={false}><span><small>الفصل التالي</small>{next.title}</span><ArrowLeft size={19} aria-hidden="true" /></Link> : <span className="reader-navigation-disabled">نهاية الفصول المتاحة</span>}
      </nav>
      <Link className="reader-bottom-back" href={`/books/${bookSlug}`} onClick={() => flushRef.current()}>العودة إلى صفحة الكتاب</Link>
    </div>
  </main>;
}
