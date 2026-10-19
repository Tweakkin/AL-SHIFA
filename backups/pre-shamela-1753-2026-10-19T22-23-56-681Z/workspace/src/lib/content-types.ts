/** Source details are supplied with verified texts, never inferred from a title. */
export type SourceCitation = {
  label: string;
  url?: string;
  locator?: string;
};

export type Passage = {
  /** Permanent identifier, independent of position or pagination. */
  id: string;
  originalText: string;
  source: SourceCitation;
};

export type Section = {
  id: string;
  title: string;
  passages: readonly Passage[];
};

type ChapterBase = {
  id: string;
  slug: string;
  title: string;
  /** Array order is the explicit reading order; IDs must not be renumbered. */
  sections: readonly Section[];
};

export type Chapter = ChapterBase & (
  | { kind: "original"; source: SourceCitation }
  | { kind: "demonstration"; note: string }
);

export type BookContent = {
  bookSlug: string;
  chapters: readonly Chapter[];
};

export type Bibliography = {
  /** Only populate these fields when an edition/source has actually been supplied. */
  edition?: { label: string; source: SourceCitation };
  textSource?: SourceCitation;
  metadataSource: string;
};
