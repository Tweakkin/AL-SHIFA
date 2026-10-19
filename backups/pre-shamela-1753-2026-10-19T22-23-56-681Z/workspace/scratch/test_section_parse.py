import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    raw_lines = [l.rstrip() for l in f]

def clean_text_passage(text):
    # Remove ms markers
    text = re.sub(r'\bms\d+\b', ' ', text)
    # Remove footnote markers like «1», «10», etc.
    text = re.sub(r'«\s*\d+\s*»', ' ', text)
    # Remove orphan footnote markers or stray editor brackets
    text = re.sub(r'«\s*»', ' ', text)
    # Fix punctuation spacing: remove space before punctuation, ensure space after punctuation
    text = re.sub(r'\s+([،؛.؟!:])', r'\1', text)
    text = re.sub(r'([،؛.؟!:])(?=[^\s\d»\)])', r'\1 ', text)
    # Normalize spaces
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def parse_section_lines(lines, initial_locator):
    # lines is a list of lines in the section
    passages = []
    current_vol, current_page = initial_locator
    
    current_passage_text = ""
    passage_locator = f"ج {current_vol}، ص {current_page}"
    
    for line in lines:
        if line.startswith('###'):
            continue
        
        # Check if line contains PageV
        page_matches = list(re.finditer(r'PageV(\d+)P(\d+)', line))
        if page_matches:
            last_match = page_matches[-1]
            current_vol = int(last_match.group(1))
            current_page = int(last_match.group(2))
            
        line_clean = re.sub(r'PageV\d+P\d+', '', line).strip()
        if not line_clean:
            continue
            
        is_continuation = False
        if line.startswith('~~'):
            is_continuation = True
            content = line[2:].strip()
        elif line.startswith('#'):
            content = line.lstrip('#').strip()
            # If current_passage_text doesn't end with sentence terminator, is it continuation?
            if current_passage_text:
                stripped_prev = current_passage_text.rstrip(' »"\'')
                # If prev didn't end with . : ! ؟ or if the previous line ended with PageV, it's continuation
                if stripped_prev and stripped_prev[-1] not in ('.', ':', '؟', '!', '؛'):
                    is_continuation = True
        else:
            content = line.strip()
            is_continuation = True
            
        if is_continuation and current_passage_text:
            current_passage_text += " " + content
        else:
            if current_passage_text:
                cleaned = clean_text_passage(current_passage_text)
                if cleaned:
                    passages.append((cleaned, passage_locator))
            current_passage_text = content
            passage_locator = f"ج {current_vol}، ص {current_page}"
            
    if current_passage_text:
        cleaned = clean_text_passage(current_passage_text)
        if cleaned:
            passages.append((cleaned, passage_locator))
            
    return passages, (current_vol, current_page)

# Test on Muqaddima
passages, final_loc = parse_section_lines(raw_lines[38:147], (1, 25))
print(f"Muqaddima passages count: {len(passages)}")
for i, (p, loc) in enumerate(passages):
    print(f"\n[{i+1}] ({loc}): {p[:120]}... [len={len(p)}]")
