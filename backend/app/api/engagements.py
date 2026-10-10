from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Engagement, Submission, Brief, CreatorProfile
from app.schemas.schemas import (
    EngagementCreate, EngagementUpdate, EngagementResponse,
    SubmissionCreate, SubmissionFeedbackUpdate, SubmissionResponse
)

router = APIRouter(prefix="/engagements", tags=["Engagements & Delivery"])

@router.get("", response_model=List[EngagementResponse])
def list_engagements(db: Session = Depends(get_db)):
    return db.query(Engagement).order_by(Engagement.updated_at.desc()).all()


@router.post("", response_model=EngagementResponse)
def create_engagement(data: EngagementCreate, db: Session = Depends(get_db)):
    brief = db.query(Brief).filter(Brief.id == data.brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    creator = db.query(CreatorProfile).filter(CreatorProfile.id == data.creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    # Terms agreed summary
    agreed_terms = data.agreed_terms or {
        "budget": brief.budget_max or creator.rate_min or 2500,
        "deadline": brief.deadline or "2026-11-20",
        "commercial_scope": brief.commercial_use_scope,
        "license_duration_months": brief.license_duration_months or 12,
        "revision_limit": brief.revision_limit or 2,
        "aspect_ratio": brief.aspect_ratio,
        "resolution": brief.resolution
    }

    engagement = Engagement(
        brief_id=data.brief_id,
        creator_id=data.creator_id,
        status="invited",
        agreed_terms=agreed_terms
    )
    db.add(engagement)
    db.commit()
    db.refresh(engagement)
    return engagement


@router.get("/{engagement_id}", response_model=EngagementResponse)
def get_engagement(engagement_id: str, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.id == engagement_id).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    return engagement


@router.patch("/{engagement_id}", response_model=EngagementResponse)
def update_engagement(engagement_id: str, data: EngagementUpdate, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.id == engagement_id).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")

    if data.status:
        valid_statuses = ["invited", "in_progress", "revision_requested", "approved", "delivered"]
        if data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        engagement.status = data.status

    if data.agreed_terms:
        engagement.agreed_terms = data.agreed_terms

    db.commit()
    db.refresh(engagement)
    return engagement


@router.post("/{engagement_id}/submissions", response_model=SubmissionResponse)
def add_submission(engagement_id: str, data: SubmissionCreate, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.id == engagement_id).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")

    # Current version count
    count = db.query(Submission).filter(Submission.engagement_id == engagement_id).count()
    version_num = count + 1

    submission = Submission(
        engagement_id=engagement_id,
        version_number=version_num,
        media_url=data.media_url,
        creator_note=data.creator_note,
        status="pending"
    )
    db.add(submission)

    # Update engagement status to in_progress
    engagement.status = "in_progress"

    db.commit()
    db.refresh(submission)
    return submission


@router.post("/submissions/{submission_id}/feedback", response_model=SubmissionResponse)
def provide_submission_feedback(submission_id: str, data: SubmissionFeedbackUpdate, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.brand_feedback = data.brand_feedback
    submission.status = data.status

    engagement = db.query(Engagement).filter(Engagement.id == submission.engagement_id).first()
    if engagement:
        if data.status == "approved":
            engagement.status = "approved"
        elif data.status == "revision_requested":
            engagement.status = "revision_requested"

    db.commit()
    db.refresh(submission)
    return submission
