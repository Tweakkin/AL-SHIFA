import { createElement } from "react";

export function chapterTitleParts(title: string) {
  // These are generated navigation titles, not source passages. Recognize only
  // explicit structural labels; preserve the entire subject, including colons.
  const parts = title.match(/^(?:(القسم\s+\S+)\s*:\s*)?((?:الباب|الفصل)\s+\S+)\s*(?::|—|–|--+)\s+([\s\S]+)$/u);
  const subject = parts?.[3].trim() || title;
  return { division: parts?.[1] ?? null, identifier: parts?.[2] ?? null, subject };
}

export function NavigationTitle({ title }: { title: string }) {
  const { division, identifier, subject } = chapterTitleParts(title);
  return createElement("span", { className: "reader-navigation-title" },
    identifier && createElement("span", { className: "reader-navigation-metadata" },
      [division, identifier].filter(Boolean).join(" · ")),
    createElement("span", { className: "reader-navigation-subject" }, subject));
}
