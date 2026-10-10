from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Brief
from app.schemas.schemas import (
    BriefCreate, BriefUpdate, BriefResponse,
    RawIdeaRequest, StructuredDraftSuggestion
)
from app.services.brief_builder import structure_raw_idea

router = APIRouter(prefix="/briefs", tags=["Briefs"])

@router.post("/structure", response_model=StructuredDraftSuggestion)
async def generate_structured_brief(data: RawIdeaRequest):
    """
    Transforms unstructured brand idea into a structured draft with schema validation
    and explicit flagging of fields needing brand confirmation.
    """
    if not data.raw_idea or len(data.raw_idea.strip()) < 5:
        raise HTTPException(status_code=400, detail="Raw idea must be at least 5 characters.")

    draft = await structure_raw_idea(
        raw_idea=data.raw_idea,
        target_audience=data.target_audience,
        preferred_format=data.preferred_format
    )
    return draft


@router.get("", response_model=List[BriefResponse])
def list_briefs(db: Session = Depends(get_db)):
    return db.query(Brief).order_by(Brief.created_at.desc()).all()


@router.post("", response_model=BriefResponse)
def create_brief(data: BriefCreate, db: Session = Depends(get_db)):
    brief = Brief(**data.model_dump())
    db.add(brief)
    db.commit()
    db.refresh(brief)
    return brief


@router.get("/{brief_id}", response_model=BriefResponse)
def get_brief(brief_id: str, db: Session = Depends(get_db)):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return brief


@router.patch("/{brief_id}", response_model=BriefResponse)
def update_brief(brief_id: str, data: BriefUpdate, db: Session = Depends(get_db)):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(brief, key, val)

    db.commit()
    db.refresh(brief)
    return brief


@router.delete("/{brief_id}")
def delete_brief(brief_id: str, db: Session = Depends(get_db)):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    db.delete(brief)
    db.commit()
    return {"status": "success", "message": "Brief deleted"}
