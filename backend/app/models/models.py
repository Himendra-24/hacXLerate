import datetime
import uuid
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    role = Column(String, default="brand")  # "brand", "creator", "admin"
    display_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator_profile = relationship("CreatorProfile", back_populates="user", uselist=False)
    briefs = relationship("Brief", back_populates="brand_user")
    shortlists = relationship("Shortlist", back_populates="brand_user")
    owned_brands = relationship("Brand", back_populates="owner")


class Brand(Base):
    __tablename__ = "brands"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    company_name = Column(String, nullable=False)
    type = Column(String, default="brand")  # "brand" | "agency"
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="owned_brands")
    briefs = relationship("Brief", back_populates="organization", cascade="all, delete-orphan")


class CreatorProfile(Base):
    __tablename__ = "creator_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    display_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    bio = Column(Text, nullable=False)
    avatar_url = Column(String, nullable=True)
    location = Column(String, default="Remote")
    specializations = Column(JSON, default=list)  # e.g., ["AI Filmmaking", "Product CGI"]
    skills = Column(JSON, default=list)            # e.g., ["Prompt Engineering", "Camera Motion", "Compositing"]
    tools = Column(JSON, default=list)             # e.g., ["Runway Gen-3", "Midjourney v6", "ComfyUI"]
    rate_min = Column(Float, nullable=True)
    rate_max = Column(Float, nullable=True)
    rating_avg = Column(Float, default=4.9)
    reviews_count = Column(Integer, default=1)
    availability_status = Column(String, default="Available")  # "Available", "Busy", "Booked"
    featured = Column(Boolean, default=False)
    
    # Trust & Verification System (Pending -> Basic -> Evidence-backed -> Established)
    trust_level = Column(String, default="Pending")  # "Pending", "Basic", "Evidence-backed", "Established"
    verification_status = Column(String, default="Pending")  # "Pending", "Approved", "Rejected"
    email_verified = Column(Boolean, default=False)
    email_otp = Column(String, nullable=True)
    ownership_code = Column(String, nullable=True)  # e.g., "unframe-4821"
    verified_profiles = Column(JSON, default=list)  # [{"platform": "...", "url": "...", "verified_at": "..."}]
    verified_tools = Column(JSON, default=list)  # [{"tool": "...", "evidence_url": "...", "verified_at": "..."}]

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="creator_profile")
    portfolio_projects = relationship("PortfolioProject", back_populates="creator", cascade="all, delete-orphan")
    verification_records = relationship("VerificationRecord", back_populates="creator", cascade="all, delete-orphan")
    engagements = relationship("Engagement", back_populates="creator")
    shortlists = relationship("Shortlist", back_populates="creator")
    reviews = relationship("Review", back_populates="creator", cascade="all, delete-orphan")
    applications = relationship("BriefApplication", back_populates="creator", cascade="all, delete-orphan")


class PortfolioProject(Base):
    __tablename__ = "portfolio_projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(String, ForeignKey("creator_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    media_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    content_type = Column(String, nullable=False)  # "video", "animation", "image", "audio", "cgi"
    specialization = Column(String, nullable=False)
    tools_used = Column(JSON, default=list)        # ["Runway Gen-3", "Premiere Pro"]
    model_versions = Column(JSON, default=dict)    # {"Runway": "Gen-3 Alpha Turbo", "Upscaler": "Topaz Video AI 4"}
    skills_demonstrated = Column(JSON, default=list)
    workflow_steps = Column(JSON, default=list)    # [{"step": 1, "name": "Concept", "tool": "Claude 3.5", "description": "..."}]
    aspect_ratios = Column(JSON, default=list)     # ["16:9", "9:16"]
    commercial_use_status = Column(String, default="Commercial Rights Granted")  
    # "Commercial Rights Granted", "Requires Confirmation", "Editorial Only", "Non-Commercial Only"
    evidence_status = Column(String, default="Self-reported")
    # "Self-reported", "Evidence submitted", "Pending review", "Verified", "Demo-only"
    prompt_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("CreatorProfile", back_populates="portfolio_projects")
    verification_records = relationship("VerificationRecord", back_populates="portfolio_project")


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(String, ForeignKey("creator_profiles.id"), nullable=False)
    portfolio_project_id = Column(String, ForeignKey("portfolio_projects.id"), nullable=True)
    evidence_type = Column(String, nullable=False)  # "tool_usage", "workflow_provenance", "portfolio_review", "track_record"
    status = Column(String, default="Verified")    # "Verified", "Pending review", "Self-reported", "Demo-only"
    evidence_reference = Column(String, nullable=True) # e.g. "Runway generation logs hash: #RW-8942-A"
    checked_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    demo_only = Column(Boolean, default=True)

    creator = relationship("CreatorProfile", back_populates="verification_records")
    portfolio_project = relationship("PortfolioProject", back_populates="verification_records")


class Brief(Base):
    __tablename__ = "briefs"

    id = Column(String, primary_key=True, default=generate_uuid)
    brand_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    organization_id = Column(String, ForeignKey("brands.id"), nullable=True)
    title = Column(String, nullable=False)
    objective = Column(Text, nullable=False)
    raw_idea = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    content_type = Column(String, nullable=False)  # "video", "animation", "image", "cgi", "motion"
    style_tags = Column(JSON, default=list)        # ["cinematic", "photorealistic", "dark mood", "cyberpunk"]
    aspect_ratio = Column(String, nullable=False)  # "9:16", "16:9", "1:1", "4:5"
    duration = Column(String, nullable=True)       # e.g., "15-30s"
    resolution = Column(String, default="1080p")   # "1080p", "4K"
    commercial_use_scope = Column(String, default="Full Commercial (Digital & Broadcast)")
    license_duration_months = Column(Integer, nullable=True) # e.g., 12
    exclusivity_required = Column(Boolean, default=False)
    revision_limit = Column(Integer, default=2)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    deadline = Column(String, nullable=True)
    status = Column(String, default="open")        # "draft", "open", "closed"
    visibility = Column(String, default="public")  # "public", "private"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    brand_user = relationship("User", back_populates="briefs")
    organization = relationship("Brand", back_populates="briefs")
    engagements = relationship("Engagement", back_populates="brief")
    shortlists = relationship("Shortlist", back_populates="brief")
    applications = relationship("BriefApplication", back_populates="brief", cascade="all, delete-orphan")


class BriefApplication(Base):
    __tablename__ = "brief_applications"

    id = Column(String, primary_key=True, default=generate_uuid)
    brief_id = Column(String, ForeignKey("briefs.id"), nullable=False)
    creator_id = Column(String, ForeignKey("creator_profiles.id"), nullable=False)
    pitch = Column(Text, nullable=False)
    proposed_rate = Column(Float, nullable=True)
    portfolio_sample_urls = Column(JSON, default=list)
    status = Column(String, default="pending")  # "pending", "reviewed", "accepted", "declined"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    brief = relationship("Brief", back_populates="applications")
    creator = relationship("CreatorProfile", back_populates="applications")


class Shortlist(Base):
    __tablename__ = "shortlists"

    id = Column(String, primary_key=True, default=generate_uuid)
    brand_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    brief_id = Column(String, ForeignKey("briefs.id"), nullable=True)
    creator_id = Column(String, ForeignKey("creator_profiles.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    brand_user = relationship("User", back_populates="shortlists")
    brief = relationship("Brief", back_populates="shortlists")
    creator = relationship("CreatorProfile", back_populates="shortlists")


class Engagement(Base):
    __tablename__ = "engagements"

    id = Column(String, primary_key=True, default=generate_uuid)
    brief_id = Column(String, ForeignKey("briefs.id"), nullable=False)
    creator_id = Column(String, ForeignKey("creator_profiles.id"), nullable=False)
    status = Column(String, default="invited")
    # "invited", "in_progress", "revision_requested", "approved", "delivered"
    agreed_terms = Column(JSON, default=dict)
    # {"budget": 1200, "deadline": "2026-11-01", "commercial_scope": "Full Commercial", "revision_limit": 2}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    brief = relationship("Brief", back_populates="engagements")
    creator = relationship("CreatorProfile", back_populates="engagements")
    submissions = relationship("Submission", back_populates="engagement", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="engagement", cascade="all, delete-orphan")
    review = relationship("Review", back_populates="engagement", uselist=False)


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=generate_uuid)
    engagement_id = Column(String, ForeignKey("engagements.id"), nullable=False)
    version_number = Column(Integer, default=1)
    media_url = Column(String, nullable=False)
    creator_note = Column(Text, nullable=True)
    brand_feedback = Column(Text, nullable=True)
    status = Column(String, default="pending")  # "pending", "revision_requested", "approved"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    engagement = relationship("Engagement", back_populates="submissions")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    engagement_id = Column(String, ForeignKey("engagements.id"), nullable=True)
    sender_id = Column(String, nullable=False)
    sender_name = Column(String, nullable=False)
    sender_role = Column(String, default="brand")  # "brand" or "creator"
    recipient_id = Column(String, nullable=False)
    recipient_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    attachment_url = Column(String, nullable=True)
    attachment_name = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    engagement = relationship("Engagement", back_populates="messages")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(String, ForeignKey("creator_profiles.id"), nullable=False)
    engagement_id = Column(String, ForeignKey("engagements.id"), nullable=True)
    brand_name = Column(String, nullable=False)
    brand_avatar = Column(String, nullable=True)
    rating = Column(Float, default=5.0)
    delivery_speed_rating = Column(Float, default=5.0)
    workflow_transparency_rating = Column(Float, default=5.0)
    communication_rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=False)
    project_title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("CreatorProfile", back_populates="reviews")
    engagement = relationship("Engagement", back_populates="review")


class AssetUpload(Base):
    __tablename__ = "asset_uploads"

    id = Column(String, primary_key=True, default=generate_uuid)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # "video", "lora", "workflow_json", "image", "document"
    file_size_bytes = Column(Integer, default=0)
    storage_path = Column(String, nullable=False)
    url = Column(String, nullable=False)
    uploader_role = Column(String, default="brand")  # "brand" or "creator"
    uploader_user_id = Column(String, nullable=True)
    related_entity_type = Column(String, nullable=True)
    related_entity_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

