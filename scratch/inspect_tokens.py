import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("scratch/shifa_raw.txt", encoding="utf-8") as f:
    text = f.read()

print("Checking special tokens in raw text:")
footnotes = re.findall(r'«\d+»', text)
print(f"Footnote numbers like «1»: {len(footnotes)}")
pages = re.findall(r'PageV\d+P\d+', text)
print(f"Page markers like PageV01P025: {len(pages)}")
ms_markers = re.findall(r'ms\d+', text)
print(f"Manuscript markers like ms001: {len(ms_markers)}")

# Let's inspect samples of pages
print("First 10 page markers:", pages[:10])
print("First 10 ms markers:", ms_markers[:10])

# Let's see how paragraphs are structured
# A paragraph starts with # and continues with ~~
sample_paras = []
curr = []
for line in text.splitlines()[38:150]:
    if line.startswith("# "):
        if curr:
            sample_paras.append(" ".join(curr))
            curr = []
        curr.append(line[2:].strip())
    elif line.startswith("~~"):
        curr.append(line[2:].strip())
if curr:
    sample_paras.append(" ".join(curr))

print(f"\nSample paragraphs in preface: {len(sample_paras)}")
for i, p in enumerate(sample_paras[:5]):
    print(f"\n[P{i+1}]: {p}")
