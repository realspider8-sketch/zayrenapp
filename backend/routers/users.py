from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
import random

from database import get_db
from models import User

router = APIRouter()

# Helper function to generate simulated online states and badges for frontend compatibility
def enhance_user(user: User):
    user_dict = {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "bio": user.bio,
        "location": user.location,
        "profile_pic": user.profile_pic,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        # Simulate fields expected by frontend
        "online": random.choice([True, False, True]), # 66% chance of being online for testing
        "unread": random.choice([0, 0, 1, 3]),
        "hasNew": random.choice([True, False, False]),
        "is_verified": getattr(user, "is_verified", False),
    }
    return user_dict

@router.get("/", response_model=List[dict])
async def list_users(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """
    List all active users.
    """
    stmt = select(User).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return [enhance_user(u) for u in users]

@router.get("/search", response_model=List[dict])
async def search_users(q: str = Query(..., min_length=1), limit: int = 20, db: AsyncSession = Depends(get_db)):
    """
    Search users by name or username.
    """
    search_term = f"%{q}%"
    stmt = select(User).where(
        or_(
            User.name.ilike(search_term),
            User.username.ilike(search_term)
        )
    ).limit(limit)
    
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return [enhance_user(u) for u in users]
