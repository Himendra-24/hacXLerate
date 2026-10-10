import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreatorProfile } from '../types';
import { api } from '../services/api';
import { CreatorCard } from '../components/creators/CreatorCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wand2,
  Layers,
  Compass,
  CheckCircle2,
  Film,
  Cpu,
  Video,
  Box,
  Palette
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCreators, setFeaturedCreators] = useState<CreatorProfile[]>([]);
  const [roughIdeaInput, setRoughIdeaInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCreators().then((creators) => {
      setFeaturedCreators(creators.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roughIdeaInput.trim()) {
      navigate(`/brief-builder?idea=${encodeURIComponent(roughIdeaInput)}`);
    } else {
      navigate('/brief-builder');
    }
  };

  const categories = [
    { name: 'AI Filmmaking', icon: Film, desc: 'Cinematic commercials & spec ads' },
    { name: 'Product CGI', icon: Box, desc: 'Neural 3D & studio lighting' },
    { name: 'Motion Design', icon: Palette, desc: 'Kinetic typography & branding' },
    { name: 'AI Ad Creative', icon: Video, desc: 'Hook-driven 9:16 vertical video' },
    { name: 'Animation', icon: Cpu, desc: 'Character consistency & anime' },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Cinematic Editorial Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-electric-700/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-750 text-slate-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse" />
            <span className="font-medium">Creative Fit Intelligence™</span>
            <span className="text-slate-500">•</span>
            <span className="text-electric-300">Job-to-Evidence Matching</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-[1.1]">
            Find the talent behind your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-electric-200 to-white">big idea</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover AI filmmakers, designers and animators through their work, workflows and documented capabilities. 
            No visual guesswork—we match your creative brief directly against verifiable portfolio evidence.
          </p>

          {/* Quick Rough Idea Input Form */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleHeroSubmit}
              className="p-2 rounded-2xl bg-charcoal-900/90 border border-charcoal-750 shadow-elevated backdrop-blur-md flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={roughIdeaInput}
                  onChange={(e) => setRoughIdeaInput(e.target.value)}
                  placeholder="Enter a campaign idea (e.g. '30s cinematic luxury car ad in rain')..."
                  className="w-full bg-transparent px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Build Structured Brief</span>
              </button>
            </form>
            <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Deterministic 4-factor scoring
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-electric-400" />
                Workflow recipe provenance
              </span>
            </div>
          </div>

          {/* Secondary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 text-xs font-medium border border-charcoal-700 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-electric-400" />
              <span>Explore All Creators</span>
            </Link>
            <Link
              to="/studio"
              className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-850 text-slate-400 hover:text-slate-200 text-xs font-medium border border-charcoal-800 transition-all"
            >
              For Creators: Showcase Studio
            </Link>
          </div>

        </div>
      </section>

      {/* Category Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/discover?specialization=${encodeURIComponent(cat.name)}`}
                className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-850/80 transition-all group flex flex-col justify-between"
              >
                <div className="w-9 h-9 rounded-xl bg-charcoal-800 group-hover:bg-electric-950 flex items-center justify-center text-slate-300 group-hover:text-electric-400 transition-colors mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white text-xs group-hover:text-electric-300 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* The Core Differentiator: Proof Behind The Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-charcoal-900 to-charcoal-950 border border-charcoal-800 p-8 sm:p-12 space-y-10">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] uppercase font-bold text-electric-400 tracking-wider">
              Creative Fit Intelligence™
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              The proof behind the process.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pretty visuals aren’t enough for production. Cre8Match AI validates how work was produced, which models were used, and whether the creator has demonstrated experience in your target aspect ratio and licensing scope.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-electric-950 border border-electric-800/80 flex items-center justify-center text-electric-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">
                AI Brief Structurer
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turns ambiguous ideas into structured creative briefs with confirmed formats, duration, style keywords, and commercial parameters.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">
                Documented Workflow Recipes
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Creators document their end-to-end pipeline: Prompting → Generative Video → ControlNet → Upscaling → Editorial Grade.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">
                Explainable 4-Factor Fit
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every recommendation clearly explains why they matched, displays portfolio proof, and flags missing requirements or commercial uncertainties.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Featured Creators Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase font-bold text-electric-400 tracking-wider">
              Verified Creator Roster
            </span>
            <h2 className="font-display font-extrabold text-2xl text-white">
              Featured AI Artists & Directors
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Screened for commercial production readiness and verifiable tool mastery.
            </p>
          </div>
          <Link
            to="/discover"
            className="text-xs font-semibold text-electric-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>View all 12 creators</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-charcoal-900 border border-charcoal-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </section>

      {/* Brand & Creator Dual CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-8 rounded-3xl bg-gradient-to-br from-charcoal-900 to-charcoal-950 border border-charcoal-800 space-y-4">
            <span className="text-[10px] uppercase font-bold text-electric-400 tracking-wider">
              For Brands & Agencies
            </span>
            <h3 className="font-display font-bold text-xl text-white">
              Ready to commission your next campaign?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use our AI Brief Builder to turn your ideas into concrete specs. Compare creators by demonstrated capabilities, not just follower counts.
            </p>
            <Link
              to="/brief-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all"
            >
              <span>Build Campaign Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-charcoal-900 to-charcoal-950 border border-charcoal-800 space-y-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              For AI Artists & Creators
            </span>
            <h3 className="font-display font-bold text-xl text-white">
              Get matched based on your real craft.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Publish your portfolio projects with step-by-step workflow recipes, controlnet depth passes, and verified tool licenses in Creator Studio.
            </p>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-semibold border border-charcoal-700 transition-all"
            >
              <span>Open Creator Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};
