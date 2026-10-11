import os
import uuid
import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_current_user
from app.models.models import AssetUpload, User, CreatorProfile, Brand, Engagement
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
    file_type: str = Form("video"),
    related_entity_type: str = Form(None),
    related_entity_id: str = Form(None),
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Secure file upload endpoint.
    - Requires authenticated user.
    - Authoritatively derives uploader identity & role from JWT.
    - Enforces file type and size validation.
    - Authorizes related entity ownership (creator, organization, engagement).
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a valid filename.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Resource ownership & authorization verification
    if related_entity_type and related_entity_id:
        entity_type_lower = related_entity_type.lower()
        if entity_type_lower == "creator":
            creator = db.query(CreatorProfile).filter(CreatorProfile.id == related_entity_id).first()
            if creator and creator.user_id != current_user.id and current_user.role != "admin":
                raise HTTPException(status_code=403, detail="Forbidden: You cannot upload assets for another creator's profile.")
        elif entity_type_lower in ("organization", "brand"):
            org = db.query(Brand).filter(Brand.id == related_entity_id).first()
            if org and org.owner_user_id and org.owner_user_id != current_user.id and current_user.role != "admin":
                raise HTTPException(status_code=403, detail="Forbidden: You cannot upload assets for an organization you do not own.")
        elif entity_type_lower == "engagement":
            engagement = db.query(Engagement).filter(Engagement.id == related_entity_id).first()
            if engagement:
                creator = db.query(CreatorProfile).filter(CreatorProfile.id == engagement.creator_id).first()
                creator_uid = creator.user_id if creator else None
                org = db.query(Brand).filter(Brand.id == engagement.brand_id).first()
                org_uid = org.owner_user_id if org else None
                
                is_authorized_party = (current_user.id in (creator_uid, org_uid) or current_user.role == "admin")
                if not is_authorized_party:
                    raise HTTPException(status_code=403, detail="Forbidden: You are not an authorized participant in this engagement.")

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
        uploader_role=current_user.role,
        uploader_user_id=current_user.id,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )

    db.add(asset_record)
    db.commit()
    db.refresh(asset_record)

    return asset_record
