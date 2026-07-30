import os
import time
import logging
import traceback
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

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    # Do not raise in import-time in dev, but warn loudly
    print('\n[WARN] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Create backend/.env or set env vars.\n')

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger('backend')

app = FastAPI()

# Supabase client placeholder (global - created at startup)
supabase_client = None

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    client_host = request.client.host if request.client else 'unknown'
    logger.info("Incoming %s %s from %s", request.method, request.url.path, client_host)
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled exception processing %s %s", request.method, request.url.path)
        return JSONResponse({"error": "internal server error"}, status_code=500)
    duration = (time.time() - start) * 1000
    logger.info("Completed %s %s -> %s in %.0fms", request.method, request.url.path, response.status_code, duration)
    return response

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
    # Example: call an external transactional email service with a short timeout
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Replace with your real email API call if needed
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

    # Build Supabase REST endpoint for profiles — adjust table name if different
    profiles_url = SUPABASE_URL.rstrip('/') + '/rest/v1/profiles'

    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        # Use PostgREST "Prefer" header to upsert/merge duplicates when possible
        'Prefer': 'return=representation, resolution=merge-duplicates'
    }

    body = {
        'id': payload.id,
        'email': payload.email,
        'username': payload.username,
        'name': payload.name,
        'created_at': None  # let Postgres default created_at if configured
    }

    # Use httpx with a reasonable timeout and short connect/read timeouts
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
            logger.info('Forwarding profile to Supabase: %s', profiles_url)
            resp = await client.post(profiles_url, headers=headers, json=body)

            logger.info('Supabase response status: %s', resp.status_code)

            # Successful insert/upsert: 201 Created or 200 OK depending on server
            if resp.status_code in (200, 201):
                try:
                    resp_json = resp.json()
                except Exception:
                    resp_json = None
                logger.info('Profile created/upserted: %s', resp_json)

                # Kick off background tasks (non-blocking)
                background_tasks.add_task(send_welcome_email, payload.email, payload.username)

                total_ms = (time.time() - start_total) * 1000
                logger.info('POST /api/auth/register DONE in %.0fms for id=%s', total_ms, payload.id)
                return {'ok': True, 'id': payload.id, 'detail': 'created'}

            # Handle conflict or duplicate
            if resp.status_code == 409:
                logger.warning('Supabase conflict for profile: %s', resp.text)
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Profile already exists')

            # Forward other errors
            logger.error('Supabase returned error: %s %s', resp.status_code, resp.text)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='Upstream error')

    except httpx.RequestError as e:
        logger.exception('HTTPX RequestError when calling Supabase: %s', e)
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail='Upstream timeout')
    except Exception as e:
        logger.exception('Unhandled exception in register handler: %s', e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='server error')

# Appended: supabase-backed endpoints and startup (non-intrusive additions)
from starlette.concurrency import run_in_threadpool as _run_in_threadpool

@app.on_event('startup')
async def _create_supabase_client_appended():
    global supabase_client
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and not supabase_client:
        try:
            # import locally to avoid altering top-of-file imports
            from supabase import create_client as create_supabase_client_local
            supabase_client = create_supabase_client_local(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            logger.info('Supabase client (appended) created')
        except Exception:
            logger.exception('Failed to create appended supabase client')

@app.post('/api/auth/register_supabase', response_model=RegisterResponse)
async def register_supabase(payload: RegisterRequest, background_tasks: BackgroundTasks):
    start_total = time.time()
    logger.info('[register_supabase] START payload=%s', payload.dict())
    if not supabase_client:
        logger.error('[register_supabase] missing supabase client')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Server misconfigured')

    body = {
        'id': payload.id,
        'email': payload.email,
        'username': payload.username,
        'name': payload.name,
    }

    try:
        def _do_upsert():
            return supabase_client.table('profiles').upsert(body).execute()
        res = await _run_in_threadpool(_do_upsert)
        logger.info('[register_supabase] raw result: %s', str(res))

        # parse result
        rows = None
        if isinstance(res, dict):
            rows = res.get('data') or res.get('body') or res.get('result')
        elif isinstance(res, tuple):
            rows = res[0]

        if rows:
            background_tasks.add_task(send_welcome_email, payload.email, payload.username)
            total_ms = (time.time() - start_total) * 1000
            logger.info('[register_supabase] DONE in %.0fms for id=%s', total_ms, payload.id)
            return {'ok': True, 'id': payload.id, 'detail': 'created'}

        logger.error('[register_supabase] unexpected result: %s', str(res))
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='Upstream error')

    except Exception:
        logger.exception('[register_supabase] error')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='server error')

@app.post('/api/auth/profile/verify_supabase')
async def verify_profile_supabase(payload: dict):
    user_id = payload.get('id')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='missing id')
    if not supabase_client:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Server misconfigured')

    try:
        def _do_select():
            return supabase_client.table('profiles').select('*').eq('id', user_id).limit(1).execute()
        res = await _run_in_threadpool(_do_select)
        logger.info('[verify_profile_supabase] raw result: %s', str(res))
        rows = None
        if isinstance(res, dict):
            rows = res.get('data') or res.get('body') or res.get('result')
        elif isinstance(res, tuple):
            rows = res[0]
        exists = bool(rows and len(rows) > 0)
        return {'exists': exists, 'profile': rows[0] if exists else None}
    except Exception:
        logger.exception('[verify_profile_supabase] error')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='server error')

# If running directly (use backend_start.bat or uvicorn as configured in repo)
if __name__ == '__main__':
    import uvicorn
    uvicorn.run('backend.main:app', host='0.0.0.0', port=PORT, reload=True)
