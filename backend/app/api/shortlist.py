from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_current_user, require_role
from app.models.models import Shortlist, CreatorProfile, User
from app.schemas.schemas import ShortlistCreate, ShortlistResponse

router = APIRouter(prefix="/shortlist", tags=["Shortlist"])


@router.get("", response_model=List[ShortlistResponse])
def get_shortlist(
    brief_id: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated brand user's shortlist.
    Optionally filtered by brief_id.
    """
    query = db.query(Shortlist).filter(Shortlist.brand_user_id == current_user.id)
    if brief_id:
        query = query.filter(Shortlist.brief_id == brief_id)
    return query.order_by(Shortlist.created_at.desc()).all()


@router.post("", response_model=ShortlistResponse)
def add_to_shortlist(
    data: ShortlistCreate,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Adds a creator to the authenticated brand's shortlist.
    """
    # Check if already in shortlist for this user
    existing = db.query(Shortlist).filter(
        Shortlist.brand_user_id == current_user.id,
        Shortlist.creator_id == data.creator_id,
        Shortlist.brief_id == data.brief_id
    ).first()
    if existing:
        return existing

    creator = db.query(CreatorProfile).filter(CreatorProfile.id == data.creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    shortlist_item = Shortlist(
        brand_user_id=current_user.id,
        creator_id=data.creator_id,
        brief_id=data.brief_id,
        notes=data.notes
    )
    db.add(shortlist_item)
    db.commit()
    db.refresh(shortlist_item)
    return shortlist_item


@router.delete("/{shortlist_id}")
def remove_from_shortlist(
    shortlist_id: str,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    item = db.query(Shortlist).filter(Shortlist.id == shortlist_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shortlist item not found")

    # Only the owning brand can remove
    if item.brand_user_id and item.brand_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to remove this shortlist item."
        )

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Removed from shortlist"}


@router.delete("/creator/{creator_id}")
def remove_creator_from_shortlist(
    creator_id: str,
    brief_id: Optional[str] = None,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(Shortlist).filter(
        Shortlist.creator_id == creator_id,
        Shortlist.brand_user_id == current_user.id
    )
    if brief_id:
        query = query.filter(Shortlist.brief_id == brief_id)
    items = query.all()
    for it in items:
        db.delete(it)
    db.commit()
    return {"status": "success", "message": f"Removed {len(items)} item(s) from shortlist"}
