import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CreatorMatchResult, Brief } from '../types';
import { api } from '../services/api';
import { MatchCard } from '../components/matching/MatchCard';
import { Modal } from '../components/ui/Modal';
import {
  Compass,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Loader2,
  FileText,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';

export const MatchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const briefId = searchParams.get('brief_id');
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [currentBrief, setCurrentBrief] = useState<Brief | null>(null);
  const [matches, setMatches] = useState<CreatorMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideViolations, setHideViolations] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [customTerms, setCustomTerms] = useState({
    budget: 2500,
    deadline: '2026-11-20',
    notes: 'Excited to invite you to our campaign! Please review the brief attached.',
  });
  const [isInviting, setIsInviting] = useState(false);

  // Load briefs
  useEffect(() => {
    api.getBriefs().then((data) => {
      setBriefs(data);
      if (data.length > 0) {
        const found = briefId ? data.find((b) => b.id === briefId) || data[0] : data[0];
        setCurrentBrief(found);
      }
    });

    api.getShortlist().then((items) => {
      setShortlistedIds(new Set(items.map((i) => i.creator_id)));
    });
  }, [briefId]);

  // Load matches whenever currentBrief or hideViolations changes
  useEffect(() => {
    if (!currentBrief) return;
    setLoading(true);
    api.getMatchesForBrief(currentBrief.id, hideViolations)
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentBrief, hideViolations]);

  const handleToggleShortlist = async (creatorId: string) => {
    if (shortlistedIds.has(creatorId)) {
      await api.removeCreatorFromShortlist(creatorId, currentBrief?.id);
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(creatorId);
        return next;
      });
    } else {
      await api.addToShortlist(creatorId, currentBrief?.id);
      setShortlistedIds((prev) => new Set(prev).add(creatorId));
    }
  };

  const handleOpenInvite = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setCustomTerms({
      budget: currentBrief?.budget_max || 2500,
      deadline: currentBrief?.deadline || '2026-11-20',
      notes: 'We loved your demonstrated portfolio evidence and workflow recipe for this campaign.',
    });
    setInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!currentBrief || !selectedCreatorId) return;
    setIsInviting(true);
    try {
      const engagement = await api.createEngagement(currentBrief.id, selectedCreatorId, {
        budget: customTerms.budget,
        deadline: customTerms.deadline,
        commercial_scope: currentBrief.commercial_use_scope,
        aspect_ratio: currentBrief.aspect_ratio,
        revision_limit: currentBrief.revision_limit || 2,
        invitation_notes: customTerms.notes,
      });
      setInviteModalOpen(false);
      navigate(`/engagements/${engagement.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const selectedCreator = matches.find((m) => m.creator.id === selectedCreatorId)?.creator;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-800 text-slate-300 text-xs mb-2">
          <Compass className="w-3.5 h-3.5 text-electric-400" />
          <span>Creative Fit Intelligence™ Matching</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">
          Ranked Creator Fit Recommendations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Deterministic 4-factor scoring matching your brief specifications against verified creator skills, tools, and portfolio project evidence.
        </p>
      </div>

      {/* Brief Summary Bar & Switcher */}
      {currentBrief && (
        <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-electric-950 text-electric-400 border border-electric-800">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-display font-bold text-white text-base">
                  {currentBrief.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">{currentBrief.objective}</p>
              </div>
            </div>

            {/* Brief Switcher */}
            {briefs.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">Switch Brief:</span>
                <select
                  value={currentBrief.id}
                  onChange={(e) => {
                    const selected = briefs.find((b) => b.id === e.target.value);
                    if (selected) setCurrentBrief(selected);
                  }}
                  className="bg-charcoal-950 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-electric-500"
                >
                  {briefs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Key Brief Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-850">
              <span className="text-[10px] text-slate-500 block">Content & Aspect Ratio</span>
              <strong className="text-slate-200">
                {currentBrief.content_type.toUpperCase()} • {currentBrief.aspect_ratio}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-850">
              <span className="text-[10px] text-slate-500 block">Budget Ceiling</span>
              <strong className="text-slate-200">
                ${currentBrief.budget_max ? Number(currentBrief.budget_max).toLocaleString() : '3,500'} USD
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-850">
              <span className="text-[10px] text-slate-500 block">Commercial Scope</span>
              <strong className="text-slate-200 line-clamp-1">
                {currentBrief.commercial_use_scope}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-850">
              <span className="text-[10px] text-slate-500 block">Required Styles</span>
              <strong className="text-electric-300 line-clamp-1">
                {currentBrief.style_tags?.join(', ') || 'Cinematic'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Showing <strong className="text-white font-semibold">{matches.length}</strong> evaluated creator candidates
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideViolations}
            onChange={(e) => setHideViolations(e.target.checked)}
            className="w-4 h-4 rounded border-charcoal-700 bg-charcoal-950 text-electric-600 focus:ring-electric-500 focus:ring-offset-charcoal-900"
          />
          <span>Hide candidates failing mandatory requirements (e.g. over budget or booked)</span>
        </label>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-charcoal-900 border border-charcoal-800 animate-pulse" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard
              key={match.creator.id}
              match={match}
              briefId={currentBrief?.id}
              isShortlisted={shortlistedIds.has(match.creator.id)}
              onToggleShortlist={handleToggleShortlist}
              onInvite={handleOpenInvite}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
          <h3 className="font-display font-bold text-white text-base">
            No matching creators found for this brief configuration
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your brief's budget parameters or removing strict mandatory constraints.
          </p>
        </div>
      )}

      {/* Invitation Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Creator to Campaign Brief"
        subtitle={`Sending structured invitation to ${selectedCreator?.display_name || 'Creator'}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-medium">Offered Budget ($ USD)</label>
            <input
              type="number"
              value={customTerms.budget}
              onChange={(e) => setCustomTerms({ ...customTerms, budget: Number(e.target.value) })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Target Delivery Date</label>
            <input
              type="date"
              value={customTerms.deadline}
              onChange={(e) => setCustomTerms({ ...customTerms, deadline: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Invitation Message & Project Notes</label>
            <textarea
              rows={3}
              value={customTerms.notes}
              onChange={(e) => setCustomTerms({ ...customTerms, notes: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-3 text-white resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Agreed Scope Inherited from Brief:</span>
            <div>• Aspect Ratio: <strong>{currentBrief?.aspect_ratio}</strong></div>
            <div>• Commercial Rights: <strong>{currentBrief?.commercial_use_scope}</strong></div>
            <div>• Included Revisions: <strong>{currentBrief?.revision_limit || 2} rounds</strong></div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={isInviting}
              className="px-5 py-2 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-semibold shadow-glow-violet transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isInviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Invitation</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
