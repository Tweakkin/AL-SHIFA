import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

url_jk = "https://raw.githubusercontent.com/OpenITI/0550AH/master/data/0544QadiCiyad/0544QadiCiyad.Shifa/0544QadiCiyad.Shifa.JK009263-ara1"
print("Fetching JK009263...")
jk_data = urllib.request.urlopen(url_jk).read().decode('utf-8')

url_1753 = "https://raw.githubusercontent.com/OpenITI/0550AH/master/data/0544QadiCiyad/0544QadiCiyad.Shifa/0544QadiCiyad.Shifa.Shamela0001753-ara1"
print("Fetching Shamela0001753...")
s1753_data = urllib.request.urlopen(url_1753).read().decode('utf-8')

print("JK sample:")
for l in jk_data.splitlines()[50:75]:
    if l.strip():
        print(l[:100])

print("\nShamela 1753 sample:")
for l in s1753_data.splitlines()[50:75]:
    if l.strip():
        print(l[:100])
