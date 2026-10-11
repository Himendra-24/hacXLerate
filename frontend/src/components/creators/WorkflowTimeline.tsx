import React from 'react';
import { WorkflowStep } from '../../types';
import { Cpu, Film, Layers, CheckCircle2, Sliders, Scissors, Wand2 } from 'lucide-react';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  evidenceStatus?: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  evidenceStatus = 'Verified',
}) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic py-2">
        No workflow steps documented for this project.
      </div>
    );
  }

  const getStepIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('concept') || n.includes('ideation') || n.includes('prompt')) return Wand2;
    if (n.includes('keyframe') || n.includes('style') || n.includes('cad')) return Layers;
    if (n.includes('motion') || n.includes('video') || n.includes('diffusion')) return Film;
    if (n.includes('upscale') || n.includes('render') || n.includes('neural')) return Cpu;
    if (n.includes('edit') || n.includes('grade') || n.includes('cut')) return Scissors;
    return Sliders;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#5B46F6]" />
          Documented Workflow Recipe ({steps.length} Steps)
        </span>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Provenance Checked
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const IconComponent = getStepIcon(step.name);
          return (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-[#5B46F6] flex items-center justify-center text-[#5B46F6] shadow-sm group-hover:scale-110 transition-transform">
                <span className="text-[10px] font-bold">{step.step || idx + 1}</span>
              </div>

              {/* Step card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <IconComponent className="w-3.5 h-3.5 text-[#5B46F6]" />
                    <span className="font-medium text-xs text-slate-900">{step.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-50 border border-violet-100 text-[#5B46F6] font-mono">
                    {step.tool}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {step.description}
                </p>
                {step.duration_estimate && (
                  <div className="mt-1.5 text-[10px] text-slate-500 font-mono">
                    Estimated duration: {step.duration_estimate}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
