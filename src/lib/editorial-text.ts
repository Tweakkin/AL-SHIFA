// For generated chapter-navigation labels only. Never apply to source headings
// or originalText: their punctuation belongs to the preserved transcription.
export function editorialChapterTitle(title: string): string {
  return title.replace(/^((?:القسم\s+[^:]+:\s*)?(?:الباب|الفصل)\s+\S+)\s+(?:—|–|--+)\s+/u, "$1: ");
}
