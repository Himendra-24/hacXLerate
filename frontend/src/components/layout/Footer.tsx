import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B46F6] to-[#7C3AED] flex items-center justify-center text-white shadow-glow-violet-sm">
                <span className="font-display font-black text-sm">U</span>
              </div>
              <span className="font-display font-extrabold text-slate-900 text-xl tracking-tight">
                UNFRAME
              </span>
            </Link>

            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              The AI creator marketplace. <br />
              Find the talent behind the vision.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#twitter" className="hover:text-slate-900 transition-colors font-bold text-xs">𝕏</a>
              <a href="#linkedin" className="hover:text-slate-900 transition-colors font-bold text-xs">in</a>
              <a href="#instagram" className="hover:text-slate-900 transition-colors font-bold text-xs">ig</a>
              <a href="#youtube" className="hover:text-slate-900 transition-colors font-bold text-xs">yt</a>
            </div>
          </div>

          {/* For Brands */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-semibold text-xs tracking-tight">For Brands</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/brief-builder" className="hover:text-slate-900 transition-colors">
                  Post a Brief
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-slate-900 transition-colors">
                  Find Creators
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/brief-builder" className="hover:text-slate-900 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* For Creators */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-semibold text-xs tracking-tight">For Creators</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/studio" className="hover:text-slate-900 transition-colors">
                  Create a Portfolio
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-slate-900 transition-colors">
                  Verification
                </Link>
              </li>
              <li>
                <Link to="/studio" className="hover:text-slate-900 transition-colors">
                  Creator Resources
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-slate-900 transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-semibold text-xs tracking-tight">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
              </li>
              <li>
                <a href="#careers" className="hover:text-slate-900 transition-colors">Careers</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* Stay in the Loop */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-semibold text-xs tracking-tight">Stay in the loop</h4>
            <p className="text-slate-500 text-xs">
              Get product updates and creator stories.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-1.5 pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5B46F6]"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#5B46F6] hover:bg-[#4F46E5] text-white shrink-0 transition-colors shadow-glow-violet-sm"
                title="Subscribe"
              >
                {subscribed ? <Check className="w-3.5 h-3.5 text-white" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
            {subscribed && (
              <span className="text-[11px] text-emerald-600 block">Thank you for subscribing!</span>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 UNFRAME. All rights reserved.
          </div>
          <div>
            Built for a more creative tomorrow.
          </div>
        </div>
      </div>
    </footer>
  );
};
