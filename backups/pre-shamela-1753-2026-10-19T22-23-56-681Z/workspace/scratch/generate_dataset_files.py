import sys
import re
import os
import json

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from test_full_generation import chapters_data

output_dir = os.path.abspath("src/content/al-shifa")
chapters_dir = os.path.join(output_dir, "chapters")
os.makedirs(chapters_dir, exist_ok=True)

index_imports = []
index_array = []

for idx, ch in enumerate(chapters_data):
    ch_num = f"{idx+1:02d}"
    var_name = f"chapter{ch_num}"
    file_name = f"chapter-{ch_num}.ts"
    file_path = os.path.join(chapters_dir, file_name)
    
    # We output valid TypeScript code
    content_ts = f"""import type {{ Chapter }} from "../../../lib/content-types.ts";

export const {var_name}: Chapter = {json.dumps(ch, ensure_ascii=False, indent=2)};
"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content_ts)
        
    index_imports.append(f'import {{ {var_name} }} from "./chapters/chapter-{ch_num}.ts";')
    index_array.append(var_name)
    print(f"Wrote {file_name} ({len(ch['sections'])} sections, {sum(len(s['passages']) for s in ch['sections'])} passages)")

index_ts_content = f"""import type {{ BookContent }} from "../../lib/content-types.ts";
{chr(10).join(index_imports)}

export const shifaContent: BookContent = {{
  bookSlug: "al-shifa",
  chapters: [
    {', '.join(index_array)}
  ],
}};
"""

with open(os.path.join(output_dir, "index.ts"), "w", encoding="utf-8") as f:
    f.write(index_ts_content)

print(f"Successfully generated all chapters and index.ts in {output_dir}")
