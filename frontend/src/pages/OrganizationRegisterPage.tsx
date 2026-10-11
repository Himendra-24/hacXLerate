import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, ArrowRight, ArrowLeft, CheckCircle2,
  DollarSign, Globe, Briefcase, Loader2, AlertCircle
} from 'lucide-react';

export const OrganizationRegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    // Step 1: Account Owner
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: Organization
    companyName: '',
    type: 'brand' as 'brand' | 'agency',
    industry: 'Consumer Tech & Electronics',
    website: '',
    description: '',
    logoUrl: '',

    // Step 3: Campaign Preferences
    contentCategories: ['Commercial Video', '3D Product CGI'],
    budgetRange: '$5,000 – $15,000',
    preferredSpecializations: ['AI Filmmaking', 'Product CGI']
  });

  const availableIndustries = [
    'Consumer Tech & Electronics', 'Automotive & Mobility', 'Luxury & Fashion',
    'Gaming & Entertainment', 'CPG & Food/Beverage', 'B2B SaaS & Enterprise', 'Media & Advertising Agency'
  ];

  const suggestedCategories = [
    'Commercial Video', '3D Product CGI', 'Social Ad Sequences',
    'Cinematic Spec Teasers', 'Virtual Production Worlds', 'Generative Visual Effects'
  ];

  const suggestedSpecializations = [
    'AI Filmmaking', 'Product CGI', 'Motion Design', 'Visual Effects',
    'Fashion & Editorial', 'Gaming & Cinematic Worlds'
  ];

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      contentCategories: prev.contentCategories.includes(cat)
        ? prev.contentCategories.filter(c => c !== cat)
        : [...prev.contentCategories, cat]
    }));
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSpecializations: prev.preferredSpecializations.includes(spec)
        ? prev.preferredSpecializations.filter(s => s !== spec)
        : [...prev.preferredSpecializations, spec]
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.contactName.trim()) {
        setError('Please enter contact person name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Please enter a valid work email.');
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
    } else if (currentStep === 2) {
      if (!formData.companyName.trim()) {
        setError('Please enter your company or agency name.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
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

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      display_name: formData.contactName.trim(),
      role: 'brand' as const,
      company_name: formData.companyName.trim() || `${formData.contactName.trim()}'s Studio`,
      type: formData.type,
      industry: formData.industry,
      website: formData.website.trim(),
      logo_url: formData.logoUrl.trim(),
      description: formData.description.trim() || `Official workspace for ${formData.companyName}.`,
      preferred_specializations: formData.preferredSpecializations,
      budget_range: formData.budgetRange
    };

    try {
      await register(payload);
      navigate('/organization/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-6 sm:p-10">
        
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5 text-slate-900">
              <Building2 className="w-4 h-4 text-violet-600" />
              Organization Registration
            </span>
            <span>Step {step} of 3</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-[11px] font-medium text-slate-400">
            <span className={step >= 1 ? 'text-slate-900 font-semibold' : ''}>Account Owner</span>
            <span className={step >= 2 ? 'text-slate-900 font-semibold' : ''}>Organization Info</span>
            <span className={step >= 3 ? 'text-slate-900 font-semibold' : ''}>Campaign Preferences</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* STEP 1: ACCOUNT OWNER */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Account Owner Details</h2>
              <p className="text-sm text-slate-600 mt-1">
                The primary owner credentials for managing organization members and campaign budgets.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. David Sterling"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="david@acmemobility.design"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ORGANIZATION PROFILE */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Organization Profile</h2>
              <p className="text-sm text-slate-600 mt-1">
                Tell creators about your company brand or production agency.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Organization / Company Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Acme Mobility Design Labs"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Organization Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as 'brand' | 'agency' })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white"
                  >
                    <option value="brand">Brand / In-House Studio</option>
                    <option value="agency">Creative Agency / Production House</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Industry Sector
                  </label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white"
                  >
                    {availableIndustries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Website (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://acmemobility.design"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Organization Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of your commercial brand vision, production volume, and creative needs..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or brand logo link"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CAMPAIGN PREFERENCES */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Campaign Preferences</h2>
              <p className="text-sm text-slate-600 mt-1">
                Configure default matching parameters for your campaign briefs.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Content Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedCategories.map(cat => {
                    const isSelected = formData.contentCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Typical Campaign Budget Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['$1,500 – $5,000', '$5,000 – $15,000', '$15,000 – $35,000', '$35,000+'].map(bg => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => setFormData({ ...formData, budgetRange: bg })}
                      className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        formData.budgetRange === bg
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Creator Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedSpecializations.map(spec => {
                    const isSelected = formData.preferredSpecializations.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{spec}
                      </button>
                    );
                  })}
                </div>
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
              to="/organization/login"
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Existing organization? Sign in
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
                Save & Complete Later
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submitRegistration(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up Organization...
                  </>
                ) : (
                  <>
                    Launch Brand Hub
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

export default OrganizationRegisterPage;
