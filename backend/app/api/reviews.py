from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime

from app.core.database import get_db
from app.models.models import Review, CreatorProfile, Engagement
from app.schemas.schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Ratings & Reviews"])

@router.get("/creator/{creator_id}", response_model=List[ReviewResponse])
def get_creator_reviews(creator_id: str, db: Session = Depends(get_db)):
    """
    Get all verified client reviews and ratings for a creator.
    """
    reviews = (
        db.query(Review)
        .filter(Review.creator_id == creator_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews


@router.post("", response_model=ReviewResponse)
def create_review(review_in: ReviewCreate, db: Session = Depends(get_db)):
    """
    Submit a verified client review, update engagement status, and recalculate creator average rating.
    """
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == review_in.creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    new_review = Review(
        creator_id=review_in.creator_id,
        engagement_id=review_in.engagement_id,
        brand_name=review_in.brand_name,
        brand_avatar=review_in.brand_avatar,
        rating=review_in.rating,
        delivery_speed_rating=review_in.delivery_speed_rating,
        workflow_transparency_rating=review_in.workflow_transparency_rating,
        communication_rating=review_in.communication_rating,
        comment=review_in.comment,
        project_title=review_in.project_title,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_review)
    db.flush()

    # Recalculate average rating & count
    avg_rating, total_count = (
        db.query(func.avg(Review.rating), func.count(Review.id))
        .filter(Review.creator_id == review_in.creator_id)
        .first()
    )

    creator.rating_avg = round(float(avg_rating or 5.0), 1)
    creator.reviews_count = int(total_count or 1)

    db.commit()
    db.refresh(new_review)
    return new_review
