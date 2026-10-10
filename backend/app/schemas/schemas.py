import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# ==================== WORKFLOW & PROJECT SCHEMAS ====================

class WorkflowStep(BaseModel):
    step: int
    name: str
    tool: str
    description: str
    duration_estimate: Optional[str] = None

class PortfolioProjectBase(BaseModel):
    title: str
    description: str
    media_url: str
    thumbnail_url: Optional[str] = None
    content_type: str = "video"  # "video", "animation", "image", "cgi", "motion"
    specialization: str
    tools_used: List[str] = []
    model_versions: Dict[str, str] = {}
    skills_demonstrated: List[str] = []
    workflow_steps: List[Dict[str, Any]] = []
    aspect_ratios: List[str] = ["16:9"]
    commercial_use_status: str = "Commercial Rights Granted"
    evidence_status: str = "Self-reported"
    prompt_summary: Optional[str] = None

class PortfolioProjectCreate(PortfolioProjectBase):
    pass

class PortfolioProjectResponse(PortfolioProjectBase):
    id: str
    creator_id: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== VERIFICATION SCHEMAS ====================

class VerificationRecordBase(BaseModel):
    evidence_type: str  # "tool_usage", "workflow_provenance", "portfolio_review", "track_record"
    status: str = "Verified"  # "Verified", "Pending review", "Self-reported", "Demo-only"
    evidence_reference: Optional[str] = None
    notes: Optional[str] = None
    demo_only: bool = True

class VerificationRecordResponse(VerificationRecordBase):
    id: str
    creator_id: str
    portfolio_project_id: Optional[str] = None
    checked_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== CREATOR SCHEMAS ====================

class CreatorProfileBase(BaseModel):
    display_name: str
    title: str
    bio: str
    avatar_url: Optional[str] = None
    location: Optional[str] = "Remote"
    specializations: List[str] = []
    skills: List[str] = []
    tools: List[str] = []
    rate_min: Optional[float] = None
    rate_max: Optional[float] = None
    availability_status: str = "Available"
    featured: bool = False

class CreatorProfileCreate(CreatorProfileBase):
    pass

class CreatorProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    specializations: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    tools: Optional[List[str]] = None
    rate_min: Optional[float] = None
    rate_max: Optional[float] = None
    availability_status: Optional[str] = None

class CreatorProfileResponse(CreatorProfileBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    portfolio_projects: List[PortfolioProjectResponse] = []
    verification_records: List[VerificationRecordResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==================== BRIEF SCHEMAS ====================

class BriefBase(BaseModel):
    title: str
    objective: str
    raw_idea: Optional[str] = None
    description: str
    content_type: str = "video"
    style_tags: List[str] = []
    aspect_ratio: str = "16:9"
    duration: Optional[str] = "15-30s"
    resolution: str = "1080p"
    commercial_use_scope: str = "Full Commercial (Digital & Broadcast)"
    license_duration_months: Optional[int] = 12
    exclusivity_required: bool = False
    revision_limit: int = 2
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    deadline: Optional[str] = None
    status: str = "draft"

class BriefCreate(BriefBase):
    brand_user_id: Optional[str] = None

class BriefUpdate(BaseModel):
    title: Optional[str] = None
    objective: Optional[str] = None
    description: Optional[str] = None
    content_type: Optional[str] = None
    style_tags: Optional[List[str]] = None
    aspect_ratio: Optional[str] = None
    duration: Optional[str] = None
    resolution: Optional[str] = None
    commercial_use_scope: Optional[str] = None
    license_duration_months: Optional[int] = None
    exclusivity_required: Optional[bool] = None
    revision_limit: Optional[int] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    deadline: Optional[str] = None
    status: Optional[str] = None

class BriefResponse(BriefBase):
    id: str
    brand_user_id: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# AI Brief Structuring
class RawIdeaRequest(BaseModel):
    raw_idea: str
    target_audience: Optional[str] = None
    preferred_format: Optional[str] = None

class StructuredDraftSuggestion(BaseModel):
    title: str
    objective: str
    description: str
    content_type: str
    style_tags: List[str]
    aspect_ratio: str
    duration: Optional[str]
    resolution: str
    commercial_use_scope: str
    suggested_budget_range: Optional[str]
    suggested_skills_needed: List[str]
    suggested_tools: List[str]
    needs_confirmation_fields: List[str]
    integrity_warnings: List[str] = []


# ==================== MATCHING SCHEMAS ====================

class MatchScoreBreakdown(BaseModel):
    overall_score: float
    skill_match: float
    portfolio_relevance: float
    format_compatibility: float
    tool_compatibility: float
    mandatory_passed: bool
    mandatory_violations: List[str] = []

class CreatorMatchResult(BaseModel):
    creator: CreatorProfileResponse
    score: float
    breakdown: MatchScoreBreakdown
    supporting_portfolio_items: List[PortfolioProjectResponse]
    match_explanations: List[str]
    missing_or_uncertain_requirements: List[str]
    commercial_rights_summary: str
    verification_tier: str


# ==================== SHORTLIST SCHEMAS ====================

class ShortlistCreate(BaseModel):
    creator_id: str
    brief_id: Optional[str] = None
    notes: Optional[str] = None

class ShortlistResponse(BaseModel):
    id: str
    creator_id: str
    brief_id: Optional[str] = None
    notes: Optional[str] = None
    creator: CreatorProfileResponse
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== ENGAGEMENT & SUBMISSION SCHEMAS ====================

class SubmissionCreate(BaseModel):
    media_url: str
    creator_note: Optional[str] = None

class SubmissionFeedbackUpdate(BaseModel):
    brand_feedback: str
    status: str  # "approved", "revision_requested"

class SubmissionResponse(BaseModel):
    id: str
    engagement_id: str
    version_number: int
    media_url: str
    creator_note: Optional[str] = None
    brand_feedback: Optional[str] = None
    status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class EngagementCreate(BaseModel):
    brief_id: str
    creator_id: str
    agreed_terms: Optional[Dict[str, Any]] = None

class EngagementUpdate(BaseModel):
    status: Optional[str] = None # "invited", "in_progress", "revision_requested", "approved", "delivered"
    agreed_terms: Optional[Dict[str, Any]] = None

class EngagementResponse(BaseModel):
    id: str
    brief_id: str
    creator_id: str
    status: str
    agreed_terms: Dict[str, Any]
    created_at: datetime.datetime
    updated_at: datetime.datetime
    brief: Optional[BriefResponse] = None
    creator: Optional[CreatorProfileResponse] = None
    submissions: List[SubmissionResponse] = []

    model_config = ConfigDict(from_attributes=True)
