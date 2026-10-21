import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { shifaContent } from '../src/content/al-shifa/index.ts';
import { readerDisplayText } from '../src/lib/reader-display-text.ts';
import { readerEditorialOverrides } from '../src/lib/reader-editorial-overrides.ts';
import { IntroOutlinePassage } from '../src/components/reader/intro-outline.ts';
import { sourcePeriodPresentation, inspectPunctuation } from '../scripts/audit-shifa-punctuation.mjs';

const load=name=>JSON.parse(readFileSync(new URL(`../reports/al-shifa-integrity/${name}`,import.meta.url),'utf8'));
test('source-run repair is based on contiguous source periods and does not erase or invent marks',()=>{
  const source={text:'نص. . . ثم نص. .',fragments:[{line:1,text:'نص... ثم نص..'}]};
  assert.equal(sourcePeriodPresentation(source),'نص... ثم نص..');
  assert.equal(sourcePeriodPresentation({text:'نص. . ثم نص',fragments:[{line:1,text:'نص. . ثم نص'}]}),'نص. . ثم نص');
});
test('all stored text, diacritics, citations, chapter/section/passage IDs and order equal the untouched starting dataset',()=>{
  assert.deepEqual(shifaContent,load('punctuation-original-content.json'));
  assert.equal(shifaContent.chapters.flatMap(c=>c.sections.flatMap(s=>s.passages)).length,4831);
});
test('both screenshot examples retain valid colons/list markers and display verified repairs',()=>{
  const chapter=shifaContent.chapters.find(c=>c.slug==='qism-1-bab-2');
  const get=id=>chapter.sections.flatMap(s=>s.passages).find(p=>p.id.endsWith(id));
  const render=p=>renderToStaticMarkup(createElement(IntroOutlinePassage,{chapterId:chapter.id,passage:{id:p.id,text:p.originalText,kind:'original'}}));
  const classification=get('sec-01-002'); const html=render(classification);
  assert(html.includes('دنيوي...'));
  assert(html.includes('reader-inline-enumeration'));
  assert.equal((html.match(/role="listitem"/g)||[]).length,2);
  assert(html.includes('الدنيا'));
  assert(html.includes('مكتسب'));
  assert(html.includes('فنين أيضا:'));
  assert.equal((html.match(/data-reader-passage/g)||[]).length,1);
  assert(render(get('sec-03-013')).includes('وقال علي في آخر وصفه له:'));
  for(const id of ['sec-03-009','sec-03-011'])assert(render(get(id)).includes(':'));
  assert(render(get('sec-03-016')).includes('- والأحاديث'));
});
test('presentation rescan matches historical findings apart from separately tested editorial overrides',()=>{
  const copy=structuredClone(shifaContent);
  for(const c of copy.chapters)for(const s of c.sections)for(const p of s.passages)p.originalText=readerDisplayText({id:p.id,text:p.originalText,kind:'original'});
  const scan=inspectPunctuation(copy.chapters),summary=load('punctuation-summary.json');
  assert.equal(scan.quoteScan.counts.closing,summary.afterDelimiters.guillemets.closing);
  assert.equal(scan.findings.filter(f=>f.category==='spaced-period-run').length,0);
  // Keep the historical audit unchanged. Later explicit editorial choices have
  // their own exact-text regression tests and are excluded on both sides.
  const canonical=findings=>findings.filter(f=>f.category!=='verified-parenthetical-continuation' && !readerEditorialOverrides[f.passageId]).map(({passageId,category,exactText})=>({passageId,category,exactText}));
  assert.deepEqual(canonical(scan.findings),canonical(load('punctuation-post-findings.json')));
});
test('Arabic, Western and parenthetical quotations can continue across passage boundaries',()=>{
  const content=[{id:'c',sections:[{id:'s',passages:[
    {id:'p1',originalText:'«عربي “غربي "قول (نص'},
    {id:'p2',originalText:'تكملة) قول" غربي” عربي»'},
  ]}]}];
  const result=inspectPunctuation(content);
  for(const key of ['parentheses','western-double','straight-double']){
    assert.equal(result.delimiterInventory[key].unmatched.length,0);
    assert.equal(result.delimiterInventory[key].crossingPassagePairs,1);
  }
  assert.equal(result.quoteScan.chapter.unmatchedOpening.length,0);
  assert.equal(result.quoteScan.chapter.unmatchedClosing.length,0);
});
