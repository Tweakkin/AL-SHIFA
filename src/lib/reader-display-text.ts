import { readerPunctuationErrata } from "./reader-punctuation-errata.ts";
import { readerEditorialOverrides } from "./reader-editorial-overrides.ts";

export function readerDisplayText(passage: { id: string; text: string; kind: "original" | "demonstration" }): string {
  if (passage.kind !== "original") return passage.text;
  const editorial = readerEditorialOverrides[passage.id];
  if (editorial && passage.text === editorial.originalText) return editorial.displayText;
  const erratum = readerPunctuationErrata[passage.id];
  // Guard every reviewed span before applying anything. Never normalize arbitrary
  // book text, infer missing wording, or change a new version's punctuation.
  if (!erratum || passage.text.length !== erratum.sourceLength || erratum.changes.some(change =>
    passage.text.slice(change.contextStart, change.contextStart + change.context.length) !== change.context
    || passage.text.slice(change.offset, change.offset + change.from.length) !== change.from)) return passage.text;
  let text = passage.text;
  for (let index = erratum.changes.length - 1; index >= 0; index--) {
    const change = erratum.changes[index];
    text = text.slice(0, change.offset) + change.to + text.slice(change.offset + change.from.length);
  }
  return text;
}
