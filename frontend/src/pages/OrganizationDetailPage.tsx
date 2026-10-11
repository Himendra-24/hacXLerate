import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Organization, Brief, CreatorProfile } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/ui/Modal';
import {
  Building2,
  Globe,
  ShieldCheck,
  Briefcase,
  ExternalLink,
  Edit3,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  DollarSign,
  Clock,
  Layers
} from 'lucide-react';

export const OrganizationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit organization modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    company_name: '',
    type: 'brand' as 'brand' | 'agency',
    industry: '',
    website: '',
    logo_url: '',
    description: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Application modal state
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState<number | ''>('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchOrganization = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrganization(id);
      setOrg(data);
      setEditFormData({
        company_name: data.company_name,
        type: data.type,
        industry: data.industry || '',
        website: data.website || '',
        logo_url: data.logo_url || '',
        description: data.description || '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load organization profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
    api.getCreators().then((data) => {
      setCreators(data);
      if (data.length > 0) setSelectedCreatorId(data[0].id);
    });
  }, [id]);

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setIsUpdating(true);
    setEditError(null);

    try {
      const updated = await api.updateOrganization(
        org.id,
        editFormData,
        'brand_demo_user' // Current simulated brand owner user
      );
      setOrg((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update organization profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrief) return;
    setIsSubmittingApp(true);
    try {
      await api.applyToBrief(
        selectedBrief.id,
        {
          creator_id: selectedCreatorId || (creators[0]?.id ?? undefined),
          pitch,
          proposed_rate: proposedRate === '' ? undefined : Number(proposedRate),
          portfolio_sample_urls: [],
        }
      );
      setApplySuccess(true);
      fetchOrganization();
    } catch (err: any) {
      alert(err?.message || 'Failed to apply');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Organization Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This organization does not exist.'}</p>
        <Link
          to="/briefs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold"
        >
          <span>Return to Open Briefs</span>
        </Link>
      </div>
    );
  }

  // Simulated owner check: brand_demo_user owns brand_acme_mobility or matches owner_user_id
  const isOwner = org.owner_user_id === 'brand_demo_user' || org.id === 'brand_acme_mobility';

  const openBriefs = org.open_briefs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Organization Banner / Profile Card */}
      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 overflow-hidden">
        {/* Subtle decorative gradient background in header */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-100/40 via-purple-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {org.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.company_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#5B46F6] to-[#7C3AED] text-white font-extrabold text-2xl flex items-center justify-center shadow-md font-display">
                {org.company_name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {org.company_name}
                </h1>
                {org.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  {org.type === 'agency' ? 'Creative Agency' : 'Direct Brand'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {org.industry && (
                  <span className="font-medium text-slate-700">{org.industry}</span>
                )}
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#5B46F6] hover:underline font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{org.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Owner Actions */}
          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <Link
              to="/brief-builder"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Commission Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Description Section */}
        {org.description && (
          <div className="relative mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              About the Organization
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              {org.description}
            </p>
          </div>
        )}
      </div>

      {/* Open Briefs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
              Active Open Briefs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Public production commissions currently open for creator pitches from this organization.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-50 text-[#5B46F6] border border-violet-100">
            {openBriefs.length} Active
          </span>
        </div>

        {openBriefs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-slate-800">
              No open briefs currently published
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This organization does not have any publicly open briefs right now. Check back soon or explore the main brief board.
            </p>
            <Link
              to="/briefs"
              className="inline-flex items-center gap-1.5 text-xs text-[#5B46F6] font-semibold hover:underline pt-1"
            >
              <span>Explore All Open Briefs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openBriefs.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase">
                      Open Campaign
                    </span>
                    <span className="text-xs font-extrabold text-[#5B46F6]">
                      ${b.budget_min?.toLocaleString()} – ${b.budget_max?.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {b.objective || b.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {b.content_type.toUpperCase()}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {b.aspect_ratio}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {b.resolution}
                    </span>
                    {b.duration && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {b.duration}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Rights: {b.commercial_use_scope}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBrief(b);
                      setPitch('');
                      setProposedRate(b.budget_min || 2000);
                      setApplySuccess(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Organization Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Organization Profile"
      >
        <form onSubmit={handleUpdateOrganization} className="space-y-4">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {editError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Studio Name
            </label>
            <input
              type="text"
              required
              value={editFormData.company_name}
              onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type
              </label>
              <select
                value={editFormData.type}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as 'brand' | 'agency' })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              >
                <option value="brand">Brand</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Focus
              </label>
              <input
                type="text"
                value={editFormData.industry}
                onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Website
            </label>
            <input
              type="url"
              value={editFormData.website}
              onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Logo / Avatar URL
            </label>
            <input
              type="url"
              value={editFormData.logo_url}
              onChange={(e) => setEditFormData({ ...editFormData, logo_url: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Creative Focus
            </label>
            <textarea
              rows={3}
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isUpdating ? <span>Saving...</span> : <span>Save Changes</span>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply to Brief Modal */}
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
                Pitch Sent to {org.company_name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your proposal has been delivered to the brand lead.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="px-5 py-2.5 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applying As (Creator Profile)
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Compensation Quote ($ USD)
              </label>
              <input
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Creative Pitch & Capabilities
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your execution approach, camera rigs, tools, and timeline..."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>

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
                disabled={isSubmittingApp}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Pitch</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
