import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { shifaContent } from '../src/content/al-shifa/index.ts';

export function runAudit({ content = shifaContent, write = true, includeSourceMap = false } = {}) {
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'reports/al-shifa-integrity');
const read = path => readFileSync(resolve(root, path), 'utf8');
const sha256 = text => createHash('sha256').update(text).digest('hex');
const raw = read('scratch/shifa_raw.txt');
const lines = raw.replaceAll('\r\n', '\n').split('\n');
if (lines.at(-1) === '') lines.pop();
const importer = read('scratch/test_full_generation.py');
const correctionsPath = resolve(output, 'corrections.json');
const priorCorrections = existsSync(correctionsPath) ? JSON.parse(readFileSync(correctionsPath, 'utf8')) : [];
const definitions = [...importer.slice(0, importer.indexOf('def clean_heading_title')).matchAll(/\{\s*"index":\s*(\d+),\s*"slug":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"start":\s*(\d+),\s*"end":\s*(\d+|len\(raw_lines\)),\s*\}/gu)]
  .map(([, index, slug, title, start, end]) => ({ index: +index, slug, title, start: +start, end: end.startsWith('len') ? lines.length : +end }));
if (definitions.length !== 14) throw Error('Import manifest changed; review parser before auditing.');

function cleanImportText(text) {
  return text.replace(/\bms\d+\b/gu, ' ').replace(/«\s*\d+\s*»/gu, ' ')
    .replace(/«\s*»/gu, ' ').replace(/\s+([،؛.؟!:])/gu, '$1')
    .replace(/([،؛.؟!:])(?=[^\s\d»\)])/gu, '$1 ').replace(/\s{2,}/gu, ' ').trim();
}
const cleanHeading = text => text.replace(/^###\s*\|*\s*/u, '').replace(/\bms\d+\b/gu, '').replace(/«\s*\d+\s*»/gu, '').replace(/\s+/gu, ' ').trim();
const pageAtLine = new Map();
let nextPage = null;
for (let i = lines.length - 1; i >= 0; i--) {
  const markers = [...lines[i].matchAll(/PageV(\d+)P(\d+)/gu)];
  if (markers.length) nextPage = { volume: +markers[0][1], page: +markers[0][2] };
  pageAtLine.set(i + 1, nextPage);
}
let volume = 1, page = 25;
const usedLines = new Set();
const expected = [];
const shadowedHeadings = [];
for (const definition of definitions) {
  const sections = [];
  let title = '', headingLine = null, body = [];
  const hasBody = (rows, excludeBasmala) => rows.some(({ text }) => {
    const t = text.replace(/^[#~ ]+/u, '').trim();
    return t && !(excludeBasmala && text.trim() === '# (بسم الله الرحمن الرحيم)') && !/^#\s*PageV\d+P\d+\s*$/u.test(text);
  });
  const flushSection = () => {
    const passages = [];
    let current = '', fragments = [], locator = null;
    const flushPassage = () => {
      const cleaned = cleanImportText(current);
      if (cleaned) {
        passages.push({ text: cleaned, locator, fragments, firstPage: pageAtLine.get(fragments[0]?.line) });
        fragments.forEach(fragment => usedLines.add(fragment.line));
      }
    };
    for (const row of body) {
      if (row.text.startsWith('###')) continue;
      const matches = [...row.text.matchAll(/PageV(\d+)P(\d+)/gu)];
      if (matches.length) { volume = +matches.at(-1)[1]; page = +matches.at(-1)[2]; }
      const cleanedLine = row.text.replace(/PageV\d+P\d+/gu, '').trim();
      if (!cleanedLine) continue;
      let continuation = false, content = cleanedLine;
      if (row.text.startsWith('~~')) { continuation = true; content = cleanedLine.replace(/^~+/u, '').trim(); }
      else if (row.text.startsWith('#')) {
        content = cleanedLine.replace(/^#+/u, '').trim();
        const previous = current.replace(/[ »"']+$/u, '');
        if (previous && !/[.:؟!؛]$/u.test(previous)) continuation = true;
      } else continuation = true;
      if (continuation && current) { current += ' ' + content; fragments.push({ line: row.line, text: content }); }
      else { flushPassage(); current = content; fragments = [{ line: row.line, text: content }]; locator = `ج ${volume}، ص ${page}`; }
    }
    flushPassage();
    if (passages.length) sections.push({ title, headingLine, passages });
  };
  for (let i = definition.start - 1; i < definition.end; i++) {
    if (lines[i].startsWith('###')) {
      if (hasBody(body, true) && title) { flushSection(); body = []; }
      else if (title) shadowedHeadings.push({ chapter: definition.slug, title, sourceLine: headingLine, nextHeading: cleanHeading(lines[i]) });
      title = cleanHeading(lines[i]); headingLine = i + 1;
    } else body.push({ line: i + 1, text: lines[i] });
  }
  if (hasBody(body, false) && title) flushSection();
  expected.push({ ...definition, sections });
}

const findings = [];
const add = (category, location, exactText, evidence = {}, classification = 'unresolved') => {
  findings.push({ id: `SHIFA-${String(findings.length + 1).padStart(5, '0')}`, category, classification,
    chapter: location.chapter ?? null, chapterTitle: location.chapterTitle ?? null,
    sectionId: location.sectionId ?? null, sectionTitle: location.sectionTitle ?? null,
    passageId: location.passageId ?? null, exactText, sourceReference: location.source ?? null,
    origin: evidence.origin ?? 'undetermined', evidence,
    suggestedInvestigation: classification === 'legitimate-source-feature' ? 'Retain; this is documented source apparatus.'
      : classification === 'confirmed-error' ? 'Correct only the demonstrated mismatch and log before/after evidence.'
      : 'Compare the cited raw lines with the printed edition; source inheritance alone does not prove correctness.' });
};
const counts = {};
const ids = new Set();
const texts = new Map();
const chapterSummary = [];
const sourceMap = new Map();
const canonical = [];
const structuralState = { replayMatches: true, titleMatches: true, idsOrdered: true, citationsMatchingFirstSourcePage: 0, citationsDifferingFromFirstSourcePage: 0 };
let sectionCount = 0, passageCount = 0;
const scanDelimiters = (text, location, evidence) => {
  for (const [label, open, close] of [['guillemets', '«', '»'], ['parentheses', '(', ')'], ['square-brackets', '[', ']'], ['curly-brackets', '{', '}']]) {
    const opens = [...text].filter(c => c === open).length, closes = [...text].filter(c => c === close).length;
    let depth = 0, premature = false;
    for (const c of text) { if (c === open) depth++; if (c === close && --depth < 0) premature = true; }
    if (opens !== closes || premature) add(`unbalanced-${label}`, location, text, { ...evidence, opens, closes, prematureClosing: premature });
  }
  if ((text.match(/"/gu) || []).length % 2) add('unbalanced-straight-quotes', location, text, evidence);
};
const inspect = (text, location, evidence, includeProseChecks = true) => {
  scanDelimiters(text, location, evidence);
  const checks = [
    ['replacement-character', /\uFFFD/gu],
    ['unicode-control-or-direction-mark', /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/gu],
    ['arabic-presentation-form', /[\uFB50-\uFDFF\uFE70-\uFEFF]/gu],
    ['literal-html-entity', /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/giu],
    ['literal-escape-or-markup', /\\(?:[nrt"\\]|u[0-9a-f]{4}|x[0-9a-f]{2})|<\/?[a-z][^>]*>/giu],
    ['latin-or-import-marker', /[A-Za-z]+(?:\d+)?/gu],
    ['non-arabic-unexpected-symbol', /[^\p{Script=Arabic}\p{M}\p{N}\p{P}\p{Z}\sA-Za-z]/gu],
    ['orphan-or-repeated-diacritic', /(?:^|\s)[\u064B-\u065F\u0670]+|([\u064B-\u065F\u0670])\1/gu],
    ['possible-missing-punctuation-space', /[،؛؟!:](?=[\p{Script=Arabic}\p{L}])/gu],
    // Narrow review lexicon only; Arabic word boundaries cannot be safely
    // reconstructed by a general whitespace regex.
    ['possible-joined-arabic-word', /(?<![\p{Script=Arabic}\p{M}])(?:لاعدما|لاخفاء)(?![\p{Script=Arabic}\p{M}])/gu],
    ['unusually-long-unbroken-token', /[\p{Script=Arabic}\p{M}]{35,}/gu],
  ];
  for (const [category, pattern] of checks) {
    const matches = [...text.matchAll(pattern)].map(m => ({ text: m[0], offset: m.index }));
    if (matches.length) add(category, location, text, { ...evidence, matches });
  }
  if (!text.trim()) add('empty-text', location, text, evidence, 'confirmed-error');
  if (!includeProseChecks) return;
  const repeated = [...text.matchAll(/([\p{Script=Arabic}\p{M}]{3,})\s+\1(?=$|[^\p{Script=Arabic}\p{M}])/gu)].map(m => ({ text: m[0], offset: m.index }));
  if (repeated.length) add('possible-duplicated-word', location, text, { ...evidence, matches: repeated });
  const sentences = text.split(/[.؟!؛]/u).map(t => t.trim()).filter(t => t.length >= 30);
  const duplicateSentences = [...new Set(sentences.filter((sentence, index) => sentences.indexOf(sentence) !== index))];
  if (duplicateSentences.length) add('possible-duplicated-sentence', location, text, { ...evidence, sentences: duplicateSentences });
  if (text.trim().length < 8 || /(?:\s|^)(?:و|أو|في|من|على|إلى|أن|عن|ثم|قال|قوله)\s*$/u.test(text)) add('possible-truncation-or-fragment', location, text, evidence);
};

const ordinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
  'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون',
  'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون', 'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون', 'التاسع والعشرون', 'الثلاثون'];
for (let ci = 0; ci < content.chapters.length; ci++) {
  const chapter = content.chapters[ci], reference = expected[ci];
  const chapterLocation = { chapter: chapter.slug, chapterTitle: chapter.title, source: chapter.source };
  const checkId = (id, wanted, location) => {
    if (ids.has(id)) add('duplicate-id', location, id, {}, 'confirmed-error');
    ids.add(id);
    if (id !== wanted) { structuralState.idsOrdered = false; add('unexpected-id-or-order', location, id, { expected: wanted }, 'confirmed-error'); }
  };
  checkId(chapter.id, `al-shifa:chapter:${reference.slug}`, chapterLocation);
  inspect(chapter.title, chapterLocation, { origin: 'editorial-metadata' }, false);
  if (chapter.slug !== reference.slug || chapter.title !== reference.title) { structuralState.titleMatches = false; add('chapter-manifest-mismatch', chapterLocation, chapter.title, { expected: reference }, 'confirmed-error'); }
  if (chapter.sections.length !== reference.sections.length) add('section-count-mismatch', chapterLocation, String(chapter.sections.length), { expected: reference.sections.length }, 'confirmed-error');
  let chapterPassages = 0;
  let faslNumber = 0;
  chapter.sections.forEach((section, si) => {
    sectionCount++;
    const sectionReference = reference.sections[si];
    const location = { ...chapterLocation, sectionId: section.id, sectionTitle: section.title };
    const sec = `sec-${String(si + 1).padStart(2, '0')}`;
    checkId(section.id, `${chapter.id}:section:${sec}`, location);
    if (!sectionReference) { add('unexpected-section', location, section.title, {}, 'confirmed-error'); return; }
    inspect(section.title, location, { origin: 'digital-source', sourceLines: [sectionReference.headingLine], rawText: lines[sectionReference.headingLine - 1] }, false);
    if (section.title.startsWith('الفصل ')) {
      faslNumber++;
      const number = ordinals.map((word, index) => ({ word, number: index + 1 })).sort((a, b) => b.word.length - a.word.length)
        .find(({ word }) => section.title === `الفصل ${word}` || section.title.startsWith(`الفصل ${word} `))?.number;
      if (number !== faslNumber) add('source-section-numbering-discontinuity', location, section.title, { origin: 'digital-source', sequentialPosition: faslNumber, declaredOrdinal: number, sourceLines: [sectionReference.headingLine] });
    }
    if (section.title !== sectionReference.title) add('section-title-mismatch', location, section.title, { expected: sectionReference.title }, 'confirmed-error');
    if (section.passages.length !== sectionReference.passages.length) add('passage-count-mismatch', location, String(section.passages.length), { expected: sectionReference.passages.length }, 'confirmed-error');
    section.passages.forEach((passage, pi) => {
      passageCount++; chapterPassages++;
      const where = { ...location, passageId: passage.id, source: passage.source };
      checkId(passage.id, `${chapter.id}:passage:${sec}-${String(pi + 1).padStart(3, '0')}`, where);
      const original = sectionReference.passages[pi];
      if (!original) { add('unexpected-passage', where, passage.originalText, {}, 'confirmed-error'); return; }
      sourceMap.set(passage.id, original);
      const evidence = { origin: passage.originalText === original.text ? 'inherited-from-digital-source-after-documented-import-cleaning' : 'import-mismatch',
        sourceLines: original.fragments.map(f => f.line), rawText: original.fragments.map(f => f.text).join('\n'), replayText: original.text };
      if (passage.originalText !== original.text) { structuralState.replayMatches = false; add('import-text-mismatch', where, passage.originalText, evidence, 'confirmed-error'); }
      if (original.firstPage) {
        const firstLocator = `ج ${original.firstPage.volume}، ص ${original.firstPage.page}`;
        if (firstLocator !== passage.source.locator) { structuralState.citationsDifferingFromFirstSourcePage++; add('source-page-locator-mismatch', where, passage.originalText, { ...evidence, expectedFirstPage: firstLocator, legacyReplayLocator: original.locator }, 'confirmed-error'); }
        else structuralState.citationsMatchingFirstSourcePage++;
      } else add('unbounded-final-source-page', where, passage.originalText, { ...evidence, note: 'No following page-end marker; do not infer the final page number.' });
      inspect(passage.originalText, where, evidence);
      if (chapter.slug === 'muqaddima' && passage.originalText.startsWith('الباب الثاني:')
          && passage.originalText.indexOf('الباب الثاني:') !== passage.originalText.lastIndexOf('الباب الثاني:')) {
        add('source-outline-label-repetition', where, passage.originalText, { ...evidence, note: 'The introduction names الباب الثاني twice in this passage. Preserve the source reading until print collation establishes a correction.' });
      }
      if (!texts.has(passage.originalText)) texts.set(passage.originalText, []);
      texts.get(passage.originalText).push(where);
      canonical.push({ id: passage.id, text: passage.originalText, source: passage.source });
    });
  });
  const declaredCounts = { 'سبعة وعشرون': 27, 'اثنا عشر': 12, 'ثلاثون': 30, 'خمسة': 5, 'ستة': 6, 'سبعة': 7, 'عشرة': 10, 'ستة عشر': 16, 'تسعة': 9 };
  const chapterHeading = lines.slice(reference.start - 1, reference.end).find(line => /^###\s*\|\|\s*الباب/u.test(line));
  const declaredLabel = chapterHeading?.match(/وفيه (.+?) فصلا/u)?.[1];
  if (declaredCounts[declaredLabel] && declaredCounts[declaredLabel] !== faslNumber) add('source-declared-section-count-discrepancy', chapterLocation, chapterHeading,
    { origin: 'digital-source', declaredCount: declaredCounts[declaredLabel], numberedFaslCount: faslNumber });
  chapterSummary.push({ slug: chapter.slug, title: chapter.title, sections: chapter.sections.length, passages: chapterPassages, sourceLineRange: [reference.start, reference.end] });
}
for (const [text, locations] of texts) if (locations.length > 1) {
  for (const location of locations) add('identical-passage-text', location, text, { origin: 'digital-source-repeat-not-necessarily-an-error', otherPassageIds: locations.filter(l => l !== location).map(l => l.passageId) });
}
const omittedLines = [];
for (const definition of definitions) for (let i = definition.start - 1; i < definition.end; i++) {
  if (!/^(?:#(?!##)|~~)/u.test(lines[i]) || usedLines.has(i + 1)) continue;
  const body = cleanImportText(lines[i].replace(/^[#~]+\s*/u, '').replace(/PageV\d+P\d+/gu, ''));
  if (body) omittedLines.push({ chapter: definition.slug, sourceLine: i + 1, text: body });
}
for (const row of omittedLines) add('unrepresented-source-body-line', { chapter: row.chapter }, row.text, { sourceLines: [row.sourceLine], origin: 'import-coverage' }, 'confirmed-error');
const excludedRanges = [];
let end = 37;
for (const definition of definitions) {
  if (definition.start > end + 1) excludedRanges.push({ start: end + 1, end: definition.start - 1, lines: lines.slice(end, definition.start - 1) });
  end = definition.end;
}
for (const range of excludedRanges) if (range.lines.some(line => line.trim())) add('excluded-source-range', {}, range.lines.join('\n'), { origin: 'explicit-import-range-selection', sourceLines: [range.start, range.end] }, 'legitimate-source-feature');
for (const heading of shadowedHeadings) add('heading-represented-by-following-heading', { chapter: heading.chapter }, heading.title, { origin: 'consecutive-source-headings', ...heading });
// Asterism separators and these explicitly reviewed parenthetical continuations
// are source features, not missing prose. All other candidates stay unresolved.
const parentheticalContinuations = new Set([
  'qism-2-bab-3:sec-04-011', 'qism-2-bab-3:sec-04-012',
  'qism-2-bab-3:sec-04-018', 'qism-2-bab-3:sec-04-019',
  'qism-3-bab-1:sec-16-138', 'qism-3-bab-1:sec-16-139',
]);
for (const finding of findings) {
  const key = finding.passageId?.replace('al-shifa:chapter:', '').replace(':passage:', ':');
  if ((finding.exactText === '***' && ['possible-truncation-or-fragment', 'identical-passage-text'].includes(finding.category))
      || (finding.category === 'unbalanced-parentheses' && parentheticalContinuations.has(key))) {
    finding.classification = 'legitimate-source-feature';
    finding.evidence.review = finding.exactText === '***' ? 'Source typographic separator, not a truncated sentence.' : 'Reviewed adjacent passages continue one parenthetical quotation; no punctuation removal is warranted.';
    finding.suggestedInvestigation = 'Retain the source feature; do not remove text or punctuation.';
  }
}
const totalText = canonical.map(p => p.text).join('\n');
const delimiterTotals = Object.fromEntries(['«', '»', '(', ')', '[', ']', '{', '}', '"'].map(char => [char, [...totalText].filter(c => c === char).length]));
const classifications = {};
for (const finding of findings) { counts[finding.category] = (counts[finding.category] || 0) + 1; classifications[finding.classification] = (classifications[finding.classification] || 0) + 1; }
const inventory = {
  numericFootnoteMarkersRemoved: [...raw.matchAll(/«\s*\d+\s*»/gu)].length,
  milestoneMarkersRemoved: [...raw.matchAll(/\bms\d+\b/gu)].length,
  rawHeadingCount: lines.filter(l => /^###\s/u.test(l)).length,
  includedSourceParagraphStarts: [...usedLines].filter(line => /^#(?!##)/u.test(lines[line - 1])).length,
  mergedSourceParagraphStarts: [...sourceMap.values()].reduce((sum, original) => sum + original.fragments.slice(1).filter(f => /^#(?!##)/u.test(lines[f.line - 1])).length, 0),
  paragraphPolicy: 'The importer joins # paragraphs unless previous text ends in . : ؟ ! ؛; ~~ is always joined. This is not a diplomatic transcription.',
};
const summary = {
  scope: { divisions: new Set(content.chapters.flatMap(c => c.slug.match(/^qism-(\d+)/u)?.[1] ?? [])).size,
    chapters: content.chapters.length, sections: sectionCount, passages: passageCount, rawLines: lines.length },
  hashes: { rawSha256: sha256(Buffer.from(raw)), rawLfSha256: sha256(raw.replaceAll('\r\n', '\n')), importedPassageSnapshotSha256: sha256(JSON.stringify(canonical)) },
  structuralState, chapterSummary, counts, classifications, delimiterTotals, inventory,
  totalFindings: findings.length, confirmedCitationCorrectionsRecorded: priorCorrections.length, omittedLines, shadowedHeadings,
  limitations: ['Comparison is to the selected OpenITI digital transcription, not a page-by-page collation against printed witnesses.',
    'Source-inherited suspicious readings remain unresolved; digitization provenance is not evidence of authentic authorial wording.',
    'The selected Shamela edition explicitly removes isnads; it is not the unabridged authorial text.',
    'Heuristics cannot reliably detect every joined Arabic word, lost sentence, malformed diacritic or source-level omission.',
    'Per-passage quote imbalance can span passages; counts are review candidates rather than proven errors.'],
};
if (!write) return { summary, findings, ...(includeSourceMap ? { sourceMap } : {}) };
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'findings.json'), JSON.stringify(findings, null, 2) + '\n');
writeFileSync(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
if (!existsSync(resolve(output, 'passage-baseline.json'))) writeFileSync(resolve(output, 'passage-baseline.json'), JSON.stringify(canonical, null, 2) + '\n');
if (!existsSync(resolve(output, 'original-content.json'))) writeFileSync(resolve(output, 'original-content.json'), JSON.stringify(content, null, 2) + '\n');
if (process.argv.includes('--apply-confirmed-citations')) {
  const verification = JSON.parse(readFileSync(resolve(output, 'source-verification.json'), 'utf8'));
  if (summary.hashes.rawLfSha256 !== verification.remoteSha256 || !structuralState.replayMatches || !structuralState.idsOrdered) throw Error('Source or inventory changed; do not apply citation corrections without a fresh verified comparison.');
  const corrections = findings.filter(f => f.category === 'source-page-locator-mismatch').map(f => ({
    passageId: f.passageId, field: 'source.locator', original: f.sourceReference.locator, corrected: f.evidence.expectedFirstPage,
    sourceLines: f.evidence.sourceLines, origin: 'confirmed-import-error',
    evidence: 'OpenITI PageVxxPxxx marks the END of a page; use the first following marker for the passage opening, not the preceding marker.',
    rawSourceSha256: summary.hashes.rawLfSha256,
    sourceUrl: 'https://raw.githubusercontent.com/OpenITI/0550AH/a22f6bb581f740ba93c7995ba6900d5e1ef8e47b/data/0544QadiCiyad/0544QadiCiyad.Shifa/0544QadiCiyad.Shifa.Shamela0023645-ara1.completed',
    documentationUrl: 'https://alraqmiyyat.github.io/mARkdown/#--page-numbers',
    reason: 'Correct a page-reference field only; passage wording, IDs and order are unchanged.',
  }));
  const byId = new Map(corrections.map(c => [c.passageId, c]));
  for (let i = 1; i <= definitions.length; i++) {
    const path = resolve(root, `src/content/al-shifa/chapters/chapter-${String(i).padStart(2, '0')}.ts`);
    const before = readFileSync(path, 'utf8');
    const after = before.replace(/("id":\s*"([^"]+:passage:[^"]+)"[\s\S]*?"locator":\s*)"([^"]+)"/gu, (match, prefix, id, locator) => {
      const correction = byId.get(id);
      if (!correction) return match;
      if (correction.original !== locator) throw Error(`Locator changed concurrently: ${id}`);
      return prefix + JSON.stringify(correction.corrected);
    });
    if (after !== before) writeFileSync(path, after);
  }
  writeFileSync(correctionsPath, JSON.stringify([...priorCorrections, ...corrections], null, 2) + '\n');
  console.log(`Corrected ${corrections.length} page locators. Run the scanner again to verify.`);
}
console.log(JSON.stringify({ ...summary, chapterSummary: undefined, shadowedHeadings: undefined, omittedLines: omittedLines.slice(0, 5) }, null, 2));
return { summary, findings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runAudit();
