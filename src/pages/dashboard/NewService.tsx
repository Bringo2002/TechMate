import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Smartphone, Cloud, Database, Brain, Rocket, 
  Terminal, Sparkles, Briefcase, Server, ArrowLeft, 
  Save, Loader2, Check
} from 'lucide-react';
import supabase from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// Available icons for selection
const ICONS = [
  { name: 'Globe', icon: Globe },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Cloud', icon: Cloud },
  { name: 'Database', icon: Database },
  { name: 'Brain', icon: Brain },
  { name: 'Server', icon: Server },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Terminal', icon: Terminal },
  { name: 'Rocket', icon: Rocket },
];

// Available tailwind colors
const COLORS = [
  { name: 'emerald', hex: '#10b981' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'purple', hex: '#a855f7' },
  { name: 'amber', hex: '#f59e0b' },
  { name: 'cyan', hex: '#06b6d4' },
  { name: 'indigo', hex: '#6366f1' },
  { name: 'rose', hex: '#f43f5e' },
  { name: 'orange', hex: '#f97316' },
];

const NewService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconName: 'Briefcase',
    color: 'emerald',
    isActive: true,
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('service_categories').insert({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.iconName,
        color: formData.color,
        is_active: formData.isActive,
        sort_order: formData.sortOrder,
      });

      if (error) throw error;

      toast.success('Service created successfully!');
      navigate('/dashboard/services');
    } catch (err: any) {
      console.error('Error creating service:', err);
      toast.error(err.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = ICONS.find(i => i.name === formData.iconName)?.icon || Briefcase;

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/services')}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Add New Service</h1>
            <p className="text-gray-400">Configure a new service line for your portfolio</p>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Basics */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Service Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-gray-500"
                    placeholder="e.g., Web Development"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Short Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-gray-500 resize-none"
                    placeholder="Describe what this service entails..."
                  />
                </div>

                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-500 transition-colors">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        {formData.isActive ? 'Active' : 'Draft'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Visuals */}
              <div className="space-y-8 bg-gray-900/30 p-6 rounded-2xl border border-gray-800/50">
                
                {/* Live Preview Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Preview</label>
                  <div className={`p-4 rounded-xl border bg-gradient-to-br from-${formData.color}-900/20 to-gray-900/50 border-${formData.color}-500/30 flex items-center gap-4`}>
                    <div className={`p-3 bg-${formData.color}-500/10 rounded-lg`}>
                      <SelectedIcon className={`w-6 h-6 text-${formData.color}-400`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-white group-hover:text-${formData.color}-400 transition-colors`}>
                        {formData.name || 'Service Name'}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{formData.description || 'Description will appear here'}</p>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Theme Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.name })}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          formData.color === c.name 
                            ? `ring-2 ring-offset-2 ring-offset-gray-900 ring-${c.name}-500 scale-110 shadow-lg` 
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {formData.color === c.name && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Service Icon
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {ICONS.map((i) => {
                      const IconComponent = i.icon;
                      const isSelected = formData.iconName === i.name;
                      return (
                        <button
                          key={i.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, iconName: i.name })}
                          className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                            isSelected 
                              ? `bg-${formData.color}-500/20 border-${formData.color}-500/50 text-${formData.color}-400 shadow-inner` 
                              : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                          } border`}
                          title={i.name}
                        >
                          <IconComponent className="w-6 h-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-10 flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => navigate('/dashboard/services')}
                className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 bg-${formData.color}-500 hover:bg-${formData.color}-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-semibold shadow-lg shadow-${formData.color}-500/20`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Service
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default NewService;
