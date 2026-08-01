import json

with open('check_runs.json', encoding='utf-16') as f:
    d = json.load(f)

for c in d.get('check_runs', []):
    print(f"Name: {c.get('name')}")
    print(f"Status: {c.get('status')}")
    print(f"Conclusion: {c.get('conclusion')}")
    print(f"URL: {c.get('details_url')}")
    print("-" * 20)
