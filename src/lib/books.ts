import type { Bibliography } from "./content-types";

export type Book = {
  slug: string;
  title: string;
  coverTitle: string;
  coverSubtitle?: string;
  author: string;
  category: string;
  color: "green" | "wine" | "sand" | "slate";
  editorial: { description: string };
  bibliography: Bibliography;
};

// Bibliographic labels supplied in the project brief; no book text is included.
const bibliography: Bibliography = { metadataSource: "العنوان واسم المؤلف كما وردا في موجز المشروع. التصنيف الموضوعي من تنظيم المكتبة." };
export const books: readonly Book[] = [
  { slug: "al-shifa", title: "الشفا بتعريف حقوق المصطفى", coverTitle: "الشفا", coverSubtitle: "بتعريف حقوق المصطفى", author: "القاضي عياض", category: "السيرة والحقوق النبوية", color: "green", editorial: { description: "يحمل مشروع الشفا اسم هذا المؤلَّف للقاضي عياض، ويضعه في قلب مجموعته الأولى من كتب التراث المغربي في السيرة النبوية. تجمع هذه الصفحة بياناته المتاحة، تمهيدًا لإضافة النص بعد تحديد مصدره وإعداده." }, bibliography },
  { slug: "dalail-al-khayrat", title: "دلائل الخيرات", coverTitle: "دلائل الخيرات", author: "الإمام الجزولي", category: "الصلوات والمديح النبوي", color: "wine", editorial: { description: "أحد عناوين المجموعة الأولى لمكتبة الشفا، من تأليف الإمام الجزولي. أُدرج ضمن موضوع الصلوات والمديح النبوي بحسب التصور الأولي للمشروع؛ وتنتظر النسخة الرقمية تزويد المكتبة بالمصدر المعتمد." }, bibliography },
  { slug: "al-durr-al-munazzam", title: "الدر المنظم في مولد النبي المعظم", coverTitle: "الدر المنظم", coverSubtitle: "في مولد النبي المعظم", author: "أبو العباس العزفي", category: "المولد النبوي", color: "sand", editorial: { description: "عنوان لأبي العباس العزفي ضمن المجموعة الأولى لمكتبة الشفا، مصنَّف هنا في موضوع المولد النبوي. تعرض الصفحة البيانات المقدمة للمشروع؛ وستُضاف معلومات الطبعة والفهرس الأصلي عند توفير مصدر موثّق." }, bibliography },
  { slug: "dhakhirat-al-muhtaj", title: "ذخيرة المحتاج", coverTitle: "ذخيرة المحتاج", author: "المعطي الشرقاوي", category: "الصلوات والمديح النبوي", color: "slate", editorial: { description: "من العناوين الأربعة المختارة لبداية مكتبة الشفا، من تأليف المعطي الشرقاوي. يندرج في تنظيم المكتبة ضمن الصلوات والمديح النبوي، مع بقاء النص ومعلومات الطبعة في انتظار التزويد والمراجعة." }, bibliography },
];
