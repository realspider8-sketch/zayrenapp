import os
import asyncio
from dotenv import load_dotenv
import httpx

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://vskmpsecfgsiiyfkcyzg.supabase.co')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZza21wc2VjZmdzaWl5ZmtjeXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI4NTQ4MywiZXhwIjoyMDk4ODYxNDgzfQ.ri20eSUOqiEjmeJQQI0HKPqD3192s3L9gvILlH8jG2E')

async def test_register():
    print(f'[TEST] SUPABASE_URL: {SUPABASE_URL}')
    print(f'[TEST] SUPABASE_SERVICE_ROLE_KEY (first 20 chars): {SUPABASE_SERVICE_ROLE_KEY[:20]}...')
    
    profiles_url = SUPABASE_URL.rstrip('/') + '/rest/v1/profiles'
    print(f'[TEST] profiles_url: {profiles_url}')
    
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation, resolution=merge-duplicates'
    }
    
    body = {
        'id': 'a08e3bae-5e0f-4374-9b13-855f01014311',
        'email': 'realspider8@gmail.com',
        'username': 'realspider8',
        'name': 'Arfat Danjummai',
    }
    
    print(f'[TEST] body: {body}')
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            print('[TEST] Making POST request...')
            resp = await client.post(profiles_url, headers=headers, json=body)
            print(f'[TEST] Response status: {resp.status_code}')
            print(f'[TEST] Response headers: {dict(resp.headers)}')
            print(f'[TEST] Response body: {resp.text}')
            if resp.status_code in (200, 201):
                print(f'[TEST] SUCCESS')
                return True
            else:
                print(f'[TEST] FAILED: {resp.status_code}')
                return False
    except Exception as e:
        print(f'[TEST] EXCEPTION: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = asyncio.run(test_register())
    exit(0 if success else 1)
