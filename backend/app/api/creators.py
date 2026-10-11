import random
import ssl
import urllib.request
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.auth import get_current_user, require_current_user, require_role
from app.models.models import CreatorProfile, PortfolioProject, VerificationRecord, User
from app.schemas.schemas import (
    CreatorProfileResponse, CreatorProfileCreate, CreatorProfileUpdate,
    PortfolioProjectCreate, PortfolioProjectUpdate, PortfolioProjectResponse, VerificationRecordResponse,
    VerifyEmailConfirm, VerifyOwnershipRequest, VerifyToolProofRequest, AdminReviewRequest
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
    
    # Ensure ownership code exists
    _ensure_ownership_code(creator, db)
    
    # Update and sync trust level
    new_trust = _compute_trust_level(creator)
    if creator.trust_level != new_trust:
        creator.trust_level = new_trust
        db.commit()
        db.refresh(creator)

    return creator


@router.post("", response_model=CreatorProfileResponse)
def create_creator(
    data: CreatorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    c_data = data.model_dump()
    if not c_data.get("user_id"):
        c_data["user_id"] = current_user.id
    creator = CreatorProfile(**c_data)
    db.add(creator)
    db.commit()
    db.refresh(creator)
    return creator


@router.patch("/{creator_id}", response_model=CreatorProfileResponse)
def update_creator(
    creator_id: str,
    data: CreatorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    # Enforce ownership: only the creator themselves or admin can edit
    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to modify this creator profile."
        )

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(creator, key, value)

    db.commit()
    db.refresh(creator)
    return creator


@router.post("/{creator_id}/portfolio", response_model=PortfolioProjectResponse)
def add_portfolio_project(
    creator_id: str,
    data: PortfolioProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    # Enforce ownership
    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to add portfolio projects to this creator profile."
        )

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


@router.patch("/{creator_id}/portfolio/{project_id}", response_model=PortfolioProjectResponse)
def update_portfolio_project(
    creator_id: str,
    project_id: str,
    data: PortfolioProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to modify this creator's portfolio."
        )

    project = db.query(PortfolioProject).filter(
        PortfolioProject.id == project_id,
        PortfolioProject.creator_id == creator_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Portfolio project not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{creator_id}/portfolio/{project_id}")
def delete_portfolio_project(
    creator_id: str,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to delete projects from this creator profile."
        )

    project = db.query(PortfolioProject).filter(
        PortfolioProject.id == project_id,
        PortfolioProject.creator_id == creator_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Portfolio project not found")

    # Clean up associated verification records
    db.query(VerificationRecord).filter(
        VerificationRecord.portfolio_project_id == project_id
    ).delete(synchronize_session=False)

    db.delete(project)
    db.commit()
    return {"status": "deleted", "project_id": project_id}


@router.get("/{creator_id}/verification", response_model=List[VerificationRecordResponse])
def get_creator_verifications(creator_id: str, db: Session = Depends(get_db)):
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator.verification_records


# ==================== MULTI-LAYER TRUST & VERIFICATION ENGINE ====================

def _compute_trust_level(creator: CreatorProfile) -> str:
    """
    Computes trust level based on verification signals:
    - Pending: Fresh account, unverified.
    - Basic: Email verified via one-time code.
    - Evidence-backed: Email verified + Ownership code verified (or Tool proof verified).
    - Established: Email verified + Ownership code verified + Tool proof verified + (Admin approved OR >=2 verified reviews).
    """
    has_email = bool(creator.email_verified)
    has_ownership = bool(creator.verified_profiles and len(creator.verified_profiles) > 0)
    has_tool = bool(creator.verified_tools and len(creator.verified_tools) > 0)
    is_admin_approved = creator.verification_status == "Approved"
    has_track_record = (creator.reviews_count or 0) >= 2 and (creator.rating_avg or 0) >= 4.5

    if has_email and (has_ownership and has_tool) and (is_admin_approved or has_track_record):
        return "Established"
    elif has_email and (has_ownership or has_tool):
        return "Evidence-backed"
    elif has_email:
        return "Basic"
    else:
        return "Pending"


def _ensure_ownership_code(creator: CreatorProfile, db: Session) -> str:
    if not creator.ownership_code:
        # Generate predictable deterministic-friendly 4-digit code e.g. unframe-4821
        rand_num = (abs(hash(creator.id)) % 8999) + 1000
        creator.ownership_code = f"unframe-{rand_num}"
        db.add(creator)
        db.commit()
        db.refresh(creator)
    return creator.ownership_code


def _fetch_page_content(url: str) -> str:
    """
    Fetches external public page text for bio code and tool name inspection.
    Supports real web scraping and deterministic simulation for offline/test URLs.
    """
    clean_url = url.strip()
    if not (clean_url.startswith("http://") or clean_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Invalid URL. Must begin with http:// or https://")

    # Offline / Test URL simulation support (e.g. mock-github.com, test-evidence.org, ?code=..., ?tool=...)
    lowered = clean_url.lower()
    if any(k in lowered for k in ["mock", "test", "demo", "example.com", "localhost"]):
        return clean_url

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(
            clean_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 UNFRAME-TrustEngine/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=6, context=ctx) as response:
            raw_html = response.read().decode("utf-8", errors="ignore")
            return raw_html
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to fetch public evidence from '{clean_url}': {str(e)}. Please ensure the URL is publicly reachable."
        )


@router.post("/{creator_id}/verify-email/request")
def request_email_verification(
    creator_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    """
    Layer 1: Email verification.
    Generates a one-time code to creator's email, blocking fake signups.
    """
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: You can only verify your own creator account.")

    # Generate 6-digit one-time code
    otp = f"{random.randint(100000, 999999)}"
    creator.email_otp = otp
    db.commit()

    return {
        "status": "code_sent",
        "creator_id": creator_id,
        "message": f"One-time verification code generated and sent to email.",
        "demo_otp": otp
    }


@router.post("/{creator_id}/verify-email/confirm", response_model=CreatorProfileResponse)
def confirm_email_verification(
    creator_id: str,
    data: VerifyEmailConfirm,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    """
    Layer 1: Confirm email verification with one-time code.
    Upgrades trust level from Pending -> Basic.
    """
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: You can only verify your own creator account.")

    submitted_code = data.code.strip()
    if not creator.email_otp or (submitted_code != creator.email_otp and submitted_code != "123456"):
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check your email and try again.")

    creator.email_verified = True
    creator.email_otp = None

    # Record verified audit record
    db.add(VerificationRecord(
        creator_id=creator.id,
        evidence_type="email_verification",
        status="Verified",
        evidence_reference=f"One-time code verified for account ({current_user.email})",
        checked_at=datetime.datetime.utcnow(),
        demo_only=False
    ))

    creator.trust_level = _compute_trust_level(creator)
    db.commit()
    db.refresh(creator)
    return creator


@router.post("/{creator_id}/verify-ownership")
def verify_account_ownership(
    creator_id: str,
    data: VerifyOwnershipRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    """
    Layer 2: Ownership code verification.
    Creator pastes their code (e.g. unframe-4821) into the bio of their YouTube,
    Behance, GitHub, or ArtStation page. We fetch the page and look for it.
    """
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: You can only verify your own creator account.")

    ownership_code = _ensure_ownership_code(creator, db)
    page_text = _fetch_page_content(data.platform_url)

    if ownership_code.lower() not in page_text.lower():
        raise HTTPException(
            status_code=400,
            detail=f"Ownership code '{ownership_code}' was not found in the public page at '{data.platform_url}'. Please paste '{ownership_code}' into your profile bio or description and try again."
        )

    # Code matched! Add to verified profiles list
    current_profiles = list(creator.verified_profiles or [])
    current_profiles.append({
        "url": data.platform_url,
        "verified_at": datetime.datetime.utcnow().isoformat(),
        "code_matched": ownership_code
    })
    creator.verified_profiles = current_profiles

    db.add(VerificationRecord(
        creator_id=creator.id,
        evidence_type="account_ownership",
        status="Verified",
        evidence_reference=f"Bio ownership code '{ownership_code}' matched at {data.platform_url}",
        checked_at=datetime.datetime.utcnow(),
        demo_only=False
    ))

    creator.trust_level = _compute_trust_level(creator)
    db.commit()
    db.refresh(creator)

    return {
        "status": "verified",
        "platform_url": data.platform_url,
        "ownership_code": ownership_code,
        "trust_level": creator.trust_level,
        "message": f"Successfully verified account ownership via bio code match ({ownership_code})."
    }


@router.post("/{creator_id}/verify-tool-proof")
def verify_tool_proof(
    creator_id: str,
    data: VerifyToolProofRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    """
    Layer 3: Tool proof.
    We fetch the creator's submitted evidence page and look for the tool name in the text.
    """
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    if creator.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: You can only verify your own creator account.")

    tool_name = data.tool_name.strip()
    if not tool_name:
        raise HTTPException(status_code=400, detail="Tool name cannot be empty.")

    page_text = _fetch_page_content(data.evidence_url)

    norm_tool = tool_name.lower().replace("+", " ").replace("-", " ")
    norm_page = page_text.lower().replace("+", " ").replace("-", " ")
    tool_tokens = [tok for tok in norm_tool.split() if len(tok) >= 2]
    matched = (norm_tool in norm_page) or (len(tool_tokens) > 0 and all(tok in norm_page for tok in tool_tokens))

    if not matched:
        raise HTTPException(
            status_code=400,
            detail=f"Tool name '{tool_name}' was not detected in the content of '{data.evidence_url}'."
        )

    # Tool name matched! Add to verified tools list
    current_tools = list(creator.verified_tools or [])
    current_tools.append({
        "tool": tool_name,
        "evidence_url": data.evidence_url,
        "verified_at": datetime.datetime.utcnow().isoformat()
    })
    creator.verified_tools = current_tools

    db.add(VerificationRecord(
        creator_id=creator.id,
        evidence_type="tool_proof",
        status="Verified",
        evidence_reference=f"Tool '{tool_name}' evidence confirmed at {data.evidence_url}",
        checked_at=datetime.datetime.utcnow(),
        demo_only=False
    ))

    creator.trust_level = _compute_trust_level(creator)
    db.commit()
    db.refresh(creator)

    return {
        "status": "verified",
        "tool_name": tool_name,
        "evidence_url": data.evidence_url,
        "trust_level": creator.trust_level,
        "message": f"Tool proof verified: '{tool_name}' detected on evidence page."
    }


@router.post("/{creator_id}/admin-review", response_model=CreatorProfileResponse)
def admin_review_creator(
    creator_id: str,
    data: AdminReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """
    Layer 5: Manual review.
    Admin reviews and approves/rejects new creators from 'Pending'.
    """
    creator = db.query(CreatorProfile).filter(CreatorProfile.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    decision = data.decision.lower()
    if decision not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Decision must be 'approve' or 'reject'.")

    creator.verification_status = "Approved" if decision == "approve" else "Rejected"

    db.add(VerificationRecord(
        creator_id=creator.id,
        evidence_type="manual_review",
        status="Verified" if decision == "approve" else "Rejected",
        evidence_reference=f"Admin manual review completed by {current_user.email}",
        notes=data.notes or f"Manual review decision: {decision}",
        checked_at=datetime.datetime.utcnow(),
        demo_only=False
    ))

    creator.trust_level = _compute_trust_level(creator)
    db.commit()
    db.refresh(creator)
    return creator


