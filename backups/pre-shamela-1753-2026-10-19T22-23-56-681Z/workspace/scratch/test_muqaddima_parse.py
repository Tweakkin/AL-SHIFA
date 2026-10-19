import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    raw_lines = [line.rstrip() for line in f]

# Let's inspect muqaddima lines 39 to 147
current_vol = 1
current_page = 25

def clean_paragraph_text(text):
    global current_vol, current_page
    
    # Find any Page markers
    page_matches = list(re.finditer(r'PageV(\d+)P(\d+)', text))
    if page_matches:
        last_match = page_matches[-1]
        current_vol = int(last_match.group(1))
        current_page = int(last_match.group(2))
    
    # Remove Page markers
    text = re.sub(r'PageV\d+P\d+', ' ', text)
    
    # Remove ms markers (e.g. ms001, ms192)
    text = re.sub(r'\bms\d+\b', ' ', text)
    
    # Remove footnote markers like «1», «2», etc.
    text = re.sub(r'«\d+»', ' ', text)
    text = re.sub(r'«\s*\d+\s*»', ' ', text)
    
    # Clean up whitespace around punctuation
    text = re.sub(r'\s+([،؛.؟!:])', r'\1', text)
    text = re.sub(r'([،؛.؟!:])\s*', r'\1 ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip(), f"ج {current_vol}، ص {current_page}"

paragraphs = []
cur_p = ""

for line in raw_lines[38:147]: # lines 39 to 147 (0-indexed: 38 to 147)
    if line.startswith('###'):
        continue
    if line.startswith('# '):
        if cur_p:
            cleaned, loc = clean_paragraph_text(cur_p)
            if cleaned:
                paragraphs.append((cleaned, loc))
        cur_p = line[2:]
    elif line.startswith('~~'):
        cur_p += ' ' + line[2:]
    elif line.startswith('#'):
        if cur_p:
            cleaned, loc = clean_paragraph_text(cur_p)
            if cleaned:
                paragraphs.append((cleaned, loc))
        cur_p = line[1:].strip()

if cur_p:
    cleaned, loc = clean_paragraph_text(cur_p)
    if cleaned:
        paragraphs.append((cleaned, loc))

print(f"Total paragraphs in Muqaddima: {len(paragraphs)}")
for idx, (p, loc) in enumerate(paragraphs[:5]):
    print(f"\n--- Paragraph {idx+1} ({loc}) ---")
    print(p)

print("\n--- Last Paragraph ---")
print(f"({paragraphs[-1][1]}): {paragraphs[-1][0]}")
