import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("scratch/shifa_raw.txt", encoding="utf-8") as f:
    lines = f.readlines()

current_qism = None
current_bab = None
structure = []

for idx, line in enumerate(lines):
    line_clean = line.strip()
    if line_clean.startswith("### | "):
        title = line_clean[6:].strip()
        current_qism = title
        structure.append(("QISM", idx + 1, title))
    elif line_clean.startswith("### || "):
        title = line_clean[7:].strip()
        current_bab = title
        structure.append(("BAB", idx + 1, title, current_qism))
    elif line_clean.startswith("### ||| "):
        title = line_clean[8:].strip()
        structure.append(("FASL", idx + 1, title, current_bab, current_qism))

print(f"Total entries: {len(structure)}")
qisms = [s for s in structure if s[0] == "QISM"]
babs = [s for s in structure if s[0] == "BAB"]
fasls = [s for s in structure if s[0] == "FASL"]
print(f"Qisms: {len(qisms)}, Babs: {len(babs)}, Fasls: {len(fasls)}")

for q in qisms:
    print("QISM:", q[2])
    q_babs = [b for b in babs if b[3] == q[2]]
    for b in q_babs:
        b_fasls = [f for f in fasls if f[3] == b[2]]
        print(f"   BAB: {b[2][:60]}... ({len(b_fasls)} fasls)")
