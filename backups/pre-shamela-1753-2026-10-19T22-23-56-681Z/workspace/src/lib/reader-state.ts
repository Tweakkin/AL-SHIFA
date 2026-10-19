export const PREFERENCES_KEY = "al-shifa:reader:preferences:v1";
export const MIN_FONT_SIZE = 18;
export const MAX_FONT_SIZE = 34;
export type ReadingTheme = "white" | "ivory" | "dark";
export type ReadingFont = "plex" | "amiri";
export type ReaderPreferences = { theme: ReadingTheme; fontSize: number | null; fontFamily: ReadingFont };
export const DEFAULT_PREFERENCES: ReaderPreferences = { theme: "ivory", fontSize: null, fontFamily: "plex" };

export function parsePreferences(raw: string | null): ReaderPreferences {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return { ...DEFAULT_PREFERENCES };
    const record = value as Record<string, unknown>;
    const theme = ["white", "ivory", "dark"].includes(String(record.theme)) ? record.theme as ReadingTheme : "ivory";
    const fontSize = typeof record.fontSize === "number" && Number.isFinite(record.fontSize)
      ? Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, record.fontSize)) : null;
    const fontFamily = record.fontFamily === "amiri" ? "amiri" : "plex";
    return { theme, fontSize, fontFamily };
  } catch { return { ...DEFAULT_PREFERENCES }; }
}


// One saved reading theme determines site appearance. Header toggles choose
// dark/ivory; reader white/ivory both mean site light. Font size is independent.
export const globalMode = (theme: ReadingTheme): "light" | "dark" => theme === "dark" ? "dark" : "light";
export const themeFromGlobalMode = (mode: "light" | "dark"): ReadingTheme => mode === "dark" ? "dark" : "ivory";
export const siteThemeTokens = {
  "light": {
    "forest": "#173f35",
    "ivory": "#f8f5ec",
    "gold": "#806638",
    "ink": "#252820",
    "muted": "#666b60",
    "line": "#e4e4da",
    "page": "#faf8f3",
    "catalog-page": "var(--page)",
    "surface": "#fff",
    "button-bg": "#173f35",
    "button-ink": "#fff",
    "button-hover": "#245447",
    "footer-bg": "#173f35",
    "brand-line": "#d9ddd4",
    "hero-line": "#e8e4d9",
    "eyebrow": "#796943",
    "input-line": "#deddd1",
    "input-icon": "#64675b",
    "placeholder": "#64675b",
    "note": "#64675b",
    "explore": "#64675b",
    "panel": "#f5f6f0",
    "panel-line": "#e6e9df",
    "author": "#6c6955",
    "availability": "#64675b",
    "arch": "#d8ddcd",
    "arch-inner": "#e0e3d6",
    "caption": "#64675b",
    "stage": "#f1f3ed",
    "stage-line": "#e8eae2",
    "stage-wine": "#f4efeb",
    "stage-wine-line": "#eee6e0",
    "stage-sand": "#f6f2e8",
    "stage-sand-line": "#eee9dc",
    "stage-slate": "#edf1f0",
    "stage-slate-line": "#e4e9e7",
    "index": "#64675b",
    "stage-arrow": "#64675b",
    "status": "#796943",
    "library-note": "#64675b",
    "note-surface": "#f8f9f5",
    "note-line": "#e9ece2",
    "closing-line": "#e3e3d7",
    "empty": "#fafbf8",
    "selection": "#dbe5df"
  },
  "dark": {
    "forest": "#ddc798",
    "ivory": "#1c2c25",
    "gold": "#ddc798",
    "ink": "#e6e7df",
    "muted": "#b7c0b4",
    "line": "#3b4c42",
    "page": "#17231f",
    "catalog-page": "var(--ivory)",
    "surface": "#22352c",
    "button-bg": "#ddc798",
    "button-ink": "#17231f",
    "button-hover": "#e8d5ad",
    "footer-bg": "#101b17",
    "brand-line": "#3b4c42",
    "hero-line": "#3b4c42",
    "eyebrow": "#ddc798",
    "input-line": "#4d6054",
    "input-icon": "#b7c0b4",
    "placeholder": "#b7c0b4",
    "note": "#b7c0b4",
    "explore": "#b7c0b4",
    "panel": "#1c2c25",
    "panel-line": "#3b4c42",
    "author": "#c3c5b5",
    "availability": "#b7c0b4",
    "arch": "#4d6054",
    "arch-inner": "#3b4c42",
    "caption": "#b7c0b4",
    "stage": "#22352c",
    "stage-line": "#3b4c42",
    "stage-wine": "#302a28",
    "stage-wine-line": "#51413d",
    "stage-sand": "#302e23",
    "stage-sand-line": "#504b38",
    "stage-slate": "#253235",
    "stage-slate-line": "#405055",
    "index": "#b7c0b4",
    "stage-arrow": "#b7c0b4",
    "status": "#ddc798",
    "library-note": "#b7c0b4",
    "note-surface": "#1c2c25",
    "note-line": "#3b4c42",
    "closing-line": "#3b4c42",
    "empty": "#22352c",
    "selection": "#314b3c"
  }
} as const;

export function applyPreferences(preferences: ReaderPreferences) {
  const root = document.documentElement;
  const mode = globalMode(preferences.theme);
  root.dataset.theme = mode;
  root.dataset.readerTheme = preferences.theme;
  root.dataset.readerFont = preferences.fontFamily;
  root.style.colorScheme = mode;
  for (const [key, value] of Object.entries(siteThemeTokens[mode])) root.style.setProperty(`--${key}`, value);
  if (preferences.fontSize !== null) root.style.setProperty("--reader-font-size", `${preferences.fontSize}px`);
  else root.style.removeProperty("--reader-font-size");
}

export type ReadingProgress = {
  version: 1;
  chapterId: string;
  chapterSlug: string;
  ratio: number;
  passageId?: string;
  passageOffset?: number;
  updatedAt: number;
};
export type ChapterReference = { id: string; slug: string; title: string };
export const progressKey = (bookSlug: string) => `al-shifa:reader:progress:${bookSlug}:v1`;
export const clampRatio = (value: number) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
export const formatNumber = (value: number | string) => String(value);
export const arabicNumber = (value: number | string) => String(value);

/** Only the opening metadata heading may duplicate the chapter heading. */
export function isRepeatedChapterHeading(sectionTitle: string, chapterTitle: string, index: number): boolean {
  if (index !== 0) return false;
  const clean = (value: string) => value.trim().replace(/\s+/gu, " ");
  const displayedChapter = chapterTitle.replace(/^القسم\s+[^:]+:\s*/u, "");
  return clean(sectionTitle) === clean(chapterTitle) || clean(sectionTitle) === clean(displayedChapter);
}

export function parseProgress(raw: string | null, chapters: readonly ChapterReference[]): ReadingProgress | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (record.version !== 1 || !chapters.some((chapter) => chapter.id === record.chapterId && chapter.slug === record.chapterSlug)
      || typeof record.ratio !== "number" || !Number.isFinite(record.ratio)
      || typeof record.updatedAt !== "number" || !Number.isFinite(record.updatedAt)) return null;
    return {
      version: 1, chapterId: record.chapterId as string, chapterSlug: record.chapterSlug as string,
      ratio: clampRatio(record.ratio), updatedAt: record.updatedAt,
      ...(typeof record.passageId === "string" && record.passageId.length < 250 ? { passageId: record.passageId } : {}),
      ...(typeof record.passageOffset === "number" ? { passageOffset: clampRatio(record.passageOffset) } : {}),
    };
  } catch { return null; }
}

export function shouldRestoreProgress(progress: ReadingProgress | null, chapterId: string, startOver: boolean, hash: string): boolean {
  return Boolean(progress && progress.chapterId === chapterId && !startOver && !hash);
}

export function readingRatio(scrollY: number, articleTop: number, articleHeight: number, viewportHeight: number, toolbarHeight: number): number {
  const start = Math.max(0, articleTop - toolbarHeight - 16);
  const distance = Math.max(1, articleHeight - viewportHeight + toolbarHeight + 32);
  return clampRatio((scrollY - start) / distance);
}

// Root-level next/script runs this before hydration on every page.
// A temporary CSSOM sheet avoids mutating React-owned HTML attributes before
// hydration. The shared provider takes over and removes the sheet.
export const readerPreferencesScript = `(function(){
  try{
    var p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFERENCES_KEY)})||'null')||{};
    var theme=['white','ivory','dark'].includes(p.theme)?p.theme:'ivory';
    var tokens={
      white:['#fff','#252820','#62695e','#d9ded4','#f3f5ef','#173f35','#8b703d'],
      ivory:['#f8f5ec','#252820','#64675b','#ddd8ca','#eeeadd','#173f35','#8b703d'],
      dark:['#17231f','#e6e7df','#b7c0b4','#3b4c42','#22352c','#ddc798','#ddc798']
    }[theme];
    var names=['bg','ink','muted','line','control','accent','focus'];
    var declarations=names.map(function(name,index){return '--reader-'+name+':'+tokens[index]}).join(';');
    var mode=theme==='dark'?'dark':'light';
    var siteTokens=${JSON.stringify(siteThemeTokens)}[mode];
    Object.keys(siteTokens).forEach(function(key){declarations+=';--'+key+':'+siteTokens[key]});
    declarations+=';color-scheme:'+mode;
    if(typeof p.fontSize==='number'&&Number.isFinite(p.fontSize))declarations+=';--reader-font-size:'+Math.min(${MAX_FONT_SIZE},Math.max(${MIN_FONT_SIZE},p.fontSize))+'px';
    var sheet=new CSSStyleSheet();
    var readingFont=p.fontFamily==='amiri'?'var(--font-amiri), serif':'var(--font-plex), sans-serif';
    sheet.replaceSync(':root{'+declarations+'}html:has(.reader-shell){color-scheme:'+(theme==='dark'?'dark':'light')+'}body .reader-document{font-family:'+readingFont+'}');
    document.adoptedStyleSheets=[...document.adoptedStyleSheets,sheet];
    window.__alShifaReaderBootstrap=sheet;
  }catch(e){}
})();`;

export function clearReaderPreferenceBootstrap() {
  const readerWindow = window as Window & { __alShifaReaderBootstrap?: CSSStyleSheet };
  const sheet = readerWindow.__alShifaReaderBootstrap;
  if (!sheet) return;
  document.adoptedStyleSheets = document.adoptedStyleSheets.filter((item) => item !== sheet);
  delete readerWindow.__alShifaReaderBootstrap;
}
