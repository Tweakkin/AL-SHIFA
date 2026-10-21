import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuotationText, quotationPlan, quotationSpans } from '../src/components/reader/quotation-text.ts';
import { IntroOutlinePassage } from '../src/components/reader/intro-outline.ts';
import { enumerationRuns } from '../src/components/reader/enumerations.ts';
import { PassageList } from '../src/components/reader/passage-list.ts';
import { readerDisplayText } from '../src/lib/reader-display-text.ts';
import { bookContents } from '../src/content/books.ts';
import { contentsGroups } from '../src/components/reader/contents-model.ts';

test('quotation emphasis preserves exact text, symbols and line boundaries', () => {
  const text = 'تمهيد «قول «منقول» محفوظ» ثم «ثانٍ».\nنهاية';
  const html = renderToStaticMarkup(createElement(QuotationText, { text, enabled: true }));
  assert.equal(html, 'تمهيد <strong class="reader-quotation">«قول «منقول» محفوظ»</strong> ثم <strong class="reader-quotation">«ثانٍ»</strong>.<br/>نهاية');
  for (const text of ['قول «غير مغلق', 'قول»', '<<ليس اقتباسًا>>', '«أول» ثم »']) {
    const html = renderToStaticMarkup(createElement(QuotationText, { text, enabled: true }));
    assert(!html.includes('<strong'));
  }
  assert.equal(quotationSpans('«غير مغلق'), null);
});

test('cross-passage quotation context is skipped and reported without speculative boundaries', () => {
  const passages = [{id:'a',text:'«بداية'}, {id:'b',text:'داخل «قول»'}, {id:'c',text:'نهاية»'}, {id:'d',text:'ثم «محفوظ»'}, {id:'e',text:'علامة»'}];
  const before = JSON.stringify(passages);
  const plan = quotationPlan(passages);
  assert.deepEqual([...plan.safe], ['d']);
  assert.deepEqual(plan.review.map(item => item.id), ['a','b','c','e']);
  assert.equal(JSON.stringify(passages), before);
});

test('focus controls preserve source IDs and prose, and never classify prose as headings', () => {
  for (const text of ['قصير', 'ذكر الباب الأول داخل كلام المؤلف. '.repeat(40), 'قال «نص محفوظ».']) {
    const passage = {id:'test:passage',text,kind:'original'};
    const before = JSON.stringify(passage);
    const html = renderToStaticMarkup(createElement(IntroOutlinePassage, {chapterId:'test',passage,focusable:true,emphasizeQuotes:true}));
    assert(html.includes('id="test:passage" data-reader-passage="true"'));
    assert(html.includes('tabindex="0"'));
    assert(html.includes('data-focus-eligible="true"'));
    assert(html.includes('aria-keyshortcuts="Enter Space"'));
    assert(html.includes('data-focus-passage="test:passage"'));
    assert(html.includes('aria-haspopup="dialog"'));
    assert(html.includes('title="تكبير الفقرة"'));
    assert.match(html, /<button[^>]*><svg[^>]*aria-hidden="true"/u);
    assert(!html.includes('>تكبير<'));
    assert(!html.includes('<h'));
    assert.equal(JSON.stringify(passage), before);
  }
  const html = renderToStaticMarkup(createElement(IntroOutlinePassage, {chapterId:'test',passage:{id:'punctuation',text:'***',kind:'original'},focusable:true}));
  assert(!html.includes('<button'));
});

test('reviewed enumerations preserve source text, IDs and order while applying logged display punctuation', () => {
  const chapter = bookContents.find(book => book.bookSlug === 'al-shifa').chapters.find(chapter => chapter.slug === 'qism-1-bab-2');
  const before = JSON.stringify(chapter);
  for (const sectionId of ['sec-01','sec-08']) {
    const section = chapter.sections.find(section => section.id.endsWith(sectionId));
    const passages = section.passages.map(p => ({id:p.id,text:p.originalText,kind:'original'}));
    const runs = enumerationRuns(passages);
    const list = runs.find(run => run.kind === 'list');
    assert.equal(list.items.length, sectionId === 'sec-01' ? 2 : 3);
    assert.deepEqual(runs.flatMap(run => run.kind === 'list' ? run.items.map(item => item.passage) : [run.passage]), passages);
    const html = renderToStaticMarkup(createElement(PassageList, {chapterId:chapter.id,passages,safeQuotes:new Set()}));
    assert(html.includes('<ul class="reader-enumeration" role="list">'));
    for (const passage of passages) {
      const p = html.match(new RegExp(`<p id="${passage.id}"[^>]*>([\\s\\S]*?)</p>`));
      assert(p);
      assert.equal(p[1].replace(/<br\/>/g,'\n').replace(/<[^>]+>/g,''), readerDisplayText(passage));
      assert.equal(html.split(`id="${passage.id}"`).length - 1, 1);
    }
    if (sectionId === 'sec-01') {
      assert(html.includes('ثم هي على فنين أيضا:'));
      assert(html.includes('لأحد الوصفين.'));
      assert(html.includes('فأما الضروري المحض:'));
      assert(html.includes('دنيوي...'));
      assert(html.includes('reader-enumeration-lead'));
    }
    const altered = passages.map(p => ({...p}));
    altered.find(p => p.id === list.items[0].passage.id).text += ' تعديل';
    assert(!enumerationRuns(altered).some(run => run.kind === 'list'));
  }
  assert.equal(JSON.stringify(chapter), before);
  assert.equal(enumerationRuns([{id:'unreviewed',text:'أ- نص: عادي',kind:'original'}])[0].kind,'paragraph');
});

test('the sole editorial colon override is exact, guarded and shared by reader and focused text', () => {
  const id = 'al-shifa:chapter:qism-1-bab-2:passage:sec-01-003';
  const passage = {id,text:'أ- منها ما يتخلص لأحد الوصفين:',kind:'original'};
  const before = JSON.stringify(passage);
  const display = readerDisplayText(passage);
  assert.equal(display, 'أ- منها ما يتخلص لأحد الوصفين.');
  const normal = renderToStaticMarkup(createElement(IntroOutlinePassage, {chapterId:'al-shifa:chapter:qism-1-bab-2',passage,focusable:true,enumerationMarker:'أ-'}));
  // BookReader supplies readerDisplayText results to ParagraphFocus, whose body
  // renders that exact string through the same QuotationText component.
  const focused = renderToStaticMarkup(createElement(QuotationText, {text:display}));
  assert(normal.includes('منها ما يتخلص لأحد الوصفين.'));
  assert.equal(focused, display);
  for (const input of [{...passage,id:'unrelated'}, {...passage,kind:'demonstration'}, {...passage,text:passage.text+' '}, {...passage,text:'أ- منها ما يتخلص لأحد الوصفين: تتمة'}]) {
    assert.equal(readerDisplayText(input), input.text);
  }
  assert.equal(readerDisplayText({id:'lead',text:'ثم هي على فنين أيضا:',kind:'original'}),'ثم هي على فنين أيضا:');
  assert.equal(readerDisplayText({id:'next',text:'ب- ومنها ما يتمازج ويتداخل.',kind:'original'}),'ب- ومنها ما يتمازج ويتداخل.');
  assert.equal(JSON.stringify(passage), before);
});

test('reader contents group divisions and separate identifiers without changing routes or order', () => {
  const book = bookContents.find(book => book.bookSlug === 'al-shifa');
  const before = JSON.stringify(book);
  const groups = contentsGroups(book.chapters);
  assert.deepEqual(groups.map(group => group.division), [null,'القسم الأول','القسم الثاني','القسم الثالث','القسم الرابع']);
  assert.equal(groups[0].entries[0].subject, 'مقدمة المؤلف');
  assert.equal(groups[0].entries[0].identifier, null);
  const entries = groups.flatMap(group => group.entries);
  assert.deepEqual(entries.map(entry => entry.chapter.id), book.chapters.map(chapter => chapter.id));
  assert.deepEqual(entries.map(entry => entry.chapter.slug), book.chapters.map(chapter => chapter.slug));
  assert.deepEqual(entries.map(entry => entry.number), Array.from({length:14},(_,index)=>index+1));
  for (const entry of entries.slice(1)) {
    assert.match(entry.identifier,/^الباب /u);
    assert(!/^القسم |^الباب /u.test(entry.subject));
  }
  const other = contentsGroups([{id:'1',slug:'demo',title:'عنوان تجريبي: وصف'},{id:'2',slug:'different',title:'القسم الأول: الباب الأول: موضوع: تفصيل'}]);
  assert.equal(other[0].entries[0].subject,'عنوان تجريبي: وصف');
  assert.equal(other[1].entries[0].subject,'موضوع: تفصيل');
  assert.equal(JSON.stringify(book),before);
});
