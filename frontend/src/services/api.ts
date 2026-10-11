import {
  CreatorProfile,
  PortfolioProject,
  Brief,
  StructuredDraftSuggestion,
  CreatorMatchResult,
  ShortlistItem,
  Engagement,
  Submission,
  Review,
  Message,
  MessageThreadSummary,
  AssetUpload,
  Organization,
  BriefApplication,
  User,
  AuthResponse,
  UserRegisterPayload,
  UserLoginPayload,
  OnboardingUpdatePayload
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export function getAuthToken(): string | null {
  return localStorage.getItem('unframe_token');
}

export function setAuthSession(auth: AuthResponse): void {
  localStorage.setItem('unframe_token', auth.access_token);
  localStorage.setItem('unframe_user', JSON.stringify(auth.user));
  if (auth.creator_profile) {
    localStorage.setItem('unframe_creator_profile', JSON.stringify(auth.creator_profile));
  }
  if (auth.organization) {
    localStorage.setItem('unframe_organization', JSON.stringify(auth.organization));
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem('unframe_token');
  localStorage.removeItem('unframe_user');
  localStorage.removeItem('unframe_creator_profile');
  localStorage.removeItem('unframe_organization');
}

export function getAuthHeaders(custom: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...custom };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const userStr = localStorage.getItem('unframe_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u?.id) {
        headers['x-user-id'] = u.id;
      }
    } catch {
      // ignore
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API Request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Authentication & Onboarding
  async register(data: UserRegisterPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(data: UserLoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AuthResponse>(res);
  },

  async updateOnboarding(data: OnboardingUpdatePayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/onboarding`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  // Creators
  async getCreators(params?: Record<string, string>): Promise<CreatorProfile[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/creators`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') url.searchParams.append(k, v);
      });
    }
    const res = await fetch(url.toString());
    return handleResponse<CreatorProfile[]>(res);
  },

  async getCreator(id: string): Promise<CreatorProfile> {
    const res = await fetch(`${API_BASE}/creators/${id}`);
    return handleResponse<CreatorProfile>(res);
  },

  async createCreator(data: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const res = await fetch(`${API_BASE}/creators`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<CreatorProfile>(res);
  },

  async updateCreator(id: string, data: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const res = await fetch(`${API_BASE}/creators/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<CreatorProfile>(res);
  },

  async addPortfolioProject(creatorId: string, project: Partial<PortfolioProject>): Promise<PortfolioProject> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/portfolio`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(project),
    });
    return handleResponse<PortfolioProject>(res);
  },

  async updatePortfolioProject(creatorId: string, projectId: string, data: Partial<PortfolioProject>): Promise<PortfolioProject> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/portfolio/${projectId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<PortfolioProject>(res);
  },

  async deletePortfolioProject(creatorId: string, projectId: string): Promise<{ status: string; project_id: string }> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/portfolio/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ status: string; project_id: string }>(res);
  },

  // Multi-Layer Verification & Trust Signals
  async requestEmailVerification(creatorId: string): Promise<{ status: string; demo_otp?: string; message: string }> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/verify-email/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ status: string; demo_otp?: string; message: string }>(res);
  },

  async confirmEmailVerification(creatorId: string, code: string): Promise<CreatorProfile> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/verify-email/confirm`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ code }),
    });
    return handleResponse<CreatorProfile>(res);
  },

  async verifyOwnership(creatorId: string, platformUrl: string): Promise<{ status: string; platform_url: string; ownership_code: string; trust_level: string; message: string }> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/verify-ownership`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ platform_url: platformUrl }),
    });
    return handleResponse<{ status: string; platform_url: string; ownership_code: string; trust_level: string; message: string }>(res);
  },

  async verifyToolProof(creatorId: string, toolName: string, evidenceUrl: string): Promise<{ status: string; tool_name: string; evidence_url: string; trust_level: string; message: string }> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/verify-tool-proof`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ tool_name: toolName, evidence_url: evidenceUrl }),
    });
    return handleResponse<{ status: string; tool_name: string; evidence_url: string; trust_level: string; message: string }>(res);
  },

  async adminReviewCreator(creatorId: string, decision: 'approve' | 'reject', notes?: string): Promise<CreatorProfile> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/admin-review`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ decision, notes }),
    });
    return handleResponse<CreatorProfile>(res);
  },

  // Briefs & AI Builder
  async structureRawIdea(rawIdea: string, targetAudience?: string, preferredFormat?: string): Promise<StructuredDraftSuggestion> {
    const res = await fetch(`${API_BASE}/briefs/structure`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        raw_idea: rawIdea,
        target_audience: targetAudience,
        preferred_format: preferredFormat,
      }),
    });
    return handleResponse<StructuredDraftSuggestion>(res);
  },

  async getBriefs(): Promise<Brief[]> {
    const res = await fetch(`${API_BASE}/briefs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Brief[]>(res);
  },

  async getBrief(id: string): Promise<Brief> {
    const res = await fetch(`${API_BASE}/briefs/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Brief>(res);
  },

  async createBrief(brief: Partial<Brief>): Promise<Brief> {
    const res = await fetch(`${API_BASE}/briefs`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(brief),
    });
    return handleResponse<Brief>(res);
  },

  async getOpenBriefs(params?: {
    category?: string;
    aspect_ratio?: string;
    budget_min?: number;
    budget_max?: number;
    search?: string;
  }): Promise<Brief[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/briefs/open`);
    if (params) {
      if (params.category && params.category !== 'all') url.searchParams.append('category', params.category);
      if (params.aspect_ratio && params.aspect_ratio !== 'all') url.searchParams.append('aspect_ratio', params.aspect_ratio);
      if (params.budget_min !== undefined) url.searchParams.append('budget_min', params.budget_min.toString());
      if (params.budget_max !== undefined) url.searchParams.append('budget_max', params.budget_max.toString());
      if (params.search) url.searchParams.append('search', params.search);
    }
    const res = await fetch(url.toString());
    return handleResponse<Brief[]>(res);
  },

  async applyToBrief(
    briefId: string,
    data: { creator_id?: string; pitch: string; proposed_rate?: number; portfolio_sample_urls?: string[] }
  ): Promise<BriefApplication> {
    const res = await fetch(`${API_BASE}/briefs/${briefId}/apply`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<BriefApplication>(res);
  },

  async getBriefApplications(briefId: string): Promise<BriefApplication[]> {
    const res = await fetch(`${API_BASE}/briefs/${briefId}/applications`);
    return handleResponse<BriefApplication[]>(res);
  },

  async getMyBriefApplications(): Promise<BriefApplication[]> {
    const res = await fetch(`${API_BASE}/briefs/my-applications/all`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<BriefApplication[]>(res);
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<BriefApplication> {
    const res = await fetch(`${API_BASE}/briefs/applications/${applicationId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    return handleResponse<BriefApplication>(res);
  },

  async updateBriefApplicationStatus(applicationId: string, status: string): Promise<BriefApplication> {
    return this.updateApplicationStatus(applicationId, status);
  },

  // Organizations
  async getOrganizations(params?: { type?: string; search?: string }): Promise<Organization[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/organizations`);
    if (params) {
      if (params.type && params.type !== 'all') url.searchParams.append('type', params.type);
      if (params.search) url.searchParams.append('search', params.search);
    }
    const res = await fetch(url.toString());
    return handleResponse<Organization[]>(res);
  },

  async getOrganization(id: string): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations/${id}`);
    return handleResponse<Organization>(res);
  },

  async createOrganization(org: Partial<Organization>): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(org),
    });
    return handleResponse<Organization>(res);
  },

  async updateOrganization(id: string, org: Partial<Organization>, currentUserId?: string): Promise<Organization> {
    const url = new URL(`${window.location.origin}${API_BASE}/organizations/${id}`);
    if (currentUserId) url.searchParams.append('current_user_id', currentUserId);
    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(currentUserId ? { 'X-User-Id': currentUserId } : {})
      },
      body: JSON.stringify(org),
    });
    return handleResponse<Organization>(res);
  },

  // Creative Fit Intelligence Matching
  async getMatchesForBrief(briefId: string, filterPassedOnly = false): Promise<CreatorMatchResult[]> {
    const res = await fetch(`${API_BASE}/briefs/${briefId}/matches?filter_passed_only=${filterPassedOnly}`, {
      method: 'POST',
    });
    return handleResponse<CreatorMatchResult[]>(res);
  },

  async previewMatches(draft: Partial<Brief>): Promise<CreatorMatchResult[]> {
    const res = await fetch(`${API_BASE}/matches/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    return handleResponse<CreatorMatchResult[]>(res);
  },

  // Shortlist
  async getShortlist(briefId?: string): Promise<ShortlistItem[]> {
    const url = briefId ? `${API_BASE}/shortlist?brief_id=${briefId}` : `${API_BASE}/shortlist`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<ShortlistItem[]>(res);
  },

  async addToShortlist(creatorId: string, briefId?: string, notes?: string): Promise<ShortlistItem> {
    const res = await fetch(`${API_BASE}/shortlist`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ creator_id: creatorId, brief_id: briefId, notes }),
    });
    return handleResponse<ShortlistItem>(res);
  },

  async removeFromShortlist(shortlistId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/shortlist/${shortlistId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    await handleResponse(res);
  },

  async removeCreatorFromShortlist(creatorId: string, briefId?: string): Promise<void> {
    const url = briefId
      ? `${API_BASE}/shortlist/creator/${creatorId}?brief_id=${briefId}`
      : `${API_BASE}/shortlist/creator/${creatorId}`;
    const res = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
    await handleResponse(res);
  },

  // Engagements & Delivery
  async getEngagements(): Promise<Engagement[]> {
    const res = await fetch(`${API_BASE}/engagements`);
    return handleResponse<Engagement[]>(res);
  },

  async getEngagement(id: string): Promise<Engagement> {
    const res = await fetch(`${API_BASE}/engagements/${id}`);
    return handleResponse<Engagement>(res);
  },

  async createEngagement(briefId: string, creatorId: string, agreedTerms?: Record<string, any>): Promise<Engagement> {
    const res = await fetch(`${API_BASE}/engagements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief_id: briefId, creator_id: creatorId, agreed_terms: agreedTerms }),
    });
    return handleResponse<Engagement>(res);
  },

  async updateEngagement(id: string, status: string): Promise<Engagement> {
    const res = await fetch(`${API_BASE}/engagements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Engagement>(res);
  },

  async addSubmission(engagementId: string, mediaUrl: string, creatorNote?: string): Promise<Submission> {
    const res = await fetch(`${API_BASE}/engagements/${engagementId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_url: mediaUrl, creator_note: creatorNote }),
    });
    return handleResponse<Submission>(res);
  },

  async provideSubmissionFeedback(submissionId: string, feedback: string, status: string): Promise<Submission> {
    const res = await fetch(`${API_BASE}/engagements/submissions/${submissionId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_feedback: feedback, status }),
    });
    return handleResponse<Submission>(res);
  },

  // Messaging & Live Chat
  async getMessageThreads(): Promise<MessageThreadSummary[]> {
    const res = await fetch(`${API_BASE}/messages/threads`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<MessageThreadSummary[]>(res);
  },

  async getConversation(partnerId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/messages/conversation/${partnerId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Message[]>(res);
  },

  async getEngagementMessages(engagementId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/messages/engagement/${engagementId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Message[]>(res);
  },

  async sendMessage(msg: {
    engagement_id?: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    recipient_id: string;
    recipient_name: string;
    content: string;
    attachment_url?: string;
    attachment_name?: string;
  }): Promise<Message> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(msg),
    });
    return handleResponse<Message>(res);
  },

  async markThreadRead(partnerId: string): Promise<void> {
    await fetch(`${API_BASE}/messages/mark-thread-read/${partnerId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Reviews & Ratings
  async getCreatorReviews(creatorId: string): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews/creator/${creatorId}`);
    return handleResponse<Review[]>(res);
  },

  async createReview(review: {
    creator_id: string;
    engagement_id?: string;
    brand_name: string;
    brand_avatar?: string;
    rating: number;
    delivery_speed_rating?: number;
    workflow_transparency_rating?: number;
    communication_rating?: number;
    comment: string;
    project_title?: string;
  }): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return handleResponse<Review>(res);
  },

  // Asset & File Uploads
  async uploadFile(
    file: File,
    uploaderRole: string = 'brand',
    fileType: string = 'video',
    relatedEntityType?: string,
    relatedEntityId?: string
  ): Promise<AssetUpload> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploader_role', uploaderRole);
    formData.append('file_type', fileType);
    if (relatedEntityType) formData.append('related_entity_type', relatedEntityType);
    if (relatedEntityId) formData.append('related_entity_id', relatedEntityId);

    const headers = getAuthHeaders();
    delete headers['Content-Type'];

    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<AssetUpload>(res);
  },

  async uploadAsset(
    file: File,
    uploaderRole: string = 'creator',
    fileType: string = 'video',
    relatedEntityType?: string,
    relatedEntityId?: string
  ): Promise<AssetUpload> {
    return this.uploadFile(file, uploaderRole, fileType, relatedEntityType, relatedEntityId);
  },
};

