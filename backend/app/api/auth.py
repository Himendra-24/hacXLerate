from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.auth import require_current_user
from app.models.models import User, CreatorProfile, Brand
from app.schemas.schemas import (
    UserRegister, UserLogin, UserResponse, AuthResponse,
    CreatorProfileResponse, BrandResponse, OnboardingUpdate
)

router = APIRouter(prefix="/auth", tags=["Authentication & Onboarding"])

def _build_auth_response(user: User, db: Session, access_token: Optional[str] = None) -> AuthResponse:
    if not access_token:
        access_token = create_access_token({
            "sub": user.id,
            "role": user.role,
            "email": user.email,
            "display_name": user.display_name
        })

    creator_resp = None
    brand_resp = None

    if user.role == "creator":
        creator = db.query(CreatorProfile).filter(CreatorProfile.user_id == user.id).first()
        if creator:
            creator_resp = CreatorProfileResponse.model_validate(creator)
    elif user.role == "brand":
        brand = db.query(Brand).filter(Brand.owner_user_id == user.id).first()
        if brand:
            brand_resp = BrandResponse.model_validate(brand)

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        creator_profile=creator_resp,
        organization=brand_resp
    )

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user (Creator with personal profile or Brand with organization profile).
    """
    normalized_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # 1. Create User
    new_user = User(
        email=normalized_email,
        display_name=data.display_name.strip(),
        password_hash=hash_password(data.password),
        role=data.role,
        avatar_url=data.avatar_url or (
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
            if data.role == "creator"
            else "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"
        ),
        onboarding_completed=False,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # 2. Provision initial role-specific entity
    if data.role == "creator":
        creator = CreatorProfile(
            user_id=new_user.id,
            display_name=new_user.display_name,
            title=data.title or "Generative AI Filmmaker & Spec Artist",
            bio=data.bio or f"Hi! I'm {new_user.display_name}, creating next-generation generative video and commercial AI content.",
            avatar_url=new_user.avatar_url,
            location=data.location or "Remote",
            specializations=data.specializations if data.specializations is not None else ["AI Filmmaking", "Product CGI"],
            skills=data.skills if data.skills is not None else ["Prompt Engineering", "Color Grading", "Camera Motion"],
            tools=data.tools if data.tools is not None else ["Runway Gen-3", "Midjourney v6", "Topaz Video AI"],
            rate_min=data.rate_min if data.rate_min is not None else 1500,
            rate_max=data.rate_max if data.rate_max is not None else 3500,
            rating_avg=5.0,
            reviews_count=0,
            availability_status=data.availability_status or "Available",
            featured=False
        )
        db.add(creator)
        db.flush()

        # If an initial project was provided during registration
        if data.initial_project and isinstance(data.initial_project, dict):
            p = data.initial_project
            if p.get("title") and p.get("media_url"):
                from app.models.models import PortfolioProject, VerificationRecord
                new_proj = PortfolioProject(
                    creator_id=creator.id,
                    title=p.get("title"),
                    description=p.get("description", "Demonstrated commercial AI workflow project."),
                    media_url=p.get("media_url"),
                    thumbnail_url=p.get("thumbnail_url"),
                    content_type=p.get("content_type", "video"),
                    specialization=p.get("specialization", "AI Filmmaking"),
                    tools_used=p.get("tools_used", creator.tools or []),
                    skills_demonstrated=p.get("skills_demonstrated", creator.skills or []),
                    workflow_steps=p.get("workflow_steps", []),
                    aspect_ratios=p.get("aspect_ratios", ["16:9"]),
                    commercial_use_status=p.get("commercial_use_status", "Commercial Rights Granted"),
                    evidence_status="Self-reported"
                )
                db.add(new_proj)
                db.flush()
                db.add(VerificationRecord(
                    creator_id=creator.id,
                    portfolio_project_id=new_proj.id,
                    evidence_type="workflow_provenance",
                    status="Self-reported",
                    evidence_reference="Submitted during creator registration onboarding",
                    demo_only=True
                ))

        if data.title or data.skills or data.initial_project:
            new_user.onboarding_completed = True

    else:  # Brand
        company_title = data.company_name or f"{new_user.display_name}'s Studio"
        brand = Brand(
            owner_user_id=new_user.id,
            company_name=company_title,
            type=data.type or "brand",
            industry=data.industry or "Creative Production & Tech",
            website=data.website or "",
            logo_url=data.logo_url or new_user.avatar_url,
            description=data.description or f"Official creative workspace for {company_title}.",
            verified=True
        )
        db.add(brand)
        if data.company_name or data.industry:
            new_user.onboarding_completed = True

    db.commit()
    db.refresh(new_user)

    return _build_auth_response(new_user, db)


@router.post("/login", response_model=AuthResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and returns JWT bearer token with profile/org state.
    """
    normalized_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email, User.is_active == True).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Check password
    if not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    return _build_auth_response(user, db)


@router.get("/me", response_model=AuthResponse)
def get_me(user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    """
    Returns current authenticated user profile, creator profile or owned organization.
    """
    return _build_auth_response(user, db)


@router.post("/onboarding", response_model=AuthResponse)
def complete_onboarding(
    data: OnboardingUpdate,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Progressive onboarding submission. Updates creator profile or brand organization.
    """
    if user.role == "creator":
        creator = db.query(CreatorProfile).filter(CreatorProfile.user_id == user.id).first()
        if not creator:
            creator = CreatorProfile(
                user_id=user.id,
                display_name=user.display_name,
                title="AI Filmmaker",
                bio="",
                avatar_url=user.avatar_url
            )
            db.add(creator)

        if data.title:
            creator.title = data.title
        if data.bio:
            creator.bio = data.bio
        if data.location:
            creator.location = data.location
        if data.specializations is not None:
            creator.specializations = data.specializations
        if data.skills is not None:
            creator.skills = data.skills
        if data.tools is not None:
            creator.tools = data.tools
        if data.rate_min is not None:
            creator.rate_min = data.rate_min
        if data.rate_max is not None:
            creator.rate_max = data.rate_max
        if data.availability_status:
            creator.availability_status = data.availability_status

    elif user.role == "brand":
        brand = db.query(Brand).filter(Brand.owner_user_id == user.id).first()
        if not brand:
            brand = Brand(
                owner_user_id=user.id,
                company_name=data.company_name or f"{user.display_name}'s Studio",
                type=data.type or "brand"
            )
            db.add(brand)

        if data.company_name:
            brand.company_name = data.company_name
        if data.type:
            brand.type = data.type
        if data.industry:
            brand.industry = data.industry
        if data.website:
            brand.website = data.website
        if data.logo_url:
            brand.logo_url = data.logo_url
        if data.description:
            brand.description = data.description

    user.onboarding_completed = True
    db.commit()
    db.refresh(user)

    return _build_auth_response(user, db)
