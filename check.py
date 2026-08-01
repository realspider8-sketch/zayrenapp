import urllib.request, json
url = 'https://api.github.com/repos/realspider8-sketch/zayrenapp/commits/9790d483/check-runs'
req = urllib.request.Request(url, headers={'Accept': 'application/vnd.github.v3+json'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for run in data.get('check_runs', []):
            if run.get('name') == 'Workers Builds: zayrenapp':
                print(f"URL: {run.get('details_url')}")
                print(f"Status: {run.get('status')}")
                print(f"Conclusion: {run.get('conclusion')}")
                if run.get('output'):
                    print(f"Output Title: {run.get('output', {}).get('title')}")
                    print(f"Output Summary: {run.get('output', {}).get('summary')}")
except Exception as e:
    print('Error:', e)
