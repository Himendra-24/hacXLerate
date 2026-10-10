import React from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface FilterState {
  search: string;
  specialization: string;
  content_type: string;
  aspect_ratio: string;
  tool: string;
  verification_tier: string;
  availability: string;
  max_rate?: number;
}

interface CreatorFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const CreatorFilters: React.FC<CreatorFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const specializations = [
    'All',
    'AI Filmmaking',
    'Product CGI',
    'Motion Design',
    'Animation',
    'AI Ad Creative',
    'Audio & Sound Design',
  ];

  const contentTypes = ['All', 'video', 'cgi', 'animation', 'motion', 'image', 'audio'];
  const aspectRatios = ['All', '16:9', '9:16', '1:1', '4:5'];
  const tools = ['All', 'Runway Gen-3', 'Midjourney v6', 'ComfyUI', 'Blender', 'Topaz Video AI 4', 'ElevenLabs'];
  const verificationTiers = ['All', 'Verified', 'Demo-only'];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.specialization !== 'All' ||
    filters.content_type !== 'All' ||
    filters.aspect_ratio !== 'All' ||
    filters.tool !== 'All' ||
    filters.verification_tier !== 'All' ||
    filters.availability !== 'All';

  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 space-y-4">
      
      {/* Search Bar & Counter */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by creator name, model (Runway Gen-3), skill (ControlNet), or project..."
            className="w-full bg-charcoal-950 border border-charcoal-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Showing <strong className="text-white font-semibold">{totalResults}</strong> creators
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-charcoal-800 hover:bg-charcoal-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-electric-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row 1: Specialization Strip */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Specialization
        </span>
        <div className="flex flex-wrap gap-1.5">
          {specializations.map((spec) => {
            const isSelected = filters.specialization === spec;
            return (
              <button
                key={spec}
                onClick={() => onChange({ ...filters, specialization: spec })}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-electric-600 text-white shadow-glow-violet'
                    : 'bg-charcoal-950 text-slate-400 hover:text-slate-200 border border-charcoal-800 hover:border-charcoal-700'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Row 2: Content Type, Aspect Ratio, Tools & Verification Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-charcoal-800/80">
        
        {/* Content Type */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Content Type</label>
          <select
            value={filters.content_type}
            onChange={(e) => onChange({ ...filters, content_type: e.target.value })}
            className="w-full bg-charcoal-950 border border-charcoal-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-electric-500"
          >
            {contentTypes.map((ct) => (
              <option key={ct} value={ct}>
                {ct.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Aspect Ratio</label>
          <select
            value={filters.aspect_ratio}
            onChange={(e) => onChange({ ...filters, aspect_ratio: e.target.value })}
            className="w-full bg-charcoal-950 border border-charcoal-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-electric-500"
          >
            {aspectRatios.map((ar) => (
              <option key={ar} value={ar}>
                {ar === 'All' ? 'All Aspect Ratios' : ar}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Tool */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Tool / Model</label>
          <select
            value={filters.tool}
            onChange={(e) => onChange({ ...filters, tool: e.target.value })}
            className="w-full bg-charcoal-950 border border-charcoal-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-electric-500"
          >
            {tools.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Tier */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Verification Tier</label>
          <select
            value={filters.verification_tier}
            onChange={(e) => onChange({ ...filters, verification_tier: e.target.value })}
            className="w-full bg-charcoal-950 border border-charcoal-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-electric-500"
          >
            {verificationTiers.map((vt) => (
              <option key={vt} value={vt}>
                {vt === 'All' ? 'All Tiers' : vt}
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
};
