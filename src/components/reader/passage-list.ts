import { createElement } from "react";
import { enumerationRuns, type EnumerationPassage } from "./enumerations.ts";
import { IntroOutlinePassage } from "./intro-outline.ts";

export function PassageList({ chapterId, passages, safeQuotes }: { chapterId: string; passages: readonly EnumerationPassage[]; safeQuotes: ReadonlySet<string> }) {
  const paragraph = (passage: EnumerationPassage, marker?: string) => createElement(IntroOutlinePassage, {
    key: passage.id, chapterId, passage, focusable: true, emphasizeQuotes: safeQuotes.has(passage.id), enumerationMarker: marker,
  });
  return enumerationRuns(passages).map(run => run.kind === "paragraph" ? paragraph(run.passage)
    : createElement("ul", { key: run.items[0].passage.id, className: "reader-enumeration", role: "list" },
      run.items.map(item => createElement("li", { key: item.passage.id }, paragraph(item.passage, item.marker)))));
}
