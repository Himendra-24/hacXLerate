import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { Star, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  engagementId?: string;
  projectTitle?: string;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  engagementId,
  projectTitle,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5.0);
  const [speedRating, setSpeedRating] = useState(5.0);
  const [transparencyRating, setTransparencyRating] = useState(5.0);
  const [commRating, setCommRating] = useState(5.0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.createReview({
        creator_id: creatorId,
        engagement_id: engagementId,
        brand_name: 'Acme Brand Creative Lead',
        brand_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
        rating,
        delivery_speed_rating: speedRating,
        workflow_transparency_rating: transparencyRating,
        communication_rating: commRating,
        comment: comment.trim(),
        project_title: projectTitle || 'Commercial Delivery',
      });
      setSubmitted(true);
      setTimeout(() => {
        onReviewSubmitted?.();
        onClose();
        setSubmitted(false);
        setComment('');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarSelector = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-300 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
          >
            <Star className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-current' : 'text-slate-600'}`} />
          </button>
        ))}
        <span className="text-xs font-semibold text-amber-400 ml-1.5 w-6">{value.toFixed(1)}</span>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review & Rate — ${creatorName}`}
      subtitle="Leave verified client feedback and workflow transparency rating"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-white text-base">Review Published!</h3>
          <p className="text-xs text-slate-400">
            Your verified review and ratings have been posted to {creatorName}'s public proof profile.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 bg-charcoal-900 rounded-xl border border-charcoal-800 space-y-1">
            <StarSelector value={rating} onChange={setRating} label="Overall Commercial Quality" />
            <StarSelector value={speedRating} onChange={setSpeedRating} label="Turnaround Speed" />
            <StarSelector value={transparencyRating} onChange={setTransparencyRating} label="Workflow Transparency" />
            <StarSelector value={commRating} onChange={setCommRating} label="Communication & Responsiveness" />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Verified Testimonial *</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience collaborating with ${creatorName}. Highlight prompting consistency, render fidelity, or delivery discipline...`}
              className="w-full bg-charcoal-900 border border-charcoal-800 focus:border-electric-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-5 py-2 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-semibold shadow-glow-violet transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Submit Verified Review</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
