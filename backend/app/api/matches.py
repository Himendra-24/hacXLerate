from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Brief, CreatorProfile
from app.schemas.schemas import CreatorMatchResult, BriefCreate
from app.services.matching import evaluate_creator_fit

router = APIRouter(tags=["Creative Fit Intelligence"])

@router.post("/briefs/{brief_id}/matches", response_model=List[CreatorMatchResult])
def match_creators_for_brief(
    brief_id: str,
    filter_passed_only: bool = Query(False, description="Whether to hide candidates with mandatory violations"),
    db: Session = Depends(get_db)
):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    creators = db.query(CreatorProfile).all()
    results: List[CreatorMatchResult] = []

    for c in creators:
        match_result = evaluate_creator_fit(creator=c, brief=brief)
        if filter_passed_only and not match_result.breakdown.mandatory_passed:
            continue
        results.append(match_result)

    # Sort: Mandatory passed first, then highest score descending
    results.sort(
        key=lambda r: (1 if r.breakdown.mandatory_passed else 0, r.score),
        reverse=True
    )

    return results


@router.post("/matches/preview", response_model=List[CreatorMatchResult])
def preview_matches_for_draft(
    draft_brief: BriefCreate,
    db: Session = Depends(get_db)
):
    """
    Evaluates creator fit against an unsaved/draft brief in real time.
    """
    temp_brief = Brief(**draft_brief.model_dump())
    creators = db.query(CreatorProfile).all()

    results: List[CreatorMatchResult] = []
    for c in creators:
        match_result = evaluate_creator_fit(creator=c, brief=temp_brief)
        results.append(match_result)

    results.sort(
        key=lambda r: (1 if r.breakdown.mandatory_passed else 0, r.score),
        reverse=True
    )

    return results
