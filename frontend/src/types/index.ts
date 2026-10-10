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
}

export interface Brief {
  id: string;
  brand_user_id?: string;
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
  status: string;
  created_at: string;
  updated_at: string;
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

