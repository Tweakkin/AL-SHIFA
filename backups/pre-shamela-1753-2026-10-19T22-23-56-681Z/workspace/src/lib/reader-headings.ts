// Accept section-title metadata only, never passage text or introductory outlines.
export function readerHeading(sectionTitle: string): {
  level: "division" | "bab" | "preface" | "fasl";
  label: string;
  description: string | null;
} {
  const title = sectionTitle.trim();
  const division = title.match(/^\(?\s*(القسم\s+(?:الأول|الثاني|الثالث|الرابع))(?=\s|[:：)]|$)\s*(?:[:：]\s*)?\)?\s*(?:[:：]\s*)?([\s\S]*)$/u);
  if (division) return { level: "division", label: division[1], description: division[2] || null };
  const level = /^\(?\s*الباب(?:\s|$)/u.test(title) ? "bab"
    : /^(?:مقدمة|تمهيد|فاتحة)/u.test(title) ? "preface" : "fasl";
  return { level, label: sectionTitle, description: null };
}
