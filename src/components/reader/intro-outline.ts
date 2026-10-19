import { createElement } from "react";
import { readerDisplayText } from "../../lib/reader-display-text.ts";

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

export function IntroOutlinePassage({ chapterId, passage }: { chapterId: string; passage: Passage }) {
  const entries = introOutlineEntries(chapterId, passage);
  if (!entries) return createElement("p", {
    id: passage.id, "data-reader-passage": true, "data-content-kind": passage.kind, dir: "auto",
  }, readerDisplayText(passage));
  return createElement("div", {
    id: passage.id, className: "reader-intro-outline", "data-reader-passage": true,
    "data-content-kind": passage.kind, role: "group", "aria-label": "من خطة المؤلف للكتاب في المقدمة", dir: "rtl",
  }, entries.map((entry, index) => createElement("div", {
    key: index, className: `reader-outline-entry reader-outline-${entry.level}`,
  },
  passage.id.endsWith("-012") && index === 0
    ? createElement("p", { className: "reader-outline-note" }, "خطة الكتاب في مقدمة المؤلف") : null,
  createElement("h3", { className: "reader-outline-label" }, entry.label),
  createElement("p", { className: "reader-outline-description", dir: "auto" }, entry.description))));
}
