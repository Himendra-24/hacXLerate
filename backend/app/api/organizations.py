from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.auth import require_current_user, require_role
from app.models.models import Brand, Brief, User
from app.schemas.schemas import (
    BrandCreate, BrandUpdate, BrandResponse, BrandDetailResponse, BriefResponse
)

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("", response_model=List[BrandResponse])
def list_organizations(
    type: Optional[str] = Query(None, description="Filter by type ('brand' or 'agency')"),
    search: Optional[str] = Query(None, description="Search company name or industry"),
    db: Session = Depends(get_db)
):
    query = db.query(Brand)
    if type:
        query = query.filter(Brand.type.ilike(f"%{type}%"))
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Brand.company_name.ilike(search_filter),
                Brand.industry.ilike(search_filter),
                Brand.description.ilike(search_filter)
            )
        )
    
    orgs = query.order_by(Brand.created_at.desc()).all()
    
    results = []
    for org in orgs:
        open_count = db.query(Brief).filter(
            Brief.organization_id == org.id,
            Brief.status == "open",
            Brief.visibility == "public"
        ).count()
        
        org_dict = {
            "id": org.id,
            "owner_user_id": org.owner_user_id,
            "company_name": org.company_name,
            "type": org.type,
            "industry": org.industry,
            "website": org.website,
            "logo_url": org.logo_url,
            "description": org.description,
            "verified": org.verified,
            "created_at": org.created_at,
            "updated_at": org.updated_at,
            "open_briefs_count": open_count
        }
        results.append(BrandResponse(**org_dict))
    
    return results


@router.post("", response_model=BrandResponse)
def create_organization(
    data: BrandCreate,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Creates an organization for the authenticated brand user.
    """
    org_dict = data.model_dump()
    org_dict["owner_user_id"] = current_user.id

    org = Brand(**org_dict)
    db.add(org)
    db.commit()
    db.refresh(org)
    
    return BrandResponse(
        id=org.id,
        owner_user_id=org.owner_user_id,
        company_name=org.company_name,
        type=org.type,
        industry=org.industry,
        website=org.website,
        logo_url=org.logo_url,
        description=org.description,
        verified=org.verified,
        created_at=org.created_at,
        updated_at=org.updated_at,
        open_briefs_count=0
    )


@router.get("/{organization_id}", response_model=BrandDetailResponse)
def get_organization(organization_id: str, db: Session = Depends(get_db)):
    org = db.query(Brand).filter(Brand.id == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Only return open, public briefs for public directory view
    open_briefs = db.query(Brief).filter(
        Brief.organization_id == org.id,
        Brief.status == "open",
        Brief.visibility == "public"
    ).order_by(Brief.created_at.desc()).all()
    
    brief_responses = [BriefResponse.model_validate(b) for b in open_briefs]
    
    return BrandDetailResponse(
        id=org.id,
        owner_user_id=org.owner_user_id,
        company_name=org.company_name,
        type=org.type,
        industry=org.industry,
        website=org.website,
        logo_url=org.logo_url,
        description=org.description,
        verified=org.verified,
        created_at=org.created_at,
        updated_at=org.updated_at,
        open_briefs_count=len(brief_responses),
        open_briefs=brief_responses
    )


@router.patch("/{organization_id}", response_model=BrandResponse)
def update_organization(
    organization_id: str,
    data: BrandUpdate,
    current_user: User = Depends(require_role(["brand", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Only the verified owner of the organization can update its profile details.
    """
    org = db.query(Brand).filter(Brand.id == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if org.owner_user_id and org.owner_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the organization owner can edit this organization."
        )
    
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(org, field, val)
    
    db.commit()
    db.refresh(org)
    
    open_count = db.query(Brief).filter(
        Brief.organization_id == org.id,
        Brief.status == "open",
        Brief.visibility == "public"
    ).count()

    return BrandResponse(
        id=org.id,
        owner_user_id=org.owner_user_id,
        company_name=org.company_name,
        type=org.type,
        industry=org.industry,
        website=org.website,
        logo_url=org.logo_url,
        description=org.description,
        verified=org.verified,
        created_at=org.created_at,
        updated_at=org.updated_at,
        open_briefs_count=open_count
    )
