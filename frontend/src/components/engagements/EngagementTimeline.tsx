import React from 'react';
import { Check, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface EngagementTimelineProps {
  currentStatus: 'invited' | 'in_progress' | 'revision_requested' | 'approved' | 'delivered';
}

export const EngagementTimeline: React.FC<EngagementTimelineProps> = ({ currentStatus }) => {
  const steps = [
    { key: 'invited', label: 'Invited / Accepted', desc: 'Brief sent & terms agreed' },
    { key: 'in_progress', label: 'In Progress', desc: 'Creator generating drafts' },
    { key: 'revision_requested', label: 'Revision Review', desc: 'Brand feedback & iteration' },
    { key: 'approved', label: 'Approved', desc: 'Final render sign-off' },
    { key: 'delivered', label: 'Delivered', desc: 'Master assets & licensing' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'invited': return 0;
      case 'in_progress': return 1;
      case 'revision_requested': return 2;
      case 'approved': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-800">
          Engagement Lifecycle Progress
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-50 text-[#5B46F6] border border-violet-100">
          Status: {currentStatus.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.key}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-violet-50/60 border-[#5B46F6] ring-1 ring-[#5B46F6]/20 shadow-sm'
                  : isCompleted
                  ? 'bg-slate-50 border-emerald-200'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-[#5B46F6] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                  {step.label}
                </h5>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
