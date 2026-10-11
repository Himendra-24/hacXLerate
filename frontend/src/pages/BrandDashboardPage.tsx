import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brief,
  CreatorProfile,
  Engagement,
  MessageThreadSummary,
  ShortlistItem,
  Organization,
  BriefApplication
} from '../types';
import { api } from '../services/api';
import { DirectMessageModal } from '../components/messaging/DirectMessageModal';
import { Modal } from '../components/ui/Modal';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  DollarSign,
  Plus,
  Send,
  Eye,
  Star,
  Building2,
  Globe,
  ShieldCheck,
  Edit3,
  ExternalLink,
  UserCheck,
  UserX,
  Inbox
} from 'lucide-react';

export const BrandDashboardPage: React.FC = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [applications, setApplications] = useState<BriefApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'briefs' | 'applications' | 'engagements' | 'shortlist' | 'messages'>('briefs');
  const [selectedCreatorForChat, setSelectedCreatorForChat] = useState<CreatorProfile | null>(null);

  // Edit organization modal state
  const [editOrgModalOpen, setEditOrgModalOpen] = useState(false);
  const [editOrgForm, setEditOrgForm] = useState({
    company_name: '',
    type: 'brand' as 'brand' | 'agency',
    industry: '',
    website: '',
    logo_url: '',
    description: '',
  });
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [orgUpdateError, setOrgUpdateError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [briefsData, engData, shortData, threadsData, orgsData] = await Promise.all([
        api.getBriefs(),
        api.getEngagements(),
        api.getShortlist(),
        api.getMessageThreads(),
        api.getOrganizations(),
      ]);
      setBriefs(briefsData);
      setEngagements(engData);
      setShortlist(shortData);
      setThreads(threadsData);

      // Find organization owned by brand_demo_user (or fallback to first seeded brand)
      const myOrg = orgsData.find((o) => o.owner_user_id === 'brand_demo_user') || orgsData[0] || null;
      if (myOrg) {
        setOrganization(myOrg);
        setEditOrgForm({
          company_name: myOrg.company_name,
          type: myOrg.type,
          industry: myOrg.industry || '',
          website: myOrg.website || '',
          logo_url: myOrg.logo_url || '',
          description: myOrg.description || '',
        });
      }

      // Load applications for all briefs
      const allApps: BriefApplication[] = [];
      for (const b of briefsData) {
        try {
          const bApps = await api.getBriefApplications(b.id);
          allApps.push(...bApps);
        } catch {
          // ignore individual fetch errors
        }
      }
      setApplications(allApps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setIsUpdatingOrg(true);
    setOrgUpdateError(null);

    try {
      const updated = await api.updateOrganization(
        organization.id,
        editOrgForm,
        'brand_demo_user'
      );
      setOrganization((prev) => (prev ? { ...prev, ...updated } : updated));
      setEditOrgModalOpen(false);
    } catch (err: any) {
      setOrgUpdateError(err?.message || 'Failed to update organization profile.');
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const handleApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus as any } : a))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    }
  };

  const totalUnread = threads.reduce((acc, t) => acc + (t.unread_count || 0), 0);
  const pendingApps = applications.filter((a) => a.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Brand Portal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[#5B46F6] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand Creative Hub</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Brand Workspace & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Oversee structured campaign briefs, review incoming creator pitches, manage verified organization profile, and monitor deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/brief-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create New Brief</span>
          </Link>
          <Link
            to="/briefs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Open Briefs Board</span>
          </Link>
        </div>
      </div>

      {/* Organization Profile Overview Banner */}
      {organization && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.company_name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5B46F6] to-[#7C3AED] text-white font-extrabold text-lg flex items-center justify-center font-display">
                {organization.company_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {organization.company_name}
                </h2>
                {organization.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">
                  {organization.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {organization.industry || 'Creative Direction'} · {organization.website || 'No website set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Link
              to={`/organizations/${organization.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>View Public Page</span>
            </Link>
            <button
              onClick={() => setEditOrgModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Organization Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('briefs')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'briefs'
              ? 'bg-white border-[#5B46F6] ring-2 ring-[#5B46F6]/15 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Briefs</span>
            <FileText className="w-4 h-4 text-[#5B46F6]" />
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900">{briefs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live campaigns</div>
        </div>

        <div
          onClick={() => setActiveTab('applications')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-white border-[#5B46F6] ring-2 ring-[#5B46F6]/15 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pitches & Apps</span>
            <Inbox className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900">{applications.length}</div>
          <div className="text-[11px] text-[#5B46F6] font-semibold mt-1">
            {pendingApps.length} awaiting review
          </div>
        </div>

        <div
          onClick={() => setActiveTab('engagements')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'engagements'
              ? 'bg-white border-[#5B46F6] ring-2 ring-[#5B46F6]/15 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Deliveries</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900">{engagements.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Production versions</div>
        </div>

        <div
          onClick={() => setActiveTab('shortlist')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'shortlist'
              ? 'bg-white border-[#5B46F6] ring-2 ring-[#5B46F6]/15 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Shortlist</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900">{shortlist.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Vetted creators</div>
        </div>

        <div
          onClick={() => setActiveTab('messages')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer col-span-2 lg:col-span-1 ${
            activeTab === 'messages'
              ? 'bg-white border-[#5B46F6] ring-2 ring-[#5B46F6]/15 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Messages</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900">{threads.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{totalUnread} unread</div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('briefs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'briefs'
              ? 'bg-[#5B46F6] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Campaign Briefs ({briefs.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all relative ${
            activeTab === 'applications'
              ? 'bg-[#5B46F6] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Creator Applications ({applications.length})
          {pendingApps.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold">
              {pendingApps.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('engagements')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'engagements'
              ? 'bg-[#5B46F6] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Engagements & Deliveries ({engagements.length})
        </button>

        <button
          onClick={() => setActiveTab('shortlist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'shortlist'
              ? 'bg-[#5B46F6] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Shortlisted Creators ({shortlist.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'messages'
              ? 'bg-[#5B46F6] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Messages {totalUnread > 0 && `(${totalUnread})`}
        </button>
      </div>

      {/* Tab 1: Briefs */}
      {activeTab === 'briefs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900">Your Structured Creative Briefs</h2>
            <Link
              to="/brief-builder"
              className="text-xs font-semibold text-[#5B46F6] hover:underline flex items-center gap-1"
            >
              <span>+ Create with AI Brief Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {briefs.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-violet-50 text-[#5B46F6] border border-violet-100">
                        {b.content_type} • {b.aspect_ratio}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        b.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700'
                          : b.status === 'draft'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 font-mono">
                      {b.budget_min ? `$${b.budget_min} – $${b.budget_max || 4500}` : 'Budget Flexible'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-slate-900 text-base mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{b.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {b.style_tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <span>Deadline: </span>
                    <span className="text-slate-800 font-medium">{b.deadline || 'Flexible'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                    >
                      <span>Applications ({b.applications_count || 0})</span>
                    </button>
                    <Link
                      to={`/matches?brief_id=${b.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Rank Creators</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Applications Review */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Incoming Creator Proposals & Pitches
              </h2>
              <p className="text-xs text-slate-500">
                Review pitches submitted by verified creators to your open briefs.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {applications.length} Total Applications
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-500 space-y-3">
              <Inbox className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">No applications received yet</p>
              <p className="text-xs max-w-sm mx-auto text-slate-600">
                Creators can discover your open campaigns on the Open Briefs Board and submit direct pitches.
              </p>
              <Link
                to="/briefs"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold shadow-sm"
              >
                <span>View Public Brief Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const brief = briefs.find((b) => b.id === app.brief_id);
                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/creators/${app.creator_id}`}
                            className="font-display font-bold text-slate-900 text-sm hover:text-[#5B46F6] transition-colors"
                          >
                            {app.creator?.display_name || 'Elena Rostova'}
                          </Link>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            app.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : app.status === 'declined'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Applied to: <span className="font-semibold text-slate-700">{brief?.title || 'Open Brief'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {app.proposed_rate && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Proposed Quote</span>
                            <span className="text-sm font-extrabold text-[#5B46F6]">
                              ${app.proposed_rate.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900 block mb-1">Creator Pitch:</span>
                      {app.pitch}
                    </div>

                    {app.portfolio_sample_urls && app.portfolio_sample_urls.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Attached Portfolio Samples:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {app.portfolio_sample_urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#5B46F6] hover:underline bg-violet-50 px-2 py-1 rounded-lg"
                            >
                              <span>Sample #{i + 1}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Received {new Date(app.created_at).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'accepted')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Accept Pitch</span>
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'declined')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={async () => {
                            const c = await api.getCreator(app.creator_id);
                            setSelectedCreatorForChat(c);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#5B46F6] text-xs font-semibold transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Engagements & Deliveries */}
      {activeTab === 'engagements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900">Active Engagements & Version Control</h2>
            <span className="text-xs text-slate-500">Live milestones & proof review</span>
          </div>

          {engagements.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-500 space-y-3">
              <Layers className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">No active production contracts yet</p>
              <p className="text-xs max-w-sm mx-auto text-slate-600">
                Match with top candidates and initiate invitations to begin production sprints.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {engagements.map((eng) => (
                <div
                  key={eng.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-slate-900 text-base">
                        {eng.brief?.title || 'Zenith Quantum EV Teaser'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {eng.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span>
                        Creator:{' '}
                        <strong className="text-slate-800">
                          {eng.creator?.display_name || 'Assigned Creator'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Budget: <strong className="text-slate-800">${eng.agreed_terms?.budget || 3500}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Submissions: <strong className="text-slate-800">{eng.submissions?.length || 2}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        if (eng.creator) setSelectedCreatorForChat(eng.creator);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Chat with Creator"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/engagements/${eng.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <span>Review Deliverables</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Shortlist */}
      {activeTab === 'shortlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900">Saved Shortlist Candidates</h2>
            <Link to="/discover" className="text-xs font-semibold text-[#5B46F6] hover:underline">
              Browse More Talent →
            </Link>
          </div>

          {shortlist.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-500 space-y-3">
              <Bookmark className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">Your shortlist is currently empty</p>
              <p className="text-xs max-w-sm mx-auto text-slate-600">
                Save prospective creators from discovery or matching results to evaluate them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shortlist.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={item.creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={item.creator.display_name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">{item.creator.display_name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.creator.title}</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 mb-2">
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-semibold text-slate-900">★ {item.creator.rating_avg}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-semibold text-slate-900">${item.creator.rate_min} – ${item.creator.rate_max}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/creators/${item.creator.id}`}
                      className="text-xs font-semibold text-[#5B46F6] hover:underline"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => setSelectedCreatorForChat(item.creator)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900">Direct Message Threads</h2>
            <span className="text-xs text-slate-500">Communication history with creators</span>
          </div>

          {threads.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-500 space-y-3">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">No active message threads</p>
              <p className="text-xs max-w-sm mx-auto text-slate-600">
                Reach out to creators from the discovery roster or from brief matches to start a thread.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((t) => (
                <div
                  key={t.partner_id}
                  onClick={async () => {
                    const c = await api.getCreator(t.partner_id);
                    setSelectedCreatorForChat(c);
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-[#5B46F6] font-bold">
                      {t.partner_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-slate-900 text-sm">{t.partner_name}</span>
                        {t.unread_count > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B46F6] text-white font-bold">
                            {t.unread_count} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{t.last_message}</p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <span>
                      {new Date(t.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className="block text-[11px] text-[#5B46F6] font-semibold mt-1">
                      Open Chat →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Organization Profile Modal */}
      <Modal
        isOpen={editOrgModalOpen}
        onClose={() => setEditOrgModalOpen(false)}
        title="Edit Organization Profile"
      >
        <form onSubmit={handleUpdateOrganization} className="space-y-4">
          {orgUpdateError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {orgUpdateError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Studio Name *
            </label>
            <input
              type="text"
              required
              value={editOrgForm.company_name}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, company_name: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type
              </label>
              <select
                value={editOrgForm.type}
                onChange={(e) => setEditOrgForm({ ...editOrgForm, type: e.target.value as 'brand' | 'agency' })}
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
                value={editOrgForm.industry}
                onChange={(e) => setEditOrgForm({ ...editOrgForm, industry: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Website URL
            </label>
            <input
              type="url"
              value={editOrgForm.website}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, website: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Logo / Avatar URL
            </label>
            <input
              type="url"
              value={editOrgForm.logo_url}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, logo_url: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Mission
            </label>
            <textarea
              rows={3}
              value={editOrgForm.description}
              onChange={(e) => setEditOrgForm({ ...editOrgForm, description: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditOrgModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingOrg}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isUpdatingOrg ? <span>Saving Changes...</span> : <span>Save Organization Profile</span>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Direct Message Modal */}
      <DirectMessageModal
        isOpen={!!selectedCreatorForChat}
        onClose={() => setSelectedCreatorForChat(null)}
        creator={selectedCreatorForChat}
      />
    </div>
  );
};
