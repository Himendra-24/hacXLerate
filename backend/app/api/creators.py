from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.models import CreatorProfile, PortfolioProject, VerificationRecord
from app.schemas.schemas import (
    CreatorProfileResponse, CreatorProfileCreate, CreatorProfileUpdate,
    PortfolioProjectCreate, PortfolioProjectResponse, VerificationRecordResponse
)

router = APIRouter(prefix="/creators", tags=["Creators"])

@router.get("", response_model=List[CreatorProfileResponse])
def list_creators(
    search: Optional[str] = Query(None, description="Free text search over name, bio, skills, tools"),
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    tool: Optional[str] = Query(None, description="Filter by tool/model"),
    content_type: Optional[str] = Query(None, description="Filter by project content type"),
    aspect_ratio: Optional[str] = Query(None, description="Filter by aspect ratio"),
    availability: Optional[str] = Query(None, description="Filter by availability status"),
    verification_tier: Optional[str] = Query(None, description="Filter by verification tier"),
    max_rate: Optional[float] = Query(None, description="Max budget/rate"),
    db: Session = Depends(get_db)
):
    query = db.query(CreatorProfile)

    if availability:
        query = query.filter(CreatorProfile.availability_status == availability)

    if max_rate:
        query = query.filter(
            or_(CreatorProfile.rate_min <= max_rate, CreatorProfile.rate_min.is_(None))
        )

    creators = query.all()

    # In-memory structured filtering for JSON array attributes
    filtered = []
    for c in creators:
        # Search query
        if search:
            s = search.lower()
            name_match = s in c.display_name.lower() or s in c.title.lower() or s in c.bio.lower()
            skill_match = any(s in sk.lower() for sk in (c.skills or []))
            tool_match = any(s in t.lower() for t in (c.tools or []))
            spec_match = any(s in sp.lower() for sp in (c.specializations or []))
            proj_match = any(
                s in p.title.lower() or s in p.description.lower()
                for p in c.portfolio_projects
            )
            if not (name_match or skill_match or tool_match or spec_match or proj_match):
                continue

        # Specialization filter
        if specialization and specialization.lower() != "all":
            if not any(specialization.lower() in sp.lower() for sp in (c.specializations or [])):
                continue

        # Skill filter
        if skill and skill.lower() != "all":
            if not any(skill.lower() in sk.lower() for sk in (c.skills or [])):
                continue

        # Tool filter
        if tool and tool.lower() != "all":
            if not any(tool.lower() in t.lower() for t in (c.tools or [])):
                continue

        # Content type filter across projects
        if content_type and content_type.lower() != "all":
            has_ct = any(p.content_type.lower() == content_type.lower() for p in c.portfolio_projects)
            if not has_ct:
                continue

        # Aspect ratio filter across projects
        if aspect_ratio and aspect_ratio.lower() != "all":
            has_ar = any(aspect_ratio in (p.aspect_ratios or []) for p in c.portfolio_projects)
            if not has_ar:
                continue

        # Verification tier filter
        if verification_tier and verification_tier.lower() != "all":
            has_verified = any(v.status == "Verified" and not v.demo_only for v in c.verification_records)
            has_demo = any(v.demo_only for v in c.verification_records)
            if verification_tier.lower() == "verified" and not has_verified:
                continue
            elif verification_tier.lower() == "demo-only" and not has_demo:
                continue

        filtered.append(c)

    return filtered


@router.get("/{creator_id}", response_model=CreatorProfileResponse)
def get_creator(creator_id: str, db: Session = Depends(get_db)):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator


@router.post("", response_model=CreatorProfileResponse)
def create_creator(data: CreatorProfileCreate, db: Session = Depends(get_db)):
    creator = CreatorProfile(**data.model_dump())
    db.add(creator)
    db.commit()
    db.refresh(creator)
    return creator


@router.patch("/{creator_id}", response_model=CreatorProfileResponse)
def update_creator(creator_id: str, data: CreatorProfileUpdate, db: Session = Depends(get_db)):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(creator, key, value)

    db.commit()
    db.refresh(creator)
    return creator


@router.post("/{creator_id}/portfolio", response_model=PortfolioProjectResponse)
def add_portfolio_project(creator_id: str, data: PortfolioProjectCreate, db: Session = Depends(get_db)):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    proj_dict = data.model_dump()
    proj_dict["creator_id"] = creator_id
    project = PortfolioProject(**proj_dict)
    db.add(project)

    # Automatically add a self-reported verification record
    ver_record = VerificationRecord(
        creator_id=creator_id,
        portfolio_project_id=project.id,
        evidence_type="workflow_provenance",
        status="Self-reported",
        evidence_reference="Creator submission in Studio",
        notes="Awaiting manual platform verification",
        demo_only=True
    )
    db.add(ver_record)

    db.commit()
    db.refresh(project)
    return project


@router.get("/{creator_id}/verification", response_model=List[VerificationRecordResponse])
def get_creator_verifications(creator_id: str, db: Session = Depends(get_db)):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator.verification_records
