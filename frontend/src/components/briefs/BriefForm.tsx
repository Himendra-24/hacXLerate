import React, { useState } from 'react';
import { Brief, StructuredDraftSuggestion } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Save,
  Compass,
  Layers,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface BriefFormProps {
  initialData?: Partial<Brief>;
  draftSuggestion?: StructuredDraftSuggestion | null;
  onSave: (brief: Partial<Brief>) => Promise<void>;
  onFindMatches: (brief: Partial<Brief>) => Promise<void>;
  isSaving: boolean;
}

export const BriefForm: React.FC<BriefFormProps> = ({
  initialData = {},
  draftSuggestion,
  onSave,
  onFindMatches,
  isSaving,
}) => {
  const [formData, setFormData] = useState<Partial<Brief>>({
    title: initialData.title || draftSuggestion?.title || '',
    objective: initialData.objective || draftSuggestion?.objective || '',
    raw_idea: initialData.raw_idea || draftSuggestion?.description || '',
    description: initialData.description || draftSuggestion?.description || '',
    content_type: initialData.content_type || draftSuggestion?.content_type || 'video',
    style_tags: initialData.style_tags || draftSuggestion?.style_tags || ['cinematic'],
    aspect_ratio: initialData.aspect_ratio || draftSuggestion?.aspect_ratio || '16:9',
    duration: initialData.duration || draftSuggestion?.duration || '15-30s',
    resolution: initialData.resolution || draftSuggestion?.resolution || '1080p',
    commercial_use_scope:
      initialData.commercial_use_scope ||
      draftSuggestion?.commercial_use_scope ||
      'Full Commercial (Digital & Broadcast)',
    license_duration_months: initialData.license_duration_months || 12,
    exclusivity_required: initialData.exclusivity_required || false,
    revision_limit: initialData.revision_limit || 2,
    budget_min: initialData.budget_min || 1500,
    budget_max: initialData.budget_max || 3500,
    deadline: initialData.deadline || '2026-11-15',
    status: initialData.status || 'published',
  });

  const [tagInput, setTagInput] = useState('');
  const [confirmedFields, setConfirmedFields] = useState<Record<string, boolean>>({
    budget: !draftSuggestion?.needs_confirmation_fields.includes('budget'),
    deadline: !draftSuggestion?.needs_confirmation_fields.includes('deadline'),
    licensing: true,
  });

  const needsBudgetConfirm = draftSuggestion?.needs_confirmation_fields.includes('budget') && !confirmedFields.budget;
  const needsDeadlineConfirm = draftSuggestion?.needs_confirmation_fields.includes('deadline') && !confirmedFields.deadline;

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.style_tags?.includes(tagInput.trim().toLowerCase())) {
      setFormData({
        ...formData,
        style_tags: [...(formData.style_tags || []), tagInput.trim().toLowerCase()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      style_tags: formData.style_tags?.filter((t) => t !== tag),
    });
  };

  const isFormValid =
    formData.title?.trim() &&
    formData.objective?.trim() &&
    formData.description?.trim() &&
    formData.content_type &&
    formData.aspect_ratio;

  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 sm:p-8 space-y-6">
      
      {/* Integrity Warnings Banner */}
      {draftSuggestion?.integrity_warnings && draftSuggestion.integrity_warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Integrity Guard: Confirmation Required</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 pl-1">
            {draftSuggestion.integrity_warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Idea Reference */}
      {formData.raw_idea && (
        <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Source Input (Raw Idea)
          </span>
          <p className="text-slate-300 italic">"{formData.raw_idea}"</p>
        </div>
      )}

      {/* Section 1: Campaign Fundamentals */}
      <div className="space-y-4">
        <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric-500"></span>
          1. Campaign Objectives & Concept
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Campaign Name / Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Project Zenith: Hypercar Reveal Commercial"
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Primary Objective <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="What must this creative accomplish? (e.g. Generate high brand excitement for EV launch...)"
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-electric-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Creative & Technical Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Visual narrative, camera moves, lighting, pacing, key scenes..."
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-electric-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Production Specs & Formats */}
      <div className="space-y-4 pt-4 border-t border-charcoal-800">
        <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          2. Content Type, Formats & Aesthetics
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Content Type <span className="text-rose-400">*</span>
            </label>
            <select
              value={formData.content_type}
              onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-500"
            >
              <option value="video">AI Video / Commercial</option>
              <option value="cgi">Product CGI / 3D Synthetic</option>
              <option value="animation">Stylized Animation</option>
              <option value="motion">Motion Design / Kinetic</option>
              <option value="image">Key Art / Static Print</option>
              <option value="audio">Sound Design & Foley</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Primary Aspect Ratio <span className="text-rose-400">*</span>
            </label>
            <select
              value={formData.aspect_ratio}
              onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-500"
            >
              <option value="16:9">16:9 (Landscape / Cinema)</option>
              <option value="9:16">9:16 (Vertical / Reels / TikTok)</option>
              <option value="1:1">1:1 (Square Feed)</option>
              <option value="4:5">4:5 (Portrait Feed)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">Resolution</label>
            <select
              value={formData.resolution}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-500"
            >
              <option value="1080p">1080p (FHD Standard)</option>
              <option value="4K">4K (Super-Resolution Upscaled)</option>
            </select>
          </div>
        </div>

        {/* Style & Mood Tags */}
        <div>
          <label className="text-xs text-slate-300 block mb-1 font-medium">
            Style & Aesthetic Keywords
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formData.style_tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-lg bg-charcoal-800 border border-charcoal-700 text-electric-300 flex items-center gap-1.5"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add style tag (e.g. cyberpunk, anamorphic, macro lighting)..."
              className="flex-1 bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-electric-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-medium"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Commercial & Legal Terms */}
      <div className="space-y-4 pt-4 border-t border-charcoal-800">
        <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          3. Commercial Scope & Delivery Guarantees
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Commercial Rights Scope
            </label>
            <select
              value={formData.commercial_use_scope}
              onChange={(e) => setFormData({ ...formData, commercial_use_scope: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-500"
            >
              <option value="Full Commercial (Digital & Broadcast)">
                Full Commercial (Digital & Broadcast)
              </option>
              <option value="Digital Social Advertising Only">
                Digital Social Advertising Only
              </option>
              <option value="Internal / Pitch Spec Only">
                Internal / Pitch Spec Only
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              License Duration
            </label>
            <select
              value={formData.license_duration_months}
              onChange={(e) => setFormData({ ...formData, license_duration_months: Number(e.target.value) })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-500"
            >
              <option value={6}>6 Months</option>
              <option value={12}>12 Months (Standard)</option>
              <option value={24}>24 Months</option>
              <option value={0}>Perpetual (All Media)</option>
            </select>
          </div>
        </div>

        {/* Budget & Confirmation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-medium">
                Budget Range ($ USD)
              </label>
              {needsBudgetConfirm ? (
                <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Needs confirmation
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.budget_min || ''}
                onChange={(e) => {
                  setFormData({ ...formData, budget_min: Number(e.target.value) });
                  setConfirmedFields({ ...confirmedFields, budget: true });
                }}
                placeholder="Min ($)"
                className="w-1/2 bg-charcoal-900 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <span className="text-slate-500">–</span>
              <input
                type="number"
                value={formData.budget_max || ''}
                onChange={(e) => {
                  setFormData({ ...formData, budget_max: Number(e.target.value) });
                  setConfirmedFields({ ...confirmedFields, budget: true });
                }}
                placeholder="Max ($)"
                className="w-1/2 bg-charcoal-900 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-medium">Target Delivery Date</label>
              {needsDeadlineConfirm ? (
                <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Needs confirmation
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </span>
              )}
            </div>
            <input
              type="date"
              value={formData.deadline || ''}
              onChange={(e) => {
                setFormData({ ...formData, deadline: e.target.value });
                setConfirmedFields({ ...confirmedFields, deadline: true });
              }}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="pt-4 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Required fields are validated before matching. Scores reflect documented evidence only.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSave(formData)}
            disabled={isSaving || !isFormValid}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-semibold border border-charcoal-700 transition-all disabled:opacity-50"
          >
            Save Draft Brief
          </button>

          <button
            type="button"
            onClick={() => onFindMatches(formData)}
            disabled={isSaving || !isFormValid}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-700 to-electric-600 hover:from-electric-600 hover:to-electric-500 text-white text-xs font-semibold shadow-glow-violet transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Compass className="w-4 h-4" />
            <span>Find Verified Creator Matches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
