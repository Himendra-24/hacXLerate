import {
  CreatorProfile,
  PortfolioProject,
  Brief,
  StructuredDraftSuggestion,
  CreatorMatchResult,
  ShortlistItem,
  Engagement,
  Submission
} from '../types';

const API_BASE = '/api/v1';

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

  async updateCreator(id: string, data: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const res = await fetch(`${API_BASE}/creators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<CreatorProfile>(res);
  },

  async addPortfolioProject(creatorId: string, project: Partial<PortfolioProject>): Promise<PortfolioProject> {
    const res = await fetch(`${API_BASE}/creators/${creatorId}/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return handleResponse<PortfolioProject>(res);
  },

  // Briefs & AI Builder
  async structureRawIdea(rawIdea: string, targetAudience?: string, preferredFormat?: string): Promise<StructuredDraftSuggestion> {
    const res = await fetch(`${API_BASE}/briefs/structure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raw_idea: rawIdea,
        target_audience: targetAudience,
        preferred_format: preferredFormat,
      }),
    });
    return handleResponse<StructuredDraftSuggestion>(res);
  },

  async getBriefs(): Promise<Brief[]> {
    const res = await fetch(`${API_BASE}/briefs`);
    return handleResponse<Brief[]>(res);
  },

  async getBrief(id: string): Promise<Brief> {
    const res = await fetch(`${API_BASE}/briefs/${id}`);
    return handleResponse<Brief>(res);
  },

  async createBrief(brief: Partial<Brief>): Promise<Brief> {
    const res = await fetch(`${API_BASE}/briefs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });
    return handleResponse<Brief>(res);
  },

  async updateBrief(id: string, brief: Partial<Brief>): Promise<Brief> {
    const res = await fetch(`${API_BASE}/briefs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });
    return handleResponse<Brief>(res);
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
    const res = await fetch(url);
    return handleResponse<ShortlistItem[]>(res);
  },

  async addToShortlist(creatorId: string, briefId?: string, notes?: string): Promise<ShortlistItem> {
    const res = await fetch(`${API_BASE}/shortlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creatorId, brief_id: briefId, notes }),
    });
    return handleResponse<ShortlistItem>(res);
  },

  async removeFromShortlist(shortlistId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/shortlist/${shortlistId}`, {
      method: 'DELETE',
    });
    await handleResponse(res);
  },

  async removeCreatorFromShortlist(creatorId: string, briefId?: string): Promise<void> {
    const url = briefId
      ? `${API_BASE}/shortlist/creator/${creatorId}?brief_id=${briefId}`
      : `${API_BASE}/shortlist/creator/${creatorId}`;
    const res = await fetch(url, { method: 'DELETE' });
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
};
