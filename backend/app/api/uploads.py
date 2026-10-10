import os
import uuid
import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import AssetUpload
from app.schemas.schemas import AssetUploadResponse

router = APIRouter(prefix="/uploads", tags=["Asset & File Storage"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=AssetUploadResponse)
async def upload_asset_file(
    file: UploadFile = File(...),
    uploader_role: str = Form("brand"),
    file_type: str = Form("video"),
    related_entity_type: str = Form(None),
    related_entity_id: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload real asset files (deliverable video, prompt text, LoRA weights, workflow JSON).
    """
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    destination_path = os.path.join(UPLOAD_DIR, unique_filename)

    file_bytes = await file.read()
    file_size = len(file_bytes)

    with open(destination_path, "wb") as f:
        f.write(file_bytes)

    asset_url = f"/uploads/{unique_filename}"

    asset_record = AssetUpload(
        filename=unique_filename,
        original_filename=file.filename,
        file_type=file_type,
        file_size_bytes=file_size,
        storage_path=destination_path,
        url=asset_url,
        uploader_role=uploader_role,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
        created_at=datetime.datetime.utcnow()
    )

    db.add(asset_record)
    db.commit()
    db.refresh(asset_record)

    return asset_record
