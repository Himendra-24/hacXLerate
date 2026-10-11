export interface WorkflowStep {
  step: number;
  name: string;
  tool: string;
  description: string;
  duration_estimate?: string;
}

export interface PortfolioProject {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  media_url: string;
  thumbnail_url?: string;
  content_type: string;
  specialization: string;
  tools_used: string[];
  model_versions: Record<string, string>;
  skills_demonstrated: string[];
  workflow_steps: WorkflowStep[];
  aspect_ratios: string[];
  commercial_use_status: string;
  evidence_status: string;
  prompt_summary?: string;
  created_at: string;
}

export interface VerificationRecord {
  id: string;
  creator_id: string;
  portfolio_project_id?: string;
  evidence_type: string;
  status: string;
  evidence_reference?: string;
  notes?: string;
  demo_only: boolean;
  checked_at?: string;
}

export interface Review {
  id: string;
  creator_id: string;
  engagement_id?: string;
  brand_name: string;
  brand_avatar?: string;
  rating: number;
  delivery_speed_rating: number;
  workflow_transparency_rating: number;
  communication_rating: number;
  comment: string;
  project_title?: string;
  created_at: string;
}

export interface CreatorProfile {
  id: string;
  user_id?: string;
  display_name: string;
  title: string;
  bio: string;
  avatar_url?: string;
  location?: string;
  specializations: string[];
  skills: string[];
  tools: string[];
  rate_min?: number;
  rate_max?: number;
  rating_avg?: number;
  reviews_count?: number;
  availability_status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  portfolio_projects: PortfolioProject[];
  verification_records: VerificationRecord[];
  reviews?: Review[];
  trust_level?: 'Pending' | 'Basic' | 'Evidence-backed' | 'Established';
  verification_status?: string;
  email_verified?: boolean;
  ownership_code?: string;
  verified_profiles?: Array<{ url: string; verified_at: string; code_matched?: string }>;
  verified_tools?: Array<{ tool: string; evidence_url: string; verified_at: string }>;
}

export interface Organization {
  id: string;
  owner_user_id?: string;
  company_name: string;
  type: 'brand' | 'agency';
  industry?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  verified: boolean;
  created_at: string;
  updated_at?: string;
  open_briefs_count?: number;
  open_briefs?: Brief[];
}

export interface BriefApplication {
  id: string;
  brief_id: string;
  creator_id: string;
  pitch: string;
  proposed_rate?: number;
  portfolio_sample_urls: string[];
  status: 'pending' | 'reviewed' | 'accepted' | 'declined';
  created_at: string;
  creator?: CreatorProfile;
}

export interface Brief {
  id: string;
  brand_user_id?: string;
  organization_id?: string;
  title: string;
  objective: string;
  raw_idea?: string;
  description: string;
  content_type: string;
  style_tags: string[];
  aspect_ratio: string;
  duration?: string;
  resolution: string;
  commercial_use_scope: string;
  license_duration_months?: number;
  exclusivity_required: boolean;
  revision_limit: number;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  status: 'draft' | 'open' | 'closed' | string;
  visibility?: 'public' | 'private' | string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
  applications_count?: number;
}

export interface StructuredDraftSuggestion {
  title: string;
  objective: string;
  description: string;
  content_type: string;
  style_tags: string[];
  aspect_ratio: string;
  duration?: string;
  resolution: string;
  commercial_use_scope: string;
  suggested_budget_range?: string;
  suggested_skills_needed: string[];
  suggested_tools: string[];
  needs_confirmation_fields: string[];
  integrity_warnings: string[];
}

export interface MatchScoreBreakdown {
  overall_score: number;
  skill_match: number;
  portfolio_relevance: number;
  format_compatibility: number;
  tool_compatibility: number;
  mandatory_passed: boolean;
  mandatory_violations: string[];
}

export interface CreatorMatchResult {
  creator: CreatorProfile;
  score: number;
  breakdown: MatchScoreBreakdown;
  supporting_portfolio_items: PortfolioProject[];
  match_explanations: string[];
  missing_or_uncertain_requirements: string[];
  commercial_rights_summary: string;
  verification_tier: string;
}

export interface ShortlistItem {
  id: string;
  creator_id: string;
  brief_id?: string;
  notes?: string;
  creator: CreatorProfile;
  created_at: string;
}

export interface Submission {
  id: string;
  engagement_id: string;
  version_number: number;
  media_url: string;
  creator_note?: string;
  brand_feedback?: string;
  status: string;
  created_at: string;
}

export interface Engagement {
  id: string;
  brief_id: string;
  creator_id: string;
  status: 'invited' | 'in_progress' | 'revision_requested' | 'approved' | 'delivered';
  agreed_terms: Record<string, any>;
  created_at: string;
  updated_at: string;
  brief?: Brief;
  creator?: CreatorProfile;
  submissions: Submission[];
  messages?: Message[];
  review?: Review;
}

export interface Message {
  id: string;
  engagement_id?: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'brand' | 'creator';
  recipient_id: string;
  recipient_name: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageThreadSummary {
  partner_id: string;
  partner_name: string;
  partner_role: 'brand' | 'creator';
  last_message: string;
  last_message_at: string;
  unread_count: number;
  engagement_id?: string;
}

export interface AssetUpload {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  url: string;
  uploader_role: string;
  created_at: string;
}

export interface User {
  id: string;
  role: 'brand' | 'creator' | 'admin';
  display_name: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  creator_profile?: CreatorProfile;
  organization?: Organization;
}

export interface UserRegisterPayload {
  email: string;
  password: string;
  display_name: string;
  role: 'creator' | 'brand';
  avatar_url?: string;
  // Creator onboarding
  title?: string;
  bio?: string;
  location?: string;
  specializations?: string[];
  skills?: string[];
  tools?: string[];
  rate_min?: number;
  rate_max?: number;
  availability_status?: string;
  initial_project?: any;
  // Brand onboarding
  company_name?: string;
  type?: 'brand' | 'agency';
  industry?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  preferred_specializations?: string[];
  budget_range?: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface OnboardingUpdatePayload {
  title?: string;
  bio?: string;
  location?: string;
  specializations?: string[];
  skills?: string[];
  tools?: string[];
  rate_min?: number;
  rate_max?: number;
  availability_status?: string;
  company_name?: string;
  type?: 'brand' | 'agency';
  industry?: string;
  website?: string;
  logo_url?: string;
  description?: string;
}


