import { clampRatio, readingRatio, type ReadingProgress } from "./reader-state";

export type ScrollPosition = Pick<ReadingProgress, "ratio" | "passageId" | "passageOffset">;

export function capturePosition(article: HTMLElement, toolbar: HTMLElement | null): ScrollPosition {
  const toolbarHeight = toolbar?.getBoundingClientRect().height ?? 72;
  const rect = article.getBoundingClientRect();
  const readingTop = toolbarHeight + 16;
  const paragraph = Array.from(article.querySelectorAll<HTMLElement>("[data-reader-passage]")).find((item) => {
    const bounds = item.getBoundingClientRect();
    return bounds.top <= readingTop && bounds.bottom > readingTop;
  });
  return {
    ratio: readingRatio(window.scrollY, rect.top + window.scrollY, rect.height, window.innerHeight, toolbarHeight),
    ...(paragraph ? { passageId: paragraph.id, passageOffset: clampRatio((readingTop - paragraph.getBoundingClientRect().top) / paragraph.getBoundingClientRect().height) } : {}),
  };
}

export function restorePosition(article: HTMLElement, toolbar: HTMLElement | null, position: ScrollPosition) {
  const toolbarHeight = toolbar?.getBoundingClientRect().height ?? 72;
  const rect = article.getBoundingClientRect();
  const start = Math.max(0, rect.top + window.scrollY - toolbarHeight - 16);
  const distance = Math.max(1, rect.height - window.innerHeight + toolbarHeight + 32);
  const passage = position.passageId ? document.getElementById(position.passageId) : null;
  const target = passage && article.contains(passage)
    ? passage.getBoundingClientRect().top + window.scrollY + passage.getBoundingClientRect().height * (position.passageOffset ?? 0) - toolbarHeight - 16
    : position.ratio === 0 ? 0 : start + position.ratio * distance;
  window.scrollTo({ top: Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight)), behavior: "instant" });
}
