import React, { useState } from 'react';
import { Submission } from '../../types';
import { Badge } from '../ui/Badge';
import { MessageSquare, CheckCircle2, RotateCcw, Send, Film, Clock } from 'lucide-react';

interface SubmissionVersionCardProps {
  submission: Submission;
  isLatest: boolean;
  onProvideFeedback: (submissionId: string, feedback: string, status: string) => Promise<void>;
}

export const SubmissionVersionCard: React.FC<SubmissionVersionCardProps> = ({
  submission,
  isLatest,
  onProvideFeedback,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);

  const handleAction = async (status: 'approved' | 'revision_requested') => {
    if (!feedbackText.trim() && status === 'revision_requested') {
      alert('Please provide revision notes for the creator.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onProvideFeedback(
        submission.id,
        feedbackText.trim() || (status === 'approved' ? 'Approved without further changes.' : 'Revisions requested.'),
        status
      );
      setShowFeedbackBox(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-xs font-bold font-mono text-electric-400">
            v{submission.version_number}
          </span>
          <h4 className="font-display font-semibold text-white text-sm">
            Deliverable Version {submission.version_number}
          </h4>
          {isLatest && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-electric-950 border border-electric-700 text-electric-300">
              Latest
            </span>
          )}
        </div>

        <Badge
          variant={
            submission.status === 'approved' ? 'success' :
            submission.status === 'revision_requested' ? 'warning' : 'pending'
          }
          size="sm"
        >
          {submission.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Media Preview */}
      <div className="relative rounded-xl overflow-hidden aspect-video bg-charcoal-950 border border-charcoal-800">
        <img
          src={submission.media_url}
          alt={`Submission v${submission.version_number}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Creator Notes */}
      {submission.creator_note && (
        <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
            Creator Production Notes
          </span>
          <p className="text-slate-300">{submission.creator_note}</p>
        </div>
      )}

      {/* Existing Brand Feedback */}
      {submission.brand_feedback && (
        <div className="p-3 rounded-xl bg-charcoal-950 border border-electric-900/60 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-electric-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Brand Feedback Recorded
          </span>
          <p className="text-slate-200">{submission.brand_feedback}</p>
        </div>
      )}

      {/* Feedback & Decision Controls if pending or latest */}
      {isLatest && submission.status === 'pending' && (
        <div className="pt-2 border-t border-charcoal-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Review & Sign-Off</span>
            <button
              onClick={() => setShowFeedbackBox(!showFeedbackBox)}
              className="text-xs text-electric-400 hover:text-electric-300 font-medium"
            >
              {showFeedbackBox ? 'Cancel Feedback' : 'Add Revision Notes'}
            </button>
          </div>

          {showFeedbackBox && (
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Specify requested changes (e.g. adjust camera speed in 0:10-0:15, match brand color tone)..."
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-500 resize-none"
            />
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleAction('approved')}
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-subtle disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Version</span>
            </button>

            <button
              onClick={() => {
                if (!showFeedbackBox) {
                  setShowFeedbackBox(true);
                } else {
                  handleAction('revision_requested');
                }
              }}
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-charcoal-700 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Revision</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
