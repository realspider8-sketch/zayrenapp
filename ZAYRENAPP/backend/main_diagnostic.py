"""
Zayren App - FastAPI Backend with Enhanced Diagnostics
Production-ready registration backend with detailed logging and error handling.
"""

import os
import httpx
import logging
from typing import Optional
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Zayren-API")

# Initialize FastAPI
app = FastAPI(title="Zayren API")

# Load environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
PORT = int(os.getenv("PORT", 8000))

logger.info("=" * 60)
logger.info("BACKEND STARTUP")
logger.info("=" * 60)
logger.info(f"Loading .env from: {env_path}")
logger.info(f"SUPABASE_URL: {SUPABASE_URL}")
logger.info(f"SERVICE_ROLE_KEY (first 30 chars): {SUPABASE_SERVICE_ROLE_KEY[:30] if SUPABASE_SERVICE_ROLE_KEY else 'NOT SET'}...")
logger.info(f"PORT: {PORT}")

# Validate environment
if not SUPABASE_URL:
    logger.error("❌ SUPABASE_URL not set in environment!")
if not SUPABASE_SERVICE_ROLE_KEY:
    logger.error("❌ SUPABASE_SERVICE_ROLE_KEY not set in environment!")

class ProfilePayload(BaseModel):
    id: str
    email: str
    username: str
    name: str

class ProfileResponse(BaseModel):
    ok: bool
    id: str
    detail: str

@app.get("/")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/auth/register", response_model=ProfileResponse)
async def register(payload: ProfilePayload):
    """
    Register user profile in Supabase.
    
    Expected payload:
    {
        "id": "uuid-from-auth",
        "email": "user@example.com",
        "username": "username",
        "name": "Full Name"
    }
    """
    logger.info(f"[REGISTER] START - Payload: {payload.dict()}")
    
    try:
        # Validate environment
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            logger.error("[REGISTER] Missing Supabase configuration")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server misconfiguration: Missing Supabase credentials"
            )
        
        # Build Supabase request
        profiles_url = f"{SUPABASE_URL}/rest/v1/profiles"
        headers = {
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        body = {
            "id": payload.id,
            "email": payload.email,
            "username": payload.username,
            "name": payload.name
        }
        
        logger.info(f"[REGISTER] Supabase URL: {profiles_url}")
        logger.info(f"[REGISTER] Request body: {body}")
        logger.info(f"[REGISTER] Headers: Authorization=Bearer {SUPABASE_SERVICE_ROLE_KEY[:20]}..., Content-Type=application/json")
        
        # Call Supabase REST API
        async with httpx.AsyncClient(timeout=15.0) as client:
            logger.info(f"[REGISTER] Sending POST request to Supabase...")
            response = await client.post(profiles_url, json=body, headers=headers)
            
            logger.info(f"[REGISTER] Supabase response status: {response.status_code}")
            logger.info(f"[REGISTER] Supabase response body: {response.text}")
            
            if response.status_code not in (200, 201):
                error_detail = response.text
                logger.error(f"[REGISTER] ❌ Supabase error: {error_detail}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Supabase error: {error_detail}"
                )
            
            result = response.json()
            logger.info(f"[REGISTER] ✅ Profile created successfully: {result}")
            
            return ProfileResponse(
                ok=True,
                id=payload.id,
                detail="Profile created successfully"
            )
    
    except HTTPException as e:
        logger.error(f"[REGISTER] HTTPException: {e.detail}")
        raise
    except httpx.TimeoutException as e:
        logger.error(f"[REGISTER] Timeout connecting to Supabase: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request to Supabase timed out"
        )
    except httpx.ConnectError as e:
        logger.error(f"[REGISTER] Cannot connect to Supabase: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cannot connect to Supabase API"
        )
    except Exception as e:
        logger.error(f"[REGISTER] Unexpected error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {type(e).__name__}: {str(e)}"
        )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    """Catch-all exception handler with logging"""
    logger.error(f"[EXCEPTION] Unhandled exception: {type(exc).__name__}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

@app.on_event("startup")
async def startup_event():
    logger.info("[STARTUP] ✅ Backend started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("[SHUTDOWN] Backend shutting down")

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting uvicorn on 0.0.0.0:{PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=True)
