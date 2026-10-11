import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Brief, StructuredDraftSuggestion } from '../types';
import { api } from '../services/api';
import { RawIdeaInput } from '../components/briefs/RawIdeaInput';
import { BriefForm } from '../components/briefs/BriefForm';
import { Wand2, FileText, CheckCircle2, ArrowRight, Compass, Sparkles } from 'lucide-react';

export const BriefBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rawIdea, setRawIdea] = useState(searchParams.get('idea') || '');
  const [draftSuggestion, setDraftSuggestion] = useState<StructuredDraftSuggestion | null>(null);
  const [isStructuring, setIsStructuring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBriefs, setSavedBriefs] = useState<Brief[]>([]);

  // Load existing briefs
  useEffect(() => {
    api.getBriefs().then(setSavedBriefs).catch(console.error);
  }, []);

  // Auto-structure if idea passed via query params
  useEffect(() => {
    const queryIdea = searchParams.get('idea');
    if (queryIdea && queryIdea.trim()) {
      handleStructureIdea(queryIdea);
    }
  }, [searchParams]);

  const handleStructureIdea = async (ideaText: string, targetAudience?: string, preferredFormat?: string) => {
    setIsStructuring(true);
    setRawIdea(ideaText);
    try {
      const draft = await api.structureRawIdea(ideaText, targetAudience, preferredFormat);
      setDraftSuggestion(draft);
    } catch (err) {
      console.error('Failed to structure idea:', err);
    } finally {
      setIsStructuring(false);
    }
  };

  const handleSaveBrief = async (briefData: Partial<Brief>) => {
    setIsSaving(true);
    try {
      const created = await api.createBrief(briefData);
      setSavedBriefs((prev) => [created, ...prev]);
      alert('Brief saved successfully as draft!');
    } catch (err) {
      console.error(err);
      alert('Failed to save brief.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFindMatches = async (briefData: Partial<Brief>) => {
    setIsSaving(true);
    try {
      // Save or create brief first to obtain persistent ID
      const created = await api.createBrief(briefData);
      navigate(`/matches?brief_id=${created.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate brief matches.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-[#5B46F6] text-xs font-semibold mb-2">
          <Wand2 className="w-3.5 h-3.5" />
          <span>AI-Assisted Creative Brief Builder</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Structured Campaign Brief Builder
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Transform rough thoughts into verifiable creative briefs. Define aspect ratios, resolution targets, and commercial terms before matching against creator capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input and Existing Briefs */}
        <div className="lg:col-span-5 space-y-6">
          <RawIdeaInput onSubmit={handleStructureIdea} isLoading={isStructuring} />

          {/* Quick List of Existing Briefs */}
          {savedBriefs.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#5B46F6]" />
                Active Campaign Briefs ({savedBriefs.length})
              </span>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {savedBriefs.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/matches?brief_id=${b.id}`)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#5B46F6] hover:bg-violet-50/50 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#5B46F6] truncate">
                        {b.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {b.content_type.toUpperCase()} • {b.aspect_ratio} • Budget: ${b.budget_min || '1k'} - ${b.budget_max || '4k'}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5B46F6] shrink-0 ml-2 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Editable Brief Form with Confirmation Highlights */}
        <div className="lg:col-span-7">
          <BriefForm
            draftSuggestion={draftSuggestion}
            onSave={handleSaveBrief}
            onFindMatches={handleFindMatches}
            isSaving={isSaving}
          />
        </div>

      </div>

    </div>
  );
};
