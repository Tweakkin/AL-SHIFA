import { createElement, Fragment } from "react";
import { readerDisplayText } from "../../lib/reader-display-text.ts";
import { QuotationText } from "./quotation-text.ts";

export type EnumerationPassage = { id: string; text: string; kind: "original" | "demonstration" };
const chapter = "al-shifa:chapter:qism-1-bab-2:passage:";
const classificationText = "- ضروري دنيوي. . . اقتضته الجبلة وضرورة الحياة الدنيا- مكتسب ديني. . . وهو ما يحمد فاعله ويقرب إلى الله زلفى ثم هي على فنين أيضا:";

// Reviewed against scratch/shifa_raw.txt, lines 955–962 and 1312–1316.
// Exact IDs, lead-ins, sequence and original text must all match. No detection
// based on a colon, hyphen or an Arabic letter elsewhere in the book.
const lists = [
  {
    leadId: `${chapter}sec-01-002`, leadText: classificationText,
    items: [
      { id: `${chapter}sec-01-003`, text: "أ- منها ما يتخلص لأحد الوصفين:", marker: "أ-" },
      { id: `${chapter}sec-01-004`, text: "ب- ومنها ما يتمازج ويتداخل.", marker: "ب-" },
    ],
  },
  {
    leadId: `${chapter}sec-08-001`, leadText: "وأما ما تدعو ضرورة الحياة إليه، مما فصلناه فعلى ثلاثة أضرب:",
    items: [
      { id: `${chapter}sec-08-002`, text: "- ضرب الفضل في قلته.", marker: "-" },
      { id: `${chapter}sec-08-003`, text: "- وضرب الفضل في كثرته.", marker: "-" },
      { id: `${chapter}sec-08-004`, text: "- وضرب تختلف الأحوال فيه. . .", marker: "-" },
    ],
  },
] as const;

type Run = { kind: "paragraph"; passage: EnumerationPassage } | { kind: "list"; items: { passage: EnumerationPassage; marker: string }[] };
export function enumerationRuns(passages: readonly EnumerationPassage[]): Run[] {
  const runs: Run[] = [];
  for (let index = 0; index < passages.length; index++) {
    const previous = passages[index - 1];
    const list = lists.find(list => previous?.id === list.leadId && previous.kind === "original" && previous.text === list.leadText
      && list.items.every((item, offset) => {
        const passage = passages[index + offset];
        return passage?.kind === "original" && passage.id === item.id && passage.text === item.text;
      }));
    if (list) {
      runs.push({ kind: "list", items: list.items.map((item, offset) => ({ passage: passages[index + offset], marker: item.marker })) });
      index += list.items.length - 1;
    } else runs.push({ kind: "paragraph", passage: passages[index] });
  }
  return runs;
}

export function EnumerationItemText({ text, marker, enabled = false }: { text: string; marker: string; enabled?: boolean }) {
  return createElement(Fragment, null,
    createElement("span", { className: "reader-enumeration-marker" }, marker),
    createElement("span", null, createElement(QuotationText, { text: text.slice(marker.length), enabled })));
}

export function ClassificationText({ passage, enabled = false }: { passage: EnumerationPassage; enabled?: boolean }) {
  const text = readerDisplayText(passage);
  const boundary = text.indexOf("\n- مكتسب");
  const lead = text.indexOf(" ثم هي على فنين أيضا:");
  if (passage.kind !== "original" || passage.id !== `${chapter}sec-01-002` || passage.text !== classificationText || boundary < 0 || lead < boundary) {
    return createElement(QuotationText, { text, enabled });
  }
  const items = [text.slice(0, boundary), text.slice(boundary + 1, lead)];
  return createElement(Fragment, null,
    createElement("span", { role: "list", className: "reader-inline-enumeration" }, items.map((item, index) => createElement(Fragment, { key: index },
      index ? "\n" : null,
      createElement("span", { role: "listitem", className: "reader-enumeration-text" }, createElement(EnumerationItemText, { text: item, marker: "-", enabled }))))),
    createElement("span", { className: "reader-enumeration-lead" }, text.slice(lead)));
}
