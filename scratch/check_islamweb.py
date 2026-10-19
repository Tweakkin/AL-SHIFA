import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\user\.gemini\antigravity\brain\adb63caf-c0a2-4e4d-821f-2482130d82fc\.system_generated\steps\250\content.md'
with open(path, encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'/ar/library/content/118/(\d+)/?([^\s"\'<>]*)', text)
seen = set()
unique = []
for m in matches:
    if m[0] not in seen:
        seen.add(m[0])
        unique.append(m)

print(f"Total unique IDs found: {len(unique)}")
for u in unique[:40]:
    print(u)
