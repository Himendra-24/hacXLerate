import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreatorMatchResult } from '../../types';
import { Badge } from '../ui/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bookmark,
  Send,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface MatchCardProps {
  match: CreatorMatchResult;
  briefId?: string;
  isShortlisted?: boolean;
  onToggleShortlist?: (creatorId: string) => void;
  onInvite?: (creatorId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  briefId,
  isShortlisted = false,
  onToggleShortlist,
  onInvite,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { creator, score, breakdown, supporting_portfolio_items, match_explanations, missing_or_uncertain_requirements, commercial_rights_summary } = match;

  const scoreColor =
    score >= 80 ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' :
    score >= 60 ? 'text-electric-400 bg-electric-950/60 border-electric-800/60' :
    'text-amber-400 bg-amber-950/60 border-amber-800/60';

  return (
    <div
      className={`rounded-2xl bg-charcoal-900 border transition-all duration-300 overflow-hidden flex flex-col ${
        breakdown.mandatory_passed
          ? 'border-charcoal-800 hover:border-charcoal-700 hover:shadow-glow-violet'
          : 'border-rose-900/60 bg-gradient-to-b from-rose-950/20 to-charcoal-900'
      }`}
    >
      
      {/* Mandatory Violation Banner if failed */}
      {!breakdown.mandatory_passed && (
        <div className="bg-rose-950/80 border-b border-rose-900/60 px-4 py-2.5 flex items-start gap-2.5 text-xs text-rose-200">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-rose-300">Mandatory Requirement Mismatch</span>
            <ul className="list-disc list-inside text-[11px] text-rose-300/90">
              {breakdown.mandatory_violations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="p-5 sm:p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Creator Identity */}
          <div className="flex items-center gap-3.5">
            <img
              src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={creator.display_name}
              className="w-13 h-13 rounded-full object-cover border border-charcoal-700 ring-2 ring-electric-600/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/creators/${creator.id}`}
                  className="font-display font-bold text-base text-white hover:text-electric-400 transition-colors"
                >
                  {creator.display_name}
                </Link>
                <Badge variant={creator.verification_records?.some(v => v.demo_only) ? 'demo' : 'verified'} size="sm">
                  {match.verification_tier}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{creator.title}</p>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Rate: <strong className="text-slate-300">${creator.rate_min || 1500} - ${creator.rate_max || 4000}</strong> • {creator.availability_status}
              </div>
            </div>
          </div>

          {/* Composite Score Meter */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className={`px-4 py-2 rounded-xl border flex flex-col items-center ${scoreColor}`}>
              <div className="flex items-baseline gap-0.5">
                <span className="font-display font-bold text-2xl tracking-tight leading-none">
                  {Math.round(score)}
                </span>
                <span className="text-[10px] opacity-75">/100</span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">
                Creative Fit
              </span>
            </div>

            {onToggleShortlist && (
              <button
                onClick={() => onToggleShortlist(creator.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isShortlisted
                    ? 'bg-electric-600 border-electric-500 text-white shadow-glow-violet'
                    : 'bg-charcoal-800 border-charcoal-700 text-slate-400 hover:text-white hover:bg-charcoal-750'
                }`}
                title={isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              >
                <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

        </div>

        {/* Explainable Fit Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-charcoal-800">
          
          {/* Why Matched */}
          <div className="space-y-1.5 p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Documented Fit Drivers
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {match_explanations.map((exp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">•</span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing / Uncertain */}
          <div className="space-y-1.5 p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800">
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Missing or Uncertain Requirements
            </span>
            {missing_or_uncertain_requirements.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-400">
                {missing_or_uncertain_requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">
                All brief specifications have documented portfolio evidence.
              </p>
            )}
          </div>

        </div>

        {/* Commercial rights summary tag */}
        <div className="text-[11px] text-slate-400 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-electric-400 shrink-0" />
          <span><strong>Commercial Term Audit:</strong> {commercial_rights_summary}</span>
        </div>

        {/* Supporting Portfolio Evidence Preview */}
        {supporting_portfolio_items && supporting_portfolio_items.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-charcoal-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Supporting Portfolio Evidence ({supporting_portfolio_items.length} Project{supporting_portfolio_items.length > 1 ? 's' : ''})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supporting_portfolio_items.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-3"
                >
                  <img
                    src={proj.media_url}
                    alt={proj.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-charcoal-700"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-white truncate">{proj.title}</h5>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-charcoal-800 font-mono text-electric-300">
                        {proj.aspect_ratios?.join(', ')}
                      </span>
                      <span>• {proj.content_type}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {proj.evidence_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Mathematical Breakdown */}
        <div>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <span>{showBreakdown ? 'Hide' : 'Inspect'} 4-Factor Score Weighting Formula</span>
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showBreakdown && (
            <div className="mt-3 p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs space-y-2 animate-fade-in font-mono">
              <div className="text-[11px] text-slate-400 pb-1 border-b border-charcoal-800">
                Formula: 0.40(Skill) + 0.30(Portfolio) + 0.20(Format) + 0.10(Tool)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded bg-charcoal-900 border border-charcoal-800">
                  <span className="text-[10px] text-slate-500 block">Skills (40%)</span>
                  <strong className="text-white text-xs">{breakdown.skill_match}/100</strong>
                </div>
                <div className="p-2 rounded bg-charcoal-900 border border-charcoal-800">
                  <span className="text-[10px] text-slate-500 block">Portfolio (30%)</span>
                  <strong className="text-white text-xs">{breakdown.portfolio_relevance}/100</strong>
                </div>
                <div className="p-2 rounded bg-charcoal-900 border border-charcoal-800">
                  <span className="text-[10px] text-slate-500 block">Format (20%)</span>
                  <strong className="text-white text-xs">{breakdown.format_compatibility}/100</strong>
                </div>
                <div className="p-2 rounded bg-charcoal-900 border border-charcoal-800">
                  <span className="text-[10px] text-slate-500 block">Tools (10%)</span>
                  <strong className="text-white text-xs">{breakdown.tool_compatibility}/100</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions bar */}
        <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-3">
          <Link
            to={`/creators/${creator.id}`}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium"
          >
            <span>View Full Portfolio & Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            {onInvite && (
              <button
                onClick={() => onInvite(creator.id)}
                className="px-4 py-2 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Invite to Brief</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
