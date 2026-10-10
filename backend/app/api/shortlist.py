from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Shortlist, CreatorProfile
from app.schemas.schemas import ShortlistCreate, ShortlistResponse

router = APIRouter(prefix="/shortlist", tags=["Shortlist"])

@router.get("", response_model=List[ShortlistResponse])
def get_shortlist(brief_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Shortlist)
    if brief_id:
        query = query.filter(Shortlist.brief_id == brief_id)
    return query.order_by(Shortlist.created_at.desc()).all()


@router.post("", response_model=ShortlistResponse)
def add_to_shortlist(data: ShortlistCreate, db: Session = Depends(get_db)):
    # Check if already in shortlist
    existing = db.query(Shortlist).filter(
        Shortlist.creator_id == data.creator_id,
        Shortlist.brief_id == data.brief_id
    ).first()
    if existing:
        return existing

    creator = db.query(CreatorProfile).filter(CreatorProfile.id == data.creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    shortlist_item = Shortlist(**data.model_dump())
    db.add(shortlist_item)
    db.commit()
    db.refresh(shortlist_item)
    return shortlist_item


@router.delete("/{shortlist_id}")
def remove_from_shortlist(shortlist_id: str, db: Session = Depends(get_db)):
    item = db.query(Shortlist).filter(Shortlist.id == shortlist_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shortlist item not found")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Removed from shortlist"}


@router.delete("/creator/{creator_id}")
def remove_creator_from_shortlist(creator_id: str, brief_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Shortlist).filter(Shortlist.creator_id == creator_id)
    if brief_id:
        query = query.filter(Shortlist.brief_id == brief_id)
    items = query.all()
    for it in items:
        db.delete(it)
    db.commit()
    return {"status": "success", "message": f"Removed {len(items)} item(s) from shortlist"}
