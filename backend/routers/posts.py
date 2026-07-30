from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from backend.database import get_db
from backend.models import User, Post, PostMedia, PostLike, PostComment, PostShare
from backend.schemas import PostSchema, PostCreate, PostCommentSchema, CommentCreate
from backend.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=List[PostSchema])
async def get_posts(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch posts with user info and media items
    query = select(Post).options(selectinload(Post.user), selectinload(Post.media_items)).order_by(Post.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    # We need to construct the response manually to include counts and is_liked_by_me
    # For a real app, this should be done with a more efficient query or joined load
    # For now, we will query counts per post.
    
    post_responses = []
    for post in posts:
        # Get counts
        likes_count = await db.scalar(select(func.count(PostLike.id)).where(PostLike.post_id == post.id))
        comments_count = await db.scalar(select(func.count(PostComment.id)).where(PostComment.post_id == post.id))
        shares_count = await db.scalar(select(func.count(PostShare.id)).where(PostShare.post_id == post.id))
        
        # Check if liked by me
        liked_by_me = await db.scalar(
            select(PostLike).where(PostLike.post_id == post.id, PostLike.user_id == current_user.id)
        )
        
        post_data = {
            "id": post.id,
            "user_id": post.user_id,
            "content": post.content,
            "post_type": post.post_type,
            "audience": post.audience,
            "media_items": post.media_items,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "updated_at": post.updated_at.isoformat() if post.updated_at else None,
            "user": post.user,
            "likes_count": likes_count or 0,
            "comments_count": comments_count or 0,
            "shares_count": shares_count or 0,
            "is_liked_by_me": bool(liked_by_me)
        }
        post_responses.append(post_data)
        
    return post_responses

@router.post("", response_model=PostSchema)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_post = Post(
        user_id=current_user.id,
        content=post_in.content,
        post_type=post_in.post_type,
        audience=post_in.audience
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    
    # Add media items if any
    if post_in.media_items:
        for media_in in post_in.media_items:
            new_media = PostMedia(
                post_id=new_post.id,
                media_url=media_in.media_url,
                media_type=media_in.media_type,
                size_bytes=media_in.size_bytes
            )
            db.add(new_media)
        await db.commit()
    
    # Reload with user relationship and media items
    result = await db.execute(select(Post).options(selectinload(Post.user), selectinload(Post.media_items)).where(Post.id == new_post.id))
    new_post = result.scalar_one()
    
    return {
        "id": new_post.id,
        "user_id": new_post.user_id,
        "content": new_post.content,
        "post_type": new_post.post_type,
        "audience": new_post.audience,
        "media_items": new_post.media_items,
        "created_at": new_post.created_at.isoformat() if new_post.created_at else None,
        "updated_at": new_post.updated_at.isoformat() if new_post.updated_at else None,
        "user": new_post.user,
        "likes_count": 0,
        "comments_count": 0,
        "shares_count": 0,
        "is_liked_by_me": False
    }

@router.post("/{post_id}/like")
async def like_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if post exists
    post = await db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # Check if already liked
    existing_like = await db.scalar(
        select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    )
    
    if existing_like:
        return {"status": "success", "message": "Already liked"}
        
    new_like = PostLike(post_id=post_id, user_id=current_user.id)
    db.add(new_like)
    await db.commit()
    return {"status": "success", "message": "Post liked"}

@router.delete("/{post_id}/like")
async def unlike_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await db.execute(
        delete(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    )
    await db.commit()
    return {"status": "success", "message": "Post unliked"}

@router.get("/{post_id}/comments", response_model=List[PostCommentSchema])
async def get_comments(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PostComment).options(selectinload(PostComment.user)).where(PostComment.post_id == post_id).order_by(PostComment.created_at.asc())
    result = await db.execute(query)
    comments = result.scalars().all()
    
    # Format response
    return [
        {
            "id": c.id,
            "post_id": c.post_id,
            "user_id": c.user_id,
            "content": c.content,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "user": c.user
        }
        for c in comments
    ]

@router.post("/{post_id}/comments", response_model=PostCommentSchema)
async def add_comment(
    post_id: UUID,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if post exists
    post = await db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    new_comment = PostComment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    
    # Reload with user relationship
    result = await db.execute(select(PostComment).options(selectinload(PostComment.user)).where(PostComment.id == new_comment.id))
    new_comment = result.scalar_one()
    
    return {
        "id": new_comment.id,
        "post_id": new_comment.post_id,
        "user_id": new_comment.user_id,
        "content": new_comment.content,
        "created_at": new_comment.created_at.isoformat() if new_comment.created_at else None,
        "user": new_comment.user
    }

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = await db.scalar(select(PostComment).where(PostComment.id == comment_id))
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
    await db.execute(delete(PostComment).where(PostComment.id == comment_id))
    await db.commit()
    return {"status": "success", "message": "Comment deleted"}

@router.post("/{post_id}/share")
async def share_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if post exists
    post = await db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    new_share = PostShare(
        post_id=post_id,
        user_id=current_user.id,
        platform="internal"
    )
    db.add(new_share)
    await db.commit()
    return {"status": "success", "message": "Post shared"}
