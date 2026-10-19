// Presentation-only erratum; the imported source and passage IDs stay untouched.
// See reports/al-shifa-reader-quotes/REPORT.md. Fail closed if the source changes.
const introductionId = "al-shifa:chapter:muqaddima:passage:sec-01-001";
const prefix = "الحمد لله المتفرد باسمه الأسمى، المختص بالعز الأحمى الذي ليس دونه منتهى ولا وراءه مرمى، الظاهر";

export function readerDisplayText(passage: { id: string; text: string; kind: "original" | "demonstration" }): string {
  if (passage.kind !== "original" || passage.id !== introductionId || !passage.text.startsWith(`${prefix}» لا تخيلا ولا وهما،`)) return passage.text;
  return passage.text.slice(0, prefix.length) + passage.text.slice(prefix.length + 1);
}
