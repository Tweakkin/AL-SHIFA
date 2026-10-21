"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { X } from "lucide-react";
import { QuotationText } from "./quotation-text";

export function ParagraphFocus({ articleRef, passages, safeQuotes, fontSize }: {
  articleRef: RefObject<HTMLElement | null>;
  passages: readonly { id: string; text: string }[];
  safeQuotes: ReadonlySet<string>;
  fontSize: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const paragraph = useRef<HTMLElement | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selected, setSelected] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    const lookup = new Map(passages.map(passage => [passage.id, passage]));
    let down: { x: number; y: number } | null = null;
    let dragged = false;
    const selectionChanged = () => {
      const selected = window.getSelection()?.isCollapsed === false;
      article.toggleAttribute("data-text-selection", !!down || selected);
    };
    const pointerDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY }; dragged = false;
      if (event.button === 0 && event.target instanceof Element && event.target.closest("p[data-focus-eligible]")) article.setAttribute("data-text-selection", "");
    };
    const pointerUp = () => { down = null; selectionChanged(); };
    const pointerMove = (event: PointerEvent) => {
      if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) dragged = true;
    };
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.button !== 0 || event.detail > 1 || dragged || window.getSelection()?.isCollapsed === false) return;
      const control = event.target.closest<HTMLButtonElement>("button[data-focus-passage]");
      if (!control && (window.matchMedia("(max-width: 760px), (pointer: coarse)").matches || event.target.closest("a, button, input, select, textarea, label, summary, [role=button], [role=link], [contenteditable]:not([contenteditable=false])"))) return;
      const target = control ? document.getElementById(control.dataset.focusPassage ?? "") : event.target.closest<HTMLElement>("p[data-reader-passage]");
      if (!target || !article.contains(target)) return;
      const passage = lookup.get(target.id);
      if (!passage || !/[\p{L}\p{N}]/u.test(passage.text)) return;
      const open = () => {
        if (window.getSelection()?.isCollapsed === false) return;
        origin.current = control ?? target;
        paragraph.current = target;
        setSelected(passage);
      };
      // Selection drags are rejected above. A completed ordinary click opens
      // immediately, without delaying for a possible later double-click.
      open();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (!(event.target instanceof HTMLElement) || !event.target.matches("p[data-focus-eligible]")) return;
      if (window.getSelection()?.isCollapsed === false) return;
      const passage = lookup.get(event.target.id);
      if (!passage) return;
      event.preventDefault();
      origin.current = paragraph.current = event.target;
      setSelected(passage);
    };
    article.addEventListener("pointerdown", pointerDown);
    article.addEventListener("click", click);
    article.addEventListener("keydown", keyDown);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    document.addEventListener("selectionchange", selectionChanged);
    return () => {
      article.removeEventListener("pointerdown", pointerDown);
      article.removeEventListener("click", click);
      article.removeEventListener("keydown", keyDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      document.removeEventListener("selectionchange", selectionChanged);
      article.removeAttribute("data-text-selection");
    };
  }, [articleRef, passages]);

  useLayoutEffect(() => { if (selected && !dialog.current?.open) dialog.current?.showModal(); }, [selected]);
  useEffect(() => () => { if (highlightTimer.current) clearTimeout(highlightTimer.current); }, []);

  function finish() {
    setSelected(null);
    origin.current?.focus({ preventScroll: true });
    const target = paragraph.current;
    if (!target) return;
    articleRef.current?.querySelectorAll("[data-focus-returned]").forEach(element => element.removeAttribute("data-focus-returned"));
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    target.setAttribute("data-focus-returned", "true");
    highlightTimer.current = setTimeout(() => target.removeAttribute("data-focus-returned"), 1800);
  }

  return <dialog id="reader-paragraph-focus" ref={dialog} className="reader-paragraph-dialog" dir="rtl" aria-labelledby="reader-paragraph-focus-title" onClose={finish} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
  }} style={{ "--focus-font-size": `${Math.min(42, fontSize + 3)}px` } as CSSProperties}>
    <div className="reader-paragraph-dialog-header"><h2 id="reader-paragraph-focus-title">قراءة مركّزة</h2><button type="button" className="reader-icon-button" autoFocus aria-label="إغلاق القراءة المركّزة" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button></div>
    <div className="reader-paragraph-dialog-body"><p>{selected && <QuotationText text={selected.text} enabled={safeQuotes.has(selected.id)} />}</p></div>
  </dialog>;
}
