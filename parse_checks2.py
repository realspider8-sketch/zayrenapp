import json

with open('check_runs.json', encoding='utf-16') as f:
    d = json.load(f)

for c in d.get('check_runs', []):
    if c.get('name') == 'Workers Builds: zayrenapp':
        print(f"Name: {c.get('name')}")
        print(f"Output: {c.get('output')}")
