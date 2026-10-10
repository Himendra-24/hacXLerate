import React, { useState } from 'react';
import { Wand2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface RawIdeaInputProps {
  onSubmit: (rawIdea: string, targetAudience?: string, preferredFormat?: string) => Promise<void>;
  isLoading: boolean;
}

export const RawIdeaInput: React.FC<RawIdeaInputProps> = ({ onSubmit, isLoading }) => {
  const [idea, setIdea] = useState('');
  const [format, setFormat] = useState('16:9');
  const [audience, setAudience] = useState('');

  const sampleIdeas = [
    {
      title: 'Luxury EV Reveal',
      text: 'A sleek cinematic 30s teaser ad for an electric hypercar speeding through neon rain-slicked Munich streets at night with dramatic rolling camera motion and reflections.',
      format: '16:9',
    },
    {
      title: 'Viral TikTok Skincare',
      text: 'Vertical 9:16 video ads for an organic serum bottle with morning sunlight, macro water droplets, and high-retention customer reaction hooks.',
      format: '9:16',
    },
    {
      title: '3D Luxury Watch CGI',
      text: 'Exploded mechanical gear assembly for a titanium chronograph with macro dial engravings and photorealistic studio lighting.',
      format: '1:1',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    await onSubmit(idea, audience, format);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-charcoal-850 to-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-5">
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-electric-950 text-electric-400 border border-electric-800">
              <Wand2 className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-white text-base">
              Convert Rough Idea to Structured Creative Brief
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Enter an unpolished campaign thought. Creative Fit Intelligence extracts technical requirements, styles, and flags unconfirmed legal/commercial terms.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            placeholder="Describe your vision (e.g. 'We need a 30s cinematic commercial for our brand launch featuring futuristic cityscapes, moody lighting, and clean product hero shots')..."
            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all leading-relaxed resize-none"
          />
        </div>

        {/* Quick parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Target Format / Aspect Ratio</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-electric-500"
            >
              <option value="16:9">16:9 (Landscape / YouTube / Preroll)</option>
              <option value="9:16">9:16 (Vertical / TikTok / Reels / Shorts)</option>
              <option value="1:1">1:1 (Square / Feed / Display Ads)</option>
              <option value="4:5">4:5 (Portrait / Social Feed)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Target Audience (Optional)</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Tech enthusiasts, Luxury consumers (25-40)"
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric-500"
            />
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-500 block">Try an example campaign idea:</span>
          <div className="flex flex-wrap gap-2">
            {sampleIdeas.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIdea(sample.text);
                  setFormat(sample.format);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white border border-charcoal-700 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-electric-400" />
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !idea.trim()}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-electric-700 to-electric-600 hover:from-electric-600 hover:to-electric-500 text-white font-semibold text-xs shadow-glow-violet transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing & Structuring Brief...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate Structured Draft</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>

    </div>
  );
};
