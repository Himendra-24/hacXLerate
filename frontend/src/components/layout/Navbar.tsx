import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Compass, FileText, Bookmark, FolderCheck, Wand2, ShieldCheck, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: null },
    { to: '/discover', label: 'Discover Creators', icon: Compass },
    { to: '/brief-builder', label: 'AI Brief Builder', icon: Wand2 },
    { to: '/shortlist', label: 'Shortlist', icon: Bookmark },
    { to: '/engagements', label: 'Engagements & Delivery', icon: FolderCheck },
    { to: '/studio', label: 'Creator Studio', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-charcoal-950/85 backdrop-blur-md border-b border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric-700 to-electric-500 flex items-center justify-center text-white shadow-glow-violet group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-electric-400 transition-colors">
                  Cre8Match<span className="text-electric-500">.AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-electric-950/80 border border-electric-700/50 text-electric-300">
                  Kampus.VC MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                The right creative. The right proof. The right match.
              </p>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white bg-charcoal-800 border border-charcoal-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-900'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-electric-400' : 'text-slate-500'}`} />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidence Verified</span>
            </div>

            <Link
              to="/brief-builder"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all active:scale-95"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Build Brief</span>
            </Link>

            <Link
              to="/studio"
              className="px-3 py-1.5 rounded-lg border border-charcoal-700 hover:border-charcoal-600 bg-charcoal-900 hover:bg-charcoal-800 text-slate-300 text-xs font-medium transition-all"
            >
              Creator Studio
            </Link>
          </div>

        </div>
      </div>
      
      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden border-t border-charcoal-850 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              location.pathname === link.to ? 'bg-electric-950 text-electric-300 border border-electric-700/50' : 'text-slate-400'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
};
