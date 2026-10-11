import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brief, CreatorProfile } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/ui/Modal';
import {
  Briefcase,
  Search,
  Filter,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  Send,
  CheckCircle2,
  ExternalLink,
  Layers,
  Film
} from 'lucide-react';

export const OpenBriefsPage: React.FC = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [budgetTier, setBudgetTier] = useState('all');

  // Application modal state
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState<number | ''>('');
  const [portfolioSamples, setPortfolioSamples] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const fetchOpenBriefs = async () => {
    setLoading(true);
    try {
      let bMin: number | undefined;
      let bMax: number | undefined;
      if (budgetTier === 'under_2k') {
        bMax = 2000;
      } else if (budgetTier === '2k_4k') {
        bMin = 2000;
        bMax = 4000;
      } else if (budgetTier === 'over_4k') {
        bMin = 4000;
      }

      const data = await api.getOpenBriefs({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        aspect_ratio: selectedFormat !== 'all' ? selectedFormat : undefined,
        budget_min: bMin,
        budget_max: bMax,
        search: search.trim() || undefined,
      });
      setBriefs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenBriefs();
  }, [selectedCategory, selectedFormat, budgetTier]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpenBriefs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load creators for the application dropdown
  useEffect(() => {
    api.getCreators().then((data) => {
      setCreators(data);
      if (data.length > 0) setSelectedCreatorId(data[0].id);
    });
  }, []);

  const handleOpenApplyModal = (brief: Brief) => {
    setSelectedBrief(brief);
    setPitch('');
    setProposedRate(brief.budget_min || 2000);
    setPortfolioSamples('');
    setApplySuccess(false);
    setApplyError(null);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrief) return;
    if (!pitch.trim()) {
      setApplyError('Please write a brief pitch explaining your creative direction and execution.');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      const sampleUrls = portfolioSamples
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.applyToBrief(
        selectedBrief.id,
        {
          creator_id: selectedCreatorId || (creators[0]?.id ?? undefined),
          pitch: pitch.trim(),
          proposed_rate: proposedRate === '' ? undefined : Number(proposedRate),
          portfolio_sample_urls: sampleUrls,
        }
      );

      setApplySuccess(true);
      fetchOpenBriefs();
    } catch (err: any) {
      setApplyError(err?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'video', label: 'AI Video / Commercials' },
    { id: 'cgi', label: '3D Product CGI' },
    { id: 'animation', label: 'Diffusion Animation' },
    { id: 'motion', label: 'Motion Design' },
  ];

  const formats = [
    { id: 'all', label: 'All Formats' },
    { id: '16:9', label: '16:9 Landscape' },
    { id: '9:16', label: '9:16 Vertical (Reels/TikTok)' },
    { id: '1:1', label: '1:1 Square' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[#5B46F6] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Briefs Board</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Explore Active Creative Briefs
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
            Live client commissions from verified brands and creative agencies looking for specialized diffusion directors, 3D CGI artists, and motion designers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/organizations"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Browse Organizations</span>
          </Link>
          <Link
            to="/brief-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <span>Post a Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search & Budget row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search briefs by campaign title, creative concept, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            >
              <option value="all">Any Budget Range</option>
              <option value="under_2k">Under $2,000</option>
              <option value="2k_4k">$2,000 — $4,000</option>
              <option value="over_4k">$4,000+</option>
            </select>
          </div>
        </div>

        {/* Category & Format pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
              Discipline:
            </span>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === c.id
                    ? 'bg-[#5B46F6] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
              Format:
            </span>
            {formats.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFormat(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedFormat === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Briefs Count */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {briefs.length} {briefs.length === 1 ? 'Open Brief' : 'Open Briefs'} Available
        </span>
      </div>

      {/* Brief Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : briefs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              No open briefs match these filters
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your category, aspect ratio, or budget filters to view available client briefs.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedFormat('all');
              setBudgetTier('all');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {briefs.map((brief) => {
            const org = brief.organization;
            return (
              <div
                key={brief.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  {/* Org Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {org?.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.company_name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-[#5B46F6] font-bold text-xs flex items-center justify-center">
                          {org?.company_name?.slice(0, 2) || 'BR'}
                        </div>
                      )}
                      <div>
                        {org ? (
                          <Link
                            to={`/organizations/${org.id}`}
                            className="font-display font-bold text-sm text-slate-900 hover:text-[#5B46F6] transition-colors flex items-center gap-1.5"
                          >
                            <span>{org.company_name}</span>
                            {org.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </Link>
                        ) : (
                          <span className="font-display font-bold text-sm text-slate-900">
                            Verified Brand
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500">
                            {org?.industry || 'Creative Production'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600 uppercase">
                            {org?.type || 'Brand'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold uppercase tracking-wider">
                      Open
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-900 group-hover:text-[#5B46F6] transition-colors line-clamp-1">
                      {brief.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {brief.objective || brief.description}
                    </p>
                  </div>

                  {/* Specs Pill Row */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      {brief.content_type.toUpperCase()}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      Ratio: {brief.aspect_ratio}
                    </span>
                    {brief.duration && (
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        {brief.duration}
                      </span>
                    )}
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      {brief.resolution}
                    </span>
                  </div>

                  {/* Style Tags */}
                  {brief.style_tags && brief.style_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {brief.style_tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-[#5B46F6] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Details & Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Budget Scope
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      ${brief.budget_min?.toLocaleString()} – ${brief.budget_max?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {org && (
                      <Link
                        to={`/organizations/${org.id}`}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                        title="View Organization Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleOpenApplyModal(brief)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply with Pitch</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creator Application Modal */}
      <Modal
        isOpen={Boolean(selectedBrief)}
        onClose={() => setSelectedBrief(null)}
        title={applySuccess ? 'Pitch Submitted!' : `Apply: ${selectedBrief?.title || ''}`}
      >
        {applySuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Pitch Sent to {selectedBrief?.organization?.company_name || 'Brand'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your proposal, rate, and portfolio evidence have been routed to the brand's workspace. They will review it in Brand Hub.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="px-5 py-2.5 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-all shadow-sm"
              >
                Back to Open Briefs
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            {applyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {applyError}
              </div>
            )}

            {/* Brief Scope Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Client Scope:</span>
                <span>
                  ${selectedBrief?.budget_min?.toLocaleString()} – ${selectedBrief?.budget_max?.toLocaleString()}
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {selectedBrief?.commercial_use_scope} · {selectedBrief?.resolution} ({selectedBrief?.aspect_ratio})
              </div>
            </div>

            {/* Applicant Creator Profile Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applying As (Creator Profile) *
              </label>
              <select
                value={selectedCreatorId}
                onChange={(e) => setSelectedCreatorId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              >
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name} — {c.title}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Only verified creators can submit proposals to open briefs.
              </p>
            </div>

            {/* Proposed Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Compensation / Fixed Quote ($ USD)
              </label>
              <input
                type="number"
                min={100}
                max={50000}
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 3200"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>

            {/* Pitch Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Creative Pitch & Production Execution Plan *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Outline how you'll achieve this aesthetic (models, LoRAs, motion brush control, color grading) and expected turnaround..."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>

            {/* Portfolio Sample URLs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relevant Portfolio Sample URLs (optional, one per line)
              </label>
              <textarea
                rows={2}
                placeholder="https://..."
                value={portfolioSamples}
                onChange={(e) => setPortfolioSamples(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Application...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
