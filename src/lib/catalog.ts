import type { Book } from "./books";

/** Normalize matching only; preserve the original Arabic labels for display. */
export function normalizeArabic(value: string): string {
  return value.normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ـ/g, "")
    .replace(/\s+/gu, " ")
    .trim()
    .toLocaleLowerCase("ar");
}

export type CatalogFilters = { query?: string; category?: string; author?: string };

/** A clean catalog URL clears all submitted fields, including unknown filters. */
export function catalogResetHref({ query = "", category = "", author = "" }: CatalogFilters): "/library" | null {
  return [query, category, author].some((value) => value.trim()) ? "/library" : null;
}

export function filterBooks(source: readonly Book[], { query = "", category = "", author = "" }: CatalogFilters): Book[] {
  const terms = normalizeArabic(query).split(" ").filter(Boolean);
  return source.filter((book) => {
    const searchable = normalizeArabic(`${book.title} ${book.author}`);
    return (!category || book.category === category)
      && (!author || book.author === author)
      && terms.every((term) => searchable.includes(term));
  });
}
