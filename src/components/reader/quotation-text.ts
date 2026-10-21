import { createElement, Fragment } from "react";

export function quotationSpans(text: string): readonly [number, number][] | null {
  const spans: [number, number][] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index++) {
    if (text[index] === "«") { if (depth++ === 0) start = index; }
    if (text[index] === "»") {
      if (depth === 0) return null;
      if (--depth === 0) spans.push([start, index + 1]);
    }
  }
  return depth === 0 ? spans : null;
}

// Track context in chapter order. An otherwise balanced paragraph inside a
// cross-passage quotation is deliberately left alone, too.
export function quotationPlan(passages: readonly { id: string; text: string }[]) {
  const safe = new Set<string>();
  const review: { id: string; reason: string }[] = [];
  let depth = 0;
  for (const passage of passages) {
    const incoming = depth;
    for (const character of passage.text) {
      if (character === "«") depth++;
      else if (character === "»" && depth > 0) depth--;
    }
    if (!/[«»]/u.test(passage.text)) continue;
    const spans = quotationSpans(passage.text);
    if (!incoming && !depth && spans?.length) safe.add(passage.id);
    else review.push({ id: passage.id, reason: incoming || depth ? "cross-passage or unclosed quotation" : "unmatched closing quotation" });
  }
  return { safe, review };
}

export function QuotationText({ text, enabled = false }: { text: string; enabled?: boolean }) {
  const spans = enabled ? quotationSpans(text) : null;
  const pieces: (string | ReturnType<typeof createElement>)[] = [];
  const plain = (value: string, key: string) => value.split("\n").forEach((line, index) => {
    if (index) pieces.push(createElement("br", { key: `${key}-${index}` }));
    pieces.push(line);
  });
  let offset = 0;
  for (const [start, end] of spans ?? []) {
    plain(text.slice(offset, start), `before-${start}`);
    pieces.push(createElement("strong", { className: "reader-quotation", key: start }, text.slice(start, end)));
    offset = end;
  }
  plain(text.slice(offset), "after");
  return createElement(Fragment, null, ...pieces);
}
