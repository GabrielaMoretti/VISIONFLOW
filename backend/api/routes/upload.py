"""Upload endpoint — receives images for processing."""

import os
import uuid
from datetime import datetime

import aiofiles
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif", ".bmp"}


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image for processing."""
    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 50MB)")

    # Save file
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    return {
        "id": file_id,
        "filename": filename,
        "original_name": file.filename,
        "size": len(content),
        "format": ext.lstrip("."),
        "uploaded_at": datetime.utcnow().isoformat(),
    }
