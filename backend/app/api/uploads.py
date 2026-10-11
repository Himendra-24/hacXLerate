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

ALLOWED_EXTENSIONS = {
    ".mp4", ".mov", ".webm", ".avi",
    ".jpg", ".jpeg", ".png", ".webp", ".gif",
    ".json", ".zip", ".tar", ".gz"
}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

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
    Validates file extension, size limit, and persists file metadata to database.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a valid filename.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
        )

    unique_filename = f"{uuid.uuid4()}{ext}"
    destination_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(destination_path, "wb") as f:
            f.write(file_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to write file to storage: {str(exc)}")

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
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )

    db.add(asset_record)
    db.commit()
    db.refresh(asset_record)

    return asset_record

