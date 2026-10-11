import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { Organization } from '../../types';
import { Building2, Globe, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface BrandSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (org: Organization) => void;
}

export const BrandSignupModal: React.FC<BrandSignupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    // Account details
    fullName: '',
    email: '',
    roleTitle: 'Creative Director',
    // Organization section
    companyName: '',
    type: 'brand' as 'brand' | 'agency',
    industry: 'Automotive & Clean Tech',
    website: '',
    logoUrl: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrg, setCreatedOrg] = useState<Organization | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError('Company or organization name is required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const org = await api.createOrganization({
        company_name: formData.companyName,
        type: formData.type,
        industry: formData.industry,
        website: formData.website || undefined,
        logo_url: formData.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        description: formData.description,
        verified: true,
        owner_user_id: 'brand_demo_user',
      });
      setCreatedOrg(org);
      if (onSuccess) onSuccess(org);
    } catch (err: any) {
      setError(err?.message || 'Failed to register brand organization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedOrg(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Register Brand Organization">
      {createdOrg ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {createdOrg.company_name} Registered!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your organization profile has been created and verified. You can now publish open briefs and review creator pitches.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <a
              href={`/organizations/${createdOrg.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold shadow-sm hover:bg-[#4F46E5] transition-all"
            >
              <span>View Public Organization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Account Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-[#5B46F6]" />
              <span>Contact & Account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@brand.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
                />
              </div>
            </div>
          </div>

          {/* Organization Profile Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-[#5B46F6]" />
              <span>Organization Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Mobility Studio"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'brand' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      formData.type === 'brand'
                        ? 'bg-violet-50 border-[#5B46F6] text-[#5B46F6]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Direct Brand
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'agency' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      formData.type === 'agency'
                        ? 'bg-violet-50 border-[#5B46F6] text-[#5B46F6]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Creative Agency
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry Focus
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
                >
                  <option value="Automotive & Clean Tech">Automotive & Clean Tech</option>
                  <option value="Luxury Fashion & Lifestyle">Luxury Fashion & Lifestyle</option>
                  <option value="Entertainment & Virtual Production">Entertainment & VFX</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                  <option value="Consumer Electronics & 3D">Consumer Electronics</option>
                  <option value="Gaming & Metaverse">Gaming & Sci-Fi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Website URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://brand.design"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Logo / Avatar URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or your CDN logo link"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Description & Creative Vision
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what your organization creates and the types of AI campaigns you produce..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
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
                <span>Creating Profile...</span>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Register & Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
