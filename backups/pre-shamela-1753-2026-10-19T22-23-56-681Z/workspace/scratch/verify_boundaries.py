import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    raw_lines = [line.rstrip() for line in f]

# Let's see what happens if we parse into chapters and sections
# Chapters are:
# 1. muqaddima (line 39 to 147)
# 2. qism-1-bab-1 (line 158 to 951)
# 3. qism-1-bab-2 (line 952 to 2602)
# 4. qism-1-bab-3 (line 2603 to 4137)
# 5. qism-1-bab-4 (line 4138 to 6286)
# [skip 6287 to 6709: EDITOR notes]
# 6. qism-2-bab-1 (line 6710 to 7015)
# 7. qism-2-bab-2 (line 7016 to 7337)
# 8. qism-2-bab-3 (line 7338 to 7784)
# 9. qism-2-bab-4 (line 7785 to 8566)
# 10. qism-3-bab-1 (line 8567 to 10435)
# 11. qism-3-bab-2 (line 10436 to 11080)
# 12. qism-4-bab-1 (line 11081 to 11924)
# 13. qism-4-bab-2 (line 11925 to 12263)
# 14. qism-4-bab-3 (line 12264 to end)

chapters_def = [
    {
        "slug": "muqaddima",
        "title": "مقدمة المؤلف",
        "start": 39,
        "end": 147,
    },
    {
        "slug": "qism-1-bab-1",
        "title": "القسم الأول: الباب الأول — في ثناء الله تعالى عليه وإظهاره عظيم قدره لديه",
        "start": 158,
        "end": 951,
    },
    {
        "slug": "qism-1-bab-2",
        "title": "القسم الأول: الباب الثاني — في تكميل الله تعالى له المحاسن خلقا وخلقا",
        "start": 952,
        "end": 2602,
    },
    {
        "slug": "qism-1-bab-3",
        "title": "القسم الأول: الباب الثالث — فيما ورد من صحيح الأخبار بعظيم قدره عند ربه",
        "start": 2603,
        "end": 4137,
    },
    {
        "slug": "qism-1-bab-4",
        "title": "القسم الأول: الباب الرابع — فيما أظهره الله تعالى على يديه من المعجزات والخصائص",
        "start": 4138,
        "end": 6286,
    },
    {
        "slug": "qism-2-bab-1",
        "title": "القسم الثاني: الباب الأول — في فرض الإيمان به ووجوب طاعته واتباع سنته",
        "start": 6710,
        "end": 7015,
    },
    {
        "slug": "qism-2-bab-2",
        "title": "القسم الثاني: الباب الثاني — في لزوم محبته صلى الله عليه وسلم ومناصحته",
        "start": 7016,
        "end": 7337,
    },
    {
        "slug": "qism-2-bab-3",
        "title": "القسم الثاني: الباب الثالث — في تعظيم أمره ووجوب توقيره وبره",
        "start": 7338,
        "end": 7784,
    },
    {
        "slug": "qism-2-bab-4",
        "title": "القسم الثاني: الباب الرابع — في حكم الصلاة عليه والتسليم وفرض ذلك وفضيلته",
        "start": 7785,
        "end": 8566,
    },
    {
        "slug": "qism-3-bab-1",
        "title": "القسم الثالث: الباب الأول — في ما يختص بالأمور الدينية والكلام في عصمة الأنبياء",
        "start": 8567,
        "end": 10435,
    },
    {
        "slug": "qism-3-bab-2",
        "title": "القسم الثالث: الباب الثاني — فيما يطرأ عليهم من العوارض والأحوال البشرية",
        "start": 10436,
        "end": 11080,
    },
    {
        "slug": "qism-4-bab-1",
        "title": "القسم الرابع: الباب الأول — في بيان ما هو في حقه صلى الله عليه وسلم سب أو نقص",
        "start": 11081,
        "end": 11924,
    },
    {
        "slug": "qism-4-bab-2",
        "title": "القسم الرابع: الباب الثاني — في حكم سابه وشانئه ومتنقصه ومؤذيه وعقوبته",
        "start": 11925,
        "end": 12263,
    },
    {
        "slug": "qism-4-bab-3",
        "title": "القسم الرابع: الباب الثالث — في حكم من سب الله وملائكته وأنبياءه وآله وصحبه وخاتمة الكتاب",
        "start": 12264,
        "end": len(raw_lines),
    },
]

print(f"Total defined chapters: {len(chapters_def)}")
for idx, ch in enumerate(chapters_def):
    span_len = ch['end'] - ch['start'] + 1
    print(f"Ch {idx+1}: {ch['slug']} (lines {ch['start']} - {ch['end']}, total {span_len} lines)")
