import { createElement } from "react";
import { ZoomIn } from "lucide-react";
import { readerDisplayText } from "../../lib/reader-display-text.ts";
import { QuotationText } from "./quotation-text.ts";
import { ClassificationText, EnumerationItemText } from "./enumerations.ts";

type OutlineMarker = { sourceLabel: string; label: string; level: "division" | "bab" };
type OutlineEntry = OutlineMarker & { description: string };
type Passage = { id: string; text: string; kind: "original" | "demonstration" };
const introduction = "al-shifa:chapter:muqaddima";
const division = (ordinal: string, colon = false): OutlineMarker => ({
  sourceLabel: `(القسم ${ordinal}${colon ? ":" : ""}) `,
  label: `القسم ${ordinal}`, level: "division",
});
const bab = (ordinal: string): OutlineMarker => ({
  sourceLabel: `الباب ${ordinal}: `, label: `الباب ${ordinal}`, level: "bab",
});

// Manually reviewed introduction entries only. Passage 019 repeats "الباب الثاني"
// ambiguously and stays intact. These are the author's outline, not division starts.
const markers: Record<string, readonly OutlineMarker[]> = {
  "012": [division("الأول", true)],
  "013": [bab("الأول")], "014": [bab("الثاني")],
  "015": [bab("الثالث")], "016": [bab("الرابع")],
  "017": [division("الثاني")], "018": [bab("الأول")],
  "020": [bab("الرابع"), division("الثالث")],
  "021": [bab("الأول")], "022": [bab("الثاني")],
  "023": [division("الرابع")], "024": [bab("الأول")],
  "025": [bab("الثاني")],
};

export function introOutlineEntries(chapterId: string, passage: Passage): OutlineEntry[] | null {
  const prefix = `${introduction}:passage:sec-01-`;
  if (chapterId !== introduction || passage.kind !== "original" || !passage.id.startsWith(prefix)) return null;
  const selected = markers[passage.id.slice(prefix.length)];
  if (!selected || !passage.text.startsWith(selected[0].sourceLabel)) return null;
  const entries: OutlineEntry[] = [];
  let offset = 0;
  for (let index = 0; index < selected.length; index++) {
    const marker = selected[index];
    const start = offset + marker.sourceLabel.length;
    const end = index + 1 < selected.length ? passage.text.indexOf(selected[index + 1].sourceLabel, start) : passage.text.length;
    if (end < start) return null;
    entries.push({ ...marker, description: passage.text.slice(start, end) });
    offset = end;
  }
  return entries;
}

export function IntroOutlinePassage({ chapterId, passage, focusable = false, emphasizeQuotes = false, enumerationMarker }: { chapterId: string; passage: Passage; focusable?: boolean; emphasizeQuotes?: boolean; enumerationMarker?: string }) {
  const text = readerDisplayText(passage);
  const entries = introOutlineEntries(chapterId, { ...passage, text });
  if (!entries) {
    const eligible = focusable && /[\p{L}\p{N}]/u.test(text);
    const paragraph = createElement("p", {
      id: passage.id, "data-reader-passage": true, "data-content-kind": passage.kind, dir: "auto", tabIndex: eligible ? 0 : undefined,
      "data-focus-eligible": eligible || undefined, "aria-keyshortcuts": eligible ? "Enter Space" : undefined,
      "aria-haspopup": eligible ? "dialog" : undefined, "aria-controls": eligible ? "reader-paragraph-focus" : undefined,
      className: enumerationMarker ? "reader-enumeration-text" : undefined,
    }, enumerationMarker ? createElement(EnumerationItemText, { text, marker: enumerationMarker, enabled: emphasizeQuotes })
      : createElement(ClassificationText, { passage, enabled: emphasizeQuotes }));
    return focusable ? createElement("div", { className: "reader-passage", "data-short": text.length < 100 || undefined }, paragraph,
      eligible && createElement("button", { type: "button", className: "reader-paragraph-focus-control", "data-focus-passage": passage.id, "aria-label": "تكبير الفقرة", title: "تكبير الفقرة", "aria-haspopup": "dialog", "aria-controls": "reader-paragraph-focus" }, createElement(ZoomIn, { size: 17, strokeWidth: 1.5, "aria-hidden": true, focusable: false }))) : paragraph;
  }
  return createElement("div", {
    id: passage.id, className: "reader-intro-outline", "data-reader-passage": true,
    "data-content-kind": passage.kind, role: "group", "aria-label": "من خطة المؤلف للكتاب في المقدمة", dir: "rtl",
  }, entries.map((entry, index) => createElement("div", {
    key: index, className: `reader-outline-entry reader-outline-${entry.level}`,
  },
  passage.id.endsWith("-012") && index === 0
    ? createElement("p", { className: "reader-outline-note" }, "خطة الكتاب في مقدمة المؤلف") : null,
  createElement("h3", { className: "reader-outline-label" }, entry.label),
  createElement("p", { className: "reader-outline-description", dir: "auto" }, createElement(QuotationText, { text: entry.description, enabled: emphasizeQuotes })))));
}
