import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, ArrowRight, Menu, X, Frame, Sparkles, Building2,
  LogOut, ChevronDown, User, ShieldCheck, Briefcase, Film,
  MessageSquare, Bookmark, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, creatorProfile, organization, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B46F6] to-[#7C3AED] flex items-center justify-center text-white shadow-glow-violet-sm group-hover:scale-105 transition-transform">
              <Frame className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                UNFRAME
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Role Aware) */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && user?.role === 'creator' ? (
              <>
                <Link
                  to="/creator/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/creator/dashboard'
                      ? 'text-violet-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/opportunities"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/opportunities'
                      ? 'text-violet-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Matched Opportunities
                </Link>
                <Link
                  to="/studio"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/studio'
                      ? 'text-violet-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Creator Studio
                </Link>
                <Link
                  to="/messages"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/messages'
                      ? 'text-violet-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Messages
                </Link>
              </>
            ) : isAuthenticated && user?.role === 'brand' ? (
              <>
                <Link
                  to="/organization/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/organization/dashboard'
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/discover"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/discover'
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Discover Talent
                </Link>
                <Link
                  to="/briefs"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/briefs'
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Campaign Briefs
                </Link>
                <Link
                  to="/shortlist"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/shortlist'
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Shortlist
                </Link>
                <Link
                  to="/messages"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/messages'
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Messages
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/discover"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/discover'
                      ? 'text-violet-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Find Talent
                </Link>
                <Link
                  to="/briefs"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/briefs'
                      ? 'text-violet-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Open Briefs
                </Link>
                <Link
                  to="/organizations"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/organizations')
                      ? 'text-violet-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Organizations
                </Link>
                <Link
                  to="/creator/login"
                  className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors"
                >
                  For Creators
                </Link>
                <Link
                  to="/organization/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  For Organizations
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <span className="max-w-[120px] truncate">{user.display_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'creator'
                        ? 'bg-purple-50 text-violet-700 border border-violet-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.display_name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.display_name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === 'brand' ? (
                        <>
                          <Link
                            to="/organization/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Organization Dashboard
                          </Link>
                          <Link
                            to="/brief-builder"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Plus className="w-4 h-4 text-slate-400" />
                            Create Campaign Brief
                          </Link>
                          <Link
                            to="/shortlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Bookmark className="w-4 h-4 text-slate-400" />
                            Shortlist
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/creator/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-violet-600"
                          >
                            <Sparkles className="w-4 h-4 text-violet-600" />
                            Creator Dashboard
                          </Link>
                          <Link
                            to="/studio"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-violet-600"
                          >
                            <Film className="w-4 h-4 text-slate-400" />
                            Studio & Workflows
                          </Link>
                          {creatorProfile && (
                            <Link
                              to={`/creators/${creatorProfile.id}`}
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-violet-600"
                            >
                              <User className="w-4 h-4 text-slate-400" />
                              View Public Profile
                            </Link>
                          )}
                        </>
                      )}

                      <Link
                        to="/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-violet-600"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        Messages & Threads
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/creator/login"
                  className="text-xs font-semibold text-slate-700 hover:text-violet-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/creator/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-violet-200 transition-all active:scale-95"
                >
                  <span>Join as Creator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {isAuthenticated && user ? (
            <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.display_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">{user.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                to="/creator/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Creator Login
              </Link>
              <Link
                to="/organization/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-center rounded-xl bg-slate-900 text-xs font-semibold text-white"
              >
                Org Login
              </Link>
            </div>
          )}

          <div className="space-y-1">
            {isAuthenticated && user?.role === 'creator' ? (
              <>
                <Link
                  to="/creator/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Creator Dashboard
                </Link>
                <Link
                  to="/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Matched Opportunities
                </Link>
                <Link
                  to="/studio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Studio & Workflows
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Messages
                </Link>
              </>
            ) : isAuthenticated && user?.role === 'brand' ? (
              <>
                <Link
                  to="/organization/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Organization Dashboard
                </Link>
                <Link
                  to="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Discover Talent
                </Link>
                <Link
                  to="/briefs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Campaign Briefs
                </Link>
                <Link
                  to="/shortlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Shortlist
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Messages
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Find Talent
                </Link>
                <Link
                  to="/briefs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Open Briefs
                </Link>
                <Link
                  to="/organizations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Organizations
                </Link>
              </>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
