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

// Bibliographic labels supplied in the project brief for pending titles.
const pendingBibliography: Bibliography = { metadataSource: "العنوان واسم المؤلف كما وردا في موجز المشروع. التصنيف الموضوعي من تنظيم المكتبة." };

const shifaBibliography: Bibliography = {
  edition: {
    label: "طبعة دار الفيحاء (عمان)، الطبعة الثانية، 1407 هـ / 1986 م (جزءان)",
    source: {
      label: "المكتبة الشاملة (رقم 23645) وOpenITI",
      url: "https://shamela.ws/book/23645",
    },
  },
  textSource: {
    label: "النص الأصلي المعتمد لكتاب الشفا للقاضي عياض (ت 544 هـ) برواية دار الفيحاء ورقمنة مشروع OpenITI (CC BY-NC-SA 4.0)",
    url: "https://raw.githubusercontent.com/OpenITI/0550AH/master/data/0544QadiCiyad/0544QadiCiyad.Shifa/0544QadiCiyad.Shifa.Shamela0023645-ara1.completed",
  },
  metadataSource: "بيانات الكتاب والفهرس مستخرجة ومحققة من متن الشفا بتعريف حقوق المصطفى للقاضي عياض.",
};

export const books: readonly Book[] = [
  { slug: "al-shifa", title: "الشفا بتعريف حقوق المصطفى", coverTitle: "الشفا", coverSubtitle: "بتعريف حقوق المصطفى", author: "القاضي عياض", category: "السيرة والحقوق النبوية", color: "green", editorial: { description: "كتاب الشفا بتعريف حقوق المصطفى للقاضي أبي الفضل عياض بن موسى اليحصبي السبتي (ت 544 هـ)، من أجلّ كتب السيرة والشمائل النبوية ومكانة المصطفى صلى الله عليه وسلم، رتبه مؤلفه على أربعة أقسام جامعة استوعبت فضائل النبي ومعجزاته وحقوقه وأحكامه كاملة بنصه العربي الأصيل." }, bibliography: shifaBibliography },
  { slug: "dalail-al-khayrat", title: "دلائل الخيرات", coverTitle: "دلائل الخيرات", author: "الإمام الجزولي", category: "الصلوات والمديح النبوي", color: "wine", editorial: { description: "أحد عناوين المجموعة الأولى لمكتبة الشفا، من تأليف الإمام الجزولي. أُدرج ضمن موضوع الصلوات والمديح النبوي بحسب التصور الأولي للمشروع؛ وتنتظر النسخة الرقمية تزويد المكتبة بالمصدر المعتمد." }, bibliography: pendingBibliography },
  { slug: "al-durr-al-munazzam", title: "الدر المنظم في مولد النبي المعظم", coverTitle: "الدر المنظم", coverSubtitle: "في مولد النبي المعظم", author: "أبو العباس العزفي", category: "المولد النبوي", color: "sand", editorial: { description: "عنوان لأبي العباس العزفي ضمن المجموعة الأولى لمكتبة الشفا، مصنَّف هنا في موضوع المولد النبوي. تعرض الصفحة البيانات المقدمة للمشروع؛ وستُضاف معلومات الطبعة والفهرس الأصلي عند توفير مصدر موثّق." }, bibliography: pendingBibliography },
  { slug: "dhakhirat-al-muhtaj", title: "ذخيرة المحتاج", coverTitle: "ذخيرة المحتاج", author: "المعطي الشرقاوي", category: "الصلوات والمديح النبوي", color: "slate", editorial: { description: "من العناوين الأربعة المختارة لبداية مكتبة الشفا، من تأليف المعطي الشرقاوي. يندرج في تنظيم المكتبة ضمن الصلوات والمديح النبوي، مع بقاء النص ومعلومات الطبعة في انتظار التزويد والمراجعة." }, bibliography: pendingBibliography },
];
