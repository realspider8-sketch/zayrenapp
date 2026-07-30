"""
Zayren App - Minimal Backend for Debugging
Simple FastAPI server to test registration flow
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import httpx
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load .env first
env_file = Path(__file__).parent / ".env"
print(f"Loading .env from: {env_file}")
print(f"File exists: {env_file.exists()}")

if env_file.exists():
    load_dotenv(env_file)
    print("[OK] .env loaded successfully")
else:
    print("[FAIL] .env file not found!")

# Now get values
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"\n{'='*60}")
print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_KEY set: {bool(SUPABASE_KEY)}")
print(f"KEY length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")
print(f"{'='*60}\n")

app = FastAPI()

class Profile(BaseModel):
    id: str
    email: str
    username: str
    name: str

@app.get("/")
def health():
    return {"status": "ok", "backend": "running"}

@app.post("/api/auth/register")
async def register(profile: Profile):
    print(f"\n[REGISTER] Request received!")
    print(f"[REGISTER] Payload: {profile.dict()}")
    
    if not SUPABASE_URL:
        print("[REGISTER] [FAIL] SUPABASE_URL is None!")
        raise HTTPException(status_code=500, detail="SUPABASE_URL not configured")
    
    if not SUPABASE_KEY:
        print("[REGISTER] [FAIL] SUPABASE_KEY is None!")
        raise HTTPException(status_code=500, detail="SUPABASE_KEY not configured")
    
    print(f"[REGISTER] URL: {SUPABASE_URL}/rest/v1/profiles")
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/profiles"
        headers = {
            "apikey": SUPABASE_KEY,  # Supabase expects this, not Authorization header!
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        body = {
            "id": profile.id,
            "email": profile.email,
            "username": profile.username,
            "name": profile.name
        }
        
        print(f"[REGISTER] Making request to Supabase...")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=body, headers=headers)
            
            print(f"[REGISTER] Status: {response.status_code}")
            print(f"[REGISTER] Response: {response.text[:200]}")
            
            if response.status_code not in (200, 201):
                print(f"[REGISTER] [FAIL] Error from Supabase!")
                raise HTTPException(status_code=502, detail=response.text)
            
            print(f"[REGISTER] [OK] Success!")
            return {"ok": True, "id": profile.id, "detail": "created"}
    
    except Exception as e:
        print(f"[REGISTER] [FAIL] Exception: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
