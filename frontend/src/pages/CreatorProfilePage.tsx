import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CreatorProfile, PortfolioProject, Review } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { WorkflowTimeline } from '../components/creators/WorkflowTimeline';
import { DirectMessageModal } from '../components/messaging/DirectMessageModal';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Bookmark,
  Send,
  ArrowLeft,
  DollarSign,
  MapPin,
  Sparkles,
  Layers,
  Cpu,
  FileCheck,
  CheckCircle2,
  Calendar,
  Star,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Key,
  Globe,
  Wrench,
  AlertCircle,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const CreatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verification & Trust Hub State
  const [emailOtp, setEmailOtp] = useState('');
  const [emailSentInfo, setEmailSentInfo] = useState<{ sent: boolean; otp?: string; msg?: string } | null>(null);
  const [platformUrl, setPlatformUrl] = useState('');
  const [toolName, setToolName] = useState('Runway Gen-3');
  const [toolEvidenceUrl, setToolEvidenceUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTrustTab, setActiveTrustTab] = useState<'overview' | 'email' | 'ownership' | 'tool' | 'admin'>('overview');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getCreator(id)
      .then((data) => {
        setCreator(data);
        if (data.portfolio_projects?.length > 0) {
          setSelectedProject(data.portfolio_projects[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getCreatorReviews(id).then(setReviews).catch(console.error);

    api.getShortlist().then((items) => {
      setIsShortlisted(items.some((i) => i.creator_id === id));
    });
  }, [id]);

  const copyOwnershipCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRequestEmailOtp = async () => {
    if (!creator) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await api.requestEmailVerification(creator.id);
      setEmailSentInfo({ sent: true, otp: res.demo_otp, msg: res.message });
      if (res.demo_otp) setEmailOtp(res.demo_otp);
      setFeedback({ type: 'success', message: 'One-time verification code generated! Auto-filled for quick demo.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to request email verification code' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmEmailOtp = async () => {
    if (!creator || !emailOtp) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const updated = await api.confirmEmailVerification(creator.id, emailOtp);
      setCreator(updated);
      setFeedback({ type: 'success', message: `Email verified successfully! Trust level is now ${updated.trust_level}.` });
      setEmailSentInfo(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to confirm email code' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOwnership = async () => {
    if (!creator || !platformUrl) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await api.verifyOwnership(creator.id, platformUrl);
      const updated = await api.getCreator(creator.id);
      setCreator(updated);
      setFeedback({ type: 'success', message: `Account ownership verified! Trust level upgraded to ${res.trust_level}.` });
      setPlatformUrl('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to verify ownership code' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyToolProof = async () => {
    if (!creator || !toolEvidenceUrl) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await api.verifyToolProof(creator.id, toolName, toolEvidenceUrl);
      const updated = await api.getCreator(creator.id);
      setCreator(updated);
      setFeedback({ type: 'success', message: `Tool proof confirmed for ${res.tool_name}! Trust level is ${res.trust_level}.` });
      setToolEvidenceUrl('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to verify tool proof' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminReview = async (decision: 'approve' | 'reject') => {
    if (!creator) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const updated = await api.adminReviewCreator(creator.id, decision, adminNotes);
      setCreator(updated);
      setFeedback({ type: 'success', message: `Admin decision applied: ${decision.toUpperCase()}. Trust level: ${updated.trust_level}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit admin review' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleShortlist = async () => {
    if (!creator) return;
    if (isShortlisted) {
      await api.removeCreatorFromShortlist(creator.id);
      setIsShortlisted(false);
    } else {
      await api.addToShortlist(creator.id);
      setIsShortlisted(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading creator portfolio & verified recipes...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Creator not found</h2>
        <Link to="/discover" className="text-electric-400 hover:underline text-xs">
          Return to Discover
        </Link>
      </div>
    );
  }

  const isDemo = creator.verification_records?.some((v) => v.demo_only);
  const isVerified = creator.verification_records?.some((v) => v.status === 'Verified');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back button */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Creator Directory</span>
        </Link>
      </div>

      {/* Creator Profile Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          
          <div className="flex items-start gap-5">
            <img
              src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={creator.display_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 ring-4 ring-[#5B46F6]/10 shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl text-slate-900">
                  {creator.display_name}
                </h1>
                {creator.trust_level === 'Established' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Established Trust
                  </span>
                ) : creator.trust_level === 'Evidence-backed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-300 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                    Evidence-backed Trust
                  </span>
                ) : creator.trust_level === 'Basic' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-300 shadow-sm">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    Basic Trust (Email Verified)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 shadow-sm">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Pending Verification
                  </span>
                )}
                {isDemo && (
                  <Badge variant="demo" size="md">
                    Demo Sandbox
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#5B46F6] font-medium">
                {creator.title}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{creator.rating_avg ? creator.rating_avg.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-500 font-normal">({reviews.length || creator.reviews_count || 1} reviews)</span>
                </div>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {creator.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Rate: <strong className="text-slate-800">${creator.rate_min || 1500} – ${creator.rate_max || 4500}</strong>
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    creator.availability_status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {creator.availability_status}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={() => setChatModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#5B46F6]" />
              <span>Direct Message</span>
            </button>

            <button
              onClick={handleToggleShortlist}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isShortlisted
                  ? 'bg-[#5B46F6] border-[#5B46F6] text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
              <span>{isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}</span>
            </button>

            <button
              onClick={() => navigate('/brief-builder')}
              className="px-5 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invite with Brief</span>
            </button>
          </div>

        </div>

        {/* Bio description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          {creator.bio}
        </p>

        {/* Specializations & Skills */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Demonstrated Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {creator.skills?.map((sk, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Verified Model & Tool Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {creator.tools?.map((tool, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-[#5B46F6] font-mono"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Portfolio Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">
              Portfolio Projects & Workflow Recipes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a project to inspect its step-by-step production recipe, ControlNet passes, and commercial licensing status.
            </p>
          </div>
        </div>

        {/* Project Selector Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {creator.portfolio_projects?.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedProject?.id === proj.id
                  ? 'bg-[#5B46F6] border-[#5B46F6] text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{proj.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Project Deep-Dive Card */}
        {selectedProject && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
            
            {/* Left Column: Media & Specs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 group shadow-sm">
                <img
                  src={selectedProject.media_url}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="verified" size="sm">
                    {selectedProject.evidence_status}
                  </Badge>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-white border border-slate-700 font-mono">
                    {selectedProject.aspect_ratios?.join(', ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-bold text-xl text-slate-900">
                  {selectedProject.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Models & Versions Box */}
              {selectedProject.model_versions && Object.keys(selectedProject.model_versions).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Exact Neural Models & Tool Versions
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                    {Object.entries(selectedProject.model_versions).map(([model, ver]) => (
                      <div key={model} className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">{model}</span>
                        <strong className="text-[#5B46F6] text-[11px]">{ver}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt summary if available */}
              {selectedProject.prompt_summary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Key Prompt Architecture
                  </span>
                  <p className="text-xs text-slate-700 font-mono italic">
                    "{selectedProject.prompt_summary}"
                  </p>
                </div>
              )}

              {/* Commercial Rights Status Tag */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Commercial Status:</strong> {selectedProject.commercial_use_status}
                </span>
              </div>

            </div>

            {/* Right Column: Verified Workflow Recipe Timeline */}
            <div className="lg:col-span-5 space-y-4">
              <WorkflowTimeline
                steps={selectedProject.workflow_steps}
                evidenceStatus={selectedProject.evidence_status}
              />
            </div>

          </div>
        )}
      </div>

      {/* Multi-Layer Creator Trust & Verification Hub */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-50 text-[#5B46F6] border border-violet-200">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Creator Trust & Verification Hub
                </h3>
                <p className="text-xs text-slate-500">
                  Multi-layered proof of identity: Email verification, external bio ownership, tool proof, and editorial review.
                </p>
              </div>
            </div>
          </div>

          {/* Current Trust Level & Ownership Code Chip */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Ownership Code:</span>
              <strong className="font-mono text-[#5B46F6]">{creator.ownership_code || 'unframe-4821'}</strong>
              <button
                onClick={() => copyOwnershipCode(creator.ownership_code || 'unframe-4821')}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                title="Copy ownership code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-xs font-bold text-[#5B46F6]">
              Level: {creator.trust_level || 'Pending'}
            </div>
          </div>
        </div>

        {/* Trust Progression Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-3 rounded-2xl border transition-all ${
            creator.trust_level === 'Pending' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/30' : 'bg-slate-50 border-slate-200 opacity-80'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tier 1</span>
            <strong className="text-slate-800 block mt-0.5">Pending</strong>
            <span className="text-[11px] text-slate-500">Fresh signup</span>
          </div>

          <div className={`p-3 rounded-2xl border transition-all ${
            creator.trust_level === 'Basic' ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-300/30' : creator.email_verified ? 'bg-sky-50/40 border-sky-200' : 'bg-slate-50 border-slate-200 opacity-70'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tier 2</span>
            <strong className="text-slate-800 block mt-0.5">Basic</strong>
            <span className="text-[11px] text-slate-500">Email OTP verified</span>
          </div>

          <div className={`p-3 rounded-2xl border transition-all ${
            creator.trust_level === 'Evidence-backed' ? 'bg-violet-50 border-violet-300 ring-2 ring-violet-300/30' : (creator.verified_profiles?.length || creator.verified_tools?.length) ? 'bg-violet-50/40 border-violet-200' : 'bg-slate-50 border-slate-200 opacity-70'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tier 3</span>
            <strong className="text-slate-800 block mt-0.5">Evidence-backed</strong>
            <span className="text-[11px] text-slate-500">Bio code or Tool scan</span>
          </div>

          <div className={`p-3 rounded-2xl border transition-all ${
            creator.trust_level === 'Established' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300/30' : 'bg-slate-50 border-slate-200 opacity-70'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tier 4</span>
            <strong className="text-slate-800 block mt-0.5">Established</strong>
            <span className="text-[11px] text-slate-500">Multi-proof + Approved</span>
          </div>
        </div>

        {/* Verification Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTrustTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTrustTab === 'overview' ? 'bg-[#5B46F6] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Status
          </button>
          <button
            onClick={() => setActiveTrustTab('email')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTrustTab === 'email' ? 'bg-[#5B46F6] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>1. Email OTP</span>
            {creator.email_verified && <Check className="w-3 h-3 text-emerald-500" />}
          </button>
          <button
            onClick={() => setActiveTrustTab('ownership')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTrustTab === 'ownership' ? 'bg-[#5B46F6] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Bio Ownership Code</span>
            {(creator.verified_profiles?.length || 0) > 0 && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">{creator.verified_profiles?.length}</span>}
          </button>
          <button
            onClick={() => setActiveTrustTab('tool')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTrustTab === 'tool' ? 'bg-[#5B46F6] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>3. Tool Proof</span>
            {(creator.verified_tools?.length || 0) > 0 && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">{creator.verified_tools?.length}</span>}
          </button>
          <button
            onClick={() => setActiveTrustTab('admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTrustTab === 'admin' ? 'bg-[#5B46F6] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Admin Review</span>
            <span className="text-[10px] text-slate-400">(4 C2PA skipped)</span>
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTrustTab === 'overview' && (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5B46F6]" />
                  Layer 1: Email Verification
                </h4>
                <p className="text-slate-500">
                  Blocks automated signups by requiring a one-time verification code.
                </p>
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    creator.email_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {creator.email_verified ? '✓ Verified (One-time code passed)' : 'Pending verification'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#5B46F6]" />
                  Layer 2: Bio Ownership Code
                </h4>
                <p className="text-slate-500">
                  Creator pastes their assigned code (<strong className="text-[#5B46F6]">{creator.ownership_code || 'unframe-4821'}</strong>) into YouTube/Behance/GitHub bio. We fetch the page and confirm control.
                </p>
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    (creator.verified_profiles?.length || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(creator.verified_profiles?.length || 0) > 0 ? `✓ ${creator.verified_profiles?.length} Account(s) Verified` : 'No accounts verified yet'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#5B46F6]" />
                  Layer 3: Tool Proof
                </h4>
                <p className="text-slate-500">
                  We fetch the evidence URL (prompt gallery, Civitai model, GitHub repo) and verify the declared AI tool name in the public text.
                </p>
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    (creator.verified_tools?.length || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(creator.verified_tools?.length || 0) > 0 ? `✓ ${creator.verified_tools?.length} Tool(s) Verified` : 'No tools scanned yet'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5B46F6]" />
                  Layer 5: Manual Editorial Review
                </h4>
                <p className="text-slate-500">
                  New creators start as Pending. An administrator reviews sample outputs, parameters, and portfolio provenance before awarding Established status.
                </p>
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    creator.verification_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {creator.verification_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Email Verification */}
        {activeTrustTab === 'email' && (
          <div className="space-y-4 max-w-xl">
            <p className="text-xs text-slate-600">
              One-time verification code protects the marketplace from fake signups and impersonation.
            </p>

            {creator.email_verified ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-sm">Email Address Verified</strong>
                  <span className="text-xs text-emerald-700">Account ownership is cryptographically confirmed.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 font-medium">Step 1: Request One-Time Code</span>
                  <button
                    onClick={handleRequestEmailOtp}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-[#5B46F6] text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Generating...' : 'Send Verification OTP'}
                  </button>
                </div>

                {emailSentInfo && (
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-800 flex items-center justify-between">
                    <span>Code generated: <strong className="font-mono text-sm">{emailSentInfo.otp}</strong></span>
                    <button
                      onClick={() => setEmailOtp(emailSentInfo.otp || '')}
                      className="text-[#5B46F6] font-bold underline"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-xs font-semibold text-slate-700 block">Step 2: Enter 6-digit Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 481920"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs flex-1 font-mono tracking-widest focus:ring-2 focus:ring-[#5B46F6] focus:outline-none"
                    />
                    <button
                      onClick={handleConfirmEmailOtp}
                      disabled={actionLoading || !emailOtp}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      Verify & Upgrade
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Bio Ownership Code */}
        {activeTrustTab === 'ownership' && (
          <div className="space-y-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200 space-y-2">
              <strong className="text-xs text-violet-900 block font-bold">How Bio Verification Works:</strong>
              <ol className="text-xs text-violet-800 list-decimal list-inside space-y-1">
                <li>Copy your unique code: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-[#5B46F6] border border-violet-200">{creator.ownership_code || 'unframe-4821'}</code></li>
                <li>Paste it into the bio of your public YouTube channel, Behance, GitHub, or ArtStation.</li>
                <li>Submit the public profile URL below. Our server fetches the page and confirms control.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Public Profile URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://github.com/your-username or Behance URL"
                  value={platformUrl}
                  onChange={(e) => setPlatformUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs flex-1 focus:ring-2 focus:ring-[#5B46F6] focus:outline-none"
                />
                <button
                  onClick={handleVerifyOwnership}
                  disabled={actionLoading || !platformUrl}
                  className="px-4 py-2 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Scanning...' : 'Verify Ownership'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Demo tip: Try submitting <code>https://mock-github.com/profile?bio_code={creator.ownership_code || 'unframe-4821'}</code> for immediate simulation.
              </p>
            </div>

            {/* List of Verified Profiles */}
            {(creator.verified_profiles?.length || 0) > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-800 block">Verified External Accounts:</span>
                <div className="space-y-1.5">
                  {creator.verified_profiles?.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-slate-700 truncate">{p.url}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">Matched</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Tool Proof */}
        {activeTrustTab === 'tool' && (
          <div className="space-y-4 max-w-xl">
            <p className="text-xs text-slate-600">
              Prove hands-on generative skill. Submit a public model checkpoint, prompt breakdown, or workflow repo. We scan the page to verify tool evidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Declared Tool</label>
                <select
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#5B46F6] focus:outline-none"
                >
                  <option value="Runway Gen-3">Runway Gen-3</option>
                  <option value="Midjourney v6">Midjourney v6</option>
                  <option value="ComfyUI">ComfyUI</option>
                  <option value="Kling 1.5">Kling 1.5</option>
                  <option value="Topaz Video AI 4">Topaz Video AI</option>
                  <option value="ElevenLabs">ElevenLabs</option>
                  <option value="Stable Diffusion">Stable Diffusion</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Evidence Page URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://civitai.com/... or GitHub link"
                    value={toolEvidenceUrl}
                    onChange={(e) => setToolEvidenceUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#5B46F6] focus:outline-none"
                  />
                  <button
                    onClick={handleVerifyToolProof}
                    disabled={actionLoading || !toolEvidenceUrl}
                    className="px-4 py-2 rounded-xl bg-[#5B46F6] text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {actionLoading ? 'Scanning...' : 'Scan Tool'}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Demo tip: Try submitting <code>https://mock-evidence.org/recipe?tool=runway+gen-3</code> for immediate simulation.
            </p>

            {/* List of Verified Tools */}
            {(creator.verified_tools?.length || 0) > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-800 block">Verified Tools Evidence:</span>
                <div className="space-y-1.5">
                  {creator.verified_tools?.map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-[#5B46F6] shrink-0" />
                        <strong className="text-slate-900">{t.tool}</strong>
                        <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">({t.evidence_url})</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Manual Editorial Review */}
        {activeTrustTab === 'admin' && (
          <div className="space-y-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Current Editorial Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  creator.verification_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {creator.verification_status || 'Pending'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Review Notes / Audit Summary</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified 4K commercial diffusion output and prompt craftsmanship."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#5B46F6] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAdminReview('approve')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve (Award Established)</span>
                </button>
                <button
                  onClick={() => handleAdminReview('reject')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Reject Profile</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Note: Note: C2PA content credentials layer is skipped as fragile per specification.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Records Audit Table */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Verifiable Evidence Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Documented tool usage licenses, intermediate project archives, and peer benchmarks.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-200 text-xs">
          {creator.verification_records?.map((record) => (
            <div key={record.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900 uppercase text-[11px] font-mono mr-2">
                  [{record.evidence_type.replace('_', ' ')}]
                </span>
                <span className="text-slate-600">{record.evidence_reference || record.notes}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={record.status === 'Verified' ? 'verified' : 'demo'} size="sm">
                  {record.status}
                </Badge>
                {record.demo_only && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Demo Simulated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Client Reviews & Ratings Section */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Verified Client Reviews & Testimonials ({reviews.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real brand feedback, delivery speed ratings, and workflow transparency scores.
            </p>
          </div>
          <button
            onClick={() => setChatModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquire Directly</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No reviews recorded yet for this creator.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.brand_avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80'}
                      alt={r.brand_name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block">{r.brand_name}</span>
                      <span className="text-[10px] text-[#5B46F6] font-medium">{r.project_title || 'Commercial Project'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{r.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{r.comment}"
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Speed: {r.delivery_speed_rating.toFixed(1)}★</span>
                  <span>•</span>
                  <span>Transparency: {r.workflow_transparency_rating.toFixed(1)}★</span>
                  <span>•</span>
                  <span>Communication: {r.communication_rating.toFixed(1)}★</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Message Modal */}
      <DirectMessageModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        creator={creator}
      />

    </div>
  );
};
