import React, { useState } from 'react';
import { X, Sparkles, Building2, User, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { authModalState, closeAuthModal, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(authModalState.mode === 'login');
  const [role, setRole] = useState<'creator' | 'brand'>(authModalState.defaultRole || 'creator');
  
  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [orgType, setOrgType] = useState<'brand' | 'agency'>('brand');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode when modal opens
  React.useEffect(() => {
    setIsLogin(authModalState.mode === 'login');
    if (authModalState.defaultRole) {
      setRole(authModalState.defaultRole);
    }
    setError(null);
  }, [authModalState]);

  if (!authModalState.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          display_name: displayName,
          role,
          title: role === 'creator' ? (title || 'Generative AI Filmmaker') : undefined,
          company_name: role === 'brand' ? (companyName || `${displayName}'s Studio`) : undefined,
          type: role === 'brand' ? orgType : undefined,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-[#5B46F6] via-[#7C3AED] to-[#EC4899]" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Emblem */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#5B46F6] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              UF
            </div>
            <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">UNFRAME</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isLogin
              ? 'Sign in to access your creative projects and connections.'
              : 'Join the premier marketplace for verified generative AI creators.'}
          </p>

          {/* Error notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Picker (Only in Registration) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  I am joining as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      role === 'creator'
                        ? 'border-[#5B46F6] bg-[#5B46F6]/5 ring-2 ring-[#5B46F6]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${role === 'creator' ? 'text-[#5B46F6]' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold text-slate-900">AI Creator</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">Filmmakers, 3D/CGI & Artists</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('brand')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      role === 'brand'
                        ? 'border-[#5B46F6] bg-[#5B46F6]/5 ring-2 ring-[#5B46F6]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${role === 'brand' ? 'text-[#5B46F6]' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold text-slate-900">Brand / Studio</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">Agencies & Creative Brands</span>
                  </button>
                </div>
              </div>
            )}

            {/* Display Name (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {role === 'creator' ? 'Full Name' : 'Contact Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={role === 'creator' ? 'Elena Rostova' : 'Marcus Vance'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Role Specific Registration Fields */}
            {!isLogin && role === 'creator' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Specialization / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Generative Video Director & CGI Specialist"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] transition-all"
                />
              </div>
            )}

            {!isLogin && role === 'brand' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Creative Studios"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Organization Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="orgType"
                        value="brand"
                        checked={orgType === 'brand'}
                        onChange={() => setOrgType('brand')}
                        className="text-[#5B46F6] focus:ring-[#5B46F6]"
                      />
                      Brand / Enterprise
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="orgType"
                        value="agency"
                        checked={orgType === 'agency'}
                        onChange={() => setOrgType('agency')}
                        className="text-[#5B46F6] focus:ring-[#5B46F6]"
                      />
                      Creative Agency
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#5B46F6] hover:bg-[#4F46E5] text-white font-semibold text-sm shadow-glow-violet flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to UNFRAME' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              {isLogin ? "Need a demonstration account?" : "Already registered?"}{' '}
              {isLogin ? (
                <button
                  type="button"
                  onClick={() => {
                    setEmail('creator@unframe.ai');
                    setPassword('demopass123');
                  }}
                  className="text-[#5B46F6] hover:underline font-medium"
                >
                  Fill demo creator credentials
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(null); }}
                  className="text-[#5B46F6] hover:underline font-medium"
                >
                  Sign in instead
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
