import type { BookContent } from "../../lib/content-types.ts";
import { chapter01 } from "./chapters/chapter-01.ts";
import { chapter02 } from "./chapters/chapter-02.ts";
import { chapter03 } from "./chapters/chapter-03.ts";
import { chapter04 } from "./chapters/chapter-04.ts";
import { chapter05 } from "./chapters/chapter-05.ts";
import { chapter06 } from "./chapters/chapter-06.ts";
import { chapter07 } from "./chapters/chapter-07.ts";
import { chapter08 } from "./chapters/chapter-08.ts";
import { chapter09 } from "./chapters/chapter-09.ts";
import { chapter10 } from "./chapters/chapter-10.ts";
import { chapter11 } from "./chapters/chapter-11.ts";
import { chapter12 } from "./chapters/chapter-12.ts";
import { chapter13 } from "./chapters/chapter-13.ts";
import { chapter14 } from "./chapters/chapter-14.ts";

export const shifaContent: BookContent = {
  bookSlug: "al-shifa",
  chapters: [
    chapter01, chapter02, chapter03, chapter04, chapter05, chapter06, chapter07, chapter08, chapter09, chapter10, chapter11, chapter12, chapter13, chapter14
  ],
};
