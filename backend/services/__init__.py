from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional
from uuid import UUID
from database import get_db
from models import User, Follow, Post, Sale
from schemas import UserCreate, ProfileUpdate

class UserService:
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            return None
        
        # Calculate stats
        followers_count = await db.execute(select(func.count(Follow.id)).where(Follow.following_id == user_id))
        following_count = await db.execute(select(func.count(Follow.id)).where(Follow.follower_id == user_id))
        posts_count = await db.execute(select(func.count(Post.id)).where(Post.user_id == user_id))
        sales_total = await db.execute(select(func.sum(Sale.amount)).where(Sale.seller_id == user_id))

        user.stats = {
            "followers_count": followers_count.scalar() or 0,
            "following_count": following_count.scalar() or 0,
            "posts_count": posts_count.scalar() or 0,
            "sales_total": sales_total.scalar() or 0.0
        }
        return user

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        new_user = User(
            id=user_data.id,
            email=user_data.email,
            name=user_data.name,
            username=user_data.username,
            bio="",
            location=""
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    @staticmethod
    async def update_profile(db: AsyncSession, user_id: UUID, profile_data: ProfileUpdate) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            return None
        
        if profile_data.name is not None:
            user.name = profile_data.name
        if profile_data.username is not None:
            user.username = profile_data.username
        if profile_data.bio is not None:
            user.bio = profile_data.bio
        if profile_data.location is not None:
            user.location = profile_data.location
            
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_profile_pic(db: AsyncSession, user_id: UUID, pic_url: str) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            return None
        
        user.profile_pic = pic_url
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def toggle_follow(db: AsyncSession, follower_id: UUID, following_id: UUID) -> bool:
        """Returns True if followed, False if unfollowed."""
        result = await db.execute(
            select(Follow).where(Follow.follower_id == follower_id, Follow.following_id == following_id)
        )
        existing_follow = result.scalars().first()
        
        if existing_follow:
            await db.delete(existing_follow)
            await db.commit()
            return False
        else:
            new_follow = Follow(follower_id=follower_id, following_id=following_id)
            db.add(new_follow)
            await db.commit()
            return True
