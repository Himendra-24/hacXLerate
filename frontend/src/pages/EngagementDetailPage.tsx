import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Engagement, Submission } from '../types';
import { api } from '../services/api';
import { EngagementTimeline } from '../components/engagements/EngagementTimeline';
import { SubmissionVersionCard } from '../components/engagements/SubmissionVersionCard';
import { CommercialTermsSummary } from '../components/engagements/CommercialTermsSummary';
import { Modal } from '../components/ui/Modal';
import {
  FolderCheck,
  Plus,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Upload,
  Send,
  Loader2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const EngagementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);

  // New Submission Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newSubmissionMedia, setNewSubmissionMedia] = useState(
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'
  );
  const [newSubmissionNotes, setNewSubmissionNotes] = useState(
    'Attached draft render v2 with revised color grading and speed ramps.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await api.getEngagements();
      setEngagements(all);
      if (all.length > 0) {
        const found = id ? all.find((e) => e.id === id) || all[0] : all[0];
        setCurrentEngagement(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleProvideFeedback = async (submissionId: string, feedback: string, status: string) => {
    if (!currentEngagement) return;
    try {
      await api.provideSubmissionFeedback(submissionId, feedback, status);
      // Reload current engagement
      const refreshed = await api.getEngagement(currentEngagement.id);
      setCurrentEngagement(refreshed);
    } catch (err) {
      console.error(err);
      alert('Failed to record feedback.');
    }
  };

  const handleUploadSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEngagement || !newSubmissionMedia.trim()) return;
    setIsSubmitting(true);
    try {
      await api.addSubmission(currentEngagement.id, newSubmissionMedia, newSubmissionNotes);
      setUploadModalOpen(false);
      const refreshed = await api.getEngagement(currentEngagement.id);
      setCurrentEngagement(refreshed);
    } catch (err) {
      console.error(err);
      alert('Failed to submit revision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransitionStatus = async (newStatus: string) => {
    if (!currentEngagement) return;
    try {
      const updated = await api.updateEngagement(currentEngagement.id, newStatus);
      setCurrentEngagement(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-800 text-slate-300 text-xs mb-2">
            <FolderCheck className="w-3.5 h-3.5 text-electric-400" />
            <span>Campaign Delivery & Revision Lifecycle</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white">
            Engagement & Delivery Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Track iteration versions, review feedback loops, approve deliverables, and inspect recorded commercial licensing rights.
          </p>
        </div>

        {/* Engagement switcher if multiple exist */}
        {engagements.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Campaign:</span>
            <select
              value={currentEngagement?.id}
              onChange={(e) => {
                const found = engagements.find((eng) => eng.id === e.target.value);
                if (found) {
                  setCurrentEngagement(found);
                  navigate(`/engagements/${found.id}`);
                }
              }}
              className="bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-500"
            >
              {engagements.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.creator?.display_name || 'Creator'} — {eng.brief?.title || 'Brief'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-charcoal-900 border border-charcoal-800 animate-pulse" />
          ))}
        </div>
      ) : currentEngagement ? (
        <div className="space-y-8">
          
          {/* Progress Timeline */}
          <EngagementTimeline currentStatus={currentEngagement.status} />

          {/* Quick Info & Action Strip */}
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentEngagement.creator?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentEngagement.creator?.display_name}
                className="w-13 h-13 rounded-2xl object-cover border border-charcoal-700 ring-2 ring-electric-600/20 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-white text-base">
                    {currentEngagement.creator?.display_name}
                  </h3>
                  <span className="text-xs text-slate-400">• {currentEngagement.creator?.title}</span>
                </div>
                <h4 className="text-xs text-electric-300 font-medium mt-0.5">
                  Campaign: {currentEngagement.brief?.title || 'Creative Campaign'}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Creator submit deliverable action */}
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 text-xs font-semibold border border-charcoal-700 flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-electric-400" />
                <span>Submit Deliverable (v{(currentEngagement.submissions?.length || 0) + 1})</span>
              </button>

              {/* Status progression shortcuts */}
              {currentEngagement.status === 'approved' && (
                <button
                  onClick={() => handleTransitionStatus('delivered')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Final Delivered</span>
                </button>
              )}
            </div>
          </div>

          {/* Submissions & Deliverables Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                Deliverable Version Log ({currentEngagement.submissions?.length || 0})
              </h3>
              <span className="text-xs text-slate-500">
                Max included revisions: {currentEngagement.agreed_terms?.revision_limit || 2} rounds
              </span>
            </div>

            {currentEngagement.submissions && currentEngagement.submissions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentEngagement.submissions.map((sub, idx) => (
                  <SubmissionVersionCard
                    key={sub.id}
                    submission={sub}
                    isLatest={idx === currentEngagement.submissions.length - 1}
                    onProvideFeedback={handleProvideFeedback}
                  />
                ))}
              </div>
            ) : (
              <div className="p-10 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
                <p className="text-xs text-slate-400">
                  No deliverables submitted yet. The creator has been invited and can upload Version 1 above.
                </p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold"
                >
                  Submit Version 1 Draft
                </button>
              </div>
            )}
          </div>

          {/* Recorded Commercial Terms Summary Card */}
          <CommercialTermsSummary terms={currentEngagement.agreed_terms || {}} />

        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-800 flex items-center justify-center text-slate-400 mx-auto">
            <FolderCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-white text-base">
              No active campaign engagements found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Start by building a creative brief, matching with creators, and sending an invitation.
            </p>
          </div>
          <Link
            to="/brief-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Campaign Brief</span>
          </Link>
        </div>
      )}

      {/* Upload Submission Version Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Submit Deliverable Version"
        subtitle={`Uploading Version ${(currentEngagement?.submissions?.length || 0) + 1} for brand review`}
      >
        <form onSubmit={handleUploadSubmission} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-medium">Deliverable Media URL *</label>
            <input
              type="url"
              required
              value={newSubmissionMedia}
              onChange={(e) => setNewSubmissionMedia(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Creator Production Notes</label>
            <textarea
              rows={3}
              value={newSubmissionNotes}
              onChange={(e) => setNewSubmissionNotes(e.target.value)}
              placeholder="Explain changes made, model settings used, or questions for the brand..."
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-3 text-white resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newSubmissionMedia.trim()}
              className="px-5 py-2 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-semibold shadow-glow-violet transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Upload Version</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
