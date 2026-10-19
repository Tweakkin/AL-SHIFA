import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Chapter } from "@/lib/content-types";
import { formatNumber } from "@/lib/reader-state";

function formatSectionCount(count: number): string {
  if (count <= 0) return "";
  // Imported sections include introductions as well as fusul; don't relabel them.
  return `العناوين الفرعية: ${formatNumber(count)}`;
}

type ChapterItem = {
  chapter: Chapter;
  number: number;
  displayTitle: string;
  sectionCountText: string;
};

type ChapterGroup = {
  key: string;
  divisionTitle?: string;
  chapters: ChapterItem[];
};

const DIVISION_TITLES: Record<string, string> = {
  "muqaddima": "مقدمة الكتاب",
  "qism-1": "القسم الأول: في تعظيم العلي الأعلى لقدر النبي المصطفى صلى الله عليه وسلم قولاً وفعلاً",
  "qism-2": "القسم الثاني: فيما يجب على الأنام من حقوقه عليه الصلاة والسلام",
  "qism-3": "القسم الثالث: في ما يجب للنبي صلى الله عليه وسلم وما يستحيل في حقه أو يجوز عليه",
  "qism-4": "القسم الرابع: في تصرف وجوه الأحكام على من تنقصه أو سبه صلى الله عليه وسلم",
};

export function TableOfContents({ bookSlug, chapters }: { bookSlug: string; chapters: readonly Chapter[] }) {
  const hasDemonstration = chapters.some((chapter) => chapter.kind === "demonstration");
  const hasDivisions = chapters.some((c) => c.slug.startsWith("qism-"));

  const groups: ChapterGroup[] = [];

  if (hasDivisions) {
    const groupMap = new Map<string, ChapterItem[]>();
    chapters.forEach((chapter, index) => {
      const number = index + 1;
      let groupKey = "default";
      if (chapter.slug === "muqaddima") groupKey = "muqaddima";
      else {
        const match = chapter.slug.match(/^(qism-\d+)/);
        if (match) groupKey = match[1];
      }

      if (!groupMap.has(groupKey)) groupMap.set(groupKey, []);
      const displayTitle = chapter.slug === "muqaddima"
        ? chapter.title
        : chapter.title.replace(/^القسم\s+[^:]+:\s*/, "");
      const sectionCount = chapter.sections ? chapter.sections.length : 0;

      groupMap.get(groupKey)!.push({
        chapter,
        number,
        displayTitle,
        sectionCountText: formatSectionCount(sectionCount),
      });
    });

    groupMap.forEach((items, key) => {
      groups.push({
        key,
        divisionTitle: DIVISION_TITLES[key] ?? "أبواب الكتاب",
        chapters: items,
      });
    });
  } else {
    groups.push({
      key: "all",
      chapters: chapters.map((chapter, index) => ({
        chapter,
        number: index + 1,
        displayTitle: chapter.title,
        sectionCountText: formatSectionCount(chapter.sections ? chapter.sections.length : 0),
      })),
    });
  }

  const subtitle = hasDemonstration
    ? "فهرس تجريبي"
    : `${formatNumber(chapters.length)} مدخلًا`;

  return (
    <section className="book-detail-section table-of-contents-section" aria-labelledby="contents-heading">
      <div className="detail-section-heading">
        <h2 id="contents-heading">فهرس الكتاب</h2>
        <span className="contents-subtitle">{subtitle}</span>
      </div>

      {chapters.length ? (
        <nav className="chapter-selection-nav" aria-label="فهرس فصول الكتاب" aria-describedby={hasDemonstration ? "reading-availability" : undefined}>
          {groups.map((group) => (
            <div key={group.key} className={`chapter-group${group.key === "muqaddima" ? " chapter-group-introduction" : ""}`}>
              {hasDivisions && group.divisionTitle && (
                <div className="chapter-group-header">
                  <h3 className="chapter-group-title">{group.divisionTitle}</h3>
                  {group.key.startsWith("qism-") && <span className="chapter-group-count">
                    {formatNumber(group.chapters.length)} {group.chapters.length === 1 ? "باب" : "أبواب"}
                  </span>}
                </div>
              )}
              <div className="chapter-grid">
                {group.chapters.map(({ chapter, number, displayTitle, sectionCountText }) => {
                  const hasTitleNumber = /^الباب\s+(?:الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|[0-9]+)(?:\s|[—:،]|$)/u.test(displayTitle);
                  return (
                  <Link
                    key={chapter.id}
                    className="chapter-card"
                    href={`/read/${bookSlug}/${chapter.slug}`}
                    aria-label={`${formatNumber(number)}: ${chapter.title}`}
                    title={chapter.title}
                  >
                    <div className="chapter-card-top">
                      {!hasTitleNumber && <span className="chapter-card-number" aria-hidden="true">
                        {formatNumber(number)}
                      </span>}
                      <h4 className="chapter-card-title">{displayTitle.replace(/^((?:الباب|الفصل)\s+[^:—–]+?)\s+[—–]\s+/u, "$1: ")}</h4>
                      <ArrowLeft className="chapter-card-arrow" size={17} aria-hidden="true" />
                    </div>
                    <div className="chapter-card-footer">
                      {sectionCountText ? (
                        <span className="chapter-card-meta">{sectionCountText}</span>
                      ) : chapter.kind === "demonstration" ? (
                        <span className="chapter-card-label">محتوى تجريبي</span>
                      ) : null}
                    </div>
                  </Link>
                );})}
              </div>
            </div>
          ))}
        </nav>
      ) : (
        <p className="contents-notice">لم يتوفر فهرس لهذا الكتاب بعد.</p>
      )}
    </section>
  );
}
