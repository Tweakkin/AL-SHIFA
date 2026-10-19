import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/shifa_raw.txt', encoding='utf-8') as f:
    lines = [line.rstrip() for line in f]

headings = []
for idx, line in enumerate(lines):
    if line.startswith('###'):
        headings.append((idx + 1, line))

print(f"Total lines: {len(lines)}")
print(f"Total headings: {len(headings)}")

with open('scratch/all_headings.txt', 'w', encoding='utf-8') as out:
    for line_num, h in headings:
        out.write(f"Line {line_num}: {h}\n")

print("Saved all headings to scratch/all_headings.txt")
