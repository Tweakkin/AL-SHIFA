import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { shifaContent } from '../src/content/al-shifa/index.ts';
import { readerDisplayText } from '../src/lib/reader-display-text.ts';
import { IntroOutlinePassage } from '../src/components/reader/intro-outline.ts';
import { inspectQuotes } from '../scripts/inspect-reader-quotes.mjs';

test('only the reviewed initial stray mark changes; source words, IDs and all other marks survive', () => {
  const snapshot = JSON.stringify(shifaContent);
  let changes = 0;
  for (const c of shifaContent.chapters) for (const s of c.sections) for (const p of s.passages) {
    const input = { id: p.id, text: p.originalText, kind: 'original' };
    const shown = readerDisplayText(input);
    if (shown !== p.originalText) {
      changes++;
      assert.equal(p.id, 'al-shifa:chapter:muqaddima:passage:sec-01-001');
      assert.equal(shown, p.originalText.slice(0, 94) + p.originalText.slice(95));
      assert.equal(shown.replace(/[«»]/gu, ''), p.originalText.replace(/[«»]/gu, ''));
      const html = renderToStaticMarkup(createElement(IntroOutlinePassage, { chapterId: c.id, passage: input }));
      assert(html.includes('الظاهر لا تخيلا'));
      assert(html.includes(`id="${p.id}"`));
      assert(html.includes('data-reader-passage="true"'));
    }
  }
  assert.equal(changes, 1);
  assert.equal(JSON.stringify(shifaContent), snapshot);
});

test('erratum fails closed on a changed context, wrong ID, or demonstration', () => {
  const p = shifaContent.chapters[0].sections[0].passages[0];
  for (const input of [
    { id: p.id, text: p.originalText.replace('لا تخيلا', 'سياق مختلف'), kind: 'original' },
    { id: 'other', text: p.originalText, kind: 'original' },
    { id: p.id, text: p.originalText, kind: 'demonstration' },
  ]) assert.equal(readerDisplayText(input), input.text);
});

test('logical quote matching preserves pairs spanning paragraphs and separately flags chapter boundaries', () => {
  const section = (id, texts) => ({ id, passages: texts.map((originalText,i) => ({ id: `${id}-${i}`, originalText })) });
  const r = inspectQuotes([
    { id: 'c1', sections: [section('s1', ['قال: «نص', 'بقية النص».']), section('s2', ['«بداية'])] },
    { id: 'c2', sections: [section('s3', ['نهاية»'])] },
  ]);
  assert.equal(r.chapter.pairs.length, 1);
  assert.equal(r.chapter.pairs[0].crossesPassages, true);
  assert.equal(r.chapter.unmatchedOpening.length, 1);
  assert.equal(r.chapter.unmatchedClosing.length, 1);
  assert.equal(r.book.pairs.length, 2);
  assert.equal(r.book.pairs[1].crossesChapters, true);
});
