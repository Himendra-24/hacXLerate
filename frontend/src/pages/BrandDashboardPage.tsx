import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brief, CreatorProfile, Engagement, MessageThreadSummary, ShortlistItem } from '../types';
import { api } from '../services/api';
import { DirectMessageModal } from '../components/messaging/DirectMessageModal';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  DollarSign,
  Plus,
  Send,
  Eye,
  Star
} from 'lucide-react';

export const BrandDashboardPage: React.FC = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'briefs' | 'engagements' | 'shortlist' | 'messages'>('briefs');
  const [selectedCreatorForChat, setSelectedCreatorForChat] = useState<CreatorProfile | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [briefsData, engData, shortData, threadsData] = await Promise.all([
        api.getBriefs(),
        api.getEngagements(),
        api.getShortlist(),
        api.getMessageThreads('brand_demo_user'),
      ]);
      setBriefs(briefsData);
      setEngagements(engData);
      setShortlist(shortData);
      setThreads(threadsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalUnread = threads.reduce((acc, t) => acc + (t.unread_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Brand Portal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/50 text-[#818CF8] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand Creative Hub</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Brand Workspace & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Oversee structured campaign briefs, monitor AI creator deliverables, compare candidate evidence, and communicate in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/brief-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-glow-violet transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create New Brief</span>
          </Link>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-slate-200 text-xs font-semibold border border-charcoal-800 transition-all"
          >
            <span>Browse Creators</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('briefs')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'briefs'
              ? 'bg-charcoal-900 border-[#6366F1] shadow-glow-violet'
              : 'bg-charcoal-900/60 border-charcoal-800/80 hover:border-charcoal-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Briefs</span>
            <FileText className="w-4 h-4 text-[#818CF8]" />
          </div>
          <div className="text-2xl font-display font-extrabold text-white">{briefs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for candidate ranking</div>
        </div>

        <div
          onClick={() => setActiveTab('engagements')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'engagements'
              ? 'bg-charcoal-900 border-[#6366F1] shadow-glow-violet'
              : 'bg-charcoal-900/60 border-charcoal-800/80 hover:border-charcoal-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Deliveries</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-white">{engagements.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Versioned production passes</div>
        </div>

        <div
          onClick={() => setActiveTab('shortlist')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'shortlist'
              ? 'bg-charcoal-900 border-[#6366F1] shadow-glow-violet'
              : 'bg-charcoal-900/60 border-charcoal-800/80 hover:border-charcoal-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Shortlisted Roster</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-white">{shortlist.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Vetted creator candidates</div>
        </div>

        <div
          onClick={() => setActiveTab('messages')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-charcoal-900 border-[#6366F1] shadow-glow-violet'
              : 'bg-charcoal-900/60 border-charcoal-800/80 hover:border-charcoal-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Creator Threads</span>
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-white flex items-center gap-2">
            <span>{threads.length}</span>
            {totalUnread > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#6366F1] text-white font-sans font-bold">
                {totalUnread} new
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Real-time collaboration</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3">
        <button
          onClick={() => setActiveTab('briefs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'briefs'
              ? 'bg-[#6366F1] text-white shadow-glow-violet'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-900'
          }`}
        >
          Campaign Briefs ({briefs.length})
        </button>
        <button
          onClick={() => setActiveTab('engagements')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'engagements'
              ? 'bg-[#6366F1] text-white shadow-glow-violet'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-900'
          }`}
        >
          Deliveries & Revisions ({engagements.length})
        </button>
        <button
          onClick={() => setActiveTab('shortlist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'shortlist'
              ? 'bg-[#6366F1] text-white shadow-glow-violet'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-900'
          }`}
        >
          Saved Shortlist ({shortlist.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'messages'
              ? 'bg-[#6366F1] text-white shadow-glow-violet'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-900'
          }`}
        >
          Messages {totalUnread > 0 && `(${totalUnread})`}
        </button>
      </div>

      {/* Tab 1: Briefs */}
      {activeTab === 'briefs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Your Structured Creative Briefs</h2>
            <Link
              to="/brief-builder"
              className="text-xs font-semibold text-[#818CF8] hover:text-white flex items-center gap-1"
            >
              <span>+ Create with AI Brief Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {briefs.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-violet-950/70 text-[#818CF8] border border-violet-800/40">
                      {b.content_type} • {b.aspect_ratio}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {b.budget_min ? `$${b.budget_min} – $${b.budget_max || 4500}` : 'Budget Flexible'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-white text-base mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">{b.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {b.style_tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-charcoal-800 text-slate-300 border border-charcoal-700/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span>Deadline: </span>
                    <span className="text-slate-200 font-medium">{b.deadline || 'Flexible'}</span>
                  </div>

                  <Link
                    to={`/matches?brief_id=${b.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-glow-violet transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Ranked Creators</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Engagements & Deliveries */}
      {activeTab === 'engagements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Active Engagements & Version Control</h2>
            <span className="text-xs text-slate-400">Track delivery passes and revision loops</span>
          </div>

          {engagements.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 text-slate-400 space-y-3">
              <Layers className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm font-semibold text-white">No active engagements yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Select a creator from your brief matches or shortlist to send a formal project invitation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {engagements.map((eng) => {
                const latestSub = eng.submissions?.[eng.submissions.length - 1];
                return (
                  <div
                    key={eng.id}
                    className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      {eng.creator?.avatar_url && (
                        <img
                          src={eng.creator.avatar_url}
                          alt={eng.creator.display_name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6366F1]/30 shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-white text-base">
                            {eng.creator?.display_name || 'Assigned Creator'}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              eng.status === 'delivered' || eng.status === 'approved'
                                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                                : eng.status === 'revision_requested'
                                ? 'bg-amber-950/70 text-amber-400 border-amber-800/40'
                                : 'bg-violet-950/70 text-[#818CF8] border-violet-800/40'
                            }`}
                          >
                            {eng.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          {eng.brief?.title || 'Zenith Quantum EV Ad'}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Budget: ${eng.agreed_terms?.budget || 3500}</span>
                          <span>•</span>
                          <span>Deadline: {eng.agreed_terms?.deadline || 'Nov 15'}</span>
                          <span>•</span>
                          <span>{eng.submissions?.length || 0} Submissions</span>
                        </div>
                      </div>
                    </div>

                    {latestSub && (
                      <div className="flex items-center gap-3 bg-charcoal-950/60 p-2.5 rounded-xl border border-charcoal-800 max-w-sm">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-charcoal-800 shrink-0">
                          <img
                            src={latestSub.media_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-white block">
                            Revision v{latestSub.version_number}
                          </span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {latestSub.creator_note || 'Latest draft uploaded'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {eng.creator && (
                        <button
                          onClick={() => setSelectedCreatorForChat(eng.creator!)}
                          className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-medium border border-charcoal-700/60 transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      )}
                      <Link
                        to={`/engagements/${eng.id}`}
                        className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review & Manage</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Shortlist */}
      {activeTab === 'shortlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Saved Creator Candidates</h2>
            <Link to="/discover" className="text-xs font-semibold text-[#818CF8] hover:text-white">
              + Discover More Creators
            </Link>
          </div>

          {shortlist.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 text-slate-400 space-y-3">
              <Bookmark className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm font-semibold text-white">Your shortlist is empty</p>
              <p className="text-xs max-w-sm mx-auto">
                Bookmark creators from the discovery roster or brief matching engine to compare them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shortlist.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.creator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={item.creator.display_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6366F1]/30"
                    />
                    <div>
                      <h3 className="font-display font-bold text-white text-sm">{item.creator.display_name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.creator.title}</p>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{item.creator.rating_avg ? item.creator.rating_avg.toFixed(1) : '5.0'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{item.creator.bio}</p>

                  <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCreatorForChat(item.creator)}
                      className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-medium border border-charcoal-700/60 transition-all flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Message</span>
                    </button>
                    <Link
                      to={`/creators/${item.creator.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-glow-violet transition-all"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Direct Message Threads</h2>
            <span className="text-xs text-slate-400">Communication history with creators</span>
          </div>

          {threads.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 text-slate-400 space-y-3">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm font-semibold text-white">No active message threads</p>
              <p className="text-xs max-w-sm mx-auto">
                Reach out to creators from the discovery roster or from brief matches to start a thread.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((t) => (
                <div
                  key={t.partner_id}
                  onClick={async () => {
                    const c = await api.getCreator(t.partner_id);
                    setSelectedCreatorForChat(c);
                  }}
                  className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8] font-bold">
                      {t.partner_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-sm">{t.partner_name}</span>
                        {t.unread_count > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6366F1] text-white font-bold">
                            {t.unread_count} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{t.last_message}</p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <span>
                      {new Date(t.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className="block text-[11px] text-[#818CF8] font-semibold mt-1">
                      Open Chat →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
