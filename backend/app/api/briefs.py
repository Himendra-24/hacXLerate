from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.auth import get_current_user, require_current_user, require_role
from app.models.models import Brief, BriefApplication, CreatorProfile, User, Brand
from app.schemas.schemas import (
    BriefCreate, BriefUpdate, BriefResponse,
    BriefApplicationCreate, BriefApplicationResponse, BriefApplicationStatusUpdate,
    RawIdeaRequest, StructuredDraftSuggestion, BrandResponse
)
from app.services.brief_builder import structure_raw_idea

router = APIRouter(prefix="/briefs", tags=["Briefs"])

def _format_brief_response(brief: Brief, db: Session) -> BriefResponse:
    app_count = db.query(BriefApplication).filter(BriefApplication.brief_id == brief.id).count()
    org_resp = None
    if brief.organization:
        org_resp = BrandResponse(
            id=brief.organization.id,
            owner_user_id=brief.organization.owner_user_id,
            company_name=brief.organization.company_name,
            type=brief.organization.type,
            industry=brief.organization.industry,
            website=brief.organization.website,
            logo_url=brief.organization.logo_url,
            description=brief.organization.description,
            verified=brief.organization.verified,
            created_at=brief.organization.created_at,
            updated_at=brief.organization.updated_at
        )
    
    resp = BriefResponse.model_validate(brief)
    resp.applications_count = app_count
    resp.organization = org_resp
    return resp


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


@router.get("/open", response_model=List[BriefResponse])
def list_open_briefs(
    category: Optional[str] = Query(None, description="Filter by content_type or style"),
    aspect_ratio: Optional[str] = Query(None, description="Filter by aspect ratio e.g. 16:9, 9:16"),
    budget_min: Optional[float] = Query(None, description="Minimum budget filter"),
    budget_max: Optional[float] = Query(None, description="Maximum budget filter"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    db: Session = Depends(get_db)
):
    """
    Public open briefs board. Only open and public briefs are visible.
    """
    query = db.query(Brief).filter(
        Brief.status == "open",
        Brief.visibility == "public"
    )

    if category:
        cat_filter = f"%{category}%"
        query = query.filter(
            or_(
                Brief.content_type.ilike(cat_filter),
                Brief.title.ilike(cat_filter),
                Brief.description.ilike(cat_filter)
            )
        )

    if aspect_ratio:
        query = query.filter(Brief.aspect_ratio == aspect_ratio)

    if budget_min is not None:
        query = query.filter(
            or_(
                Brief.budget_max >= budget_min,
                Brief.budget_min >= budget_min
            )
        )

    if budget_max is not None:
        query = query.filter(
            or_(
                Brief.budget_min <= budget_max,
                Brief.budget_max <= budget_max
            )
        )

    if search:
        s_filter = f"%{search}%"
        query = query.filter(
            or_(
                Brief.title.ilike(s_filter),
                Brief.objective.ilike(s_filter),
                Brief.description.ilike(s_filter)
            )
        )

    briefs = query.order_by(Brief.created_at.desc()).all()
    return [_format_brief_response(b, db) for b in briefs]


@router.get("", response_model=List[BriefResponse])
def list_briefs(
    status: Optional[str] = Query(None, description="Filter by brief status"),
    brand_user_id: Optional[str] = Query(None, description="Filter by brand user"),
    organization_id: Optional[str] = Query(None, description="Filter by organization"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List briefs. If brand_user_id or organization_id is passed, filters accordingly.
    """
    query = db.query(Brief)
    if status:
        query = query.filter(Brief.status == status)
    if brand_user_id:
        query = query.filter(Brief.brand_user_id == brand_user_id)
    if organization_id:
        query = query.filter(Brief.organization_id == organization_id)

    briefs = query.order_by(Brief.created_at.desc()).all()
    return [_format_brief_response(b, db) for b in briefs]


@router.post("", response_model=BriefResponse)
def create_brief(
    data: BriefCreate,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Creates a brief owned by the authenticated brand user.
    """
    brief_data = data.model_dump()
    brief_data["brand_user_id"] = current_user.id

    if not brief_data.get("organization_id"):
        brand_org = db.query(Brand).filter(Brand.owner_user_id == current_user.id).first()
        if brand_org:
            brief_data["organization_id"] = brand_org.id

    brief = Brief(**brief_data)
    db.add(brief)
    db.commit()
    db.refresh(brief)
    return _format_brief_response(brief, db)


@router.get("/{brief_id}", response_model=BriefResponse)
def get_brief(
    brief_id: str,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    # If the brief is in draft status or private visibility, only the owner can view it
    if brief.status == "draft" or brief.visibility == "private":
        if not current_user or (current_user.id != brief.brand_user_id and current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Public cannot view draft or private briefs"
            )

    return _format_brief_response(brief, db)


@router.patch("/{brief_id}", response_model=BriefResponse)
def update_brief(
    brief_id: str,
    data: BriefUpdate,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    if brief.brand_user_id and brief.brand_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the campaign owner can edit this brief."
        )

    update_dict = data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(brief, key, val)

    db.commit()
    db.refresh(brief)
    return _format_brief_response(brief, db)


@router.delete("/{brief_id}")
def delete_brief(
    brief_id: str,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    if brief.brand_user_id and brief.brand_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the campaign owner can delete this brief."
        )

    db.delete(brief)
    db.commit()
    return {"status": "success", "message": "Brief deleted"}


# ==================== BRIEF APPLICATIONS (CREATOR ONLY) ====================

@router.post("/{brief_id}/apply", response_model=BriefApplicationResponse)
def apply_to_brief(
    brief_id: str,
    data: BriefApplicationCreate,
    current_user: User = Depends(require_role(["creator", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Creator-only endpoint to submit an application to an open brief.
    Derives applicant creator identity strictly from the authenticated user token.
    """
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    if brief.status != "open":
        raise HTTPException(status_code=400, detail="Cannot apply to a brief that is not open")

    # Authoritative creator lookup from authenticated user
    creator = db.query(CreatorProfile).filter(CreatorProfile.user_id == current_user.id).first()
    if not creator:
        # Fallback if creator profile ID was registered directly
        creator = db.query(CreatorProfile).filter(CreatorProfile.id == current_user.id).first()
        if not creator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only creators with an active creator profile can apply to briefs."
            )

    # Check if creator already applied
    existing_app = db.query(BriefApplication).filter(
        BriefApplication.brief_id == brief.id,
        BriefApplication.creator_id == creator.id
    ).first()

    if existing_app:
        existing_app.pitch = data.pitch
        existing_app.status = "pending"
        if data.proposed_rate is not None:
            existing_app.proposed_rate = data.proposed_rate
        if data.portfolio_sample_urls:
            existing_app.portfolio_sample_urls = data.portfolio_sample_urls
        db.commit()
        db.refresh(existing_app)
        return BriefApplicationResponse.model_validate(existing_app)

    new_app = BriefApplication(
        brief_id=brief.id,
        creator_id=creator.id,
        pitch=data.pitch,
        proposed_rate=data.proposed_rate,
        portfolio_sample_urls=data.portfolio_sample_urls or [],
        status="pending"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return BriefApplicationResponse.model_validate(new_app)


@router.get("/my-applications/all", response_model=List[BriefApplicationResponse])
def get_my_applications(
    current_user: User = Depends(require_role(["creator", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Retrieves all applications submitted by the current authenticated creator.
    """
    creator = db.query(CreatorProfile).filter(CreatorProfile.user_id == current_user.id).first()
    if not creator:
        return []

    apps = db.query(BriefApplication).filter(
        BriefApplication.creator_id == creator.id
    ).order_by(BriefApplication.created_at.desc()).all()

    return [BriefApplicationResponse.model_validate(a) for a in apps]


@router.get("/{brief_id}/applications", response_model=List[BriefApplicationResponse])
def get_brief_applications(
    brief_id: str,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Retrieve all applications submitted to this brief for brand review.
    Only the owning brand can inspect applications.
    """
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    if brief.brand_user_id and brief.brand_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the brief owner can view its applications."
        )

    apps = db.query(BriefApplication).filter(
        BriefApplication.brief_id == brief_id
    ).order_by(BriefApplication.created_at.desc()).all()

    return [BriefApplicationResponse.model_validate(a) for a in apps]


@router.patch("/applications/{application_id}", response_model=BriefApplicationResponse)
def update_application_status(
    application_id: str,
    data: BriefApplicationStatusUpdate,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Brand reviews and updates application status ('reviewed', 'accepted', 'declined').
    """
    app_record = db.query(BriefApplication).filter(BriefApplication.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    if app_record.brief and app_record.brief.brand_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the campaign owner can review applications."
        )

    app_record.status = data.status
    db.commit()
    db.refresh(app_record)
    return BriefApplicationResponse.model_validate(app_record)
