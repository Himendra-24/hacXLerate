import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShortlistItem, Brief } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Bookmark, Send, Trash2, ArrowRight, DollarSign, Layers, Compass } from 'lucide-react';

export const ShortlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, bData] = await Promise.all([
        api.getShortlist(),
        api.getBriefs(),
      ]);
      setShortlist(items);
      setBriefs(bData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.removeFromShortlist(id);
      setShortlist((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to remove item.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[#5B46F6] text-xs font-semibold mb-2">
          <Bookmark className="w-3.5 h-3.5 text-[#5B46F6]" />
          <span>Brand Candidate Shortlist</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
          Shortlisted Creator Candidates
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Compare candidate capability proofs, verified workflow recipes, and rates before initiating campaign invitations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : shortlist.length > 0 ? (
        <div className="space-y-4">
          {shortlist.map((item) => {
            const { creator } = item;
            const primaryProject = creator.portfolio_projects?.[0];

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Creator info */}
                <div className="flex items-center gap-4">
                  <img
                    src={creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={creator.display_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 ring-2 ring-[#5B46F6]/15 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/creators/${creator.id}`}
                        className="font-display font-bold text-slate-900 text-base hover:text-[#5B46F6] transition-colors"
                      >
                        {creator.display_name}
                      </Link>
                      <Badge variant="verified" size="sm">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{creator.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Rate: <strong className="text-slate-800">${creator.rate_min} – ${creator.rate_max}</strong></span>
                      <span>• Stack: <strong className="text-[#5B46F6] font-mono">{creator.tools?.slice(0, 2).join(', ')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Proof preview snippet */}
                {primaryProject && (
                  <div className="hidden lg:flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 max-w-xs">
                    <img
                      src={primaryProject.media_url}
                      alt={primaryProject.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Featured Work</span>
                      <p className="text-xs text-slate-800 truncate font-medium">{primaryProject.title}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors border border-slate-200"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/creators/${creator.id}`}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
                  >
                    View Proof
                  </Link>

                  <button
                    onClick={() => {
                      if (briefs.length > 0) {
                        navigate(`/matches?brief_id=${briefs[0].id}`);
                      } else {
                        navigate('/brief-builder');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-900 text-base">
              Your candidate shortlist is empty
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Explore our creator directory or match engine and bookmark standout candidates to compare them here.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Creators</span>
          </Link>
        </div>
      )}

    </div>
  );
};
