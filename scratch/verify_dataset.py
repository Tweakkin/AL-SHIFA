import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from test_full_generation import chapters_data

all_ids = set()
empty_count = 0
min_len = 999999
max_len = 0

for ch in chapters_data:
    assert ch['kind'] == 'original'
    assert len(ch['sections']) > 0, f"Chapter {ch['slug']} has no sections"
    for s in ch['sections']:
        assert len(s['passages']) > 0, f"Section {s['id']} has no passages"
        for p in s['passages']:
            assert p['id'] not in all_ids, f"Duplicate ID: {p['id']}"
            all_ids.add(p['id'])
            txt = p['originalText'].strip()
            if not txt:
                empty_count += 1
            min_len = min(min_len, len(txt))
            max_len = max(max_len, len(txt))
            assert 'locator' in p['source']

print(f"Validation passed!")
print(f"Total passages: {len(all_ids)}")
print(f"Empty passages: {empty_count}")
print(f"Shortest passage length: {min_len} characters")
print(f"Longest passage length: {max_len} characters")

first_p = chapters_data[0]['sections'][0]['passages'][0]
last_p = chapters_data[-1]['sections'][-1]['passages'][-1]
print(f"\nFirst passage ({first_p['source']['locator']}):\n{first_p['originalText'][:120]}...")
print(f"\nLast passage ({last_p['source']['locator']}):\n...{last_p['originalText'][-120:]}")
