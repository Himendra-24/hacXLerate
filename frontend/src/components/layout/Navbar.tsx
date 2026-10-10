import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, ArrowRight, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-glow-violet group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline">
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Cre8Match<span className="text-[#818CF8]">.AI</span>
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              to="/discover"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === '/discover'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/brief-builder"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === '/brief-builder'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Brief Builder
            </Link>
            <Link
              to="/brand-hub"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === '/brand-hub'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Brand Hub
            </Link>
            <Link
              to="/studio"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === '/studio'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Creator Studio
            </Link>
            <Link
              to="/engagements"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname.startsWith('/engagements')
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Delivery Room
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/discover"
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Search Creators"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              to="/shortlist"
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="View Shortlist"
            >
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-charcoal-900 border border-charcoal-800 text-slate-300 hover:text-white">
                Shortlist
              </span>
            </Link>

            <Link
              to="/brief-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-glow-violet transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0B0C10] px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/discover"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Discover Creators
          </Link>
          <Link
            to="/brief-builder"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            For Brands (Brief Builder)
          </Link>
          <Link
            to="/studio"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            For Creators (Studio)
          </Link>
          <Link
            to="/shortlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Shortlist
          </Link>
          <Link
            to="/engagements"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Engagements & Delivery
          </Link>
          <div className="pt-2">
            <Link
              to="/brief-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#6366F1] text-white text-xs font-semibold"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
