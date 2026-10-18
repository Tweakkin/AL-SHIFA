import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { bookContents } from "../src/content/books.ts";
import { getReadingSections } from "../src/content/reader-demonstration.ts";
import { parsePreferences, parseProgress, progressKey, shouldRestoreProgress, readingRatio, readerPreferencesScript, globalMode, themeFromGlobalMode, siteThemeTokens } from "../src/lib/reader-state.ts";

test("preferences round-trip all themes and clamp invalid sizes without trusting corrupt data", () => {
  for (const theme of ["white", "ivory", "dark"]) {
    assert.deepEqual(parsePreferences(JSON.stringify({ theme, fontSize: 26 })), { theme, fontSize: 26 });
  }
  assert.equal(parsePreferences('{"fontSize":2}').fontSize, 18);
  assert.equal(parsePreferences('{"fontSize":999}').fontSize, 34);
  for (const raw of [null, "null", "[]", "bad JSON", '"text"', '{"fontSize":"28","theme":"unknown"}']) {
    assert.deepEqual(parsePreferences(raw), { theme: "ivory", fontSize: null });
  }
});

test("the supported pre-paint script applies safe CSS without changing React-owned attributes", () => {
  for (const pathname of ['/', '/library', '/books/al-shifa', '/read/al-shifa/demo-01']) {
  for (const raw of ['{"theme":"dark","fontSize":28}', '{"theme":"white","fontSize":999}', '{"theme":"ivory"}', '{"theme":"invalid","fontSize":5}', '{}', 'bad JSON']) {
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
    assert.equal(css.includes('--reader-font-size:'), expected.fontSize !== null);
    if (expected.fontSize !== null) assert.ok(css.includes(`--reader-font-size:${expected.fontSize}px`));
  }
  }
  assert.doesNotThrow(() => runInNewContext(readerPreferencesScript, { location: { pathname: '/read/al-shifa/demo-01' }, localStorage: { getItem: () => { throw new Error("blocked"); } } }));

});

const chapters = bookContents[0].chapters;
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
  for (const content of bookContents) {
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
  assert.equal(ids.size, 96);
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
