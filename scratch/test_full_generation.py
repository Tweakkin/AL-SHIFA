import sys
import re
import os
import json

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    raw_lines = [l.rstrip() for l in f]

# Chapter definitions
chapters_meta = [
    {
        "index": 1,
        "slug": "muqaddima",
        "title": "مقدمة المؤلف",
        "start": 39,
        "end": 147,
    },
    {
        "index": 2,
        "slug": "qism-1-bab-1",
        "title": "القسم الأول: الباب الأول — في ثناء الله تعالى عليه وإظهاره عظيم قدره لديه",
        "start": 158,
        "end": 951,
    },
    {
        "index": 3,
        "slug": "qism-1-bab-2",
        "title": "القسم الأول: الباب الثاني — في تكميل الله تعالى له المحاسن خلقا وخلقا",
        "start": 952,
        "end": 2602,
    },
    {
        "index": 4,
        "slug": "qism-1-bab-3",
        "title": "القسم الأول: الباب الثالث — فيما ورد من صحيح الأخبار بعظيم قدره عند ربه",
        "start": 2603,
        "end": 4137,
    },
    {
        "index": 5,
        "slug": "qism-1-bab-4",
        "title": "القسم الأول: الباب الرابع — فيما أظهره الله تعالى على يديه من المعجزات والخصائص",
        "start": 4138,
        "end": 6286,
    },
    {
        "index": 6,
        "slug": "qism-2-bab-1",
        "title": "القسم الثاني: الباب الأول — في فرض الإيمان به ووجوب طاعته واتباع سنته",
        "start": 6710,
        "end": 7015,
    },
    {
        "index": 7,
        "slug": "qism-2-bab-2",
        "title": "القسم الثاني: الباب الثاني — في لزوم محبته صلى الله عليه وسلم ومناصحته",
        "start": 7016,
        "end": 7337,
    },
    {
        "index": 8,
        "slug": "qism-2-bab-3",
        "title": "القسم الثاني: الباب الثالث — في تعظيم أمره ووجوب توقيره وبره",
        "start": 7338,
        "end": 7784,
    },
    {
        "index": 9,
        "slug": "qism-2-bab-4",
        "title": "القسم الثاني: الباب الرابع — في حكم الصلاة عليه والتسليم وفرض ذلك وفضيلته",
        "start": 7785,
        "end": 8566,
    },
    {
        "index": 10,
        "slug": "qism-3-bab-1",
        "title": "القسم الثالث: الباب الأول — في ما يختص بالأمور الدينية والكلام في عصمة الأنبياء",
        "start": 8567,
        "end": 10435,
    },
    {
        "index": 11,
        "slug": "qism-3-bab-2",
        "title": "القسم الثالث: الباب الثاني — فيما يطرأ عليهم من العوارض والأحوال البشرية",
        "start": 10436,
        "end": 11080,
    },
    {
        "index": 12,
        "slug": "qism-4-bab-1",
        "title": "القسم الرابع: الباب الأول — في بيان ما هو في حقه صلى الله عليه وسلم سب أو نقص",
        "start": 11081,
        "end": 11924,
    },
    {
        "index": 13,
        "slug": "qism-4-bab-2",
        "title": "القسم الرابع: الباب الثاني — في حكم سابه وشانئه ومتنقصه ومؤذيه وعقوبته",
        "start": 11925,
        "end": 12263,
    },
    {
        "index": 14,
        "slug": "qism-4-bab-3",
        "title": "القسم الرابع: الباب الثالث — في حكم من سب الله وملائكته وأنبياءه وآله وصحبه وخاتمة الكتاب",
        "start": 12264,
        "end": len(raw_lines),
    },
]

def clean_heading_title(h):
    t = re.sub(r'^###\s*\|*\s*', '', h).strip()
    t = re.sub(r'\bms\d+\b', '', t).strip()
    t = re.sub(r'«\s*\d+\s*»', '', t).strip()
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def clean_passage_text(text):
    # Remove ms markers
    text = re.sub(r'\bms\d+\b', ' ', text)
    # Remove footnote markers like «1», «10»
    text = re.sub(r'«\s*\d+\s*»', ' ', text)
    # Remove empty quotes or stray bracket artifacts
    text = re.sub(r'«\s*»', ' ', text)
    # Remove isolated quotes if unbalanced
    # Normalize punctuation spacing
    text = re.sub(r'\s+([،؛.؟!:])', r'\1', text)
    text = re.sub(r'([،؛.؟!:])(?=[^\s\d»\)])', r'\1 ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

# Global volume and page tracker across whole book
current_vol = 1
current_page = 25

def process_section_lines(lines):
    global current_vol, current_page
    passages = []
    current_passage = ""
    passage_vol = current_vol
    passage_page = current_page
    
    for line in lines:
        if line.startswith('###'):
            continue
            
        # Check page markers
        page_matches = list(re.finditer(r'PageV(\d+)P(\d+)', line))
        if page_matches:
            last_m = page_matches[-1]
            current_vol = int(last_m.group(1))
            current_page = int(last_m.group(2))
            
        # Remove page marker from line
        line_clean = re.sub(r'PageV\d+P\d+', '', line).strip()
        if not line_clean:
            continue
            
        is_continuation = False
        if line.startswith('~~'):
            is_continuation = True
            content = line_clean.lstrip('~').strip()
        elif line.startswith('#'):
            content = line_clean.lstrip('#').strip()
            if current_passage:
                stripped_prev = current_passage.rstrip(' »"\'')
                # If prev didn't end with sentence terminator, it continues
                if stripped_prev and stripped_prev[-1] not in ('.', ':', '؟', '!', '؛'):
                    is_continuation = True
        else:
            content = line_clean
            is_continuation = True
            
        if is_continuation and current_passage:
            current_passage += " " + content
        else:
            if current_passage:
                cleaned = clean_passage_text(current_passage)
                if cleaned:
                    passages.append((cleaned, f"ج {passage_vol}، ص {passage_page}"))
            current_passage = content
            passage_vol = current_vol
            passage_page = current_page
            
    if current_passage:
        cleaned = clean_passage_text(current_passage)
        if cleaned:
            passages.append((cleaned, f"ج {passage_vol}، ص {passage_page}"))
            
    return passages

# Process each chapter
chapters_data = []
total_passages_count = 0
total_sections_count = 0

for ch_meta in chapters_meta:
    ch_slug = ch_meta['slug']
    ch_title = ch_meta['title']
    ch_start = ch_meta['start']
    ch_end = ch_meta['end']
    ch_index = ch_meta['index']
    
    ch_lines = raw_lines[ch_start-1:ch_end]
    
    # Split ch_lines into sections
    sections_raw = []
    current_sec_title = ""
    current_sec_lines = []
    
    for line in ch_lines:
        if line.startswith('###'):
            # Check if current_sec_lines has meaningful body text
            has_body = any(l.lstrip('#~ ').strip() and not l.strip() == '# (بسم الله الرحمن الرحيم)' and not re.match(r'^#\s*PageV\d+P\d+\s*$', l) for l in current_sec_lines)
            if has_body and current_sec_title:
                sections_raw.append((current_sec_title, current_sec_lines))
                current_sec_lines = []
            current_sec_title = clean_heading_title(line)
        else:
            current_sec_lines.append(line)
            
    has_body = any(l.lstrip('#~ ').strip() for l in current_sec_lines)
    if has_body and current_sec_title:
        sections_raw.append((current_sec_title, current_sec_lines))
        
    sections = []
    for s_idx, (stitle, slines) in enumerate(sections_raw):
        passages_raw = process_section_lines(slines)
        if not passages_raw:
            continue
            
        sec_slug = f"sec-{s_idx+1:02d}"
        sec_id = f"al-shifa:chapter:{ch_slug}:section:{sec_slug}"
        
        passages = []
        for p_idx, (ptext, ploc) in enumerate(passages_raw):
            pass_id = f"al-shifa:chapter:{ch_slug}:passage:{sec_slug}-{p_idx+1:03d}"
            passages.append({
                "id": pass_id,
                "originalText": ptext,
                "source": {
                    "label": "الشفا بتعريف حقوق المصطفى (دار الفيحاء)",
                    "locator": ploc
                }
            })
            
        sections.append({
            "id": sec_id,
            "title": stitle,
            "passages": passages
        })
        total_passages_count += len(passages)
        
    total_sections_count += len(sections)
    
    chapter_obj = {
        "id": f"al-shifa:chapter:{ch_slug}",
        "slug": ch_slug,
        "title": ch_title,
        "kind": "original",
        "source": {
            "label": "دار الفيحاء - عمان / ط2 1407هـ / نسق رقمي OpenITI CC BY-NC-SA 4.0",
            "url": "https://shamela.ws/book/23645"
        },
        "sections": sections
    }
    chapters_data.append(chapter_obj)
    print(f"Chapter {ch_index} ({ch_slug}): {len(sections)} sections, {sum(len(s['passages']) for s in sections)} passages")

print(f"\n================ SUMMARY ================")
print(f"Total Chapters: {len(chapters_data)}")
print(f"Total Sections: {total_sections_count}")
print(f"Total Passages: {total_passages_count}")
