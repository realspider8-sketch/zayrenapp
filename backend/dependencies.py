import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client, Client

from database import get_db
from models import User
from services import UserService

# Supabase Client Initialization
SUPABASE_URL = os.getenv("EXPO_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "")

supabase_client: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        import logging
        logging.warning("Failed to initialize Supabase client for auth: %s", e)

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to verify the JWT token via Supabase and return the authenticated User.
    Throws a 401 if unauthorized, or a 404 if the user doesn't exist in our DB yet.
    """
    token = credentials.credentials
    
    if not supabase_client:
        # Fallback for local testing without Supabase (MOCK AUTH)
        # We will assume the token itself is the user's UUID
        from uuid import UUID
        try:
            user_id = UUID(token)
            user = await UserService.get_user_by_id(db, user_id)
            if user:
                return user
        except ValueError:
            pass
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase client not configured and invalid mock token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Ask Supabase to verify the token
        user_response = supabase_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # In Supabase, user_response.user.id is the UUID
        user_id_str = user_response.user.id
        from uuid import UUID
        user_id = UUID(user_id_str)
        
        # Get user from our database
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found in database",
            )
            
        return user
        
    except Exception as e:
        import logging
        logging.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

import json

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the user is an admin."""
    if current_user.role == "user" or not current_user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    if current_user.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is not active."
        )
    return current_user

def require_permission(permission: str):
    """
    Dependency factory to check if current admin has a specific permission.
    Super admins have all permissions.
    """
    async def permission_checker(current_admin: User = Depends(get_current_admin)) -> User:
        if current_admin.role == "super_admin":
            return current_admin
            
        if not current_admin.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required."
            )
            
        try:
            perms = json.loads(current_admin.permissions)
            if permission not in perms:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission '{permission}' required."
                )
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid permissions format."
            )
            
        return current_admin
        
    return permission_checker

