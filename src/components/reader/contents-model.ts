import { chapterTitleParts } from "./navigation-title.ts";

type Chapter = { id: string; slug: string; title: string };
export function contentsGroups(chapters: readonly Chapter[]) {
  const groups: { division: string | null; entries: { chapter: Chapter; number: number; identifier: string | null; subject: string }[] }[] = [];
  chapters.forEach((chapter, index) => {
    const { division, identifier, subject } = chapterTitleParts(chapter.title);
    let group = groups[groups.length - 1];
    // Group adjacent entries only, so unusual source ordering stays intact.
    if (!group || group.division !== division) {
      group = { division, entries: [] };
      groups.push(group);
    }
    group.entries.push({ chapter, number: index + 1, identifier, subject });
  });
  return groups;
}
