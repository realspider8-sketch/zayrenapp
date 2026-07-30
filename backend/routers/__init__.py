from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserProfileResponse, ProfileUpdate, PictureUploadResponse, PasswordResetRequest
from backend.services import UserService

router = APIRouter()

@router.post("/test")
async def test_endpoint():
    """Simple test endpoint to verify router is working"""
    import logging
    logging.info("[Test] Test endpoint called")
    return {"message": "Router is working!", "status": "ok"}

from backend.schemas import UserLogin

@router.post("/login")
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    import logging
    email = login_data.email.lower()
    
    # Try Supabase first if configured
    if supabase_client:
        try:
            auth_response = supabase_client.auth.sign_in_with_password({
                "email": email,
                "password": login_data.password
            })
            access_token = auth_response.session.access_token
        except Exception as e:
            logging.error(f"Supabase auth failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
    else:
        # Fallback access token if no Supabase
        access_token = f"mock_token_{email}"

    from sqlalchemy import select
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User profile not found in database")

    return {
        "access_token": access_token,
        "user": user
    }

@router.post("/register", response_model=UserProfileResponse)
async def register_profile(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Called by the frontend after a successful Supabase Auth sign up.
    Creates the user profile in the database.
    """
    existing_user = await UserService.get_user_by_id(db, user_data.id)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    import sqlalchemy
    try:
        user = await UserService.create_user(db, user_data)
        return user
    except sqlalchemy.exc.IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already taken")
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/profile/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile/update", response_model=UserProfileResponse)
async def update_user_profile(user_id: UUID, profile_data: ProfileUpdate, db: AsyncSession = Depends(get_db)):
    # In a real production app, we would extract the user_id from the verified JWT token here.
    user = await UserService.update_profile(db, user_id, profile_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("EXPO_PUBLIC_SUPABASE_URL", "")
# Prefer a server-side service role key for elevated operations; fall back to the anon key if provided
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "")

supabase_client: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        import logging
        logging.warning("Failed to initialize Supabase client: %s", e)
        supabase_client = None

@router.post("/profile/upload-picture", response_model=PictureUploadResponse)
async def upload_picture(user_id: UUID, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """
    Uploads a picture to Supabase Storage and updates the user's profile.
    """
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

    file_contents = await file.read()
    file_path = f"{user_id}/{file.filename}"
    
    # Upload to Supabase Storage
    try:
        supabase_client.storage.from_("avatars").upload(
            path=file_path,
            file=file_contents,
            file_options={"content-type": file.content_type, "upsert": "true"}
        )
    except Exception as e:
        # Ignore if it says duplicate, upsert should handle it but supabase-py sometimes throws
        pass

    # Get public URL
    public_url = supabase_client.storage.from_("avatars").get_public_url(file_path)
    
    user = await UserService.update_profile_pic(db, user_id, public_url)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"profile_pic": public_url}

@router.post("/reset-password")
async def reset_password(request: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """
    Password reset confirmation endpoint.
    Supabase auth handles the actual password change via the reset link.
    This endpoint simply confirms the reset was processed.
    """
    import logging
    logging.info(f"[Reset Password] Received request for email: {request.email}")
    
    # Validate input
    if not request.email or not request.new_password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    logging.info(f"[Reset Password] Processing reset for {request.email}")
    return {"message": "Password reset successfully", "status": "ok"}

@router.post("/forgot-password")
async def forgot_password(email: str, db: AsyncSession = Depends(get_db)):
    """
    Initiates password reset by sending OTP to email.
    Query param: email (required)
    In a real app, this would send an email with OTP.
    For demo, we use test code 123456.
    """
    import logging
    logging.info(f"[Forgot Password] Received request for email: {email}")
    
    if not email or '@' not in email:
        logging.warning(f"[Forgot Password] Invalid email: {email}")
        raise HTTPException(status_code=400, detail="Valid email is required")
    
    # In production, send actual OTP email via Twilio/SendGrid
    # For now, just log and return success
    logging.info(f"[Forgot Password] OTP would be sent to {email} (test: 123456)")
    
    return {"message": "OTP sent to email", "test_otp": "123456"}

@router.post("/verify-otp")
async def verify_otp(email: str, code: str, db: AsyncSession = Depends(get_db)):
    """
    Verify OTP code for password reset/account activation.
    Returns the user_id if verification succeeds.
    """
    import logging
    logging.info(f"[Verify OTP] Request for email: {email}, code: {code}")
    
    if not email or not code:
        raise HTTPException(status_code=400, detail="Email and code are required")
    
    # Test code validation
    if code != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    # Look up the user by email to return their ID
    from sqlalchemy import select
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        logging.info(f"[Verify OTP] User not found for email: {email}")
        raise HTTPException(status_code=404, detail="User not found")
    
    logging.info(f"[Verify OTP] OTP verified successfully for {email}, user_id: {user.id}")
    return {"message": "OTP verified", "status": "ok", "user_id": str(user.id)}

@router.post("/resend-otp")
async def resend_otp(email: str, db: AsyncSession = Depends(get_db)):
    """
    Resend OTP code for password reset.
    """
    import logging
    logging.info(f"[Resend OTP] Request for email: {email}")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Test OTP - always return 123456
    test_otp = "123456"
    logging.info(f"[Resend OTP] OTP resent to {email} (test: {test_otp})")
    return {"message": "OTP resent to email", "otp_code": test_otp}

@router.post("/follow/{following_id}")
async def follow_user(follower_id: UUID, following_id: UUID, db: AsyncSession = Depends(get_db)):
    if follower_id == following_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
    followed = await UserService.toggle_follow(db, follower_id, following_id)
    return {"message": "Followed successfully"} if followed else {"message": "Unfollowed successfully"}

@router.delete("/follow/{following_id}")
async def unfollow_user(follower_id: UUID, following_id: UUID, db: AsyncSession = Depends(get_db)):
    # Toggle handles both, but we can explicitly call it
    followed = await UserService.toggle_follow(db, follower_id, following_id)
    if followed: 
        # If it accidentally followed when we meant to unfollow, toggle it back
        await UserService.toggle_follow(db, follower_id, following_id)
    return {"message": "Unfollowed successfully"}
