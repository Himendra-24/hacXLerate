import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Briefcase, Calendar, DollarSign, Clock, ChevronRight,
  Filter, Search, AlertCircle, Loader2, CheckCircle2, Lock, TrendingUp,
  FileText, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Brief, BriefApplication } from '../types';

type ApplyModalState = {
  brief: Brief | null;
  pitch: string;
  proposedRate: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
};

const initialApplyModal: ApplyModalState = {
  brief: null,
  pitch: '',
  proposedRate: '',
  isSubmitting: false,
  error: null,
  success: false,
};

export const OpportunitiesPage: React.FC = () => {
  const { user, creatorProfile, isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [appliedBriefIds, setAppliedBriefIds] = useState<Set<string>>(new Set());
  const [applyModal, setApplyModal] = useState<ApplyModalState>(initialApplyModal);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBriefs();
    }
  }, [isAuthenticated]);

  const loadBriefs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOpenBriefs();
      setBriefs(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const filteredBriefs = briefs.filter(b => {
    const matchesSearch = !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.objective.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.content_type.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(briefs.map(b => b.content_type.toLowerCase())))];

  const openApplyModal = (brief: Brief) => {
    if (!creatorProfile) {
      alert('You need a creator profile to apply. Complete your studio setup first.');
      navigate('/studio');
      return;
    }
    setApplyModal({ ...initialApplyModal, brief });
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModal.brief || !applyModal.pitch.trim()) return;

    setApplyModal(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      await api.applyToBrief(applyModal.brief.id, {
        pitch: applyModal.pitch.trim(),
        proposed_rate: applyModal.proposedRate ? parseFloat(applyModal.proposedRate) : undefined,
        portfolio_sample_urls: [],
      });
      setAppliedBriefIds(prev => new Set([...prev, applyModal.brief!.id]));
      setApplyModal(prev => ({ ...prev, success: true, isSubmitting: false }));
    } catch (err: any) {
      setApplyModal(prev => ({ ...prev, error: err?.message || 'Failed to submit application', isSubmitting: false }));
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Budget TBD';
    if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return `From $${min?.toLocaleString()}`;
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    return diffDays;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5B46F6] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Lock className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to view opportunities</h2>
        <p className="text-slate-500 text-sm text-center">Browse and apply to brand campaigns matched to your skills.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-[#5B46F6] text-white font-semibold text-sm hover:bg-[#4F46E5] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (user?.role === 'brand') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Briefcase className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-900">This page is for creators</h2>
        <p className="text-slate-500 text-sm text-center">As a brand, you can post campaigns and discover creators.</p>
        <button
          onClick={() => navigate('/brand-hub')}
          className="px-6 py-2.5 rounded-xl bg-[#5B46F6] text-white font-semibold text-sm hover:bg-[#4F46E5] transition-colors"
        >
          Go to Brand Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-[#5B46F6]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B46F6]">Creator Opportunities</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Open Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse campaigns from verified brands. Apply directly to relevant projects.
          </p>
        </div>

        {/* Profile warning if no creator profile */}
        {!creatorProfile && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Complete your Creator Studio first</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You need a creator profile to apply to campaigns.{' '}
                <button onClick={() => navigate('/studio')} className="underline font-medium">Set up your studio →</button>
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] shadow-sm capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Content Types' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <p className="text-xs text-slate-500 mb-4">
            Showing <span className="font-semibold text-slate-700">{filteredBriefs.length}</span> of {briefs.length} open campaigns
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-[#5B46F6] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm text-rose-600">{error}</p>
            <button onClick={loadBriefs} className="text-sm text-[#5B46F6] hover:underline">Retry</button>
          </div>
        ) : filteredBriefs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <Briefcase className="w-12 h-12 text-slate-300" />
            <p className="font-semibold text-slate-600">No campaigns found</p>
            <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBriefs.map(brief => {
              const isApplied = appliedBriefIds.has(brief.id);
              const daysLeft = getDaysLeft(brief.deadline);

              return (
                <div
                  key={brief.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title & badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-[#5B46F6] text-[10px] font-semibold uppercase tracking-wider">
                            <Sparkles className="w-2.5 h-2.5" />
                            {brief.content_type}
                          </span>
                          {brief.organization?.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                              <BadgeCheck className="w-2.5 h-2.5" />
                              Verified Brand
                            </span>
                          )}
                          {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                              {daysLeft}d left
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-slate-900 text-base mb-1 truncate">{brief.title}</h3>
                        {brief.organization && (
                          <p className="text-xs text-slate-500 mb-2">{brief.organization.company_name} · {brief.organization.industry}</p>
                        )}
                        <p className="text-sm text-slate-600 line-clamp-2">{brief.objective}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {isApplied ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => openApplyModal(brief)}
                            className="px-4 py-2 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors"
                          >
                            Apply Now
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/organizations/${brief.organization_id}`)}
                          className="text-xs text-[#5B46F6] hover:underline flex items-center gap-0.5"
                        >
                          View org <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatBudget(brief.budget_min, brief.budget_max)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {brief.duration || 'Duration TBD'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <FileText className="w-3.5 h-3.5" />
                        {brief.aspect_ratio} · {brief.resolution}
                      </span>
                      {brief.deadline && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Due {new Date(brief.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {brief.style_tags && brief.style_tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {brief.style_tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 capitalize">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyModal.brief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#5B46F6] to-[#EC4899]" />
            <div className="p-6">
              {applyModal.success ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Your pitch has been sent to <strong>{applyModal.brief?.organization?.company_name || 'the brand'}</strong>.
                    They'll review your profile and get back to you.
                  </p>
                  <button
                    onClick={() => setApplyModal(initialApplyModal)}
                    className="px-6 py-2.5 rounded-xl bg-[#5B46F6] text-white font-semibold text-sm hover:bg-[#4F46E5] transition-colors"
                  >
                    Back to Opportunities
                  </button>
                </div>
              ) : (
                <form onSubmit={submitApplication}>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Apply to Campaign</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    <span className="font-medium text-slate-700">{applyModal.brief.title}</span>
                    {applyModal.brief.organization && (
                      <span> · {applyModal.brief.organization.company_name}</span>
                    )}
                  </p>

                  {applyModal.error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{applyModal.error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Pitch <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={applyModal.pitch}
                        onChange={e => setApplyModal(prev => ({ ...prev, pitch: e.target.value }))}
                        placeholder="Tell the brand why you're the right creator for this campaign. Mention relevant experience, your approach, and what makes your work unique…"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Proposed Rate (USD, optional)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min={0}
                          step={50}
                          value={applyModal.proposedRate}
                          onChange={e => setApplyModal(prev => ({ ...prev, proposedRate: e.target.value }))}
                          placeholder={`Brief budget: ${formatBudget(applyModal.brief.budget_min, applyModal.brief.budget_max)}`}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setApplyModal(initialApplyModal)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applyModal.isSubmitting || !applyModal.pitch.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-[#5B46F6] text-white font-semibold text-sm hover:bg-[#4F46E5] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                    >
                      {applyModal.isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
