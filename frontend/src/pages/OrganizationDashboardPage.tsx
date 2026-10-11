import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Brief, CreatorProfile, Organization, ShortlistItem,
  MessageThreadSummary, BriefApplication, CreatorMatchResult
} from '../types';
import {
  Building2, Briefcase, Sparkles, Bookmark, MessageSquare,
  Users, Settings, Plus, Eye, Globe, ShieldCheck, CheckCircle2,
  Clock, AlertCircle, Trash2, Edit3, ArrowRight, Loader2,
  Star, ExternalLink, ChevronRight, UserCheck, Send, RefreshCw, Filter
} from 'lucide-react';
import { DirectMessageModal } from '../components/messaging/DirectMessageModal';

export const OrganizationDashboardPage: React.FC = () => {
  const { user, organization: authOrg, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'organization' | 'campaigns' | 'matches' | 'shortlist' | 'messages' | 'settings'
  >('overview');

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [applications, setApplications] = useState<BriefApplication[]>([]);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  
  // Matching Engine State
  const [selectedBriefId, setSelectedBriefId] = useState<string>('');
  const [matchResults, setMatchResults] = useState<CreatorMatchResult[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);

  // Direct Message Modal
  const [selectedCreatorForChat, setSelectedCreatorForChat] = useState<CreatorProfile | null>(null);

  // Edit Org Form
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({
    company_name: '',
    industry: '',
    type: 'brand' as 'brand' | 'agency',
    website: '',
    logo_url: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meResp, orgsResp, briefsResp, shortResp, threadsResp, creatorsResp] = await Promise.all([
        api.getMe(),
        api.getOrganizations(),
        api.getBriefs(),
        api.getShortlist().catch(() => []),
        api.getMessageThreads().catch(() => []),
        api.getCreators().catch(() => []),
      ]);

      // Resolve organization strictly owned by current user
      let myOrg: Organization | undefined = meResp.organization;
      if (!myOrg && user?.id) {
        myOrg = orgsResp.find(o => o.owner_user_id === user.id);
      }
      if (!myOrg && orgsResp.length > 0) {
        myOrg = orgsResp[0];
      }

      setOrganization(myOrg || null);
      if (myOrg) {
        setOrgForm({
          company_name: myOrg.company_name,
          industry: myOrg.industry || '',
          type: myOrg.type,
          website: myOrg.website || '',
          logo_url: myOrg.logo_url || '',
          description: myOrg.description || '',
        });
      }

      // Filter briefs owned by this organization/brand
      const myBriefs = myOrg
        ? briefsResp.filter(b => b.organization_id === myOrg?.id || b.brand_user_id === user?.id)
        : briefsResp;
      setBriefs(myBriefs.length > 0 ? myBriefs : briefsResp);

      if (myBriefs.length > 0 && !selectedBriefId) {
        setSelectedBriefId(myBriefs[0].id);
      } else if (briefsResp.length > 0 && !selectedBriefId) {
        setSelectedBriefId(briefsResp[0].id);
      }

      setShortlist(shortResp);
      setThreads(threadsResp);
      setCreators(creatorsResp);

      // Load applications for my briefs
      const allApps: BriefApplication[] = [];
      for (const b of (myBriefs.length > 0 ? myBriefs : briefsResp).slice(0, 5)) {
        try {
          const bApps = await api.getBriefApplications(b.id);
          allApps.push(...bApps);
        } catch {}
      }
      setApplications(allApps);

    } catch (err) {
      console.error('Failed to load organization dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Run matching when selected brief changes or when navigating to matches tab
  useEffect(() => {
    const fetchMatches = async () => {
      if (!selectedBriefId) return;
      setIsMatchingLoading(true);
      try {
        const results = await api.getMatchesForBrief(selectedBriefId);
        setMatchResults(results);
      } catch (err) {
        console.error('Failed to calculate matches for brief:', err);
      } finally {
        setIsMatchingLoading(false);
      }
    };

    fetchMatches();
  }, [selectedBriefId]);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    try {
      const updated = await api.updateOrganization(organization.id, orgForm);
      setOrganization(updated);
      setIsEditingOrg(false);
      setStatusMsg({ type: 'success', text: 'Organization profile updated successfully.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || err?.message || 'Failed to update organization.' });
    }
  };

  const handleToggleShortlist = async (creatorId: string) => {
    const isShortlisted = shortlist.some(s => s.creator_id === creatorId);
    try {
      if (isShortlisted) {
        await api.removeCreatorFromShortlist(creatorId, selectedBriefId || undefined);
        setShortlist(prev => prev.filter(s => s.creator_id !== creatorId));
        setStatusMsg({ type: 'success', text: 'Removed from shortlist.' });
      } else {
        const item = await api.addToShortlist(creatorId, selectedBriefId || undefined, 'Shortlisted from Match Results');
        setShortlist(prev => [item, ...prev]);
        setStatusMsg({ type: 'success', text: 'Creator added to your shortlist.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to update shortlist.' });
    }
  };

  const handleApplicationStatus = async (appId: string, status: 'reviewed' | 'accepted' | 'declined') => {
    try {
      await api.updateBriefApplicationStatus(appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      setStatusMsg({ type: 'success', text: `Application marked as ${status}.` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to update application status.' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading Organization Workspace...</p>
      </div>
    );
  }

  const selectedBrief = briefs.find(b => b.id === selectedBriefId);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* STATUS ALERT */}
        {statusMsg && (
          <div className={`p-4 rounded-2xl flex items-center justify-between border ${
            statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3 text-sm font-medium">
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              {statusMsg.text}
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-xs font-semibold uppercase hover:underline">Dismiss</button>
          </div>
        )}

        {/* ORGANIZATION HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                {organization?.logo_url ? (
                  <img src={organization.logo_url} alt={organization.company_name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900 font-display">
                    {organization?.company_name || user?.display_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                    Verified Organization
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold capitalize">
                    {organization?.type || 'Brand'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  {organization?.industry || 'Creative Production & Generative AI Tech'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  {organization?.website && (
                    <a href={organization.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-violet-600">
                      <Globe className="w-3.5 h-3.5" /> {organization.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <span>•</span>
                  <span>{briefs.length} Active Campaigns</span>
                  <span>•</span>
                  <span>{shortlist.length} Shortlisted Creators</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/brief-builder"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Brief
              </Link>
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Users className="w-4 h-4" />
                Discover Talent
              </Link>
            </div>
          </div>

          {/* DASHBOARD NAVIGATION BAR */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 mt-6 pt-4 scrollbar-none">
            {[
              { id: 'overview', label: 'Overview', icon: Sparkles },
              { id: 'organization', label: 'My Organization', icon: Building2 },
              { id: 'campaigns', label: 'Campaigns', icon: Briefcase, count: briefs.length },
              { id: 'matches', label: 'Match Results', icon: Sparkles, count: matchResults.length },
              { id: 'shortlist', label: 'Shortlist', icon: Bookmark, count: shortlist.length },
              { id: 'messages', label: 'Messages', icon: MessageSquare, count: threads.reduce((acc, t) => acc + t.unread_count, 0) },
              { id: 'settings', label: 'Organization Settings', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENTS */}

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Campaigns</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{briefs.length}</p>
                <span className="text-[11px] text-slate-500 font-medium">Published briefs</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Creator Applicants</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{applications.length}</p>
                <span className="text-[11px] text-violet-600 font-medium">Awaiting review</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Shortlisted Talent</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{shortlist.length}</p>
                <span className="text-[11px] text-emerald-600 font-medium">Ready for invite</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Threads</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{threads.length}</p>
                <span className="text-[11px] text-slate-500 font-medium">Direct creator chats</span>
              </div>
            </div>

            {/* QUICK CAMPAIGN & MATCH HIGHLIGHT */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Active Campaigns</h2>
                  <p className="text-xs text-slate-500">Live briefs matching candidate creator portfolios.</p>
                </div>
                <Link to="/brief-builder" className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1">
                  + New Campaign Brief
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {briefs.map(b => (
                  <div key={b.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700">
                          {b.content_type.toUpperCase()} • {b.aspect_ratio}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          b.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{b.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{b.objective}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        ${b.budget_min?.toLocaleString()} – ${b.budget_max?.toLocaleString()}
                      </span>
                      <button
                        onClick={() => { setSelectedBriefId(b.id); setActiveTab('matches'); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        View Matches
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CREATOR APPLICANTS AWAITING REVIEW */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Creator Applications Awaiting Review</h2>
                  <p className="text-xs text-slate-500">Pitches submitted by creators to your open campaigns.</p>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No applications received yet. Your open briefs are listed on the public Open Briefs board.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-900">Creator Application</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'declined' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic">"{app.pitch}"</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-900 mr-2">
                          ${app.proposed_rate ? app.proposed_rate.toLocaleString() : 'Rate TBD'}
                        </span>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'accepted')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'declined')}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MY ORGANIZATION */}
        {activeTab === 'organization' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Organization Profile & Brand Identity</h2>
                <p className="text-xs text-slate-500">Public profile visible to creators on the Open Briefs directory and campaign headers.</p>
              </div>
              <button
                onClick={() => setIsEditingOrg(!isEditingOrg)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                {isEditingOrg ? 'Cancel' : 'Edit Organization'}
              </button>
            </div>

            {isEditingOrg ? (
              <form onSubmit={handleUpdateOrg} className="space-y-4 max-w-xl pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Company / Agency Name</label>
                  <input
                    type="text"
                    required
                    value={orgForm.company_name}
                    onChange={e => setOrgForm({ ...orgForm, company_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={orgForm.type}
                      onChange={e => setOrgForm({ ...orgForm, type: e.target.value as 'brand' | 'agency' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="brand">Brand</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Industry</label>
                    <input
                      type="text"
                      value={orgForm.industry}
                      onChange={e => setOrgForm({ ...orgForm, industry: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Official Website</label>
                  <input
                    type="url"
                    value={orgForm.website}
                    onChange={e => setOrgForm({ ...orgForm, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={orgForm.description}
                    onChange={e => setOrgForm({ ...orgForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Description</h3>
                  <p className="text-sm text-slate-800 mt-1">{organization?.description || 'No description provided.'}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
                  <span>🏢 Type: <strong className="text-slate-900 capitalize">{organization?.type}</strong></span>
                  <span>🌐 Website: <a href={organization?.website} target="_blank" rel="noreferrer" className="text-violet-600 underline font-medium">{organization?.website || 'N/A'}</a></span>
                  <span>🔒 Ownership: Verified primary owner account</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Campaign Briefs</h2>
                <p className="text-xs text-slate-500">Structured briefs used to generate algorithmic creator fit scores.</p>
              </div>
              <Link
                to="/brief-builder"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm"
              >
                + Create Brief
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {briefs.map(b => (
                <div key={b.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border text-slate-700">
                        {b.content_type.toUpperCase()} • {b.aspect_ratio}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{b.objective}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      ${b.budget_min?.toLocaleString()} – ${b.budget_max?.toLocaleString()}
                    </span>
                    <button
                      onClick={() => { setSelectedBriefId(b.id); setActiveTab('matches'); }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      View Matching Creators
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MATCH RESULTS */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* BRIEF SELECTOR */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Evaluating Campaign Brief:
                </label>
                <select
                  value={selectedBriefId}
                  onChange={e => setSelectedBriefId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {briefs.map(b => (
                    <option key={b.id} value={b.id}>{b.title} (${b.budget_min?.toLocaleString()} - ${b.budget_max?.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
                Formula: <strong className="text-slate-800 font-mono">Score = 0.40K + 0.30P + 0.20F + 0.10T</strong>
              </div>
            </div>

            {/* MATCH RESULTS GRID */}
            {isMatchingLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Calculating multidimensional creator fit scores...</p>
              </div>
            ) : matchResults.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
                No creator matches calculated for this brief.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchResults.map((result, idx) => {
                  const creator = result.creator;
                  const isShortlisted = shortlist.some(s => s.creator_id === creator.id);
                  const isMandatoryPassed = result.breakdown?.mandatory_passed;

                  return (
                    <div key={creator.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="p-6 space-y-4">
                        {/* HEADER */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border">
                              <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Link to={`/creators/${creator.id}`} className="font-bold text-slate-900 text-base hover:text-violet-600">
                                  {creator.display_name}
                                </Link>
                                <ShieldCheck className="w-4 h-4 text-violet-600" />
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-1">{creator.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span>⭐ {creator.rating_avg?.toFixed(1) || '5.0'}</span>
                                <span>•</span>
                                <span>${creator.rate_min} - ${creator.rate_max}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-xl text-xs font-black font-display ${
                              result.score >= 80 ? 'bg-violet-600 text-white' :
                              result.score >= 60 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {Math.round(result.score)}% FIT
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 block">Rank #{idx + 1}</span>
                          </div>
                        </div>

                        {/* FACTOR BREAKDOWN */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-500 block">Skills (40%)</span>
                            <span className="text-xs font-bold text-slate-900">{Math.round(result.breakdown.skill_match)}%</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-500 block">Portfolio (30%)</span>
                            <span className="text-xs font-bold text-slate-900">{Math.round(result.breakdown.portfolio_relevance)}%</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-500 block">Format (20%)</span>
                            <span className="text-xs font-bold text-slate-900">{Math.round(result.breakdown.format_compatibility)}%</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-500 block">Tools (10%)</span>
                            <span className="text-xs font-bold text-slate-900">{Math.round(result.breakdown.tool_compatibility)}%</span>
                          </div>
                        </div>

                        {/* MANDATORY CHECK & EXPLANATION */}
                        {!isMandatoryPassed && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>Needs confirmation: {result.breakdown.mandatory_violations.join(', ')}</span>
                          </div>
                        )}

                        <div className="text-xs text-slate-600 space-y-1">
                          {result.match_explanations.slice(0, 2).map((exp, eIdx) => (
                            <p key={eIdx} className="flex items-start gap-1.5">
                              <span className="text-violet-600">•</span>
                              <span>{exp}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          to={`/creators/${creator.id}`}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        >
                          View Full Portfolio →
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleShortlist(creator.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isShortlisted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isShortlisted ? '✓ Shortlisted' : '+ Shortlist'}
                          </button>
                          <button
                            onClick={() => setSelectedCreatorForChat(creator)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                          >
                            Message
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

        {/* 5. SHORTLIST */}
        {activeTab === 'shortlist' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Brand Shortlist</h2>
                <p className="text-xs text-slate-500">Creators bookmarked for campaign casting and collaboration.</p>
              </div>
            </div>

            {shortlist.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No creators currently in your shortlist. Use the Match Results tab or Discover Talent directory to add creators!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortlist.map(s => {
                  const c = s.creator;
                  return (
                    <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                          <img src={c?.avatar_url} alt={c?.display_name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <Link to={`/creators/${c?.id}`} className="font-bold text-slate-900 text-sm hover:underline">
                            {c?.display_name}
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-1">{c?.title}</p>
                          <span className="text-[11px] text-slate-400">${c?.rate_min} - ${c?.rate_max}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleShortlist(s.creator_id)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                        {c && (
                          <button
                            onClick={() => setSelectedCreatorForChat(c)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                          >
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. MESSAGES */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Creator Conversations</h2>
                <p className="text-xs text-slate-500">Collaborate directly on deliverables, revisions, and production milestones.</p>
              </div>
              <Link to="/messages" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800">
                Open Messenger
              </Link>
            </div>

            {threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active conversations yet. Shortlist a creator or click Message on any profile to begin.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {threads.map(t => (
                  <Link
                    key={t.partner_id}
                    to="/messages"
                    className="py-4 flex items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
                        {t.partner_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.partner_name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{t.last_message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">{new Date(t.last_message_at).toLocaleDateString()}</span>
                      {t.unread_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Organization & Account Settings</h2>
              <p className="text-xs text-slate-500">Manage account owner access and session security.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 max-w-xl">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Account Owner Email</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{user?.email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Role Scope</span>
                <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{user?.role} Access</p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
                >
                  Sign Out of Organization Workspace
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DIRECT MESSAGE MODAL */}
      {selectedCreatorForChat && (
        <DirectMessageModal
          creator={selectedCreatorForChat}
          onClose={() => setSelectedCreatorForChat(null)}
          onMessageSent={() => {
            setSelectedCreatorForChat(null);
            setStatusMsg({ type: 'success', text: 'Message sent! Check your Messages tab.' });
          }}
        />
      )}

    </div>
  );
};

export default OrganizationDashboardPage;
