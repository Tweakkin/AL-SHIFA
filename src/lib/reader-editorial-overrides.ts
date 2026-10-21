// Explicit editorial display choices, separate from verified transcription repairs.
// Original imported text remains authoritative and must match in full.
export const readerEditorialOverrides: Readonly<Record<string, {
  originalText: string;
  displayText: string;
  reason: string;
  evidence: readonly string[];
}>> = {
  "al-shifa:chapter:qism-1-bab-2:passage:sec-01-003": {
    originalText: "أ- منها ما يتخلص لأحد الوصفين:",
    displayText: "أ- منها ما يتخلص لأحد الوصفين.",
    reason: "User-approved editorial full stop for a complete, parallel enumeration item; not a claim that the retained source has a full stop.",
    evidence: [
      "scratch/shifa_raw.txt:959-962 (retains the original colon and separate A/B source paragraphs)",
      "https://www.islamarchive.cc/ketab_content/6985/p-148 (supports the two-category interpretation, not an exact punctuation substitution)",
      "reports/al-shifa-integrity/ENUMERATION-COLON-OVERRIDE.md",
    ],
  },
};
