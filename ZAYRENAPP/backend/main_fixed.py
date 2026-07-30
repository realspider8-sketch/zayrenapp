import os
import time
import logging
from typing import Optional

from fastapi import FastAPI, Request, BackgroundTasks, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import httpx
from dotenv import load_dotenv

# Load .env if present
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Config
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
PORT = int(os.getenv('PORT', '8000'))

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger('backend_fixed')

app = FastAPI()

# Pydantic models
class RegisterRequest(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    username: str

class RegisterResponse(BaseModel):
    ok: bool
    id: str
    detail: Optional[str] = None

# Background task: placeholder for sending email or other slow work
async def send_welcome_email(email: str, username: str):
    logger.info('send_welcome_email: START for %s', email)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post('https://httpbin.org/post', json={'to': email, 'username': username})
    except Exception:
        logger.exception('send_welcome_email failed for %s', email)
    logger.info('send_welcome_email: DONE for %s', email)

@app.get('/')
async def health():
    return {'ok': True}

@app.post('/api/auth/register', response_model=RegisterResponse)
async def register(payload: RegisterRequest, background_tasks: BackgroundTasks):
    start_total = time.time()
    logger.info('POST /api/auth/register START payload=%s', payload.dict())

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        logger.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server env')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Server misconfigured')

    profiles_url = SUPABASE_URL.rstrip('/') + '/rest/v1/profiles'

    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation, resolution=merge-duplicates'
    }

    body = {
        'id': payload.id,
        'email': payload.email,
        'username': payload.username,
        'name': payload.name,
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
            logger.info('Forwarding profile to Supabase: %s', profiles_url)
            resp = await client.post(profiles_url, headers=headers, json=body)

            logger.info('Supabase response status: %s', resp.status_code)

            if resp.status_code in (200, 201):
                try:
                    resp_json = resp.json()
                except Exception:
                    resp_json = None
                logger.info('Profile created/upserted: %s', resp_json)
                background_tasks.add_task(send_welcome_email, payload.email, payload.username)
                total_ms = (time.time() - start_total) * 1000
                logger.info('POST /api/auth/register DONE in %.0fms for id=%s', total_ms, payload.id)
                return {'ok': True, 'id': payload.id, 'detail': 'created'}

            if resp.status_code == 409:
                logger.warning('Supabase conflict for profile: %s', resp.text)
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Profile already exists')

            logger.error('Supabase returned error: %s %s', resp.status_code, resp.text)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='Upstream error')

    except httpx.RequestError as e:
        logger.exception('HTTPX RequestError when calling Supabase: %s', e)
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail='Upstream timeout')
    except Exception as e:
        logger.exception('Unhandled exception in register handler: %s', e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='server error')

@app.post('/api/auth/profile/verify')
async def verify_profile(payload: dict):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Server misconfigured')
    user_id = payload.get('id')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='missing id')

    profiles_url = SUPABASE_URL.rstrip('/') + '/rest/v1/profiles'
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
            resp = await client.get(f"{profiles_url}?id=eq.{user_id}&limit=1", headers=headers)
            if resp.status_code in (200, 201):
                try:
                    data = resp.json()
                except Exception:
                    data = None
                exists = bool(data and len(data) > 0)
                return {'exists': exists, 'profile': data[0] if exists else None}
            logger.error('Supabase verify returned error: %s %s', resp.status_code, resp.text)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='Upstream error')
    except httpx.RequestError as e:
        logger.exception('HTTPX RequestError when calling Supabase: %s', e)
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail='Upstream timeout')
    except Exception as e:
        logger.exception('Unhandled exception in verify handler: %s', e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='server error')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('backend.main_fixed:app', host='0.0.0.0', port=PORT, reload=True)
