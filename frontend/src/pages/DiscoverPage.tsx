import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreatorProfile } from '../types';
import { api } from '../services/api';
import { CreatorCard } from '../components/creators/CreatorCard';
import { CreatorFilters, FilterState } from '../components/creators/CreatorFilters';
import { Compass, RotateCcw, Search, Sparkles } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());

  const initialFilters: FilterState = {
    search: searchParams.get('search') || '',
    specialization: searchParams.get('specialization') || 'All',
    content_type: searchParams.get('content_type') || 'All',
    aspect_ratio: searchParams.get('aspect_ratio') || 'All',
    tool: searchParams.get('tool') || 'All',
    verification_tier: searchParams.get('verification_tier') || 'All',
    availability: 'All',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Load shortlist items
  const loadShortlist = async () => {
    try {
      const items = await api.getShortlist();
      setShortlistedIds(new Set(items.map((i) => i.creator_id)));
    } catch {
      // ignore
    }
  };

  // Fetch creators based on filter criteria
  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.specialization !== 'All') params.specialization = filters.specialization;
      if (filters.content_type !== 'All') params.content_type = filters.content_type;
      if (filters.aspect_ratio !== 'All') params.aspect_ratio = filters.aspect_ratio;
      if (filters.tool !== 'All') params.tool = filters.tool;
      if (filters.verification_tier !== 'All') params.verification_tier = filters.verification_tier;

      const data = await api.getCreators(params);
      setCreators(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShortlist();
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [filters]);

  const handleToggleShortlist = async (creatorId: string) => {
    if (shortlistedIds.has(creatorId)) {
      await api.removeCreatorFromShortlist(creatorId);
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(creatorId);
        return next;
      });
    } else {
      await api.addToShortlist(creatorId);
      setShortlistedIds((prev) => new Set(prev).add(creatorId));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      specialization: 'All',
      content_type: 'All',
      aspect_ratio: 'All',
      tool: 'All',
      verification_tier: 'All',
      availability: 'All',
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-800 text-slate-300 text-xs mb-2">
          <Compass className="w-3.5 h-3.5 text-electric-400" />
          <span>Creator Discovery & Roster</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">
          Discover Verified AI Creators
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Search creators by demonstrated AI tools (Runway, ComfyUI, Midjourney), workflow integrity, and target aspect ratios.
        </p>
      </div>

      {/* Filter Toolbar */}
      <CreatorFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalResults={creators.length}
      />

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-charcoal-900 border border-charcoal-800 animate-pulse" />
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creators.map((c) => (
            <CreatorCard
              key={c.id}
              creator={c}
              isShortlisted={shortlistedIds.has(c.id)}
              onToggleShortlist={handleToggleShortlist}
            />
          ))}
        </div>
      ) : (
        /* Empty State with Actionable Guidance */
        <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-800 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-white text-base">
              No creators match your current filter combination
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try broadening your search, resetting the aspect ratio or tool filter, or exploring all creative specializations.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
};
