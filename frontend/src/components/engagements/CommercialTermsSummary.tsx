import React from 'react';
import { Shield, FileCheck, AlertCircle } from 'lucide-react';

interface CommercialTermsSummaryProps {
  terms: Record<string, any>;
}

export const CommercialTermsSummary: React.FC<CommercialTermsSummaryProps> = ({ terms }) => {
  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          Recorded Commercial Terms Summary
        </span>
        <span className="text-[10px] text-slate-500 uppercase font-mono">
          Contract Record
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <span className="text-[10px] text-slate-500 block">Agreed Budget</span>
          <strong className="text-white font-semibold">
            ${terms.budget ? Number(terms.budget).toLocaleString() : '2,500'} USD
          </strong>
        </div>

        <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <span className="text-[10px] text-slate-500 block">Delivery Deadline</span>
          <strong className="text-white font-semibold">{terms.deadline || '2026-11-20'}</strong>
        </div>

        <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <span className="text-[10px] text-slate-500 block">Commercial Scope</span>
          <strong className="text-white font-semibold line-clamp-1">
            {terms.commercial_scope || 'Full Commercial'}
          </strong>
        </div>

        <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <span className="text-[10px] text-slate-500 block">Revisions Included</span>
          <strong className="text-white font-semibold">{terms.revision_limit || 2} Rounds</strong>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-850 flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 text-electric-400 shrink-0 mt-0.5" />
        <span>
          <strong>Platform Disclaimer:</strong> Recorded terms reflect agreed campaign parameters and model licensing metadata verified during matching. This summary does not constitute formal legal representation.
        </span>
      </div>
    </div>
  );
};
