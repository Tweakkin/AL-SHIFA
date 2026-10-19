import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://raw.githubusercontent.com/OpenITI/0550AH/master/data/0544QadiCiyad/0544QadiCiyad.Shifa/0544QadiCiyad.Shifa.Shamela0023645-ara1.completed"
print("Fetching OpenITI text...")
data = urllib.request.urlopen(url).read().decode('utf-8')

with open("scratch/shifa_raw.txt", "w", encoding="utf-8") as f:
    f.write(data)

print(f"Downloaded {len(data)} characters, {len(data.splitlines())} lines.")

headings = []
for i, line in enumerate(data.splitlines()):
    if line.startswith("###"):
        headings.append((i + 1, line))

print(f"Total '###' headings found: {len(headings)}")
for h in headings[:50]:
    print(f"L{h[0]}: {h[1]}")
