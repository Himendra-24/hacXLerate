import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Loader2, Video, CheckCircle2 } from 'lucide-react';

export const CreatorLoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as a creator, redirect
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'creator') {
      const from = (location.state as any)?.from?.pathname || '/creator/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const auth = await login({ email, password });
      if (auth.user.role !== 'creator' && auth.user.role !== 'admin') {
        setError('This account is registered as an Organization. Please use Organization Login.');
        return;
      }
      navigate('/creator/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Video className="w-3.5 h-3.5" />
            Creator Portal
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
            Welcome back, Creator
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your portfolio, manage client opportunities, and review your production workflows.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@creativestudio.ai"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-sm bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-medium bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all shadow-md shadow-violet-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in to Creator Studio
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200/80 space-y-3">
          <p className="text-center text-sm text-slate-600">
            Don't have a creator account?{' '}
            <Link to="/creator/register" className="font-semibold text-violet-600 hover:text-violet-700">
              Apply to join UNFRAME
            </Link>
          </p>
          <p className="text-center text-xs text-slate-500">
            Are you a brand or agency?{' '}
            <Link to="/organization/login" className="font-medium text-slate-700 hover:text-violet-600 underline">
              Sign in as an Organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorLoginPage;
