import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    raw_lines = [l.rstrip() for l in f]

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
    t = re.sub(r'^###\s*\|*\s*', '', h).strip()
    t = re.sub(r'\bms\d+\b', '', t).strip()
    t = re.sub(r'«\s*\d+\s*»', '', t).strip()
    t = re.sub(r'\s+', ' ', t).strip()
    return t

total_sections = 0
for idx, (ch_slug, ch_title, ch_start, ch_end) in enumerate(chapters_def):
    ch_lines = raw_lines[ch_start-1:ch_end]
    
    sections = []
    current_title = ""
    current_lines = []
    
    for line in ch_lines:
        if line.startswith("###"):
            # If current_lines has actual text, save the previous section
            has_text = any(l.lstrip('#~ ').strip() and not l.strip() == '# (بسم الله الرحمن الرحيم)' and not re.match(r'^#\s*PageV\d+P\d+\s*$', l) for l in current_lines)
            if has_text and current_title:
                sections.append((current_title, len(current_lines)))
                current_lines = []
            current_title = clean_heading_title(line)
        else:
            current_lines.append(line)
            
    has_text = any(l.lstrip('#~ ').strip() for l in current_lines)
    if has_text and current_title:
        sections.append((current_title, len(current_lines)))
        
    print(f"\nCh {idx+1} ({ch_slug}): {len(sections)} sections")
    for s_idx, (stitle, line_count) in enumerate(sections):
        print(f"   [{s_idx+1}] {stitle[:60]} ({line_count} lines)")
    total_sections += len(sections)

print(f"\nTOTAL SECTIONS IN BOOK: {total_sections}")
