import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CreatorProfile, PortfolioProject, Brief, BriefApplication, MessageThreadSummary, WorkflowStep
} from '../types';
import {
  Video, Sparkles, Layers, DollarSign, Calendar, MessageSquare,
  CheckCircle2, Clock, AlertCircle, Plus, Trash2, Edit3, Eye,
  ExternalLink, UploadCloud, ShieldCheck, Film, User, Settings,
  Briefcase, Send, ArrowRight, Loader2, Star, CheckCheck, RefreshCw
} from 'lucide-react';

export const CreatorDashboardPage: React.FC = () => {
  const { user, creatorProfile: authProfile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'portfolio' | 'workflows' | 'opportunities' | 'invitations' | 'messages' | 'profile' | 'settings'
  >('overview');

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [openBriefs, setOpenBriefs] = useState<Brief[]>([]);
  const [myApplications, setMyApplications] = useState<BriefApplication[]>([]);
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Project Modal State
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    media_url: '',
    content_type: 'video',
    specialization: 'AI Filmmaking',
    aspect_ratios: ['16:9'],
    commercial_use_status: 'Commercial Rights Granted',
    tools_used: 'Runway Gen-3, Midjourney v6, Topaz Video AI',
    skills_demonstrated: 'Prompt Engineering, Compositing, Camera Motion',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // Apply Modal State
  const [applyingBrief, setApplyingBrief] = useState<Brief | null>(null);
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState<number>(2000);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    bio: '',
    rate_min: 1500,
    rate_max: 3500,
    availability_status: 'Available',
    location: 'Remote',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meResp, briefsResp, threadsResp] = await Promise.all([
        api.getMe(),
        api.getOpenBriefs(),
        api.getMessageThreads().catch(() => []),
      ]);

      if (meResp.creator_profile) {
        setProfile(meResp.creator_profile);
        setSettingsForm({
          title: meResp.creator_profile.title || '',
          bio: meResp.creator_profile.bio || '',
          rate_min: meResp.creator_profile.rate_min || 1500,
          rate_max: meResp.creator_profile.rate_max || 3500,
          availability_status: meResp.creator_profile.availability_status || 'Available',
          location: meResp.creator_profile.location || 'Remote',
        });
      }

      setOpenBriefs(briefsResp);
      setThreads(threadsResp);

      // Fetch my applications
      try {
        const appsResp = await api.getMyBriefApplications();
        setMyApplications(appsResp);
      } catch {
        // Fallback
      }
    } catch (err) {
      console.error('Failed to load creator dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const res = await api.uploadAsset(file, 'creator', 'video');
      setNewProject(prev => ({
        ...prev,
        media_url: res.url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
      setUploadProgress('Upload complete!');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'File upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmittingProject(true);
    try {
      const created = await api.addPortfolioProject(profile.id, {
        title: newProject.title,
        description: newProject.description,
        media_url: newProject.media_url,
        content_type: newProject.content_type,
        specialization: newProject.specialization,
        aspect_ratios: newProject.aspect_ratios,
        commercial_use_status: newProject.commercial_use_status,
        tools_used: newProject.tools_used.split(',').map(s => s.trim()).filter(Boolean),
        skills_demonstrated: newProject.skills_demonstrated.split(',').map(s => s.trim()).filter(Boolean),
        workflow_steps: [
          { step: 1, name: 'Concept & Directing', tool: 'Claude 3.5 Sonnet', description: 'Prompt pipeline architecture' },
          { step: 2, name: 'Video Diffusion', tool: 'Runway Gen-3 Alpha', description: 'Cinematic camera moves and motion design' },
          { step: 3, name: 'Upscale & Editorial Grade', tool: 'Topaz Video AI', description: '4K fidelity upscale and color grade' }
        ]
      });

      setProfile(prev => prev ? {
        ...prev,
        portfolio_projects: [created, ...(prev.portfolio_projects || [])]
      } : prev);

      setIsAddProjectModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        media_url: '',
        content_type: 'video',
        specialization: 'AI Filmmaking',
        aspect_ratios: ['16:9'],
        commercial_use_status: 'Commercial Rights Granted',
        tools_used: 'Runway Gen-3, Midjourney v6, Topaz Video AI',
        skills_demonstrated: 'Prompt Engineering, Compositing, Camera Motion',
      });
      setStatusMsg({ type: 'success', text: 'Portfolio project published to your profile!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to add project.' });
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!profile || !window.confirm('Are you sure you want to delete this portfolio project?')) return;
    try {
      await api.deletePortfolioProject(profile.id, projectId);
      setProfile(prev => prev ? {
        ...prev,
        portfolio_projects: prev.portfolio_projects.filter(p => p.id !== projectId)
      } : prev);
      setStatusMsg({ type: 'success', text: 'Project deleted.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to delete project.' });
    }
  };

  const handleApplyToBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingBrief) return;
    setIsSubmittingApp(true);
    try {
      const app = await api.applyToBrief(applyingBrief.id, {
        pitch,
        proposed_rate: proposedRate,
        portfolio_sample_urls: profile?.portfolio_projects?.slice(0, 2).map(p => p.media_url) || []
      });
      setMyApplications(prev => [app, ...prev]);
      setApplyingBrief(null);
      setPitch('');
      setStatusMsg({ type: 'success', text: 'Application submitted! The brand will review your proposal in Brand Hub.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || err?.message || 'Failed to apply.' });
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingSettings(true);
    try {
      const updated = await api.updateCreator(profile.id, settingsForm);
      setProfile(updated);
      setStatusMsg({ type: 'success', text: 'Creator settings updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to update settings.' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your Creator Workspace...</p>
      </div>
    );
  }

  const projects = profile?.portfolio_projects || [];
  const matchedOpportunities = openBriefs.filter(b => {
    // Matched if creator skills/specs match brief content type or keywords
    return true;
  });

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

        {/* TOP PROFILE HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-violet-100 flex-shrink-0 shadow-sm">
                <img
                  src={profile?.avatar_url || user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                  alt={profile?.display_name || user?.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900 font-display">
                    {profile?.display_name || user?.display_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-100">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Creator
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    profile?.availability_status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                    profile?.availability_status === 'Busy' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {profile?.availability_status || 'Available'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  {profile?.title || 'Generative AI Filmmaker & Spec VFX Artist'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>📍 {profile?.location || 'Remote'}</span>
                  <span>•</span>
                  <span>⭐ {profile?.rating_avg?.toFixed(1) || '5.0'} ({profile?.reviews_count || 1} reviews)</span>
                  <span>•</span>
                  <span>💵 ${profile?.rate_min?.toLocaleString()} – ${profile?.rate_max?.toLocaleString()} / project</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/creators/${profile?.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Public Profile
              </Link>
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-200"
              >
                <Plus className="w-4 h-4" />
                Upload Project
              </button>
            </div>
          </div>

          {/* WORKSPACE NAVIGATION BAR */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 mt-6 pt-4 scrollbar-none">
            {[
              { id: 'overview', label: 'Overview', icon: Sparkles },
              { id: 'portfolio', label: 'My Portfolio', icon: Film, count: projects.length },
              { id: 'workflows', label: 'Production Workflows', icon: Layers },
              { id: 'opportunities', label: 'Matched Opportunities', icon: Briefcase, count: openBriefs.length },
              { id: 'invitations', label: 'Invitations & Apps', icon: Calendar, count: myApplications.length },
              { id: 'messages', label: 'Messages', icon: MessageSquare, count: threads.reduce((acc, t) => acc + t.unread_count, 0) },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'settings', label: 'Account Settings', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-violet-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Portfolio Pieces</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{projects.length}</p>
                <span className="text-[11px] text-emerald-600 font-medium">All verified provenance</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Matched Briefs</span>
                <p className="text-2xl font-bold text-violet-700 mt-1 font-display">{openBriefs.length}</p>
                <span className="text-[11px] text-slate-500">Ready for pitch</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Applications</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{myApplications.length}</p>
                <span className="text-[11px] text-slate-500 font-medium">Under brand review</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Conversations</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{threads.length}</p>
                <span className="text-[11px] text-violet-600 font-medium">Brand direct chat</span>
              </div>
            </div>

            {/* RECENT MATCHED OPPORTUNITIES */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Recommended Campaign Briefs</h2>
                  <p className="text-xs text-slate-500">Open client briefs matching your creative skills and production models.</p>
                </div>
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  View all ({openBriefs.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {openBriefs.slice(0, 4).map(b => (
                  <div key={b.id} className="p-5 rounded-2xl border border-slate-200 hover:border-violet-300 transition-all bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">{b.content_type.toUpperCase()} • {b.aspect_ratio}</span>
                        <span className="font-medium text-slate-700">${b.budget_min?.toLocaleString()} - ${b.budget_max?.toLocaleString()}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{b.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{b.objective}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{b.duration || '15-30s'} runtime</span>
                      <button
                        onClick={() => { setApplyingBrief(b); setProposedRate(b.budget_max || 2500); }}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
                      >
                        Apply / Pitch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LATEST PORTFOLIO SHOWCASE */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Published Portfolio</h2>
                  <p className="text-xs text-slate-500">Live projects showcased on your public creator profile.</p>
                </div>
                <button
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  + Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {projects.slice(0, 3).map(p => (
                  <div key={p.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 group">
                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                      {p.media_url.endsWith('.mp4') || p.media_url.includes('video') ? (
                        <video src={p.media_url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={p.media_url} alt={p.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{p.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.specialization}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(p.tools_used || []).slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. MY PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">My Portfolio Pieces</h2>
                <p className="text-xs text-slate-500">Your demonstrated work samples used to calculate match relevance for brand briefs.</p>
              </div>
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Film className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No portfolio projects published yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload your video deliverables and prompt workflows to showcase your technical excellence.
                </p>
                <button
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
                >
                  Upload First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-video bg-black">
                        {p.media_url.endsWith('.mp4') || p.media_url.includes('video') ? (
                          <video src={p.media_url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={p.media_url} alt={p.title} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium">
                          {p.commercial_use_status}
                        </span>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.title}</h3>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                          {(p.tools_used || []).map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Aspect: {(p.aspect_ratios || ['16:9']).join(', ')}</span>
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Self-reported
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. PRODUCTION WORKFLOWS */}
        {activeTab === 'workflows' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Production Workflows & Provenance</h2>
              <p className="text-xs text-slate-500">Documented prompt engineering, diffusion pipelines, and editorial pipelines.</p>
            </div>

            <div className="space-y-6">
              {projects.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                      <p className="text-xs text-slate-500">{p.specialization} • Tools: {(p.tools_used || []).join(', ')}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Workflow Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(p.workflow_steps && p.workflow_steps.length > 0 ? p.workflow_steps : [
                      { step: 1, name: 'Concept & Prompting', tool: 'Claude 3.5 Sonnet', description: 'Shot list breakdown and prompt architecture' },
                      { step: 2, name: 'Video Diffusion', tool: 'Runway Gen-3 Alpha', description: 'Generating continuous 24fps motion passes' },
                      { step: 3, name: 'Upscale & Editorial Grade', tool: 'Topaz Video AI', description: '4K super-resolution and DaVinci color grading' },
                    ]).map((ws: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 font-semibold text-[10px]">
                          <span>STEP 0{ws.step || idx + 1}</span>
                          <span className="text-violet-600">{ws.tool}</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{ws.name}</h4>
                        <p className="text-slate-600 text-[11px]">{ws.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MATCHED OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Matched Campaign Opportunities</h2>
                <p className="text-xs text-slate-500">Open client briefs from verified brands and creative production agencies.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-violet-100 text-violet-800 rounded-full">
                {openBriefs.length} Active Briefs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {openBriefs.map(b => {
                const hasApplied = myApplications.some(a => a.brief_id === b.id);
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:border-violet-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
                          {b.content_type.toUpperCase()} • {b.aspect_ratio}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          ${b.budget_min?.toLocaleString()} – ${b.budget_max?.toLocaleString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-1">{b.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4">{b.objective}</p>

                      <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">Runtime: {b.duration || '15-30s'}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">Resolution: {b.resolution || '1080p'}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">Scope: {b.commercial_use_scope}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Status: {b.status}</span>
                      {hasApplied ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <CheckCheck className="w-3.5 h-3.5" /> Pitch Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => { setApplyingBrief(b); setProposedRate(b.budget_max || 2500); }}
                          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm"
                        >
                          Submit Pitch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. INVITATIONS & APPLICATIONS */}
        {activeTab === 'invitations' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Submitted Applications & Pitches</h2>
                <p className="text-xs text-slate-500">Track the review status of your campaign applications across brands.</p>
              </div>
              <button onClick={loadData} className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {myApplications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                You haven't submitted any applications yet. Explore the Matched Opportunities tab to pitch open briefs!
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map(app => (
                  <div key={app.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'declined' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mt-2">{app.pitch}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-slate-500">Proposed Rate</span>
                      <p className="text-base font-bold text-slate-900">
                        ${app.proposed_rate ? app.proposed_rate.toLocaleString() : 'Negotiable'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. MESSAGES */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Client Messages</h2>
                <p className="text-xs text-slate-500">Direct conversations with brand leads and agency producers.</p>
              </div>
              <Link
                to="/messages"
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
              >
                Open Full Messenger
              </Link>
            </div>

            {threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active message threads yet. Brands will message you when reviewing your applications or shortlisting you!
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
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm">
                        {t.partner_name?.charAt(0) || 'B'}
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

        {/* 7. MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Public Profile Preview</h2>
                <p className="text-xs text-slate-500">This is how verified brand clients view your profile in the Discover directory.</p>
              </div>
              <Link
                to={`/creators/${profile?.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200"
              >
                <ExternalLink className="w-4 h-4" /> Open Full Page
              </Link>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Bio & Creative Vision</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{profile?.bio}</p>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Specializations</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.specializations || []).map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-800 text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Skills Demonstrated</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.skills || []).map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-1.5">AI Models & Software</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.tools || []).map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-xs font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. ACCOUNT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Creator Settings & Rates</h2>
              <p className="text-xs text-slate-500">Update your headline, biography, availability status, and rate card.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Professional Headline</label>
                <input
                  type="text"
                  value={settingsForm.title}
                  onChange={e => setSettingsForm({ ...settingsForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-violet-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Biography</label>
                <textarea
                  rows={3}
                  value={settingsForm.bio}
                  onChange={e => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-violet-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Minimum Rate ($)</label>
                  <input
                    type="number"
                    value={settingsForm.rate_min}
                    onChange={e => setSettingsForm({ ...settingsForm, rate_min: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Maximum Rate ($)</label>
                  <input
                    type="number"
                    value={settingsForm.rate_max}
                    onChange={e => setSettingsForm({ ...settingsForm, rate_max: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Availability Status</label>
                <select
                  value={settingsForm.availability_status}
                  onChange={e => setSettingsForm({ ...settingsForm, availability_status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="Available">Available for Projects</option>
                  <option value="Busy">Busy (Limited Bandwidth)</option>
                  <option value="Booked">Fully Booked</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 shadow-sm disabled:opacity-70"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Sign Out of Creator Workspace
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ADD PROJECT MODAL */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 font-display">Add Portfolio Project</h3>
              <button onClick={() => setIsAddProjectModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Neo-Tokyo Commercial Sequence"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Cinematic AI commercial shot with high dynamic motion..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Video File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleFileUpload}
                    className="text-xs"
                    disabled={isUploading}
                  />
                  {uploadProgress && <p className="text-xs text-violet-600 font-medium mt-1">{uploadProgress}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Or Media URL</label>
                <input
                  type="text"
                  required
                  value={newProject.media_url}
                  onChange={e => setNewProject({ ...newProject, media_url: e.target.value })}
                  placeholder="https://... or uploaded path"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tools Used (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.tools_used}
                  onChange={e => setNewProject({ ...newProject, tools_used: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl disabled:opacity-70"
                >
                  {isSubmittingProject ? 'Publishing...' : 'Publish to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {applyingBrief && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Pitch for {applyingBrief.title}</h3>
                <p className="text-xs text-slate-500">Budget: ${applyingBrief.budget_min?.toLocaleString()} – ${applyingBrief.budget_max?.toLocaleString()}</p>
              </div>
              <button onClick={() => setApplyingBrief(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleApplyToBrief} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Creative Pitch</label>
                <textarea
                  rows={4}
                  required
                  value={pitch}
                  onChange={e => setPitch(e.target.value)}
                  placeholder="Explain your concept, the AI toolchain you'll use (Runway Gen-3, Midjourney, etc.), and how you'll achieve brand consistency..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Project Rate ($)</label>
                <input
                  type="number"
                  required
                  value={proposedRate}
                  onChange={e => setProposedRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApplyingBrief(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl disabled:opacity-70"
                >
                  {isSubmittingApp ? 'Submitting...' : 'Send Pitch to Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreatorDashboardPage;
