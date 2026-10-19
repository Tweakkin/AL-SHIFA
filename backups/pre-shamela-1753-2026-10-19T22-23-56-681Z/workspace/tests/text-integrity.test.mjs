import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { shifaContent } from '../src/content/al-shifa/index.ts';
import { runAudit } from '../scripts/audit-al-shifa.mjs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IntroOutlinePassage } from '../src/components/reader/intro-outline.ts';

const report = path => JSON.parse(readFileSync(new URL(`../reports/al-shifa-integrity/${path}`, import.meta.url), 'utf8'));

test('all original wording, hierarchy, IDs and ordering survive the citation-only corrections', () => {
  const original = report('original-content.json');
  const corrections = report('corrections.json');
  assert.equal(new Set(corrections.map(c => c.passageId)).size, corrections.length);
  assert.equal(corrections.length, 4480);
  const byId = new Map(corrections.map(c => [c.passageId, c]));
  for (const chapter of original.chapters) for (const section of chapter.sections) for (const passage of section.passages) {
    const correction = byId.get(passage.id);
    if (correction) {
      assert.equal(correction.field, 'source.locator');
      assert.equal(passage.source.locator, correction.original);
      passage.source.locator = correction.corrected;
    }
  }
  assert.deepEqual(shifaContent, original);
  const baseline = report('original-content.json');
  for (let index = 0; index < shifaContent.chapters.length; index++) {
    const currentChapter = shifaContent.chapters[index];
    const current = currentChapter.sections.flatMap(s => s.passages).find(p => byId.has(p.id));
    if (!current) continue;
    const previous = baseline.chapters[index].sections.flatMap(s => s.passages).find(p => p.id === current.id);
    const render = p => renderToStaticMarkup(createElement(IntroOutlinePassage, {
      chapterId: currentChapter.id, passage: { id: p.id, text: p.originalText, kind: 'original' },
    }));
    assert.equal(render(current), render(previous), current.id);
  }
});

test('preserved raw source matches the pinned official transcription after line-ending normalization', () => {
  const source = readFileSync(new URL('../scratch/shifa_raw.txt', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  const verification = report('source-verification.json');
  assert.equal(createHash('sha256').update(source).digest('hex'), verification.remoteSha256);
  assert.equal(verification.sameText, true);
});

test('full independent import replay preserves every expected passage and verifies corrected page references', () => {
  const { summary, findings } = runAudit({ write: false });
  assert.deepEqual(summary.scope, { divisions: 4, chapters: 14, sections: 170, passages: 4831, rawLines: 13047 });
  assert.equal(summary.structuralState.replayMatches, true);
  assert.equal(summary.structuralState.titleMatches, true);
  assert.equal(summary.structuralState.idsOrdered, true);
  assert.equal(summary.structuralState.citationsMatchingFirstSourcePage, 4828);
  assert.equal(summary.structuralState.citationsDifferingFromFirstSourcePage, 0);
  assert.deepEqual(summary.omittedLines, []);
  assert.equal(findings.filter(f => f.classification === 'confirmed-error').length, 0);
  assert.equal(findings.filter(f => f.category === 'unbounded-final-source-page').length, 3);
});

test('scanner detects injected corruption instead of silently accepting its baseline', () => {
  const fixture = structuredClone(shifaContent);
  const first = fixture.chapters[0].sections[0].passages[0];
  first.originalText = '� Latin &amp; \\u0644 \u202E ( « [ { " \u064E نص نص لاعدما. هذا نص اختباري طويل لا ينتمي إلى الكتاب. هذا نص اختباري طويل لا ينتمي إلى الكتاب.';
  first.source.locator = 'ج 99، ص 99';
  fixture.chapters[0].sections[0].passages[1].originalText = '';
  const { findings } = runAudit({ content: fixture, write: false });
  for (const category of ['replacement-character', 'latin-or-import-marker', 'literal-html-entity', 'literal-escape-or-markup',
    'unicode-control-or-direction-mark', 'orphan-or-repeated-diacritic', 'unbalanced-guillemets', 'unbalanced-parentheses',
    'unbalanced-square-brackets', 'unbalanced-curly-brackets', 'unbalanced-straight-quotes', 'possible-duplicated-sentence',
    'empty-text', 'import-text-mismatch', 'source-page-locator-mismatch', 'possible-joined-arabic-word']) {
    assert.ok(findings.some(f => f.category === category), category);
  }
  assert.notEqual(shifaContent.chapters[0].sections[0].passages[0].originalText, first.originalText);
});
