import React, { useState } from 'react';
import { X, Sparkles, Building2, Check, ArrowRight, ShieldCheck, DollarSign, MapPin, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AVAILABLE_SPECIALIZATIONS = [
  'AI Filmmaking',
  'Product CGI',
  'Commercial Motion',
  'VFX & Compositing',
  'Virtual Production',
  'Fashion & Editorial',
  'Sci-Fi & Worldbuilding',
];

const AVAILABLE_TOOLS = [
  'Runway Gen-3',
  'Midjourney v6',
  'Topaz Video AI',
  'ComfyUI',
  'Cinema 4D',
  'Blender',
  'DaVinci Resolve',
  'Kling AI',
  'Luma Dream Machine',
];

export const OnboardingModal: React.FC = () => {
  const { user, creatorProfile, organization, isOnboardingOpen, closeOnboarding, updateOnboarding } = useAuth();

  const isCreator = user?.role === 'creator';

  // Creator fields
  const [title, setTitle] = useState(creatorProfile?.title || 'Generative AI Director');
  const [bio, setBio] = useState(creatorProfile?.bio || '');
  const [location, setLocation] = useState(creatorProfile?.location || 'Remote / Worldwide');
  const [specializations, setSpecializations] = useState<string[]>(creatorProfile?.specializations || ['AI Filmmaking']);
  const [tools, setTools] = useState<string[]>(creatorProfile?.tools || ['Runway Gen-3', 'Midjourney v6']);
  const [rateMin, setRateMin] = useState(creatorProfile?.rate_min || 1500);
  const [rateMax, setRateMax] = useState(creatorProfile?.rate_max || 3500);
  const [availability, setAvailability] = useState(creatorProfile?.availability_status || 'Available');

  // Brand fields
  const [companyName, setCompanyName] = useState(organization?.company_name || '');
  const [industry, setIndustry] = useState(organization?.industry || 'Creative Production & Advertising');
  const [website, setWebsite] = useState(organization?.website || '');
  const [description, setDescription] = useState(organization?.description || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOnboardingOpen || !user) return null;

  const toggleSpecialization = (item: string) => {
    setSpecializations(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    );
  };

  const toggleTool = (tool: string) => {
    setTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isCreator) {
        await updateOnboarding({
          title,
          bio,
          location,
          specializations,
          tools,
          rate_min: Number(rateMin),
          rate_max: Number(rateMax),
          availability_status: availability,
        });
      } else {
        await updateOnboarding({
          company_name: companyName,
          industry,
          website,
          description,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete profile onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Top */}
        <div className="bg-gradient-to-r from-[#5B46F6] to-[#7C3AED] p-6 text-white shrink-0 relative">
          <button
            onClick={closeOnboarding}
            className="absolute top-5 right-5 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Progressive Onboarding</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold">
            {isCreator ? 'Complete your Creator Profile' : 'Configure your Brand Organization'}
          </h2>
          <p className="text-sm text-purple-100 mt-1 max-w-lg">
            {isCreator
              ? 'Tell brands about your generative pipeline, verified tools, and commercial availability.'
              : 'Add your company credentials so creators and candidates can review verified briefs.'}
          </p>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {isCreator ? (
            <>
              {/* Professional Title & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Generative Video Director"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location & Timezone
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. London / UTC+1 or Remote"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Artistic Statement & Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your background, aesthetic signature, and generative workflow strengths..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                />
              </div>

              {/* Specializations Tag Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Specializations (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SPECIALIZATIONS.map(spec => {
                    const isSelected = specializations.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-[#5B46F6] text-white border-[#5B46F6] font-medium shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tools Tag Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Production Tools & Pipelines
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TOOLS.map(tool => {
                    const isSelected = tools.includes(tool);
                    return (
                      <button
                        type="button"
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 font-medium'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Rates & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Budget ($)
                  </label>
                  <input
                    type="number"
                    value={rateMin}
                    onChange={(e) => setRateMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Budget ($)
                  </label>
                  <input
                    type="number"
                    value={rateMax}
                    onChange={(e) => setRateMax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Available">Available Immediately</option>
                    <option value="Taking bookings next month">Taking Bookings Next Month</option>
                    <option value="Booked">Booked</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Brand Profile Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Studio Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Creative Studios"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Industry
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Luxury Goods, Automotive, Gaming"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization Profile & Creative Mission
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell creators about your brand, upcoming commercial campaigns, and creative guidelines..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B46F6]/20 focus:border-[#5B46F6]"
                />
              </div>
            </>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={closeOnboarding}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#5B46F6] hover:bg-[#4F46E5] text-white text-xs sm:text-sm font-semibold shadow-glow-violet flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save & Complete Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
