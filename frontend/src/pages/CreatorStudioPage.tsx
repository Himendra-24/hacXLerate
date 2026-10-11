import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CreatorProfile, PortfolioProject, WorkflowStep } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Plus,
  Save,
  Layers,
  Trash2,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  LogIn,
  ArrowRight
} from 'lucide-react';

export const CreatorStudioPage: React.FC = () => {
  const { user, creatorProfile: authCreatorProfile, isAuthenticated, isLoading: isAuthLoading, openAuthModal, logout } = useAuth();
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New Project Form State
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
    workflow_steps: [
      { step: 1, name: 'Concept & Prompt Architecture', tool: 'Claude 3.5 Sonnet', description: 'Shot list breakdown and seed prompting.' },
      { step: 2, name: 'Video Diffusion Synthesis', tool: 'Runway Gen-3 Alpha', description: 'Generating continuous 24fps motion with camera pan.' },
      { step: 3, name: 'Upscale & Editorial Grade', tool: 'Topaz & DaVinci Resolve', description: 'Super-resolution 4K upscale and color balancing.' },
    ] as WorkflowStep[],
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!isAuthenticated || user?.role !== 'creator') {
        if (isMounted) {
          setSelectedCreator(null);
          setIsProfileLoading(false);
        }
        return;
      }

      setIsProfileLoading(true);
      try {
        if (authCreatorProfile?.id) {
          const fresh = await api.getCreator(authCreatorProfile.id);
          if (isMounted) setSelectedCreator(fresh);
        } else {
          const me = await api.getMe();
          if (me.creator_profile?.id) {
            const fresh = await api.getCreator(me.creator_profile.id);
            if (isMounted) setSelectedCreator(fresh);
          } else {
            if (isMounted) setSelectedCreator(null);
          }
        }
      } catch (err) {
        console.error('Failed to load authenticated creator profile:', err);
        if (isMounted && authCreatorProfile) {
          setSelectedCreator(authCreatorProfile);
        }
      } finally {
        if (isMounted) setIsProfileLoading(false);
      }
    };

    if (!isAuthLoading) {
      loadProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id, user?.role, authCreatorProfile?.id, isAuthLoading]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) return;
    setIsSavingProfile(true);
    setStatusMessage(null);
    try {
      const updated = await api.updateCreator(selectedCreator.id, {
        display_name: selectedCreator.display_name,
        title: selectedCreator.title,
        bio: selectedCreator.bio,
        location: selectedCreator.location,
        rate_min: selectedCreator.rate_min,
        rate_max: selectedCreator.rate_max,
        availability_status: selectedCreator.availability_status,
      });
      setSelectedCreator(updated);
      setStatusMessage({ type: 'success', text: 'Creator profile updated and saved!' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Workflow step operations (Add, Edit, Reorder, Delete)
  const handleAddWorkflowStep = () => {
    const nextStepNum = newProject.workflow_steps.length + 1;
    setNewProject(prev => ({
      ...prev,
      workflow_steps: [
        ...prev.workflow_steps,
        {
          step: nextStepNum,
          name: 'Compositing / Post',
          tool: 'After Effects',
          description: 'Refining motion passes and typography lockups.',
        },
      ],
    }));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProject.workflow_steps.length) return;

    const updated = [...newProject.workflow_steps];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Re-index step numbers
    const reindexed = updated.map((step, idx) => ({ ...step, step: idx + 1 }));
    setNewProject(prev => ({ ...prev, workflow_steps: reindexed }));
  };

  const handleRemoveWorkflowStep = (idx: number) => {
    const filtered = newProject.workflow_steps.filter((_, i) => i !== idx);
    const reindexed = filtered.map((step, i) => ({ ...step, step: i + 1 }));
    setNewProject(prev => ({ ...prev, workflow_steps: reindexed }));
  };

  // File Upload Handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only MP4, MOV, WebM, JPEG, PNG, or WebP files are supported.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size exceeds the 50 MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(20);

    try {
      const isVideo = file.type.startsWith('video');
      const timer = setInterval(() => {
        setUploadProgress(prev => (prev && prev < 85 ? prev + 15 : prev));
      }, 200);

      const uploaded = await api.uploadFile(
        file,
        'creator',
        isVideo ? 'video' : 'image',
        'portfolio_project'
      );

      clearInterval(timer);
      setUploadProgress(100);
      setNewProject(prev => ({
        ...prev,
        media_url: uploaded.url,
        content_type: isVideo ? 'video' : 'image'
      }));
    } catch (err: any) {
      setUploadError(err?.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 1500);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator || !newProject.title.trim()) return;
    setIsAddingProject(true);
    setStatusMessage(null);

    try {
      await api.addPortfolioProject(selectedCreator.id, {
        title: newProject.title,
        description: newProject.description,
        media_url: newProject.media_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000',
        content_type: newProject.content_type,
        specialization: newProject.specialization,
        aspect_ratios: newProject.aspect_ratios,
        commercial_use_status: newProject.commercial_use_status,
        tools_used: newProject.tools_used.split(',').map((t) => t.trim()).filter(Boolean),
        skills_demonstrated: newProject.skills_demonstrated.split(',').map((s) => s.trim()).filter(Boolean),
        workflow_steps: newProject.workflow_steps,
        evidence_status: 'Self-reported',
      });

      // Refresh creator data
      const refreshed = await api.getCreator(selectedCreator.id);
      setSelectedCreator(refreshed);

      // Reset form
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
        workflow_steps: [
          { step: 1, name: 'Concept & Prompt Architecture', tool: 'Claude 3.5 Sonnet', description: 'Shot list breakdown and seed prompting.' },
          { step: 2, name: 'Video Diffusion Synthesis', tool: 'Runway Gen-3 Alpha', description: 'Generating continuous 24fps motion with camera pan.' },
          { step: 3, name: 'Upscale & Editorial Grade', tool: 'Topaz & DaVinci Resolve', description: 'Super-resolution 4K upscale and color balancing.' },
        ],
      });

      setStatusMessage({ type: 'success', text: 'Portfolio project and Production Workflow recipe successfully published!' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to add portfolio project.' });
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!selectedCreator) return;
    if (!window.confirm('Are you sure you want to delete this portfolio project and its workflow recipe?')) return;

    try {
      await api.deletePortfolioProject(selectedCreator.id, projectId);
      const refreshed = await api.getCreator(selectedCreator.id);
      setSelectedCreator(refreshed);
      setStatusMessage({ type: 'success', text: 'Project deleted successfully.' });
    } catch (err: any) {
      alert(err?.message || 'Failed to delete project');
    }
  };

  if (isAuthLoading || (isAuthenticated && user?.role === 'creator' && isProfileLoading && !selectedCreator)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#5B46F6] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your Creator Studio workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-14 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-[#5B46F6] flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-[#5B46F6] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Creator Studio</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-4">
            Sign in to Access Your Creator Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8">
            Your studio is your private command center to showcase verifiable AI production workflows, configure commercial rights, and receive direct brand campaign briefs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('login', 'creator')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5B46F6] text-white text-sm font-semibold hover:bg-[#4a36e2] transition shadow-md shadow-[#5B46F6]/20 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Creator</span>
            </button>
            <button
              onClick={() => openAuthModal('register', 'creator')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Create Creator Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'brand') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-14 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6">
            <Layers className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Brand Account Active</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-4">
            Creator Studio is Reserved for Creators
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8">
            You are currently signed in as <span className="font-semibold text-slate-900">{user.display_name}</span> with a Brand account. The Creator Studio is reserved for creators and directors to publish workflows. Head over to the Brand Workspace Hub to post briefs, review matches, and manage campaigns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/brand/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5B46F6] text-white text-sm font-semibold hover:bg-[#4a36e2] transition shadow-md shadow-[#5B46F6]/20 flex items-center justify-center gap-2"
            >
              <span>Go to Brand Workspace Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                logout();
                openAuthModal('login', 'creator');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Switch to Creator Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCreator) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-[#5B46F6] flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Initialize Your Creator Profile
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-8">
            Set up your UNFRAME profile to start documenting your AI tools, commercial rights, and production workflows.
          </p>
          <button
            onClick={async () => {
              setIsSavingProfile(true);
              try {
                const created = await api.createCreator({
                  display_name: user?.display_name || 'AI Creator',
                  title: 'Generative AI Director & Visualist',
                  bio: 'Specializing in next-generation AI video generation, prompt engineering, and cinematic grade.',
                  location: 'Remote',
                  rate_min: 1500,
                  rate_max: 5000,
                  availability_status: 'Available',
                  specializations: ['AI Filmmaking'],
                  skills: ['Prompt Engineering', 'Compositing', 'Camera Motion'],
                  tools: ['Runway Gen-3', 'Midjourney v6'],
                });
                setSelectedCreator(created);
                setStatusMessage({ type: 'success', text: 'Creator profile initialized successfully!' });
              } catch (err: any) {
                setStatusMessage({ type: 'error', text: err?.message || 'Failed to initialize profile.' });
              } finally {
                setIsSavingProfile(false);
              }
            }}
            disabled={isSavingProfile}
            className="px-6 py-3 rounded-xl bg-[#5B46F6] text-white text-sm font-semibold hover:bg-[#4a36e2] transition shadow-md shadow-[#5B46F6]/20"
          >
            {isSavingProfile ? 'Initializing...' : 'Initialize Studio Profile'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-[#5B46F6] text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Creator Studio Workspace</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Creator Profile & Production Workflows
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Document your tools, commercial licensing capabilities, and step-by-step production workflow recipes for deterministic brand matching.
          </p>
        </div>

        {/* Authenticated Creator Profile Identity Badge */}
        <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-[#5B46F6] font-bold text-sm overflow-hidden flex-shrink-0">
            {selectedCreator.avatar_url ? (
              <img src={selectedCreator.avatar_url} alt={selectedCreator.display_name} className="w-full h-full object-cover" />
            ) : (
              selectedCreator.display_name.charAt(0)
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight">{selectedCreator.display_name}</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Authenticated Studio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2 text-xs font-medium">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs opacity-60 hover:opacity-100 font-bold">×</button>
        </div>
      )}

      {selectedCreator && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Profile Settings Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img
                src={selectedCreator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={selectedCreator.display_name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 ring-2 ring-violet-100"
              />
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">
                  {selectedCreator.display_name}
                </h3>
                <span className="text-[11px] text-[#5B46F6] font-medium">
                  {selectedCreator.location || 'Remote'}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Display Name</label>
                <input
                  type="text"
                  value={selectedCreator.display_name}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, display_name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Headline / Title</label>
                <input
                  type="text"
                  value={selectedCreator.title}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, title: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={selectedCreator.location || ''}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, location: e.target.value })
                  }
                  placeholder="e.g. London / UTC+1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Bio & Positioning</label>
                <textarea
                  rows={3}
                  value={selectedCreator.bio}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, bio: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Min Rate ($ USD)</label>
                  <input
                    type="number"
                    value={selectedCreator.rate_min || ''}
                    onChange={(e) =>
                      setSelectedCreator({ ...selectedCreator, rate_min: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Max Rate ($ USD)</label>
                  <input
                    type="number"
                    value={selectedCreator.rate_max || ''}
                    onChange={(e) =>
                      setSelectedCreator({ ...selectedCreator, rate_max: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Availability Status</label>
                <select
                  value={selectedCreator.availability_status}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, availability_status: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                >
                  <option value="Available">Available for campaigns</option>
                  <option value="Busy">Busy (Limited capacity)</option>
                  <option value="Booked">Booked (No new briefs)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2.5 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white font-semibold transition-all shadow-glow-violet-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Right Column: Add New Portfolio Project with Production Workflow */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#5B46F6]" />
                  Add New Portfolio Project & Production Workflow
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Document ordered production steps, tools, and evidence. Stored metadata is indexed by the matching engine.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Apex Hypercar Reveal Spec Commercial"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Narrative, visual style, key challenges solved..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6] resize-none"
                />
              </div>

              {/* Asset Upload & URL Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-[#5B46F6]" />
                    Asset Upload (Images & Video Specs)
                  </span>
                  <span className="text-[10px] text-slate-400">Max 50MB</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#5B46F6] text-slate-700 font-medium flex items-center gap-2 shadow-sm transition-all text-xs"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5B46F6]" /> : <UploadCloud className="w-3.5 h-3.5 text-[#5B46F6]" />}
                    <span>{isUploading ? 'Uploading...' : 'Choose File to Upload'}</span>
                  </button>

                  <span className="text-slate-400 text-xs">or paste URL:</span>
                  <input
                    type="url"
                    value={newProject.media_url}
                    onChange={(e) => setNewProject({ ...newProject, media_url: e.target.value })}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#5B46F6]"
                  />
                </div>

                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#5B46F6] h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{uploadProgress}% uploaded</span>
                  </div>
                )}

                {uploadError && (
                  <p className="text-rose-600 text-[11px] font-medium">{uploadError}</p>
                )}

                {newProject.media_url && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="truncate">Attached asset: {newProject.media_url}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Content Type</label>
                  <select
                    value={newProject.content_type}
                    onChange={(e) => setNewProject({ ...newProject, content_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                  >
                    <option value="video">AI Video</option>
                    <option value="cgi">Product CGI</option>
                    <option value="animation">Animation</option>
                    <option value="motion">Motion Design</option>
                    <option value="image">Still Image</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Aspect Ratio</label>
                  <select
                    value={newProject.aspect_ratios[0]}
                    onChange={(e) => setNewProject({ ...newProject, aspect_ratios: [e.target.value] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Portrait)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Commercial Rights</label>
                  <select
                    value={newProject.commercial_use_status}
                    onChange={(e) =>
                      setNewProject({ ...newProject, commercial_use_status: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                  >
                    <option value="Commercial Rights Granted">Commercial Rights Granted</option>
                    <option value="Requires Confirmation">Requires Confirmation</option>
                    <option value="Editorial Only">Editorial Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Tools Used (comma separated)</label>
                <input
                  type="text"
                  value={newProject.tools_used}
                  onChange={(e) => setNewProject({ ...newProject, tools_used: e.target.value })}
                  placeholder="Runway Gen-3, Midjourney v6, Topaz Video AI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#5B46F6]"
                />
              </div>

              {/* Production Workflow Steps Builder */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#5B46F6]" />
                      Production Workflow Steps ({newProject.workflow_steps.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Reorder with arrows, edit tools, and add descriptions.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddWorkflowStep}
                    className="text-xs text-[#5B46F6] hover:text-[#4F46E5] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {newProject.workflow_steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative group transition-all hover:border-[#5B46F6]/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#5B46F6] font-mono text-[11px] bg-purple-50 px-2 py-0.5 rounded-md">
                            Step {st.step}
                          </span>
                          {/* Reordering buttons */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20"
                              title="Move Step Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, 'down')}
                              disabled={idx === newProject.workflow_steps.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20"
                              title="Move Step Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={st.name}
                          onChange={(e) => {
                            const updated = [...newProject.workflow_steps];
                            updated[idx].name = e.target.value;
                            setNewProject({ ...newProject, workflow_steps: updated });
                          }}
                          placeholder="Step Name (e.g. Concept)"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#5B46F6]"
                        />

                        <input
                          type="text"
                          value={st.tool}
                          onChange={(e) => {
                            const updated = [...newProject.workflow_steps];
                            updated[idx].tool = e.target.value;
                            setNewProject({ ...newProject, workflow_steps: updated });
                          }}
                          placeholder="Tool / Model"
                          className="w-32 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#5B46F6] font-medium font-mono focus:outline-none focus:border-[#5B46F6]"
                        />

                        {newProject.workflow_steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWorkflowStep(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Delete Step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={st.description}
                        onChange={(e) => {
                          const updated = [...newProject.workflow_steps];
                          updated[idx].description = e.target.value;
                          setNewProject({ ...newProject, workflow_steps: updated });
                        }}
                        placeholder="Detailed execution steps and parameters..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#5B46F6]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingProject || !newProject.title.trim()}
                className="w-full py-3 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white font-semibold shadow-glow-violet-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isAddingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Publish Project to Portfolio</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Existing Portfolio Projects & Workflows Showcase */}
      {selectedCreator && selectedCreator.portfolio_projects && selectedCreator.portfolio_projects.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
              <Film className="w-6 h-6 text-[#5B46F6]" />
              Published Projects & Production Workflows ({selectedCreator.portfolio_projects.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active projects shown to brands with verified steps, tools, and aspect ratio formats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCreator.portfolio_projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-900">
                  <img
                    src={project.media_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
                      {project.content_type} • {project.aspect_ratios?.join(', ') || '16:9'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">{project.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{project.description}</p>
                  </div>

                  {/* Workflow steps timeline */}
                  {project.workflow_steps && project.workflow_steps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Production Workflow ({project.workflow_steps.length} steps)
                      </span>
                      <div className="space-y-1.5">
                        {project.workflow_steps.map((st, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="w-4 h-4 rounded-full bg-violet-100 text-[#5B46F6] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {st.step || i + 1}
                            </span>
                            <span className="font-semibold truncate max-w-[140px]">{st.name}</span>
                            <span className="text-slate-400 font-mono text-[11px] truncate">({st.tool})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      {project.commercial_use_status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
