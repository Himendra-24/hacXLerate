import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Organization } from '../types';
import { api } from '../services/api';
import { BrandSignupModal } from '../components/auth/BrandSignupModal';
import {
  Building2,
  Globe,
  ShieldCheck,
  Search,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Plus,
  Sparkles
} from 'lucide-react';

export const OrganizationsDirectoryPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await api.getOrganizations({
        type: selectedType !== 'all' ? selectedType : undefined,
        search: search.trim() || undefined,
      });
      setOrganizations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [selectedType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrganizations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[#5B46F6] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Organizations Directory</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Brands & Creative Agencies
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
            Explore verified enterprise brands and boutique agencies commissioning high-fidelity AI video, CGI, and digital campaigns on UNFRAME.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/briefs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Open Briefs Board</span>
          </Link>
          <button
            onClick={() => setSignupModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Organization</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by company name, industry, or focus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Organizations
          </button>
          <button
            onClick={() => setSelectedType('brand')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'brand'
                ? 'bg-[#5B46F6] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Brands Only
          </button>
          <button
            onClick={() => setSelectedType('agency')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'agency'
                ? 'bg-[#5B46F6] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Agencies Only
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900">
            No organizations found
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or registering your organization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url}
                        alt={org.company_name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-violet-100 text-[#5B46F6] font-bold text-sm flex items-center justify-center">
                        {org.company_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/organizations/${org.id}`}
                        className="font-display font-bold text-sm text-slate-900 hover:text-[#5B46F6] transition-colors flex items-center gap-1.5"
                      >
                        <span>{org.company_name}</span>
                        {org.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </Link>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase mt-1 inline-block">
                        {org.type === 'agency' ? 'Agency' : 'Brand'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {org.industry || 'Creative Direction & Film'}
                </div>

                {org.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {org.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-extrabold text-[#5B46F6]">
                    {org.open_briefs_count || 0}
                  </span>{' '}
                  <span className="text-slate-400">Open Briefs</span>
                </div>

                <Link
                  to={`/organizations/${org.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B46F6] hover:text-[#4F46E5] hover:underline"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brand Signup Modal */}
      <BrandSignupModal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        onSuccess={() => fetchOrganizations()}
      />
    </div>
  );
};
