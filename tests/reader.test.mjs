import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IntroOutlinePassage, introOutlineEntries } from "../src/components/reader/intro-outline.ts";
import { bookContents } from "../src/content/books.ts";
import { getReadingSections } from "../src/content/reader-demonstration.ts";
import { readerHeading } from "../src/lib/reader-headings.ts";
import { editorialChapterTitle } from "../src/lib/editorial-text.ts";
import { NavigationTitle } from "../src/components/reader/navigation-title.ts";
import { readerDisplayText } from "../src/lib/reader-display-text.ts";

test("reader navigation separates structural labels without changing source titles or subject punctuation", () => {
  const content = bookContents.find(book => book.bookSlug === "al-shifa");
  const before = JSON.stringify(content);
  for (const chapter of content.chapters) {
    const html = renderToStaticMarkup(createElement(NavigationTitle, { title: chapter.title }));
    if (chapter.slug === "muqaddima") {
      assert(!html.includes('reader-navigation-metadata'));
      assert(html.includes('>مقدمة المؤلف</span>'));
    } else {
      assert.match(html, /reader-navigation-metadata">القسم \S+ · الباب \S+<\/span>/u);
      assert(!html.includes('—'));
      assert(html.includes(`reader-navigation-subject">${chapter.title.slice(chapter.title.indexOf(" — ") + 3)}</span>`));
    }
  }
  for (const separator of [":", "—", "–", "--"]) {
    const html = renderToStaticMarkup(createElement(NavigationTitle, { title: `القسم الأول: الباب الأول ${separator} موضوع: تفصيل — نص محفوظ` }));
    assert(html.includes('>القسم الأول · الباب الأول</span>'));
    assert(html.includes('>موضوع: تفصيل — نص محفوظ</span>'));
  }
  const chapterOnly = renderToStaticMarkup(createElement(NavigationTitle, { title: "الباب الثاني: موضوع الفصل" }));
  assert(chapterOnly.includes('reader-navigation-metadata">الباب الثاني</span>'));
  assert(chapterOnly.includes('reader-navigation-subject">موضوع الفصل</span>'));
  for (const title of ["مقدمة المؤلف", "عنوان مختلف: وصف", "الباب الأول", "الفصل التجريبي الأول"]) {
    const html = renderToStaticMarkup(createElement(NavigationTitle, { title }));
    assert(!html.includes('reader-navigation-metadata'));
    assert(html.includes(`>${title}</span>`));
  }
  assert.equal(JSON.stringify(content), before);
});

test("editorial chapter separators are formatted without rewriting source metadata or other dashes", () => {
  for (const separator of ["—", "–", "--"]) {
    assert.equal(editorialChapterTitle(`القسم الأول: الباب الأول ${separator} في الثناء`), "القسم الأول: الباب الأول: في الثناء");
    assert.equal(editorialChapterTitle(`الباب الأول ${separator} في الثناء`), "الباب الأول: في الثناء");
  }
  for (const text of ["مقدمة المؤلف", "قال المؤلف — نص محفوظ", "Al-Shifa", "--reader-bg", "الباب الأول: في الثناء"]) {
    assert.equal(editorialChapterTitle(text), text);
  }
  const content = bookContents.find(book => book.bookSlug === "al-shifa");
  const before = JSON.stringify(content);
  assert.equal(content.chapters.filter(chapter => editorialChapterTitle(chapter.title) !== chapter.title).length, 13);
  for (const chapter of content.chapters) assert(!/[—–]|--/u.test(editorialChapterTitle(chapter.title)));
  assert.equal(JSON.stringify(content), before);
});
import { parsePreferences, parseProgress, progressKey, shouldRestoreProgress, readingRatio, readerPreferencesScript, globalMode, themeFromGlobalMode, siteThemeTokens, isRepeatedChapterHeading } from "../src/lib/reader-state.ts";

test("preferences round-trip all themes and clamp invalid sizes without trusting corrupt data", () => {
  for (const theme of ["white", "ivory", "dark"]) {
    assert.deepEqual(parsePreferences(JSON.stringify({ theme, fontSize: 26 })), { theme, fontSize: 26, fontFamily: "plex" });
  }
  assert.equal(parsePreferences('{"fontSize":2}').fontSize, 18);
  assert.equal(parsePreferences('{"fontSize":999}').fontSize, 34);
  for (const raw of [null, "null", "[]", "bad JSON", '"text"', '{"fontSize":"28","theme":"unknown"}']) {
    assert.deepEqual(parsePreferences(raw), { theme: "ivory", fontSize: null, fontFamily: "plex" });
  }
});

test("the supported pre-paint script applies safe CSS without changing React-owned attributes", () => {
  for (const pathname of ['/', '/library', '/books/al-shifa', '/read/al-shifa/demo-01']) {
  for (const raw of ['{"theme":"dark","fontSize":28,"fontFamily":"amiri"}', '{"theme":"white","fontSize":999}', '{"theme":"ivory"}', '{"theme":"invalid","fontSize":5}', '{}', 'bad JSON']) {
    const root = { dataset: {} };
    const document = { documentElement: root, adoptedStyleSheets: [] };
    const window = {};
    class Sheet { replaceSync(css) { this.css = css; } }
    runInNewContext(readerPreferencesScript, { location: { pathname }, window, CSSStyleSheet: Sheet, localStorage: { getItem: () => raw }, document });
    const expected = parsePreferences(raw);
    assert.deepEqual(root.dataset, {});
    if (raw === 'bad JSON') { assert.equal(document.adoptedStyleSheets.length, 0); continue; }
    assert.equal(document.adoptedStyleSheets.length, 1);
    assert.equal(window.__alShifaReaderBootstrap, document.adoptedStyleSheets[0]);
    const css = document.adoptedStyleSheets[0].css;
    const background = { dark: '#17231f', ivory: '#f8f5ec', white: '#fff' }[expected.theme];
    assert.ok(css.includes(`--reader-bg:${background}`));
    const mode = globalMode(expected.theme);
    assert.ok(css.includes(`--page:${siteThemeTokens[mode].page}`));
    assert.ok(css.includes(`--button-bg:${siteThemeTokens[mode]['button-bg']}`));
    assert.ok(css.includes(`color-scheme:${mode}`));
    assert.ok(css.includes(expected.fontFamily === 'amiri' ? '.reader-document{font-family:var(--font-amiri), serif}' : '.reader-document{font-family:var(--font-plex), sans-serif}'));
    assert.equal(css.includes('--reader-font-size:'), expected.fontSize !== null);
    if (expected.fontSize !== null) assert.ok(css.includes(`--reader-font-size:${expected.fontSize}px`));
  }
  }
  assert.doesNotThrow(() => runInNewContext(readerPreferencesScript, { location: { pathname: '/read/al-shifa/demo-01' }, localStorage: { getItem: () => { throw new Error("blocked"); } } }));

});

test("font choices persist and legacy preferences keep their size and theme", () => {
  for (const fontFamily of ['plex', 'amiri']) {
    const preferences = { theme: 'dark', fontSize: 28, fontFamily };
    assert.deepEqual(parsePreferences(JSON.stringify(preferences)), preferences);
    assert.equal(parsePreferences(JSON.stringify({ ...preferences, theme: 'white' })).fontFamily, fontFamily);
  }
  assert.deepEqual(parsePreferences('{"theme":"dark","fontSize":26}'), { theme: 'dark', fontSize: 26, fontFamily: 'plex' });
  assert.equal(parsePreferences('{"fontFamily":"invalid"}').fontFamily, 'plex');
});

test("only matching opening metadata headings are suppressed", () => {
  assert.equal(isRepeatedChapterHeading('مقدمة المؤلف', 'مقدمة المؤلف', 0), true);
  assert.equal(isRepeatedChapterHeading('  مقدمة   المؤلف ', 'مقدمة المؤلف', 0), true);
  assert.equal(isRepeatedChapterHeading('الباب الأول', 'القسم الأول: الباب الأول', 0), true);
  assert.equal(isRepeatedChapterHeading('الفصل الأول', 'الباب الأول', 0), false);
  assert.equal(isRepeatedChapterHeading('مقدمة المؤلف', 'مقدمة المؤلف', 1), false);
});

const chapters = bookContents[0].chapters;

test("reviewed introductory outline renders separate labels and descriptions without changing original text", () => {
  const chapter = chapters.find(chapter => chapter.slug === 'muqaddima');
  const before = JSON.stringify(chapter);
  const passages = getReadingSections(chapter).flatMap(section => section.passages);
  let formatted = 0;
  const divisions = [];
  for (const passage of passages) {
    const entries = introOutlineEntries(chapter.id, passage);
    const html = renderToStaticMarkup(createElement(IntroOutlinePassage, { chapterId: chapter.id, passage }));
    assert.equal((html.match(/data-reader-passage=/g) || []).length, 1);
    assert.ok(html.includes(`id="${passage.id}"`));
    if (!entries) continue;
    formatted++;
    assert.equal(entries.map(entry => entry.sourceLabel + entry.description).join(''), passage.text);
    assert.ok(html.includes('aria-label="من خطة المؤلف للكتاب في المقدمة"'));
    for (const entry of introOutlineEntries(chapter.id, { ...passage, text: readerDisplayText(passage) })) {
      assert.ok(html.includes(`<h3 class="reader-outline-label">${entry.label}</h3>`));
      assert.ok(html.includes(`<p class="reader-outline-description" dir="auto">${entry.description}</p>`));
      assert.doesNotMatch(entry.label, /[()]/);
      if (entry.level === 'division') divisions.push(entry.label);
    }
  }
  assert.equal(formatted, 13);
  assert.deepEqual(divisions, ['القسم الأول', 'القسم الثاني', 'القسم الثالث', 'القسم الرابع']);
  assert.equal(JSON.stringify(chapter), before);
});

test("ambiguous outline entries and unrelated prose retain the ordinary passage rendering", () => {
  const chapter = chapters.find(chapter => chapter.slug === 'muqaddima');
  const passages = getReadingSections(chapter).flatMap(section => section.passages);
  const ambiguous = passages.find(passage => passage.id.endsWith('-019'));
  const allowed = passages.find(passage => passage.id.endsWith('-017'));
  for (const [chapterId, passage] of [
    [chapter.id, ambiguous],
    ['another-chapter', allowed],
    [chapter.id, { ...allowed, kind: 'demonstration' }],
    [chapter.id, { ...allowed, id: 'unrelated-passage' }],
    [chapter.id, { ...allowed, text: 'نص مختلف (القسم الثاني) داخل فقرة.' }],
  ]) {
    assert.equal(introOutlineEntries(chapterId, passage), null);
    const html = renderToStaticMarkup(createElement(IntroOutlinePassage, { chapterId, passage }));
    assert.equal(html, `<p id="${passage.id}" data-reader-passage="true" data-content-kind="${passage.kind}" dir="auto">${passage.text}</p>`);
  }
});

test("division metadata separates labels from descriptions without treating outline references as headings", () => {
  for (const ordinal of ['الأول', 'الثاني', 'الثالث', 'الرابع']) {
    for (const title of [`القسم ${ordinal} وصف اختباري`, `(القسم ${ordinal}) وصف اختباري`, `(القسم ${ordinal}:) وصف اختباري`]) {
      assert.deepEqual(readerHeading(title), { level: 'division', label: `القسم ${ordinal}`, description: 'وصف اختباري' });
    }
  }
  for (const title of ['مقدمة القسم الثاني', 'في بيان القسم الثاني', 'القسم الأولية']) {
    const heading = readerHeading(title);
    assert.notEqual(heading.level, 'division');
    assert.equal(heading.label, title);
    assert.equal(heading.description, null);
  }
  assert.equal(readerHeading('الباب الأول في ثناء الله تعالى عليه').level, 'bab');
  assert.equal(readerHeading('(الباب الثاني) عنوان اختباري').level, 'bab');
  assert.equal(readerHeading('الفصل الأول').level, 'fasl');
});

test("heading presentation leaves every imported passage, boundary, ID and source unchanged", () => {
  for (const chapter of chapters) {
    if (chapter.kind !== 'original') continue;
    const rendered = getReadingSections(chapter);
    assert.equal(rendered.length, chapter.sections.length);
    rendered.forEach((section, index) => {
      readerHeading(section.title);
      const original = chapter.sections[index];
      assert.equal(section.id, original.id);
      assert.equal(section.title, original.title);
      assert.deepEqual(section.passages.map(({ id, text, source }) => ({ id, originalText: text, source })), original.passages);
    });
  }
});
const progress = { version: 1, chapterId: chapters[0].id, chapterSlug: chapters[0].slug, ratio: .43, passageId: `${chapters[0].id}:passage:welcome-03`, passageOffset: .2, updatedAt: 12345 };

test("progress round-trips chapter, scroll ratio and passage anchor; storage is separated by book", () => {
  assert.deepEqual(parseProgress(JSON.stringify(progress), chapters), progress);
  assert.notEqual(progressKey("al-shifa"), progressKey("dalail-al-khayrat"));
  assert.equal(parseProgress(JSON.stringify({ ...progress, ratio: 3 }), chapters).ratio, 1);
  assert.equal(parseProgress(JSON.stringify({ ...progress, ratio: -2 }), chapters).ratio, 0);
});

test("corrupt or unknown progress is ignored and cannot redirect to an unknown chapter", () => {
  for (const value of [null, {}, { ...progress, version: 2 }, { ...progress, chapterId: 'missing' }, { ...progress, chapterSlug: 'missing' }, { ...progress, ratio: '43%' }]) {
    assert.equal(parseProgress(JSON.stringify(value), chapters), null);
  }
  assert.equal(parseProgress("broken", chapters), null);
  assert.equal(parseProgress(JSON.stringify(progress), bookContents[1].chapters), null);
});

test("same-chapter returns resume, deliberate chapter changes and start links do not", () => {
  assert.equal(shouldRestoreProgress(progress, chapters[0].id, false, ""), true);
  assert.equal(shouldRestoreProgress(progress, chapters[1].id, false, ""), false);
  assert.equal(shouldRestoreProgress(progress, chapters[0].id, true, ""), false);
  assert.equal(shouldRestoreProgress(progress, chapters[0].id, false, "#passage"), false);
  assert.equal(shouldRestoreProgress(null, chapters[0].id, false, ""), false);
});

test("scroll progress is bounded and tracks the article rather than unrelated page chrome", () => {
  assert.equal(readingRatio(0, 120, 2000, 800, 72), 0);
  const middle = readingRatio(684, 120, 2000, 800, 72);
  assert.ok(Math.abs(middle - .5) < .01);
  assert.equal(readingRatio(9000, 120, 2000, 800, 72), 1);
  assert.equal(readingRatio(0, 120, 100, 800, 72), 0);
});

test("demo paragraphs have stable unique IDs and stay outside original text records", () => {
  const ids = new Set();
  const demoContents = bookContents.filter((content) => content.bookSlug !== "al-shifa");
  for (const content of demoContents) {
    for (const chapter of content.chapters) {
      const sections = getReadingSections(chapter);
      assert.equal(sections.length, 3);
      assert.deepEqual(chapter.sections, []);
      assert.deepEqual(sections, getReadingSections(chapter));
      for (const section of sections) for (const passage of section.passages) {
        assert.equal(passage.kind, "demonstration");
        assert.ok(passage.id.startsWith(chapter.id + ":passage:"));
        assert.ok(!ids.has(passage.id));
        ids.add(passage.id);
        assert.ok(passage.text.length > 100);
      }
    }
  }
  assert.equal(ids.size, 72);
});

test("authentic chapters in al-shifa yield original reading sections and retain exact text", () => {
  const shifa = bookContents.find((c) => c.bookSlug === "al-shifa");
  assert.ok(shifa);
  for (const chapter of shifa.chapters) {
    const readingSections = getReadingSections(chapter);
    assert.equal(readingSections.length, chapter.sections.length);
    for (let i = 0; i < readingSections.length; i++) {
      const rSec = readingSections[i];
      const origSec = chapter.sections[i];
      assert.equal(rSec.id, origSec.id);
      assert.equal(rSec.title, origSec.title);
      assert.equal(rSec.passages.length, origSec.passages.length);
      for (let j = 0; j < rSec.passages.length; j++) {
        assert.equal(rSec.passages[j].id, origSec.passages[j].id);
        assert.equal(rSec.passages[j].kind, "original");
        assert.equal(rSec.passages[j].text, origSec.passages[j].originalText);
        assert.deepEqual(rSec.passages[j].source, origSec.passages[j].source);
      }
    }
  }
});

test("authentic structured passages retain their original IDs and text when adapted for rendering", () => {
  const chapter = { id: "test:chapter:one", slug: "one", title: "اختبار", kind: "original", source: { label: "test fixture" }, sections: [{ id: "test:section:one", title: "اختبار", passages: [{ id: "test:passage:one", originalText: "نص اختباري فقط.", source: { label: "test fixture" } }] }] };
  const [section] = getReadingSections(chapter);
  assert.equal(section.id, "test:section:one");
  assert.deepEqual(section.passages, [{ id: "test:passage:one", text: "نص اختباري فقط.", kind: "original", source: { label: "test fixture" } }]);
});


test("site appearance and all reader themes share one preference without changing font size", () => {
  assert.equal(globalMode("white"), "light");
  assert.equal(globalMode("ivory"), "light");
  assert.equal(globalMode("dark"), "dark");
  assert.equal(themeFromGlobalMode("light"), "ivory");
  assert.equal(themeFromGlobalMode("dark"), "dark");
  const initial = parsePreferences('{"theme":"white","fontSize":28}');
  for (const mode of ["dark", "light"]) {
    const saved = parsePreferences(JSON.stringify({ ...initial, theme: themeFromGlobalMode(mode) }));
    assert.equal(globalMode(saved.theme), mode);
    assert.equal(saved.fontSize, 28);
  }
});

test("site text, primary controls, and all reader text palettes meet AA contrast", () => {
  const luminance = (hex) => {
    const full = hex.length === 4 ? '#' + [...hex.slice(1)].map(x => x + x).join('') : hex;
    const channels = [1, 3, 5].map(i => parseInt(full.slice(i, i + 2), 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  for (const mode of ['light', 'dark']) {
    const tokens = siteThemeTokens[mode];
    for (const text of ['ink', 'muted', 'forest', 'author', 'status', 'placeholder', 'index', 'caption', 'availability', 'library-note', 'eyebrow', 'gold']) {
      for (const surface of ['page', 'surface', 'ivory', 'panel', 'stage-wine', 'stage-sand', 'stage-slate']) {
        assert.ok(contrast(tokens[text], tokens[surface]) >= 4.5, `${mode}: ${text} on ${surface}`);
      }
    }
  }
  for (const mode of ['light', 'dark']) {
    const tokens = siteThemeTokens[mode];
    assert.ok(contrast(tokens['button-ink'], tokens['button-bg']) >= 4.5);
    assert.ok(contrast(tokens['button-ink'], tokens['button-hover']) >= 4.5);
  }
  for (const [bg, ink, muted] of [['#fff','#252820','#62695e'], ['#f8f5ec','#252820','#64675b'], ['#17231f','#e6e7df','#b7c0b4']]) {
    assert.ok(contrast(ink,bg) >= 4.5);
    assert.ok(contrast(muted,bg) >= 4.5);
  }
});

test("formatNumber and arabicNumber standardize numbers to Western digits for UI presentation", async () => {
  const { formatNumber, arabicNumber } = await import("../src/lib/reader-state.ts");
  assert.equal(arabicNumber(0), "0");
  assert.equal(arabicNumber(42), "42");
  assert.equal(arabicNumber("12"), "12");
  assert.equal(formatNumber(100), "100");
  assert.equal(formatNumber("404"), "404");
  for (let i = 0; i <= 9; i++) {
    assert.equal(arabicNumber(i), String(i));
    assert.equal(formatNumber(i), String(i));
  }
});
