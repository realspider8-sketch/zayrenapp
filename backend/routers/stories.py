import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, and_

from database import get_db
from models import Story, StoryView
from schemas import StoryCreate, StorySchema, StoryViewSchema
from dependencies import get_current_user

router = APIRouter(prefix="/api/stories", tags=["stories"])

@router.post("", response_model=StorySchema)
async def create_story(story: StoryCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_story = Story(
        user_id=current_user["id"],
        media_url=story.media_url,
        media_type=story.media_type,
        text=story.text,
        location=story.location,
        music_id=story.music_id,
        # expires_at is automatically handled by the model's default
    )
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    
    # Reload with relations
    result = db.execute(
        select(Story)
        .options(selectinload(Story.user), selectinload(Story.views))
        .where(Story.id == db_story.id)
    )
    loaded_story = result.scalars().first()
    
    response_data = StorySchema.model_validate(loaded_story)
    response_data.has_viewed = False
    return response_data

@router.get("", response_model=List[StorySchema])
async def get_active_stories(current_user: Optional[dict] = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch all stories where expires_at > now
    now = datetime.datetime.utcnow()
    query = (
        select(Story)
        .options(selectinload(Story.user), selectinload(Story.views).selectinload(StoryView.viewer))
        .where(Story.expires_at > now)
        .order_by(Story.created_at.desc())
    )
    result = db.execute(query)
    stories = result.scalars().all()
    
    # Process has_viewed
    user_id = current_user["id"] if current_user else None
    
    response_stories = []
    for s in stories:
        schema = StorySchema.model_validate(s)
        if user_id:
            schema.has_viewed = any(str(v.viewer_id) == str(user_id) for v in s.views)
        else:
            schema.has_viewed = False
        response_stories.append(schema)
        
    return response_stories

@router.post("/{story_id}/view", response_model=StoryViewSchema)
async def view_story(story_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    
    # Check if story exists and is active
    story = db.execute(select(Story).where(Story.id == story_id)).scalars().first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    if story.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Story has expired")
        
    # Check if view already exists
    existing_view = db.execute(
        select(StoryView).where(
            and_(StoryView.story_id == story_id, StoryView.viewer_id == user_id)
        )
    ).scalars().first()
    
    if existing_view:
        # Load relationships for existing
        ev = db.execute(select(StoryView).options(selectinload(StoryView.viewer)).where(StoryView.id == existing_view.id)).scalars().first()
        return ev
        
    # Create view
    new_view = StoryView(
        story_id=story_id,
        viewer_id=user_id
    )
    db.add(new_view)
    db.commit()
    db.refresh(new_view)
    
    nv = db.execute(select(StoryView).options(selectinload(StoryView.viewer)).where(StoryView.id == new_view.id)).scalars().first()
    return nv

@router.delete("/{story_id}")
async def delete_story(story_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    story = db.execute(select(Story).where(Story.id == story_id)).scalars().first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    if str(story.user_id) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this story")
        
    db.delete(story)
    db.commit()
    return {"detail": "Story deleted"}

@router.get("/{story_id}", response_model=StorySchema)
async def get_story(story_id: str, current_user: Optional[dict] = Depends(get_current_user), db: Session = Depends(get_db)):
    story = db.execute(
        select(Story)
        .options(selectinload(Story.user), selectinload(Story.views).selectinload(StoryView.viewer))
        .where(Story.id == story_id)
    ).scalars().first()
    
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    schema = StorySchema.model_validate(story)
    if current_user:
        schema.has_viewed = any(str(v.viewer_id) == str(current_user["id"]) for v in story.views)
    else:
        schema.has_viewed = False
        
    return schema
