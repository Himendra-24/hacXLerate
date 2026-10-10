import React, { useEffect, useState } from 'react';
import { CreatorProfile, PortfolioProject, WorkflowStep } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import {
  User,
  Plus,
  Save,
  CheckCircle2,
  Layers,
  Wand2,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export const CreatorStudioPage: React.FC = () => {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    media_url: '',
    content_type: 'video',
    specialization: 'AI Filmmaking',
    aspect_ratios: ['16:9'],
    commercial_use_status: 'Commercial Rights Granted',
    tools_used: 'Runway Gen-3, Midjourney v6, Topaz Video AI',
    skills_demonstrated: 'Prompt Engineering, Compositing, Camera Motion',
    workflow_steps: [
      { step: 1, name: 'Concept & Prompt Architecture', tool: 'Claude 3.5 Sonnet', description: 'Shot list breakdown and seed prompting.' },
      { step: 2, name: 'Video Diffusion Synthesis', tool: 'Runway Gen-3 Alpha', description: 'Generating continuous 24fps motion with camera pan.' },
      { step: 3, name: 'Upscale & Editorial Grade', tool: 'Topaz & DaVinci Resolve', description: 'Super-resolution 4K upscale and color balancing.' },
    ] as WorkflowStep[],
  });

  useEffect(() => {
    api.getCreators().then((data) => {
      setCreators(data);
      if (data.length > 0) {
        setSelectedCreator(data[0]);
      }
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) return;
    setIsSavingProfile(true);
    try {
      const updated = await api.updateCreator(selectedCreator.id, {
        display_name: selectedCreator.display_name,
        title: selectedCreator.title,
        bio: selectedCreator.bio,
        rate_min: selectedCreator.rate_min,
        rate_max: selectedCreator.rate_max,
        availability_status: selectedCreator.availability_status,
      });
      setSelectedCreator(updated);
      alert('Creator profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddWorkflowStep = () => {
    const nextStepNum = newProject.workflow_steps.length + 1;
    setNewProject({
      ...newProject,
      workflow_steps: [
        ...newProject.workflow_steps,
        {
          step: nextStepNum,
          name: 'Compositing / Post',
          tool: 'After Effects',
          description: 'Refining motion passes and typography lockups.',
        },
      ],
    });
  };

  const handleRemoveWorkflowStep = (idx: number) => {
    setNewProject({
      ...newProject,
      workflow_steps: newProject.workflow_steps.filter((_, i) => i !== idx),
    });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator || !newProject.title.trim()) return;
    setIsAddingProject(true);
    try {
      const created = await api.addPortfolioProject(selectedCreator.id, {
        title: newProject.title,
        description: newProject.description,
        media_url: newProject.media_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000',
        content_type: newProject.content_type,
        specialization: newProject.specialization,
        aspect_ratios: newProject.aspect_ratios,
        commercial_use_status: newProject.commercial_use_status,
        tools_used: newProject.tools_used.split(',').map((t) => t.trim()),
        skills_demonstrated: newProject.skills_demonstrated.split(',').map((s) => s.trim()),
        workflow_steps: newProject.workflow_steps,
        evidence_status: 'Self-reported',
      });

      // Refresh creator
      const refreshed = await api.getCreator(selectedCreator.id);
      setSelectedCreator(refreshed);

      // Reset form
      setNewProject({
        ...newProject,
        title: '',
        description: '',
        media_url: '',
      });

      alert('Portfolio project and workflow recipe added to your studio profile!');
    } catch (err) {
      console.error(err);
      alert('Failed to add portfolio project.');
    } finally {
      setIsAddingProject(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-800 text-slate-300 text-xs mb-2">
            <User className="w-3.5 h-3.5 text-electric-400" />
            <span>Creator Studio Workspace</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white">
            Creator Profile & Workflow Recipes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Document your tools, commercial licensing capabilities, and step-by-step production workflow recipes for matching.
          </p>
        </div>

        {/* Creator Switcher for Demo evaluation */}
        {creators.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Switch Profile:</span>
            <select
              value={selectedCreator?.id}
              onChange={(e) => {
                const found = creators.find((c) => c.id === e.target.value);
                if (found) setSelectedCreator(found);
              }}
              className="bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-500"
            >
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name} ({c.title})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedCreator && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Profile Settings Form */}
          <div className="lg:col-span-5 bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-charcoal-800">
              <img
                src={selectedCreator.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={selectedCreator.display_name}
                className="w-12 h-12 rounded-xl object-cover border border-charcoal-700"
              />
              <div>
                <h3 className="font-display font-bold text-white text-base">
                  {selectedCreator.display_name}
                </h3>
                <span className="text-[11px] text-electric-400 font-mono">
                  {selectedCreator.location || 'Remote'}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Display Name</label>
                <input
                  type="text"
                  value={selectedCreator.display_name}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, display_name: e.target.value })
                  }
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Headline / Title</label>
                <input
                  type="text"
                  value={selectedCreator.title}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, title: e.target.value })
                  }
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Bio & Positioning</label>
                <textarea
                  rows={3}
                  value={selectedCreator.bio}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, bio: e.target.value })
                  }
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-3 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Min Rate ($ USD)</label>
                  <input
                    type="number"
                    value={selectedCreator.rate_min || ''}
                    onChange={(e) =>
                      setSelectedCreator({ ...selectedCreator, rate_min: Number(e.target.value) })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Max Rate ($ USD)</label>
                  <input
                    type="number"
                    value={selectedCreator.rate_max || ''}
                    onChange={(e) =>
                      setSelectedCreator({ ...selectedCreator, rate_max: Number(e.target.value) })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Availability Status</label>
                <select
                  value={selectedCreator.availability_status}
                  onChange={(e) =>
                    setSelectedCreator({ ...selectedCreator, availability_status: e.target.value })
                  }
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Available">Available for campaigns</option>
                  <option value="Busy">Busy (Limited capacity)</option>
                  <option value="Booked">Booked (No new briefs)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-white font-semibold transition-all border border-charcoal-700 flex items-center justify-center gap-2"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Right Column: Add New Portfolio Project with Workflow Recipe */}
          <div className="lg:col-span-7 bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="pb-3 border-b border-charcoal-800">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-electric-400" />
                Add New Portfolio Project & Recipe
              </h3>
              <p className="text-xs text-slate-400">
                Document how you built your work step-by-step. Projects submitted here are labeled <strong>Self-Reported</strong> until evidence verification.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Apex Hypercar Reveal Spec Commercial"
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Narrative, visual style, key challenges solved..."
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-3 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Project Media URL (Image / Video preview)</label>
                  <input
                    type="url"
                    value={newProject.media_url}
                    onChange={(e) => setNewProject({ ...newProject, media_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Content Type</label>
                  <select
                    value={newProject.content_type}
                    onChange={(e) => setNewProject({ ...newProject, content_type: e.target.value })}
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="video">AI Video</option>
                    <option value="cgi">Product CGI</option>
                    <option value="animation">Animation</option>
                    <option value="motion">Motion Design</option>
                    <option value="image">Still Image</option>
                    <option value="audio">Audio / Sound</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Aspect Ratio</label>
                  <select
                    value={newProject.aspect_ratios[0]}
                    onChange={(e) => setNewProject({ ...newProject, aspect_ratios: [e.target.value] })}
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="16:9">16:9 (Landscape / YouTube)</option>
                    <option value="9:16">9:16 (Vertical / TikTok / Reels)</option>
                    <option value="1:1">1:1 (Square Feed)</option>
                    <option value="4:5">4:5 (Portrait Feed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Commercial Status</label>
                  <select
                    value={newProject.commercial_use_status}
                    onChange={(e) =>
                      setNewProject({ ...newProject, commercial_use_status: e.target.value })
                    }
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Commercial Rights Granted">Commercial Rights Granted</option>
                    <option value="Requires Confirmation">Requires Confirmation</option>
                    <option value="Editorial Only">Editorial Only</option>
                  </select>
                </div>
              </div>

              {/* Workflow Steps Builder */}
              <div className="space-y-3 pt-3 border-t border-charcoal-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-electric-400" />
                    Documented Workflow Steps ({newProject.workflow_steps.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddWorkflowStep}
                    className="text-xs text-electric-400 hover:text-electric-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {newProject.workflow_steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-electric-400 font-mono">
                          Step {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={st.name}
                          onChange={(e) => {
                            const updated = [...newProject.workflow_steps];
                            updated[idx].name = e.target.value;
                            setNewProject({ ...newProject, workflow_steps: updated });
                          }}
                          placeholder="Step Name (e.g. Prompting)"
                          className="flex-1 bg-charcoal-900 border border-charcoal-750 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={st.tool}
                          onChange={(e) => {
                            const updated = [...newProject.workflow_steps];
                            updated[idx].tool = e.target.value;
                            setNewProject({ ...newProject, workflow_steps: updated });
                          }}
                          placeholder="Tool / Model"
                          className="w-32 bg-charcoal-900 border border-charcoal-750 rounded-lg px-2.5 py-1 text-xs text-electric-300 font-mono"
                        />
                        {newProject.workflow_steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWorkflowStep(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={st.description}
                        onChange={(e) => {
                          const updated = [...newProject.workflow_steps];
                          updated[idx].description = e.target.value;
                          setNewProject({ ...newProject, workflow_steps: updated });
                        }}
                        placeholder="Description of what was executed in this step..."
                        className="w-full bg-charcoal-900 border border-charcoal-750 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingProject || !newProject.title.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-700 to-electric-600 hover:from-electric-600 hover:to-electric-500 text-white font-semibold shadow-glow-violet transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAddingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Publish Project to Portfolio</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
