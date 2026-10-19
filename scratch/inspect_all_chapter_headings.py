import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    raw_lines = [l.rstrip() for l in f]

# 14 chapters definition:
# (slug, chapter_title, start_line_1_based, end_line_1_based)
chapters_def = [
    ("muqaddima", "مقدمة المؤلف", 39, 147),
    ("qism-1-bab-1", "القسم الأول: الباب الأول — في ثناء الله تعالى عليه وإظهاره عظيم قدره لديه", 158, 951),
    ("qism-1-bab-2", "القسم الأول: الباب الثاني — في تكميل الله تعالى له المحاسن خلقا وخلقا", 952, 2602),
    ("qism-1-bab-3", "القسم الأول: الباب الثالث — فيما ورد من صحيح الأخبار بعظيم قدره عند ربه", 2603, 4137),
    ("qism-1-bab-4", "القسم الأول: الباب الرابع — فيما أظهره الله تعالى على يديه من المعجزات والخصائص", 4138, 6286),
    ("qism-2-bab-1", "القسم الثاني: الباب الأول — في فرض الإيمان به ووجوب طاعته واتباع سنته", 6710, 7015),
    ("qism-2-bab-2", "القسم الثاني: الباب الثاني — في لزوم محبته صلى الله عليه وسلم ومناصحته", 7016, 7337),
    ("qism-2-bab-3", "القسم الثاني: الباب الثالث — في تعظيم أمره ووجوب توقيره وبره", 7338, 7784),
    ("qism-2-bab-4", "القسم الثاني: الباب الرابع — في حكم الصلاة عليه والتسليم وفرض ذلك وفضيلته", 7785, 8566),
    ("qism-3-bab-1", "القسم الثالث: الباب الأول — في ما يختص بالأمور الدينية والكلام في عصمة الأنبياء", 8567, 10435),
    ("qism-3-bab-2", "القسم الثالث: الباب الثاني — فيما يطرأ عليهم من العوارض والأحوال البشرية", 10436, 11080),
    ("qism-4-bab-1", "القسم الرابع: الباب الأول — في بيان ما هو في حقه صلى الله عليه وسلم سب أو نقص", 11081, 11924),
    ("qism-4-bab-2", "القسم الرابع: الباب الثاني — في حكم سابه وشانئه ومتنقصه ومؤذيه وعقوبته", 11925, 12263),
    ("qism-4-bab-3", "القسم الرابع: الباب الثالث — في حكم من سب الله وملائكته وأنبياءه وآله وصحبه وخاتمة الكتاب", 12264, len(raw_lines)),
]

def clean_heading_title(h):
    # Remove ### and pipes
    t = re.sub(r'^###\s*\|*\s*', '', h).strip()
    # Remove ms markers
    t = re.sub(r'\bms\d+\b', '', t).strip()
    # Remove footnote markers
    t = re.sub(r'«\s*\d+\s*»', '', t).strip()
    # Normalize spaces
    t = re.sub(r'\s+', ' ', t).strip()
    return t

total_sections = 0
for idx, (ch_slug, ch_title, ch_start, ch_end) in enumerate(chapters_def):
    ch_lines = raw_lines[ch_start-1:ch_end]
    
    # Identify section headings inside this chapter
    # Rules:
    # Any ### ||| is always a section.
    # Any ### || that is a "مقدمة" or where there's text before the first ### ||| is also a section.
    # What if a ### || or ### | has text directly under it before the next heading?
    # Let's inspect where text occurs under headings!
    headings = []
    for i, line in enumerate(ch_lines):
        if line.startswith("###"):
            headings.append((i, line))
            
    print(f"\nCh {idx+1} ({ch_slug}): {len(headings)} heading markers")
    for pos, h in headings:
        print(f"   [{pos + ch_start}] {clean_heading_title(h)}")
