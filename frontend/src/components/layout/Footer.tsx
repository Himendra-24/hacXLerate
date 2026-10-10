import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Info, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-950 border-t border-charcoal-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-electric-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-white text-base">Cre8Match AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              The AI Content Creator Marketplace powered by <strong>Creative Fit Intelligence</strong>. 
              We connect brand briefs with demonstrated creator capabilities, verifiable workflow recipes, and honest licensing evidence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg max-w-md">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                <strong>Evaluation Sandbox:</strong> Sample creator scores, portfolios, and verification records are simulated for the Kampus.VC demo.
              </span>
            </div>
          </div>

          {/* Core Flows */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Product Flows</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/discover" className="hover:text-white transition-colors flex items-center gap-1">
                  Discover AI Creators <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/brief-builder" className="hover:text-white transition-colors flex items-center gap-1">
                  AI Creative Brief Builder <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/shortlist" className="hover:text-white transition-colors flex items-center gap-1">
                  Shortlist & Comparison <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/engagements" className="hover:text-white transition-colors flex items-center gap-1">
                  Revisions & Final Delivery <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/studio" className="hover:text-white transition-colors flex items-center gap-1">
                  Creator Studio & Recipes <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Pillars */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Creative Fit Pillars</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-electric-500"></span>
                <span>Deterministic 4-Factor Matching</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Evidence-Backed Workflow Recipes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Commercial Rights Clarity</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span>Format & Aspect Ratio Gating</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-charcoal-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Cre8Match AI. Built for Kampus.VC AI Content Creator Marketplace Hackathon.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-electric-400" />
              Creative Fit Intelligence™ Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
