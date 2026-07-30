import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models import User
from dependencies import get_current_user

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a media file (image/video) and returns the public URL.
    """
    try:
        # Generate unique filename
        ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file chunks
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(file_path)
        
        # Determine basic media type
        content_type = file.content_type or ""
        media_type = "video" if content_type.startswith("video") else "image"
            
        # Hardcoding the backend URL for local dev. In production, use env vars.
        # Alternatively, return relative path and let frontend append API_URL.
        public_url = f"/uploads/{unique_filename}"
        
        return {
            "status": "success",
            "media_url": public_url,
            "media_type": media_type,
            "size_bytes": file_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
