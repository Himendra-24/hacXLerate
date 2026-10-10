import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Play,
  Film,
  Box,
  Palette,
  Megaphone,
  Wand2,
  Check,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Target,
  ArrowUpRight,
  Compass,
  MapPin
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Interactive Brief Demo State inside the "Great creative starts with the right match" section
  const [demoIdea, setDemoIdea] = useState(
    'A cinematic sneaker launch film with a futuristic urban aesthetic for Instagram Reels.'
  );
  const [isStructuringDemo, setIsStructuringDemo] = useState(false);
  const [demoBrief, setDemoBrief] = useState({
    name: 'Urban Pulse',
    aspectRatio: '9:16 (Reels)',
    contentType: 'AI Video',
    duration: '15-30 seconds',
    tags: ['Cinematic', 'Futuristic', 'Urban'],
    commercialUse: 'Paid ads (6 months)',
  });

  const handleStructureDemo = () => {
    setIsStructuringDemo(true);
    setTimeout(() => {
      setIsStructuringDemo(false);
      setDemoBrief({
        name: 'Urban Pulse: Cybernetic Motion',
        aspectRatio: '9:16 (Reels)',
        contentType: 'AI Video',
        duration: '15-30 seconds',
        tags: ['Cinematic', 'Futuristic', 'Urban', 'Color Grade'],
        commercialUse: 'Paid ads (6 months)',
      });
    }, 600);
  };

  // 3 Featured Creator Cards from the reference image
  const featuredCards = [
    {
      id: 'ananya-r',
      name: 'Ananya R.',
      role: 'AI Filmmaker · Product Ads',
      location: 'India',
      bio: 'Cinematic product films and brand stories using cutting-edge AI tools.',
      image: '/sneaker_splash.jpg',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      matchScore: 92,
      tools: ['Runway', 'ComfyUI', 'DaVinci'],
      extraTools: '+2',
    },
    {
      id: 'dev-m',
      name: 'Dev M.',
      role: 'Product CGI · Visual Design',
      location: 'India',
      bio: 'Photoreal product visuals and advertising assets for global brands.',
      image: '/floral_portrait.jpg',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      matchScore: 87,
      tools: ['Midjourney', 'Blender', 'Photoshop'],
      extraTools: '+3',
    },
    {
      id: 'mira-s',
      name: 'Mira S.',
      role: 'AI Animator · Motion Design',
      location: 'India',
      bio: 'AI-driven animation, motion graphics and visual storytelling.',
      image: '/scifi_portal.jpg',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      matchScore: 81,
      tools: ['Pika', 'After Effects', 'Illustrator'],
      extraTools: '+2',
    },
  ];

  return (
    <div className="flex flex-col w-full bg-[#0B0C10] text-slate-100 font-sans selection:bg-[#6366F1] selection:text-white">
      
      {/* =========================================================================
          SECTION 1: CINEMATIC HERO (DARK #0B0C10)
      ========================================================================= */}
      <section className="relative w-full min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden bg-[#0B0C10] border-b border-white/[0.06]">
        
        {/* Background Image positioned on right */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_creator.jpg"
            alt="AI Creator Studio"
            className="w-full h-full object-cover object-right md:object-center opacity-70 lg:opacity-85"
          />
          {/* Gradients blending smoothly to dark background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/90 to-transparent lg:w-2/3" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-[#0B0C10]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="max-w-2xl space-y-7">
            
            {/* Top kicker */}
            <div className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">
              The AI Creator Marketplace
            </div>

            {/* Display Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              Find the talent <br />
              behind your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#C4B5FD] to-[#818CF8]">
                next big idea.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Discover AI filmmakers, designers and animators through their work, workflows and proven capabilities.
            </p>

            {/* Working CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/discover"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs sm:text-sm font-semibold shadow-glow-violet transition-all active:scale-95"
              >
                <span>Find your creator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/discover"
                className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs sm:text-sm font-medium border border-white/20 hover:border-white/40 backdrop-blur-md transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                </div>
                <span>Explore portfolios</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Floating handwritten annotation in top-right */}
        <div className="hidden lg:block absolute top-16 right-20 z-10 select-none pointer-events-none text-right">
          <p className="font-handwriting text-white/95 text-3xl sm:text-4xl tracking-wide leading-tight drop-shadow-lg">
            Ideas <br />
            Creators <br />
            <span className="text-[#A78BFA]">Real Impact</span>
          </p>
        </div>

        {/* Floating Glass Video Badge in lower right */}
        <div className="hidden sm:flex absolute bottom-8 right-8 z-10 p-2.5 pr-4 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md shadow-elevated items-center gap-3">
          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-charcoal-900 border border-white/20">
            <img
              src="/sneaker_splash.jpg"
              alt="Video preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="w-3 h-3 fill-white text-white" />
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-white block">
              Watch creators in action
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex -space-x-1">
                <img
                  className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"
                  alt=""
                />
                <img
                  className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50"
                  alt=""
                />
                <img
                  className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black object-cover"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50"
                  alt=""
                />
              </div>
              <span className="text-[10px] text-slate-400">12+ creators</span>
            </div>
          </div>
        </div>

      </section>

      {/* =========================================================================
          SECTION 2: CATEGORY STRIP (CRISP PURE WHITE #FFFFFF)
      ========================================================================= */}
      <section className="w-full bg-white text-slate-900 border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4">
            
            <Link
              to="/discover?specialization=AI+Filmmaking"
              className="flex items-center gap-3.5 group hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-[#6366F1] group-hover:bg-violet-50 transition-colors shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  AI Filmmaking
                </h4>
                <p className="text-[11px] text-slate-500 font-normal">Cinematic stories</p>
              </div>
            </Link>

            <Link
              to="/discover?specialization=Product+CGI"
              className="flex items-center gap-3.5 group hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-[#6366F1] group-hover:bg-violet-50 transition-colors shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Product CGI
                </h4>
                <p className="text-[11px] text-slate-500 font-normal">Photoreal visuals</p>
              </div>
            </Link>

            <Link
              to="/discover?specialization=Motion+Design"
              className="flex items-center gap-3.5 group hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-[#6366F1] group-hover:bg-violet-50 transition-colors shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Motion Design
                </h4>
                <p className="text-[11px] text-slate-500 font-normal">Dynamic content</p>
              </div>
            </Link>

            <Link
              to="/discover?specialization=AI+Ad+Creative"
              className="flex items-center gap-3.5 group hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-[#6366F1] group-hover:bg-violet-50 transition-colors shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  AI Ad Creative
                </h4>
                <p className="text-[11px] text-slate-500 font-normal">Campaign assets</p>
              </div>
            </Link>

            <Link
              to="/discover?specialization=Animation"
              className="flex items-center gap-3.5 group hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-[#6366F1] group-hover:bg-violet-50 transition-colors shrink-0">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Animation
                </h4>
                <p className="text-[11px] text-slate-500 font-normal">Characters & more</p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "GREAT CREATIVE STARTS WITH THE RIGHT MATCH" (CRISP WHITE #FFFFFF)
      ========================================================================= */}
      <section className="w-full bg-[#FAFAFA] text-slate-900 py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Center Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 block">
              Built for the next generation of creators
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
              Great creative starts with the{' '}
              <span className="text-[#6366F1]">right match.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
              Turn your ideas into powerful content by collaborating with verified AI creators who have the skills, tools and experience to bring them to life.
            </p>
          </div>

          {/* Two-Column Feature Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brief Builder Highlights */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-[#6366F1] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Assisted Brief Builder</span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
                From rough idea to <br />
                ready-to-hire brief.
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Just describe your idea in simple words. Our AI helps you create a complete creative brief with content type, style, format, commercial use and more — ready to find the perfect creators.
              </p>

              {/* Checklist */}
              <div className="space-y-3 pt-2 text-xs font-medium text-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Structured creative brief</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Editable fields</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Tailored creator recommendations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Saves time and avoids miscommunication</span>
                </div>
              </div>

              {/* Hand-drawn annotation & CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Link
                  to="/brief-builder"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-glow-violet transition-all active:scale-95"
                >
                  <span>Generate your brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="hidden sm:flex items-center gap-2 text-slate-500 select-none">
                  <span className="font-handwriting text-2xl text-slate-500 transform -rotate-3">
                    Turn ideas into briefs
                  </span>
                  <svg className="w-8 h-8 text-slate-400 -rotate-12" viewBox="0 0 50 50" fill="none" stroke="currentColor">
                    <path d="M10 15 C 25 10, 40 25, 42 38" strokeWidth="2" strokeLinecap="round" />
                    <path d="M35 36 L 42 38 L 41 30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Web App Window Mockup */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden text-xs">
                
                {/* Mockup Window Header */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#6366F1] flex items-center justify-center text-white">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-display font-bold text-slate-800 text-xs">
                      Cre8Match<span className="text-[#6366F1]">.AI</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row bg-white">
                  
                  {/* Left Mini Sidebar from Reference Image */}
                  <div className="w-full md:w-44 border-b md:border-b-0 md:border-r border-slate-100 p-4 space-y-1 text-[11px] bg-slate-50/40 shrink-0">
                    <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-violet-100 text-[#6366F1] font-semibold text-left">
                      <span>✨</span>
                      <span>Create Brief</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-left">
                      <span>📁</span>
                      <span>My Briefs</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-left">
                      <span>🔍</span>
                      <span>Discover Creators</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-left">
                      <span>🔖</span>
                      <span>Shortlist</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-left">
                      <span>📦</span>
                      <span>Engagements</span>
                    </button>
                  </div>

                  {/* Main Mockup Area */}
                  <div className="p-5 flex-1 space-y-4">
                    
                    {/* Top Input Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Create a Creative Brief</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Describe your campaign and let AI structure it for you.
                      </p>

                      <div className="relative">
                        <textarea
                          rows={2}
                          value={demoIdea}
                          onChange={(e) => setDemoIdea(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#6366F1] resize-none leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleStructureDemo}
                          disabled={isStructuringDemo}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[10px] font-semibold transition-all shadow-sm disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isStructuringDemo ? 'Structuring...' : 'Structure with AI'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Structured Brief (Editable) */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Generated Brief (Editable)</span>
                      </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-medium block mb-1">Campaign Name</label>
                        <input
                          type="text"
                          value={demoBrief.name}
                          onChange={(e) => setDemoBrief({ ...demoBrief, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-medium block mb-1">Aspect Ratio</label>
                        <select
                          value={demoBrief.aspectRatio}
                          onChange={(e) => setDemoBrief({ ...demoBrief, aspectRatio: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                        >
                          <option value="9:16 (Reels)">9:16 (Reels)</option>
                          <option value="16:9 (Landscape)">16:9 (Landscape)</option>
                          <option value="1:1 (Square)">1:1 (Square)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-medium block mb-1">Content Type</label>
                        <input
                          type="text"
                          value={demoBrief.contentType}
                          onChange={(e) => setDemoBrief({ ...demoBrief, contentType: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-medium block mb-1">Duration</label>
                        <input
                          type="text"
                          value={demoBrief.duration}
                          onChange={(e) => setDemoBrief({ ...demoBrief, duration: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Style / Mood</label>
                      <div className="flex flex-wrap gap-1.5">
                        {demoBrief.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-0.5 rounded-md bg-violet-50 text-[#6366F1] border border-violet-200 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                        <button
                          onClick={() => setDemoBrief({ ...demoBrief, tags: [...demoBrief.tags, 'Moody'] })}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">Commercial Scope</label>
                      <input
                        type="text"
                        value={demoBrief.commercialUse}
                        onChange={(e) => setDemoBrief({ ...demoBrief, commercialUse: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "MEET CREATORS BY WHAT THEY CAN CREATE" (DEEP DARK #0B0C10)
      ========================================================================= */}
      <section className="w-full bg-[#0B0C10] text-white py-20 lg:py-28 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 block">
                Featured Creators
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Meet creators by what they can create.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Explore a curated selection of AI creators with verified skills, real projects and transparent workflows.
              </p>
            </div>

            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>View all creators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Featured Cards Matching Reference Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl overflow-hidden bg-white text-slate-900 border border-slate-200/40 shadow-xl flex flex-col group hover:-translate-y-1 transition-all duration-300"
              >
                
                {/* Media Image with Play Button & Match Score Badge */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                  {/* Play Button Icon in top-left */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>

                  {/* Match Score Badge in top-right */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white text-slate-900 text-[11px] font-bold shadow-md flex items-center gap-1">
                    <span className="text-[#6366F1]">{card.matchScore}/100</span>
                    <span className="text-slate-500 font-normal">Match</span>
                  </div>
                </div>

                {/* Creator Details in Crisp White Panel */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
                  
                  <div className="space-y-2.5">
                    {/* Avatar, Name, Location */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={card.avatar}
                          alt={card.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-sm text-slate-900">{card.name}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] fill-violet-100" />
                          </div>
                          <span className="text-[11px] text-slate-500 block">{card.role}</span>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {card.location}
                      </span>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {card.bio}
                    </p>
                  </div>

                  {/* Tool chips */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                    {card.tools.map((t, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                      {card.extraTools}
                    </span>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "MORE THAN A PORTFOLIO. PROOF BEHIND THE PROCESS." (CRISP PURE WHITE)
      ========================================================================= */}
      <section id="how-it-works" className="w-full bg-white text-slate-900 py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 block">
              Why Cre8Match AI
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
              More than a portfolio. <br />
              Proof behind the process.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              We bring transparency to AI creativity, so you can collaborate with confidence.
            </p>
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Workflow Recipes */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-[#6366F1] flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#6366F1] transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Workflow recipes
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  See the exact tools, models and steps creators use to produce their work.
                </p>
              </div>
            </div>

            {/* Card 2: Explainable matches */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-[#6366F1] flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#6366F1] transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Explainable matches
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Get creators ranked with clear reasons — skills, portfolio fit, format compatibility and more.
                </p>
              </div>
            </div>

            {/* Card 3: Evidence-based trust */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-[#6366F1] flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#6366F1] transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Evidence-based trust
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Verified tools, workflow proof and real engagement history help you make better decisions.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: "YOUR NEXT COLLABORATION STARTS HERE." (DARK #0B0C10)
      ========================================================================= */}
      <section className="relative w-full bg-[#0B0C10] text-white py-20 lg:py-28 overflow-hidden">
        
        {/* Background Workstation Image with Triple Monitors */}
        <div className="absolute inset-0 z-0">
          <img
            src="/studio_cta.jpg"
            alt="Creator Studio Workstation"
            className="w-full h-full object-cover object-right md:object-center opacity-60 lg:opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/85 to-transparent lg:w-2/3" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-[#0B0C10]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl space-y-6">
            
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 block">
              For Brands and Creators
            </span>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Your next collaboration <br />
              starts here.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bring your ideas to life with the right AI creators. Post a brief, explore talent, and create with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/brief-builder"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs sm:text-sm font-semibold shadow-glow-violet transition-all active:scale-95"
              >
                <span>Build your first brief</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/discover"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs sm:text-sm font-medium border border-white/20 hover:border-white/40 backdrop-blur-md transition-all"
              >
                <span>Explore creators</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Script text in top right */}
        <div className="hidden lg:block absolute top-12 right-20 z-10 select-none pointer-events-none text-right">
          <p className="font-handwriting text-white/90 text-3xl sm:text-4xl tracking-wide leading-tight drop-shadow-lg">
            Same tools. <br />
            New possibilities.
          </p>
        </div>

      </section>

    </div>
  );
};
