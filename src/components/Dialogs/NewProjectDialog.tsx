// src/components/Dialogs/NewProjectDialog.tsx
import { useState } from 'react';
import { X, Loader2, DollarSign, Calendar, AlertCircle, Briefcase, Sparkles, Zap } from 'lucide-react';
import supabase from '../../lib/supabaseClient';

interface NewProjectDialogProps {
  onClose: () => void;
  onProjectCreated: (project: Record<string, unknown>) => void;
}

export default function NewProjectDialog({ onClose, onProjectCreated }: NewProjectDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    type: '',
    budget: '',
    deadline: '',
    priority: 'medium',
    status: 'planning',
    description: '',
  });

  const isFormValid = formData.name && formData.client && formData.type && formData.budget && formData.deadline;

  // AI suggestion based on input
  const generateAiSuggestion = () => {
    if (formData.type && formData.budget) {
      const budgetNum = parseFloat(formData.budget);
      let suggestion = '';
      
      if (formData.type === 'web' && budgetNum > 100000) {
        suggestion = '💡 Consider breaking into phases: Discovery, Design, Development, Testing';
      } else if (formData.type === 'mobile' && budgetNum < 50000) {
        suggestion = '⚠️ Mobile apps typically require $50K+ for quality delivery';
      } else if (formData.type === 'design' && budgetNum > 75000) {
        suggestion = '✨ Premium budget detected - recommend comprehensive brand system';
      } else if (budgetNum > 200000) {
        suggestion = '🎯 Large project - suggest dedicated project manager';
      } else {
        suggestion = '✅ Budget looks appropriate for project scope';
      }
      
      setAiSuggestion(suggestion);
    }
  };

  const handleCreateProject = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      if (!formData.name || !formData.client || !formData.type || !formData.budget || !formData.deadline) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.deadline || isNaN(Date.parse(formData.deadline))) {
        throw new Error('Invalid deadline format. Please select a valid date.');
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(`Authentication error: ${authError.message}`);
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([{
            user_id: user.id,
            name: formData.name,
            client: formData.client,
            type: formData.type,
            budget: parseFloat(formData.budget),
            deadline: formData.deadline,
            priority: formData.priority as any,
            status: formData.status as any,
            description: formData.description || null,
          } as any])
        .select()
        .single();

      if (error) throw new Error(`Supabase insert error: ${error.message}`);

      onProjectCreated(data);
      onClose();
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Animated background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-700/50 p-6 flex items-center justify-between z-10 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              Create New Project
            </h2>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Sparkles className="text-emerald-400" size={14} />
              AI-assisted project setup
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-all group">
            <X className="text-zinc-400 group-hover:text-white transition-colors" size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Client <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Enter client name"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Project Type <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                title="Project Type"
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value });
                  generateAiSuggestion();
                }}
                className="w-full pl-10 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select project type</option>
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="consulting">Consulting</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Budget <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) => {
                    setFormData({ ...formData, budget: e.target.value });
                    generateAiSuggestion();
                  }}
                  onBlur={generateAiSuggestion}
                  placeholder="Enter budget"
                  className="w-full pl-10 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Deadline <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  title="Select a deadline for the project"
                  placeholder="YYYY-MM-DD"
                  className="w-full pl-10 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
              <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-300 mb-1">AI Recommendation</p>
                <p className="text-sm text-purple-200">{aiSuggestion}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Priority</label>
              <select
                title="Select project priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                title="Select project status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
              <span className="text-slate-500 text-xs ml-2">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project scope, goals, and deliverables..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 flex justify-end space-x-4 bg-slate-900/50 backdrop-blur-sm">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateProject}
            disabled={isCreating || !isFormValid}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Creating Project...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Create Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}