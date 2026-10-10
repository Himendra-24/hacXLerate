import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CreatorProfile, PortfolioProject, Review } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { WorkflowTimeline } from '../components/creators/WorkflowTimeline';
import { DirectMessageModal } from '../components/messaging/DirectMessageModal';
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
  MessageSquare
} from 'lucide-react';

export const CreatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Creator Directory</span>
        </Link>
      </div>

      {/* Creator Profile Header Card */}
      <div className="rounded-3xl bg-charcoal-900 border border-charcoal-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          
          <div className="flex items-start gap-5">
            <img
              src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={creator.display_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-charcoal-700 ring-4 ring-electric-600/20 shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl text-white">
                  {creator.display_name}
                </h1>
                {isVerified ? (
                  <Badge variant="verified" size="md">
                    Verified Capabilities
                  </Badge>
                ) : (
                  <Badge variant="self-reported" size="md">
                    Self-Reported
                  </Badge>
                )}
                {isDemo && (
                  <Badge variant="demo" size="md">
                    Demo Sandbox
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm text-electric-300 font-medium">
                {creator.title}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-charcoal-950/70 px-2.5 py-1 rounded-lg border border-charcoal-800">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{creator.rating_avg ? creator.rating_avg.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-500 font-normal">({reviews.length || creator.reviews_count || 1} reviews)</span>
                </div>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {creator.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  Rate: <strong className="text-slate-200">${creator.rate_min || 1500} – ${creator.rate_max || 4500}</strong>
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    creator.availability_status === 'Available'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                      : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-charcoal-800 border border-charcoal-700 text-slate-200 hover:text-white hover:bg-charcoal-750 transition-all flex items-center gap-1.5 shadow-subtle"
            >
              <MessageSquare className="w-3.5 h-3.5 text-electric-400" />
              <span>Direct Message</span>
            </button>

            <button
              onClick={handleToggleShortlist}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isShortlisted
                  ? 'bg-electric-600 border-electric-500 text-white shadow-glow-violet'
                  : 'bg-charcoal-800 border-charcoal-700 text-slate-300 hover:text-white hover:bg-charcoal-750'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
              <span>{isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}</span>
            </button>

            <button
              onClick={() => navigate('/brief-builder')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-electric-700 to-electric-600 hover:from-electric-600 hover:to-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invite with Brief</span>
            </button>
          </div>

        </div>

        {/* Bio description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
          {creator.bio}
        </p>

        {/* Specializations & Skills */}
        <div className="pt-4 border-t border-charcoal-800 flex flex-col sm:flex-row gap-4 items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Demonstrated Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {creator.skills?.map((sk, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-charcoal-950 border border-charcoal-800 text-slate-300"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Verified Model & Tool Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {creator.tools?.map((tool, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-electric-950/60 border border-electric-800/60 text-electric-300 font-mono"
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
            <h2 className="font-display font-bold text-xl text-white">
              Portfolio Projects & Workflow Recipes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
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
                  ? 'bg-electric-600 border-electric-500 text-white shadow-glow-violet'
                  : 'bg-charcoal-900 border-charcoal-800 text-slate-400 hover:text-white hover:bg-charcoal-850'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{proj.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Project Deep-Dive Card */}
        {selectedProject && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 p-6 sm:p-8">
            
            {/* Left Column: Media & Specs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-charcoal-950 border border-charcoal-800 group shadow-elevated">
                <img
                  src={selectedProject.media_url}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="verified" size="sm">
                    {selectedProject.evidence_status}
                  </Badge>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-charcoal-900/90 text-white border border-charcoal-700 font-mono">
                    {selectedProject.aspect_ratios?.join(', ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-bold text-xl text-white">
                  {selectedProject.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Models & Versions Box */}
              {selectedProject.model_versions && Object.keys(selectedProject.model_versions).length > 0 && (
                <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Exact Neural Models & Tool Versions
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                    {Object.entries(selectedProject.model_versions).map(([model, ver]) => (
                      <div key={model} className="p-2 rounded bg-charcoal-900 border border-charcoal-850">
                        <span className="text-[10px] text-slate-500 block">{model}</span>
                        <strong className="text-electric-300 text-[11px]">{ver}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt summary if available */}
              {selectedProject.prompt_summary && (
                <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Key Prompt Architecture
                  </span>
                  <p className="text-xs text-slate-300 font-mono italic">
                    "{selectedProject.prompt_summary}"
                  </p>
                </div>
              )}

              {/* Commercial Rights Status Tag */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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

      {/* Verification Records Audit Table */}
      <div className="rounded-3xl bg-charcoal-900 border border-charcoal-800 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verifiable Evidence Audit Trail
            </h3>
            <p className="text-xs text-slate-400">
              Documented tool usage licenses, intermediate project archives, and peer benchmarks.
            </p>
          </div>
        </div>

        <div className="divide-y divide-charcoal-800 text-xs">
          {creator.verification_records?.map((record) => (
            <div key={record.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-white uppercase text-[11px] font-mono mr-2">
                  [{record.evidence_type.replace('_', ' ')}]
                </span>
                <span className="text-slate-300">{record.evidence_reference || record.notes}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={record.status === 'Verified' ? 'verified' : 'demo'} size="sm">
                  {record.status}
                </Badge>
                {record.demo_only && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    Demo Simulated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Client Reviews & Ratings Section */}
      <div className="rounded-3xl bg-charcoal-900 border border-charcoal-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span>Verified Client Reviews & Testimonials ({reviews.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Real brand feedback, delivery speed ratings, and workflow transparency scores.
            </p>
          </div>
          <button
            onClick={() => setChatModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquire Directly</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No reviews recorded yet for this creator.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.brand_avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80'}
                      alt={r.brand_name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-charcoal-700"
                    />
                    <div>
                      <span className="font-semibold text-white text-xs block">{r.brand_name}</span>
                      <span className="text-[10px] text-electric-400">{r.project_title || 'Commercial Project'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{r.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{r.comment}"
                </p>

                <div className="pt-2 border-t border-charcoal-900 flex items-center justify-between text-[10px] text-slate-500">
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
