import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreatorProfile } from '../types';
import { api } from '../services/api';
import { CreatorCard } from '../components/creators/CreatorCard';
import { CreatorFilters, FilterState } from '../components/creators/CreatorFilters';
import { DirectMessageModal } from '../components/messaging/DirectMessageModal';
import { Compass, RotateCcw, Search, Sparkles, LayoutGrid, List, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [selectedCreatorForChat, setSelectedCreatorForChat] = useState<CreatorProfile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickFilter, setQuickFilter] = useState<'all' | 'verified' | 'available' | 'top_rated'>('all');

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

  // Filter by quick filter buttons
  const displayedCreators = creators.filter((c) => {
    if (quickFilter === 'verified') return c.verification_records?.some((v) => v.status === 'Verified');
    if (quickFilter === 'available') return c.availability_status === 'Available';
    if (quickFilter === 'top_rated') return (c.rating_avg || 5.0) >= 4.8;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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

        {/* View Switcher & Counter */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 bg-charcoal-900 px-3 py-1.5 rounded-xl border border-charcoal-800">
            Showing <span className="font-semibold text-white">{displayedCreators.length}</span> creators
          </div>
          <div className="flex items-center bg-charcoal-900 border border-charcoal-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid' ? 'bg-electric-600 text-white shadow-glow-violet' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'list' ? 'bg-electric-600 text-white shadow-glow-violet' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filter Strip */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-charcoal-800/80">
        <span className="text-xs text-slate-400 font-medium mr-1">Quick Filters:</span>
        <button
          onClick={() => setQuickFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            quickFilter === 'all'
              ? 'bg-electric-600 text-white shadow-glow-violet'
              : 'bg-charcoal-900 text-slate-400 hover:text-white border border-charcoal-800'
          }`}
        >
          All ({creators.length})
        </button>
        <button
          onClick={() => setQuickFilter('verified')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            quickFilter === 'verified'
              ? 'bg-electric-600 text-white shadow-glow-violet'
              : 'bg-charcoal-900 text-slate-400 hover:text-white border border-charcoal-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Only</span>
        </button>
        <button
          onClick={() => setQuickFilter('available')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            quickFilter === 'available'
              ? 'bg-electric-600 text-white shadow-glow-violet'
              : 'bg-charcoal-900 text-slate-400 hover:text-white border border-charcoal-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Available Now</span>
        </button>
        <button
          onClick={() => setQuickFilter('top_rated')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            quickFilter === 'top_rated'
              ? 'bg-electric-600 text-white shadow-glow-violet'
              : 'bg-charcoal-900 text-slate-400 hover:text-white border border-charcoal-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>Top Rated (4.8+)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <CreatorFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalResults={displayedCreators.length}
      />

      {/* Results View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-charcoal-900 border border-charcoal-800 animate-pulse" />
          ))}
        </div>
      ) : displayedCreators.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedCreators.map((c) => (
              <CreatorCard
                key={c.id}
                creator={c}
                isShortlisted={shortlistedIds.has(c.id)}
                onToggleShortlist={handleToggleShortlist}
                onMessage={(creator) => setSelectedCreatorForChat(creator)}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {displayedCreators.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-[280px]">
                  <img
                    src={c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={c.display_name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-electric-600/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-sm">{c.display_name}</span>
                      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{c.rating_avg ? c.rating_avg.toFixed(1) : '5.0'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        {c.availability_status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {c.tools.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block flex-1 max-w-md">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {c.bio}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Rate</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {c.rate_min ? `$${c.rate_min} – $${c.rate_max || 4500}` : 'Custom'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCreatorForChat(c)}
                      className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-medium border border-charcoal-700/60 transition-all"
                    >
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleShortlist(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        shortlistedIds.has(c.id)
                          ? 'bg-electric-600 text-white'
                          : 'bg-charcoal-800 hover:bg-charcoal-700 text-slate-300'
                      }`}
                    >
                      {shortlistedIds.has(c.id) ? 'Shortlisted' : 'Shortlist'}
                    </button>
                    <a
                      href={`/creators/${c.id}`}
                      className="px-3 py-1.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all"
                    >
                      View Proof
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
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

      {/* Direct Message Modal */}
      <DirectMessageModal
        isOpen={!!selectedCreatorForChat}
        onClose={() => setSelectedCreatorForChat(null)}
        creator={selectedCreatorForChat}
      />

    </div>
  );
};
