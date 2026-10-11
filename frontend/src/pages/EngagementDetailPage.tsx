import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Engagement, Submission, Message } from '../types';
import { api } from '../services/api';
import { EngagementTimeline } from '../components/engagements/EngagementTimeline';
import { SubmissionVersionCard } from '../components/engagements/SubmissionVersionCard';
import { CommercialTermsSummary } from '../components/engagements/CommercialTermsSummary';
import { ReviewModal } from '../components/engagements/ReviewModal';
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
  ShieldCheck,
  Star,
  MessageSquare,
  Paperclip
} from 'lucide-react';

export const EngagementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);

  // New Submission Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newSubmissionMedia, setNewSubmissionMedia] = useState(
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'
  );
  const [newSubmissionNotes, setNewSubmissionNotes] = useState(
    'Attached draft render v2 with revised color grading and speed ramps.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Live Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await api.getEngagements();
      setEngagements(all);
      if (all.length > 0) {
        const found = id ? all.find((e) => e.id === id) || all[0] : all[0];
        setCurrentEngagement(found);
        if (found) {
          const msgs = await api.getEngagementMessages(found.id);
          setMessages(msgs);
        }
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

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentEngagement || isSendingChat) return;

    setIsSendingChat(true);
    try {
      const newMsg = await api.sendMessage({
        engagement_id: currentEngagement.id,
        sender_id: 'brand_demo_user',
        sender_name: 'Acme Brand Lead',
        sender_role: 'brand',
        recipient_id: currentEngagement.creator_id,
        recipient_name: currentEngagement.creator?.display_name || 'Creator',
        content: chatInput.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setChatInput('');
    } catch (err) {
      console.error('Failed to send project message:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

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
    if (!currentEngagement) return;
    setIsSubmitting(true);
    try {
      let mediaUrl = newSubmissionMedia.trim();
      if (uploadedFile) {
        setIsUploadingFile(true);
        const uploaded = await api.uploadFile(uploadedFile, 'creator', 'video');
        mediaUrl = uploaded.url;
        setIsUploadingFile(false);
      }
      if (!mediaUrl) return;

      await api.addSubmission(currentEngagement.id, mediaUrl, newSubmissionNotes);
      setUploadModalOpen(false);
      setUploadedFile(null);
      const refreshed = await api.getEngagement(currentEngagement.id);
      setCurrentEngagement(refreshed);
    } catch (err) {
      console.error(err);
      alert('Failed to submit revision.');
    } finally {
      setIsSubmitting(false);
      setIsUploadingFile(false);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[#5B46F6] text-xs font-semibold mb-2">
            <FolderCheck className="w-3.5 h-3.5 text-[#5B46F6]" />
            <span>Campaign Delivery & Revision Lifecycle</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
            Engagement & Delivery Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Track iteration versions, review feedback loops, approve deliverables, and inspect recorded commercial licensing rights.
          </p>
        </div>

        {/* Engagement switcher if multiple exist */}
        {engagements.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Campaign:</span>
            <select
              value={currentEngagement?.id}
              onChange={(e) => {
                const found = engagements.find((eng) => eng.id === e.target.value);
                if (found) {
                  setCurrentEngagement(found);
                  navigate(`/engagements/${found.id}`);
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5B46F6]"
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
            <div key={i} className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : currentEngagement ? (
        <div className="space-y-8">
          
          {/* Progress Timeline */}
          <EngagementTimeline currentStatus={currentEngagement.status} />

          {/* Quick Info & Action Strip */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentEngagement.creator?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentEngagement.creator?.display_name}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200 ring-2 ring-[#5B46F6]/15 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    {currentEngagement.creator?.display_name}
                  </h3>
                  <span className="text-xs text-slate-500">• {currentEngagement.creator?.title}</span>
                </div>
                <h4 className="text-xs text-[#5B46F6] font-medium mt-0.5">
                  Campaign: {currentEngagement.brief?.title || 'Creative Campaign'}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Creator submit deliverable action */}
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-[#5B46F6]" />
                <span>Submit Deliverable (v{(currentEngagement.submissions?.length || 0) + 1})</span>
              </button>

              {/* Review Creator Action */}
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 flex items-center gap-1.5 transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Review Creator</span>
              </button>

              {/* Status progression shortcuts */}
              {currentEngagement.status === 'approved' && (
                <button
                  onClick={() => handleTransitionStatus('delivered')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
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
              <h3 className="font-display font-bold text-lg text-slate-900">
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
              <div className="p-10 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <p className="text-xs text-slate-500">
                  No deliverables submitted yet. The creator has been invited and can upload Version 1 above.
                </p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm"
                >
                  Submit Version 1 Draft
                </button>
              </div>
            )}
          </div>

          {/* Live Project Chat Room */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#5B46F6]" />
                <h3 className="font-display font-bold text-slate-900 text-base">
                  Project Discussion & Revisions Room
                </h3>
              </div>
              <span className="text-xs text-slate-500">Live Brand ↔ Creator Dialogue</span>
            </div>

            {/* Messages List */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No messages yet. Send a note to align on creative direction.
                </div>
              ) : (
                messages.map((m) => {
                  const isBrand = m.sender_role === 'brand';
                  return (
                    <div key={m.id} className={`flex flex-col ${isBrand ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700">{m.sender_name}</span>
                        <span>•</span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isBrand
                            ? 'bg-[#5B46F6] text-white rounded-br-none shadow-sm'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a revision note, feedback, or question..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#5B46F6] rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSendingChat}
                className="px-4 py-2.5 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-sm"
              >
                {isSendingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Recorded Commercial Terms Summary Card */}
          <CommercialTermsSummary terms={currentEngagement.agreed_terms || {}} />

        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <FolderCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-900 text-base">
              No active campaign engagements found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Start by building a creative brief, matching with creators, and sending an invitation.
            </p>
          </div>
          <Link
            to="/brief-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all"
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
            <label className="text-slate-700 block mb-1 font-medium">Upload File (MP4, PNG, JPG, JSON)</label>
            <div className="p-4 border-2 border-dashed border-slate-300 hover:border-[#5B46F6] rounded-xl bg-slate-50/50 text-center cursor-pointer transition-all">
              <input
                type="file"
                id="deliverable-file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setUploadedFile(f);
                }}
              />
              <label htmlFor="deliverable-file" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-[#5B46F6] mx-auto mb-1.5" />
                <span className="text-slate-800 font-semibold block">
                  {uploadedFile ? uploadedFile.name : 'Click to select render output from disk'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB selected` : 'Supports MP4, MOV, WebM, PNG, LoRA weights, ComfyUI JSON'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">Or Provide External Media URL</label>
            <input
              type="url"
              value={newSubmissionMedia}
              onChange={(e) => setNewSubmissionMedia(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#5B46F6]"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">Creator Production Notes</label>
            <textarea
              rows={3}
              value={newSubmissionNotes}
              onChange={(e) => setNewSubmissionNotes(e.target.value)}
              placeholder="Explain changes made, model settings used, or questions for the brand..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5B46F6] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFile || (!newSubmissionMedia.trim() && !uploadedFile)}
              className="px-5 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting || isUploadingFile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>Upload Version</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      {currentEngagement && currentEngagement.creator && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          creatorId={currentEngagement.creator_id}
          creatorName={currentEngagement.creator.display_name}
          engagementId={currentEngagement.id}
          projectTitle={currentEngagement.brief?.title}
          onReviewSubmitted={() => {
            loadData();
          }}
        />
      )}

    </div>
  );
};
