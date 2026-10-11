import React from 'react';
import { Link } from 'react-router-dom';
import { CreatorProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { Bookmark, Sparkles, ArrowRight, ShieldCheck, DollarSign, Layers, Star, MessageSquare } from 'lucide-react';

interface CreatorCardProps {
  creator: CreatorProfile;
  isShortlisted?: boolean;
  onToggleShortlist?: (creatorId: string) => void;
  onMessage?: (creator: CreatorProfile) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  isShortlisted = false,
  onToggleShortlist,
  onMessage,
}) => {
  const primaryProject = creator.portfolio_projects?.[0];
  const isDemo = creator.verification_records?.some((v) => v.demo_only);
  const isVerified = creator.verification_records?.some((v) => v.status === 'Verified');

  return (
    <div className="group rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Media / Portfolio Banner */}
      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
        {primaryProject?.media_url ? (
          <img
            src={primaryProject.media_url}
            alt={primaryProject.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
            <Layers className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Clickable link covering the banner */}
        <Link to={`/creators/${creator.id}`} className="absolute inset-0 z-0" aria-label={`View ${creator.display_name} profile`} />

        {/* Play Button Icon in top-left */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-none z-10">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Floating Verification Tag & Shortlist */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div className="px-2.5 py-1 rounded-full bg-white text-slate-900 text-[11px] font-bold shadow-md flex items-center gap-1">
            {creator.trust_level === 'Established' ? (
              <>
                <span className="text-emerald-600">● Established</span>
              </>
            ) : creator.trust_level === 'Evidence-backed' ? (
              <>
                <span className="text-[#5B46F6]">● Evidence-backed</span>
              </>
            ) : creator.trust_level === 'Basic' ? (
              <>
                <span className="text-sky-600">● Basic (Email)</span>
              </>
            ) : isVerified ? (
              <>
                <span className="text-[#5B46F6]">Verified</span>
                <span className="text-slate-400 font-normal">Match</span>
              </>
            ) : (
              <span className="text-slate-600 font-medium">Pending Review</span>
            )}
          </div>

          {onToggleShortlist && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleShortlist(creator.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                isShortlisted
                  ? 'bg-[#5B46F6] text-white shadow-glow-violet-sm'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              title={isShortlisted ? 'In Shortlist' : 'Add to Shortlist'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Project Title Overlay */}
        {primaryProject && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10">
            <span className="text-[10px] uppercase font-bold text-violet-200 tracking-wider">
              Featured Work
            </span>
            <h4 className="text-xs font-semibold text-white line-clamp-1 drop-shadow-sm">
              {primaryProject.title}
            </h4>
          </div>
        )}
      </div>

      {/* Creator Details in Crisp White Panel */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
        
        {/* Header with Avatar & Availability */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to={`/creators/${creator.id}`} className="shrink-0">
                <img
                  src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={creator.display_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 ring-2 ring-violet-100 hover:opacity-90 transition-opacity"
                />
              </Link>
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/creators/${creator.id}`}
                    className="font-display font-bold text-slate-900 text-base hover:text-[#5B46F6] transition-colors"
                  >
                    {creator.display_name}
                  </Link>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{creator.rating_avg ? creator.rating_avg.toFixed(1) : '5.0'}</span>
                    <span className="text-[10px] text-slate-400">({creator.reviews_count || 1})</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{creator.title}</p>
              </div>
            </div>

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

          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
            {creator.bio}
          </p>
        </div>

        {/* Skills & Tools */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {creator.tools?.slice(0, 3).map((t, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
              >
                {t}
              </span>
            ))}
            {(creator.tools?.length || 0) > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                +{(creator.tools?.length || 0) - 3}
              </span>
            )}
          </div>
        </div>

        {/* Rates & Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Rate Range</span>
            <span className="text-xs font-bold text-slate-900">
              {creator.rate_min ? `$${creator.rate_min} – $${creator.rate_max || '4,500'}` : 'Custom Quote'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onMessage && (
              <button
                type="button"
                onClick={() => onMessage(creator)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title={`Message ${creator.display_name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}

            <Link
              to={`/creators/${creator.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-glow-violet-sm transition-all active:scale-95"
            >
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
