import { shifaContent } from '../src/content/al-shifa/index.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Logical Unicode order, not visual RTL order. Pairing is evidence, not adjudication.
export function inspectQuotes(chapters) {
  const occurrences = [], passages = [];
  for (const chapter of chapters) for (const section of chapter.sections) for (const passage of section.passages) {
    const marks = [...passage.originalText.matchAll(/[«»]/gu)];
    if (marks.length) passages.push({ passageId: passage.id, chapterId: chapter.id, sectionId: section.id,
      opening: marks.filter(m => m[0] === '«').length, closing: marks.filter(m => m[0] === '»').length });
    for (const match of marks) occurrences.push({ index: occurrences.length, chapterId: chapter.id, sectionId: section.id,
      passageId: passage.id, offset: match.index, mark: match[0], source: passage.source,
      context: passage.originalText.slice(Math.max(0, match.index - 80), match.index + 81),
      adjacentSameMark: passage.originalText.slice(Math.max(0, match.index - 4), match.index + 5).includes(match[0] + ' ' + match[0]) });
  }
  const pair = (scope) => {
    let stack = [], current = null;
    const pairs = [], unmatchedClosing = [], nestedOpening = [], sameOrientationConsecutive = [];
    let previous = null;
    for (const event of occurrences) {
      const group = scope === 'book' ? 'book' : event.chapterId;
      if (group !== current) { stack = []; current = group; previous = null; }
      if (previous?.mark === event.mark) sameOrientationConsecutive.push(event.index);
      previous = event;
      if (event.mark === '«') {
        if (stack.length) nestedOpening.push(event.index);
        stack.push(event);
      } else if (stack.length) {
        const open = stack.pop();
        pairs.push({ opening: open.index, closing: event.index, crossesPassages: open.passageId !== event.passageId,
          crossesSections: open.sectionId !== event.sectionId, crossesChapters: open.chapterId !== event.chapterId });
      } else unmatchedClosing.push(event.index);
    }
    const paired = new Set(pairs.flatMap(p => [p.opening, p.closing]));
    return { pairs, unmatchedClosing, unmatchedOpening: occurrences.filter(e => e.mark === '«' && !paired.has(e.index)).map(e => e.index), nestedOpening, sameOrientationConsecutive };
  };
  const book = pair('book'), chapter = pair('chapter');
  const suspicious = new Set([...book.unmatchedOpening, ...book.unmatchedClosing, ...chapter.unmatchedOpening,
    ...chapter.unmatchedClosing, ...book.nestedOpening, ...chapter.nestedOpening,
    ...book.sameOrientationConsecutive, ...chapter.sameOrientationConsecutive]);
  // Include both endpoints of pairs crossing structural boundaries for human review.
  for (const scan of [book, chapter]) for (const p of scan.pairs) if (p.crossesSections || p.crossesChapters) { suspicious.add(p.opening); suspicious.add(p.closing); }
  for (const p of passages) if (p.opening !== p.closing) for (const e of occurrences) if (e.passageId === p.passageId) suspicious.add(e.index);
  return { counts: { opening: occurrences.filter(e => e.mark === '«').length, closing: occurrences.filter(e => e.mark === '»').length,
    occurrences: occurrences.length, passagesWithMarks: passages.length, suspiciousOccurrences: suspicious.size },
    book, chapter, passages, suspiciousOccurrences: [...suspicious].sort((a,b)=>a-b), occurrences,
    sourceTextSha256: createHash('sha256').update(JSON.stringify(chapters)).digest('hex') };
}

if (process.argv[1]?.endsWith('inspect-reader-quotes.mjs')) {
  const report = inspectQuotes(shifaContent.chapters);
  mkdirSync('reports/al-shifa-reader-quotes', { recursive: true });
  writeFileSync('reports/al-shifa-reader-quotes/inventory.json', JSON.stringify(report, null, 2) + '\n');
  const rows = report.suspiciousOccurrences.map(i => {
    const e = report.occurrences[i];
    return { ...e, status: e.passageId === 'al-shifa:chapter:muqaddima:passage:sec-01-001' && e.offset === 94
      ? 'display-only removal, confirmed initial stray closing mark' : 'preserved: needs contextual editorial review' };
  });
  writeFileSync('reports/al-shifa-reader-quotes/review.json', JSON.stringify(rows, null, 2) + '\n');
  console.log(JSON.stringify({ ...report.counts, bookUnmatchedOpening: report.book.unmatchedOpening.length,
    bookUnmatchedClosing: report.book.unmatchedClosing.length, chapterUnmatchedOpening: report.chapter.unmatchedOpening.length,
    chapterUnmatchedClosing: report.chapter.unmatchedClosing.length,
    crossPassagePairs: report.chapter.pairs.filter(p => p.crossesPassages).length }));
}
