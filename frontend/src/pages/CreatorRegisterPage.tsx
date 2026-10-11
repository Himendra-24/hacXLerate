import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Video, UploadCloud,
  Sparkles, Layers, DollarSign, ShieldCheck, Loader2, AlertCircle, Plus, Trash2
} from 'lucide-react';

export const CreatorRegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Account
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: Professional Identity
    displayName: '',
    headline: 'Generative AI Filmmaker & Spec VFX Artist',
    primarySpecialization: 'AI Filmmaking',
    bio: '',
    location: 'Remote (Global)',

    // Step 3: Skills & Tools
    skills: ['Prompt Engineering', 'Camera Motion', 'Color Grading'],
    tools: ['Runway Gen-3', 'Midjourney v6', 'Topaz Video AI'],
    contentTypes: ['video', 'animation'],
    aspectRatios: ['16:9', '9:16'],

    // Step 4: Portfolio
    portfolioTitle: '',
    portfolioDescription: '',
    portfolioMediaUrl: '',
    portfolioTools: 'Runway Gen-3, Midjourney v6, Topaz Video AI',
    commercialRights: 'Commercial Rights Granted',

    // Step 5: Working Preferences
    rateMin: 1500,
    rateMax: 3500,
    availability: 'Available',
    preferredProjects: 'Commercial Specs, High-End Brand Visuals, Teasers'
  });

  // Upload helper state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const availableSpecializations = [
    'AI Filmmaking', 'Product CGI', 'Motion Design', 'Visual Effects',
    'Fashion & Editorial', 'Gaming & Cinematic Worlds', 'Sound & Audio Design'
  ];

  const suggestedSkills = [
    'Prompt Engineering', 'Camera Motion', 'Color Grading',
    'Compositing', 'Character Consistency', 'Sound Design', 'Storyboarding'
  ];

  const suggestedTools = [
    'Runway Gen-3', 'Midjourney v6', 'Topaz Video AI', 'ComfyUI',
    'Kling 1.5', 'Luma Dream Machine', 'Flux.1', 'DaVinci Resolve'
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    setError(null);

    try {
      const uploadResp = await api.uploadAsset(file, 'creator', 'video');
      setFormData(prev => ({
        ...prev,
        portfolioMediaUrl: uploadResp.url,
        portfolioTitle: prev.portfolioTitle || file.name.replace(/\.[^/.]+$/, "")
      }));
      setUploadProgress('Upload complete!');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleArrayItem = (key: 'skills' | 'tools' | 'contentTypes' | 'aspectRatios', item: string) => {
    setFormData(prev => {
      const current = prev[key];
      if (current.includes(item)) {
        return { ...prev, [key]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [key]: [...current, item] };
      }
    });
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Please enter a valid email address.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const submitRegistration = async (isPartial: boolean = false) => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: any = {
      email: formData.email.trim(),
      password: formData.password,
      display_name: formData.displayName.trim() || formData.fullName.trim(),
      role: 'creator',
      title: formData.headline,
      bio: formData.bio || `Creative AI Filmmaker and visual artist specializing in ${formData.primarySpecialization}.`,
      location: formData.location,
      specializations: [formData.primarySpecialization],
      skills: formData.skills,
      tools: formData.tools,
      rate_min: Number(formData.rateMin) || 1500,
      rate_max: Number(formData.rateMax) || 3500,
      availability_status: formData.availability
    };

    if (formData.portfolioTitle && formData.portfolioMediaUrl) {
      payload.initial_project = {
        title: formData.portfolioTitle,
        description: formData.portfolioDescription || 'Commercial proof-of-work project.',
        media_url: formData.portfolioMediaUrl,
        content_type: 'video',
        specialization: formData.primarySpecialization,
        aspect_ratios: formData.aspectRatios,
        commercial_use_status: formData.commercialRights,
        tools_used: formData.tools,
        skills_demonstrated: formData.skills,
        workflow_steps: [
          { step: 1, name: 'Concept & Directing', tool: 'Claude 3.5 Sonnet', description: 'Prompt pipeline architecture' },
          { step: 2, name: 'Video Diffusion', tool: formData.tools[0] || 'Runway Gen-3', description: 'Generated cinematic passes' },
          { step: 3, name: 'Upscale & Editorial', tool: 'Topaz Video AI', description: '4K fidelity upscale and color' }
        ]
      };
    }

    try {
      await register(payload);
      navigate('/creator/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-6 sm:p-10">
        
        {/* Step Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5 text-violet-700">
              <Video className="w-4 h-4" />
              Creator Onboarding
            </span>
            <span>Step {step} of 5</span>
          </div>
          
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-[11px] font-medium text-slate-400">
            <span className={step >= 1 ? 'text-violet-600 font-semibold' : ''}>Account</span>
            <span className={step >= 2 ? 'text-violet-600 font-semibold' : ''}>Identity</span>
            <span className={step >= 3 ? 'text-violet-600 font-semibold' : ''}>Skills & Tools</span>
            <span className={step >= 4 ? 'text-violet-600 font-semibold' : ''}>Portfolio</span>
            <span className={step >= 5 ? 'text-violet-600 font-semibold' : ''}>Preferences</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* STEP 1: ACCOUNT */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Create your Creator Account</h2>
              <p className="text-sm text-slate-600 mt-1">
                Enter your credentials to secure your workspace and receive brand opportunities.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="maya@studiospectrum.ai"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROFESSIONAL IDENTITY */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Professional Identity</h2>
              <p className="text-sm text-slate-600 mt-1">
                How you present your craft to premium brands and production studios.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display / Studio Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder={formData.fullName || "Studio Display Name"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={e => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Generative AI Filmmaker & Spec VFX Artist"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Specialization
                </label>
                <select
                  value={formData.primarySpecialization}
                  onChange={e => setFormData({ ...formData, primarySpecialization: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm bg-white"
                >
                  {availableSpecializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Biography & Creative Approach
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell prospective brands about your creative aesthetic, directorial background, and AI tooling..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location or Remote Availability
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Remote (Global) or City, Country"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS AND TOOLS */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Skills & AI Tooling</h2>
              <p className="text-sm text-slate-600 mt-1">
                Select your verified production capabilities for algorithmic campaign matching.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Creative Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map(sk => {
                    const isSelected = formData.skills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => toggleArrayItem('skills', sk)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{sk}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  AI Models & Video Tools
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTools.map(tl => {
                    const isSelected = formData.tools.includes(tl);
                    return (
                      <button
                        type="button"
                        key={tl}
                        onClick={() => toggleArrayItem('tools', tl)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{tl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Supported Aspect Ratios
                </label>
                <div className="flex gap-3">
                  {['16:9', '9:16', '1:1', '4:5'].map(ar => (
                    <button
                      type="button"
                      key={ar}
                      onClick={() => toggleArrayItem('aspectRatios', ar)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                        formData.aspectRatios.includes(ar)
                          ? 'bg-violet-100 border-violet-600 text-violet-800'
                          : 'bg-white border-slate-300 text-slate-600'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PORTFOLIO */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Initial Portfolio Piece</h2>
              <p className="text-sm text-slate-600 mt-1">
                Showcase an example of your commercial-ready AI video or generative artwork.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.portfolioTitle}
                  onChange={e => setFormData({ ...formData, portfolioTitle: e.target.value })}
                  placeholder="e.g. Lumina EV — Autonomous Spec Commercial"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Video / Media File
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-violet-400 transition-colors bg-slate-50/50">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-2">
                    MP4, MOV, WEBM, or PNG up to 50MB
                  </p>
                  <label className="inline-block px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
                    {isUploading ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      accept="video/*,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {uploadProgress && (
                    <p className="text-xs text-violet-600 font-medium mt-2">{uploadProgress}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Or Media URL
                </label>
                <input
                  type="url"
                  value={formData.portfolioMediaUrl}
                  onChange={e => setFormData({ ...formData, portfolioMediaUrl: e.target.value })}
                  placeholder="https://... or uploaded path"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Commercial Rights Status
                </label>
                <select
                  value={formData.commercialRights}
                  onChange={e => setFormData({ ...formData, commercialRights: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm bg-white"
                >
                  <option value="Commercial Rights Granted">Commercial Rights Granted</option>
                  <option value="Requires Confirmation">Requires Brand Confirmation</option>
                  <option value="Editorial Only">Editorial Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: WORKING PREFERENCES */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Working Preferences & Rates</h2>
              <p className="text-sm text-slate-600 mt-1">
                Set your commercial rate guidelines and availability for incoming matching opportunities.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Minimum Project Rate ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      value={formData.rateMin}
                      onChange={e => setFormData({ ...formData, rateMin: Number(e.target.value) })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Maximum Project Rate ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      value={formData.rateMax}
                      onChange={e => setFormData({ ...formData, rateMax: Number(e.target.value) })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Availability
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Available', 'Busy', 'Booked'].map(status => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setFormData({ ...formData, availability: status })}
                      className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                        formData.availability === status
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-violet-400'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Project Types
                </label>
                <input
                  type="text"
                  value={formData.preferredProjects}
                  onChange={e => setFormData({ ...formData, preferredProjects: e.target.value })}
                  placeholder="e.g. Commercial Specs, 15s Product Spots, Cinematic Teasers"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <Link
              to="/creator/login"
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Already have an account? Sign in
            </Link>
          )}

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => submitRegistration(true)}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Save & Finish Later
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-200"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submitRegistration(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-200 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Launching Studio...
                  </>
                ) : (
                  <>
                    Complete & Enter Studio
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreatorRegisterPage;
