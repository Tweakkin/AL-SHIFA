import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("scratch/shifa_raw.txt", encoding="utf-8") as f:
    text = f.read()

lines = text.splitlines()

# Let's inspect the exact lines between headings
headings = []
for i, l in enumerate(lines):
    if l.startswith("### |"):
        headings.append((i, l))

print(f"Total headings: {len(headings)}")
for idx in range(len(headings)):
    line_no, h = headings[idx]
    next_line_no = headings[idx + 1][0] if idx + 1 < len(headings) else len(lines)
    content_lines = lines[line_no + 1 : next_line_no]
    text_lines = [cl for cl in content_lines if cl.startswith("#") or cl.startswith("~~")]
    if len(text_lines) > 0 and (h.startswith("### | ") or h.startswith("### || ")):
        print(f"Direct text under {h[:60]} -> {len(text_lines)} text lines")
