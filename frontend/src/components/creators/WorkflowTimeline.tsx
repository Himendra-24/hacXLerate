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
      <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-charcoal-800">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-electric-400" />
          Documented Workflow Recipe ({steps.length} Steps)
        </span>
        <span className="text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Provenance Checked
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-charcoal-800">
        {steps.map((step, idx) => {
          const IconComponent = getStepIcon(step.name);
          return (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-charcoal-900 border border-electric-600/70 flex items-center justify-center text-electric-400 shadow-glow-violet group-hover:scale-110 transition-transform">
                <span className="text-[10px] font-bold">{step.step || idx + 1}</span>
              </div>

              {/* Step card */}
              <div className="p-3 rounded-xl bg-charcoal-850/60 border border-charcoal-800 hover:border-charcoal-700 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <IconComponent className="w-3.5 h-3.5 text-electric-400" />
                    <span className="font-medium text-xs text-white">{step.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700 text-electric-300 font-mono">
                    {step.tool}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
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
