import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    raw_lines = [l.rstrip() for l in f]

# Let's see how many # lines in Muqaddima (lines 39-147) are continuations
muq_lines = raw_lines[38:147]

for i in range(len(muq_lines)-1):
    cur = muq_lines[i]
    nxt = muq_lines[i+1]
    if 'PageV' in cur:
        # What is the last character before PageV?
        before_page = re.sub(r'PageV\d+P\d+.*', '', cur).strip()
        last_char = before_page[-1] if before_page else ''
        first_word = nxt.lstrip('#~ ').split()[0] if nxt.lstrip('#~ ') else ''
        print(f"Line {i+39}: ...'{before_page[-20:]}' [PAGE] -> Line {i+40}: '{first_word}' (last_char='{last_char}')")
