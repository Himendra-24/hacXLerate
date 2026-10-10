import React from 'react';
import { Link } from 'react-router-dom';
import { CreatorProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { Bookmark, Sparkles, ArrowRight, ShieldCheck, DollarSign, Layers } from 'lucide-react';

interface CreatorCardProps {
  creator: CreatorProfile;
  isShortlisted?: boolean;
  onToggleShortlist?: (creatorId: string) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  isShortlisted = false,
  onToggleShortlist,
}) => {
  const primaryProject = creator.portfolio_projects?.[0];
  const isDemo = creator.verification_records?.some((v) => v.demo_only);
  const isVerified = creator.verification_records?.some((v) => v.status === 'Verified');

  return (
    <div className="group rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 hover:shadow-glow-violet transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Media / Portfolio Banner */}
      <div className="relative aspect-video bg-charcoal-950 overflow-hidden">
        {primaryProject?.media_url ? (
          <img
            src={primaryProject.media_url}
            alt={primaryProject.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-charcoal-900">
            <Layers className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/30 to-transparent" />

        {/* Floating Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isVerified ? (
            <Badge variant="verified" size="sm">
              Verified
            </Badge>
          ) : (
            <Badge variant="self-reported" size="sm">
              Self-Reported
            </Badge>
          )}
          {isDemo && (
            <Badge variant="demo" size="sm">
              Demo Sandbox
            </Badge>
          )}
        </div>

        {/* Shortlist action */}
        {onToggleShortlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleShortlist(creator.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
              isShortlisted
                ? 'bg-electric-600 text-white shadow-glow-violet'
                : 'bg-charcoal-950/70 text-slate-400 hover:text-white hover:bg-charcoal-800'
            }`}
            title={isShortlisted ? 'In Shortlist' : 'Add to Shortlist'}
          >
            <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Project Title Overlay */}
        {primaryProject && (
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-[10px] uppercase font-bold text-electric-400 tracking-wider">
              Featured Work
            </span>
            <h4 className="text-xs font-semibold text-white line-clamp-1">
              {primaryProject.title}
            </h4>
          </div>
        )}
      </div>

      {/* Creator Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Header with Avatar & Availability */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={creator.display_name}
                className="w-11 h-11 rounded-full object-cover border border-charcoal-700 ring-2 ring-electric-600/20"
              />
              <div>
                <h3 className="font-display font-bold text-white text-base group-hover:text-electric-400 transition-colors">
                  {creator.display_name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">{creator.title}</p>
              </div>
            </div>

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

          <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
            {creator.bio}
          </p>
        </div>

        {/* Skills & Tools */}
        <div className="space-y-2 pt-2 border-t border-charcoal-800/70">
          <div className="flex flex-wrap gap-1">
            {creator.skills?.slice(0, 3).map((sk, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded bg-charcoal-800 text-slate-300 border border-charcoal-700/60"
              >
                {sk}
              </span>
            ))}
            {creator.skills?.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                +{creator.skills.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-500">Stack:</span>
            <span className="text-electric-300 truncate">
              {creator.tools?.slice(0, 3).join(', ')}
            </span>
          </div>
        </div>

        {/* Rates & CTA Footer */}
        <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Rate Range</span>
            <span className="text-xs font-semibold text-slate-200">
              {creator.rate_min ? `$${creator.rate_min} – $${creator.rate_max || '4,500'}` : 'Custom Quote'}
            </span>
          </div>

          <Link
            to={`/creators/${creator.id}`}
            className="flex items-center gap-1.5 text-xs font-medium text-electric-400 hover:text-white px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-electric-600 transition-all"
          >
            <span>View Proof</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
