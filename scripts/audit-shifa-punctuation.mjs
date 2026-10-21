import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { shifaContent } from '../src/content/al-shifa/index.ts';
import { runAudit } from './audit-al-shifa.mjs';
import { inspectQuotes } from './inspect-reader-quotes.mjs';

const directory = 'reports/al-shifa-integrity';
const sha = text => createHash('sha256').update(text).digest('hex');
const clean = text => text.replace(/\bms\d+\b/gu, ' ').replace(/«\s*\d+\s*»/gu, ' ')
  .replace(/«\s*»/gu, ' ').replace(/\s+([،؛.؟!:])/gu, '$1')
  .replace(/([،؛.؟!:])(?=[^\s\d»\)])/gu, '$1 ').replace(/\s{2,}/gu, ' ').trim();

// Reproduce the legacy cleaning while shielding ONLY period runs that are
// contiguous in the actual source fragments. No prose or punctuation is guessed.
export function sourcePeriodPresentation(source) {
  const runs = [];
  const protectedText = source.fragments.map(f => f.text).join(' ')
    .replace(/\.{2,}/gu, match => { runs.push(match); return `.\uE000${runs.length - 1}\uE001`; })
    .replace(/\uE001(?=[\p{L}])/gu, '\uE001 ');
  const text = clean(protectedText).replace(/\. ?\uE000(\d+)\uE001/gu, (_, index) => runs[+index]);
  if (text.replace(/\s/gu, '') !== source.text.replace(/\s/gu, '')) throw Error('Non-whitespace change in source-period replay');
  return text;
}

const manual = [
  { id: 'muqaddima:passage:sec-01-001', from: 'الظاهر»', to: 'الظاهر', url: 'https://shamela.ws/book/23645/20', note: 7, prior: true },
  { id: 'muqaddima:passage:sec-01-009', from: 'بصدده»', to: 'بصدده', url: 'https://shamela.ws/book/23645/27', note: 2 },
  { id: 'muqaddima:passage:sec-01-020', from: 'لموعدته»', to: 'لموعدته', url: 'https://shamela.ws/book/23645/31', note: 3 },
  { id: 'qism-1-bab-2:passage:sec-03-013', from: 'وقال»', to: 'وقال', url: 'https://shamela.ws/book/23645/138', note: 6 },
].map(item => ({ ...item, id: `al-shifa:chapter:${item.id}` }));
const classificationId = 'al-shifa:chapter:qism-1-bab-2:passage:sec-01-002';

function whitespaceEdits(original, shown) {
  let i = 0, j = 0; const edits = [];
  while (i < original.length || j < shown.length) {
    if (/\s/u.test(original[i] ?? '') || /\s/u.test(shown[j] ?? '')) {
      const start = i, targetStart = j;
      while (i < original.length && /\s/u.test(original[i])) i++;
      while (j < shown.length && /\s/u.test(shown[j])) j++;
      if (original.slice(start, i) !== shown.slice(targetStart, j)) edits.push({ offset: start, from: original.slice(start, i), to: shown.slice(targetStart, j) });
    } else {
      if (original[i] !== shown[j]) throw Error('Unexpected non-whitespace source difference');
      i++; j++;
    }
  }
  return edits;
}

export function applyEdits(text, changes) {
  for (const change of [...changes].sort((a,b) => b.offset - a.offset)) {
    if (text.slice(change.offset, change.offset + change.from.length) !== change.from) throw Error('Edit context mismatch');
    text = text.slice(0, change.offset) + change.to + text.slice(change.offset + change.from.length);
  }
  return text;
}

export function inspectPunctuation(chapters) {
  const findings = [], occurrences = [];
  const quoteScan = inspectQuotes(chapters);
  const quoteByPassage = new Map();
  for (const i of quoteScan.suspiciousOccurrences) {
    const e = quoteScan.occurrences[i];
    if (!quoteByPassage.has(e.passageId)) quoteByPassage.set(e.passageId, []);
    quoteByPassage.get(e.passageId).push({ offset: e.offset, text: e.mark });
  }
  const delimiterInventory = {};
  const bracketsByPassage = new Map();
  for (const [label, opening, closing] of [['parentheses','(',')'],['square','[',']'],['curly','{','}'],['western-double','“','”'],['western-single','‘','’'],['straight-double','"','"'],['straight-single',"'","'"]]) {
    let pairs = 0, crossingPassagePairs = 0; const unmatched = [], crossPairs = [];
    for (const chapter of chapters) {
      const stack = [];
      for (const section of chapter.sections) for (const passage of section.passages) {
        for (let offset=0;offset<passage.originalText.length;offset++) {
          const text=passage.originalText[offset]; const e={passageId:passage.id,offset,text};
          if (text===opening && (opening!==closing || !stack.length)) { stack.push(e); continue; }
          if (text===closing) {
            if (stack.length) { const start=stack.pop();pairs++;if(start.passageId!==passage.id){crossingPassagePairs++;crossPairs.push({opening:start,closing:e});} }
            else unmatched.push(e);
          }
        }
      }
      unmatched.push(...stack);
    }
    for (const e of unmatched) { if(!bracketsByPassage.has(e.passageId))bracketsByPassage.set(e.passageId,[]);bracketsByPassage.get(e.passageId).push({...e,label}); }
    delimiterInventory[label]={pairs,crossingPassagePairs,unmatched,crossPairs};
  }
  const checks = [
    ['leading-punctuation', /^[\-–—:،؛.,!?؟»]+\s*/gu],
    ['trailing-colon-or-delimiter', /[:،؛«\-–—]\s*$/gu],
    ['spaced-period-run', /\.(?:\s+\.)+/gu],
    ['repeated-nonperiod-punctuation', /[،؛:!?؟](?:\s*[،؛:!?؟])+/gu],
    ['mixed-colon-punctuation', /[،؛.]\s*:|:\s*[،؛.]/gu],
    ['dash-touching-word', /[\p{Script=Arabic}\p{M}][\-–—]|[\-–—][\p{Script=Arabic}\p{M}]/gu],
    ['punctuation-space', /\s+[،؛؟!:]|[،؛؟!:](?=[\p{L}])/gu],
    ['encoding-or-hidden-control', /\uFFFD|[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]|&(?:#\d+|[a-z]+);|\\u[\da-f]{4}/giu],
  ];
  for (const chapter of chapters) for (const section of chapter.sections) for (const passage of section.passages) {
    const add=(category,matches)=>findings.push({passageId:passage.id,chapterId:chapter.id,sectionId:section.id,category,exactText:passage.originalText,source:passage.source,matches,classification:'unresolved'});
    for(const [category,regex]of checks){const matches=[...passage.originalText.matchAll(regex)].map(m=>({offset:m.index,text:m[0]}));if(matches.length)add(category,matches);}
    if(quoteByPassage.has(passage.id))add('quotation-boundary-review',quoteByPassage.get(passage.id));
    if(bracketsByPassage.has(passage.id))add('unmatched-delimiter',bracketsByPassage.get(passage.id));
    // Symmetric Western marks are paired across passages above, not independently
    // within every paragraph. Apostrophes remain candidates, never auto-corrections.
    if(passage.originalText==='***')add('source-separator',[{offset:0,text:'***'}]);
    for(const m of passage.originalText.matchAll(/[«»"'“”‘’()[\]{}:;؛،,!?؟.\-–—]/gu))occurrences.push({passageId:passage.id,offset:m.index,text:m[0]});
  }
  return {findings,occurrences,quoteScan,delimiterInventory};
}

export async function runPunctuationAudit() {
  const baselinePath=`${directory}/punctuation-original-content.json`;
  if(!fs.existsSync(baselinePath))fs.writeFileSync(baselinePath,JSON.stringify(shifaContent,null,2)+'\n');
  if(JSON.stringify(JSON.parse(fs.readFileSync(baselinePath,'utf8')))!==JSON.stringify(shifaContent))throw Error('Current dataset differs from the frozen baseline; review before continuing');
  const {summary:legacySummary,findings:legacyFindings,sourceMap}=runAudit({write:false,includeSourceMap:true});
  if(!legacySummary.structuralState.replayMatches||!legacySummary.structuralState.idsOrdered)throw Error('Source replay/order failed');
  const corrections=[],rules={},visible=structuredClone(shifaContent),plans=new Map();
  for(const chapter of shifaContent.chapters)for(const section of chapter.sections)for(const passage of section.passages){
    const source=sourceMap.get(passage.id);const periodText=sourcePeriodPresentation(source);
    const changes=whitespaceEdits(passage.originalText,periodText);const reasons=[];const evidence=[];
    if(changes.length){reasons.push('Restore contiguous source period runs split by legacy spacing regex; retain every period.');evidence.push({kind:'mechanical-source-replay',sourceLines:source.fragments.map(f=>f.line),rawText:source.fragments.map(f=>f.text).join('\n')});}
    const decision=manual.find(m=>m.id===passage.id);
    if(decision){const offset=passage.originalText.indexOf(decision.from);if(offset<0||passage.originalText.indexOf(decision.from,offset+1)>=0)throw Error('Manual target not unique');changes.push({offset:offset+decision.from.length-1,from:'»',to:''});reasons.push('Remove only the remnant of a numbered note marker; not a genuine quoted-text boundary.');evidence.push({kind:'numbered-note-evidence',url:decision.url,note:decision.note,previouslyApplied:!!decision.prior,sourceLines:source.fragments.map(f=>f.line),rawText:source.fragments.map(f=>f.text).join('\n'),referenceEvidenceFile:'punctuation-reference-evidence.json',detail:'The stray closer occupies the missing numeric note slot; the corresponding note and its adjacent numbered markers identify the apparatus.'});}
    if(passage.id===classificationId){const offset=passage.originalText.indexOf('الدنيا- مكتسب')+'الدنيا'.length;if(offset<6)throw Error('Classification boundary missing');changes.push({offset,from:'',to:'\n'});reasons.push('Separate the two explicitly named types after نوعان visually within the same passage; retain both dash markers and all wording.');evidence.push({kind:'verified-display-grouping',url:'https://shamela.ws/book/23645/127'});}
    if(!changes.length)continue;
    changes.sort((a,b)=>a.offset-b.offset);const shown=applyEdits(passage.originalText,changes);
    // No letters, diacritics, digits or other original punctuation can change.
    const letters=x=>x.replace(/[\s»]/gu,'');if(letters(shown)!==letters(passage.originalText))throw Error('Content changed');
    const guarded=changes.map(change=>{const start=Math.max(0,change.offset-24),end=Math.min(passage.originalText.length,change.offset+change.from.length+24);return {...change,contextStart:start,context:passage.originalText.slice(start,end)};});
    rules[passage.id]={sourceLength:passage.originalText.length,changes:guarded};plans.set(passage.id,{changes,period:periodText!==passage.originalText,manual:!!decision});
    corrections.push({passageId:passage.id,type:'display-only',originalText:passage.originalText,correctedText:shown,changes,reasons,evidence,source:passage.source});
  }
  const generated=`// Generated from source-verified punctuation corrections. See reports/al-shifa-integrity/PUNCTUATION-REPORT.md.\nexport type ReaderPunctuationErratum = { sourceLength: number; changes: readonly { offset: number; from: string; to: string; contextStart: number; context: string }[] };\nexport const readerPunctuationErrata: Readonly<Record<string, ReaderPunctuationErratum>> = ${JSON.stringify(rules)};\n`;
  fs.writeFileSync('src/lib/reader-punctuation-errata.ts',generated);
  for(const c of visible.chapters)for(const s of c.sections)for(const p of s.passages)if(plans.has(p.id))p.originalText=applyEdits(p.originalText,plans.get(p.id).changes);
  const before=inspectPunctuation(shifaContent.chapters),after=inspectPunctuation(visible.chapters);
  const addEvidence=scan=>{for(const f of scan.findings){const source=sourceMap.get(f.passageId);f.evidence={origin:'inherited-digital-reading-after-legacy-cleaning',sourceLines:source.fragments.map(x=>x.line),rawText:source.fragments.map(x=>x.text).join('\n'),replayText:source.text};}};
  addEvidence(before);addEvidence(after);
  // Specific source-verified features, never a blanket rule for all dashes/colons.
  const knownColons=new Set(['qism-1-bab-2:passage:sec-01-001','qism-1-bab-2:passage:sec-01-002','qism-1-bab-2:passage:sec-01-003','qism-1-bab-2:passage:sec-03-009','qism-1-bab-2:passage:sec-03-011','qism-1-bab-2:passage:sec-03-013'].map(x=>'al-shifa:chapter:'+x));
  const knownDash=new Set(['sec-01-002','sec-03-016','sec-03-017','sec-03-018'].map(x=>'al-shifa:chapter:qism-1-bab-2:passage:'+x));
  // Retain the six source-verified parenthetical continuations from the old audit.
  for (const prior of legacyFindings.filter(f=>f.category==='unbalanced-parentheses'&&f.classification==='legitimate-source-feature')) {
    before.findings.push({passageId:prior.passageId,chapterId:prior.chapter,sectionId:prior.sectionId,category:'verified-parenthetical-continuation',exactText:prior.exactText,source:prior.sourceReference,matches:[],classification:'legitimate-source-feature',evidence:prior.evidence});
    after.findings.push({...before.findings.at(-1)});
  }
  for(const f of before.findings){
    const plan=plans.get(f.passageId);
    if((f.category==='spaced-period-run'&&plan?.period)||(f.category==='quotation-boundary-review'&&plan?.manual&&f.matches.every(m=>plan.changes.some(c=>c.offset===m.offset&&c.from==='»'))))f.classification='corrected-display';
    else if(f.category==='source-separator'||(f.category==='trailing-colon-or-delimiter'&&knownColons.has(f.passageId))||(f.category==='leading-punctuation'&&knownDash.has(f.passageId)))f.classification='legitimate-source-feature';
  }
  // Carry source/reference decisions forward without claiming all mechanical pairs valid.
  for(const f of after.findings){const prior=before.findings.find(p=>p.passageId===f.passageId&&p.category===f.category);if(prior?.classification==='legitimate-source-feature')f.classification=prior.classification;}
  for(const f of before.findings)if(f.classification==='unresolved'&&plans.has(f.passageId)&&!after.findings.some(p=>p.passageId===f.passageId&&p.category===f.category))f.classification='corrected-display';
  const rawLines=fs.readFileSync('scratch/shifa_raw.txt','utf8').split(/\r?\n/u);
  const segmentationReview=[];
  for(const [passageId,source]of sourceMap){const joined=source.fragments.slice(1).filter(f=>/^#(?!##)/u.test(rawLines[f.line-1]));if(joined.length)segmentationReview.push({passageId,exactText:source.text,joinedSourceParagraphStarts:joined.map(f=>({line:f.line,text:f.text})),sourceLines:source.fragments.map(f=>f.line),classification:'unresolved-presentation-adequacy',note:'Existing source paragraphs merged by the documented importer. All words are accounted for; this is not evidence to invent or delete content.'});}
  const categories={};for(const f of before.findings){categories[f.category]??={detected:0,corrected:0,legitimate:0,unresolved:0};const bucket=categories[f.category];bucket.detected++;bucket[f.classification==='corrected-display'?'corrected':f.classification==='legitimate-source-feature'?'legitimate':'unresolved']++;}
  const classifications={};for(const f of before.findings)classifications[f.classification]=(classifications[f.classification]||0)+1;
  const summary={date:'2026-10-20',scope:legacySummary.scope,originalDatasetSha256:sha(JSON.stringify(shifaContent)),rawSourceSha256:legacySummary.hashes.rawSha256,
    classifications,categories,totalFindingRecords:before.findings.length,distinctFlaggedPassages:new Set(before.findings.map(f=>f.passageId)).size,
    correctedPassages:corrections.length,periodSpacingPassages:[...plans.values()].filter(p=>p.period).length,damagedMarkerRepairs:manual.length,newDamagedMarkerRepairs:manual.filter(m=>!m.prior).length,
    presentationGroupingRepairs:1,contentCorrections:0,sourceReplay:legacySummary.structuralState,
    remainingFindingRecords:after.findings.length,remainingUnresolvedRecords:after.findings.filter(f=>f.classification==='unresolved').length,
    beforeDelimiters:{guillemets:before.quoteScan.counts,chapterOpen:before.quoteScan.chapter.unmatchedOpening.length,chapterClose:before.quoteScan.chapter.unmatchedClosing.length},
    afterDelimiters:{guillemets:after.quoteScan.counts,chapterOpen:after.quoteScan.chapter.unmatchedOpening.length,chapterClose:after.quoteScan.chapter.unmatchedClosing.length},
    segmentation:{mergedSourceParagraphStarts:legacySummary.inventory.mergedSourceParagraphStarts,reviewPassages:segmentationReview.length,policy:legacySummary.inventory.paragraphPolicy,separatelyInventoriedNotAddedToPunctuationCounts:true},
    oldAudit:{findingRecords:legacyFindings.length,unresolved:legacyFindings.filter(f=>f.classification==='unresolved').length,notAddedToNewCounts:true}};
  const save=(name,value)=>fs.writeFileSync(`${directory}/${name}`,JSON.stringify(value,null,2)+'\n');
  save('punctuation-corrections.json',corrections);save('punctuation-findings.json',before.findings);save('punctuation-post-findings.json',after.findings);save('punctuation-summary.json',summary);
  save('punctuation-segmentation-review.json',segmentationReview);
  save('punctuation-occurrences.json',{source:before.occurrences,quoteOccurrences:before.quoteScan.occurrences,postQuoteOccurrences:after.quoteScan.occurrences,chapterQuotePairs:before.quoteScan.chapter,bookQuotePairs:before.quoteScan.book,postChapterQuotePairs:after.quoteScan.chapter,postBookQuotePairs:after.quoteScan.book,otherDelimiters:before.delimiterInventory,postOtherDelimiters:after.delimiterInventory});
  return summary;
}

if(process.argv[1]?.endsWith('audit-shifa-punctuation.mjs'))console.log(JSON.stringify(await runPunctuationAudit(),null,2));
