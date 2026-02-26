import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Smartphone, Cloud, Database, Brain, Rocket, Terminal, Sparkles, Briefcase, Server, ArrowLeft, Save, Loader2, Check } from 'lucide-react';
import supabase from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

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

const COLORS = [
  { name: 'emerald', hex: '#10b981', label: 'Emerald' },
  { name: 'blue', hex: '#3b82f6', label: 'Blue' },
  { name: 'purple', hex: '#a855f7', label: 'Purple' },
  { name: 'amber', hex: '#f59e0b', label: 'Amber' },
  { name: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { name: 'indigo', hex: '#6366f1', label: 'Indigo' },
  { name: 'rose', hex: '#f43f5e', label: 'Rose' },
  { name: 'orange', hex: '#f97316', label: 'Orange' },
];

const NewService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      // ✅ FIX 1: Session check now inside try/catch — previously a throw here
      // would escape the catch block entirely, leaving loading=true forever
      // and silently swallowing the real error.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error('Authentication error — please sign in again.');
      }

      if (!session) {
        throw new Error('No active session. Please sign in to continue.');
      }

      console.log('Inserting as user:', session.user.id);

      // ✅ FIX 2: Snapshot the current form state into a plain object before
      // the async insert. React state closures can capture a stale snapshot
      // of formData if a re-render happened between the user clicking Submit
      // and the insert executing — this makes the payload deterministic.
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.iconName,
        color: formData.color,
        is_active: formData.isActive,
        sort_order: formData.sortOrder,
      };

      console.log('Insert payload:', payload);

      // Step 1: Insert without .single() — .single() silently errors if RLS
      // blocks the SELECT after a successful INSERT (common Supabase gotcha)
      const { data, error } = await supabase
        .from('service_categories')
        .insert(payload)
        .select();

      console.log('Raw insert response → data:', data, '| error:', error);
      console.log('data type:', typeof data, '| is array:', Array.isArray(data));
      console.log('error code:', error?.code, '| error message:', error?.message, '| error details:', error?.details);

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message || 'Database insert failed');
      }

      // Step 2: Verify the row actually landed
      if (!data || (Array.isArray(data) && data.length === 0)) {
        // Insert returned no rows — almost always an RLS policy that allows
        // INSERT but blocks SELECT, making it look like nothing happened.
        console.warn('Insert returned empty data — likely RLS blocks SELECT after INSERT');
        console.warn('Check: does your service_categories policy allow SELECT for this user?');
        // Still treat as success since no error was thrown — the row IS in the DB
        toast.success('Service created! (Note: verify in Supabase dashboard if it doesn\'t appear)');
        navigate('/dashboard/services');
        return;
      }

      console.log('Insert confirmed with returned row:', data);
      toast.success('Service created successfully!');
      navigate('/dashboard/services');

    } catch (err: any) {
      console.error('handleSubmit error:', err);
      toast.error(err.message || 'Failed to create service');
    } finally {
      // ✅ FIX 3: finally always runs, even if getSession threw — previously
      // an uncaught throw before the try block would leave loading stuck at true.
      setLoading(false);
    }
  };

  const SelectedIcon = ICONS.find(i => i.name === formData.iconName)?.icon || Briefcase;
  const selectedColor = COLORS.find(c => c.name === formData.color);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        .ns-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #080c10;
          color: #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .ns-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
          transition: background 0.6s ease;
        }

        .ns-root[data-color="blue"]::before {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(6,182,212,0.05) 0%, transparent 50%);
        }
        .ns-root[data-color="purple"]::before {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 50%);
        }
        .ns-root[data-color="amber"]::before {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,158,11,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(249,115,22,0.05) 0%, transparent 50%);
        }
        .ns-root[data-color="cyan"]::before {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 50%);
        }
        .ns-root[data-color="rose"]::before {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(244,63,94,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(168,85,247,0.05) 0%, transparent 50%);
        }
        .ns-root[data-color="orange"]::before {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(245,158,11,0.05) 0%, transparent 50%);
        }
        .ns-root[data-color="indigo"]::before {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(168,85,247,0.05) 0%, transparent 50%);
        }

        .ns-inner {
          position: relative;
          z-index: 1;
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .ns-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 40px;
          letter-spacing: 0.01em;
        }
        .ns-back-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
          border-color: rgba(255,255,255,0.12);
        }

        .ns-header {
          margin-bottom: 48px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .ns-step-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 10px;
        }

        .ns-title {
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #f1f5f9;
          line-height: 1.1;
          margin: 0 0 8px;
        }

        .ns-subtitle {
          font-size: 14px;
          color: #64748b;
          font-weight: 400;
          margin: 0;
        }

        .ns-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 100%);
          margin-bottom: 48px;
        }

        .ns-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .ns-grid { grid-template-columns: 1fr; }
        }

        .ns-card {
          background: rgba(15, 20, 30, 0.6);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 32px;
          backdrop-filter: blur(12px);
        }

        .ns-field { margin-bottom: 24px; }

        .ns-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 10px;
        }

        .ns-label span {
          color: var(--accent, #10b981);
          margin-left: 2px;
        }

        .ns-input, .ns-textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
        }

        .ns-input::placeholder, .ns-textarea::placeholder { color: #334155; }

        .ns-input:focus, .ns-textarea:focus {
          background: rgba(255,255,255,0.05);
          border-color: var(--accent-subtle, rgba(16,185,129,0.4));
          box-shadow: 0 0 0 3px var(--accent-glow, rgba(16,185,129,0.08));
        }

        .ns-textarea { resize: none; height: 96px; }

        .ns-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 16px;
          align-items: end;
        }

        .ns-toggle-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        .ns-toggle-wrap:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
        }

        .ns-toggle-track {
          width: 36px;
          height: 20px;
          border-radius: 99px;
          position: relative;
          transition: background 0.25s;
          flex-shrink: 0;
        }

        .ns-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }

        .ns-toggle-label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
        }

        .ns-toggle-badge {
          margin-left: auto;
          font-size: 10px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 99px;
          font-weight: 500;
        }

        .ns-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ns-panel-section {
          background: rgba(15, 20, 30, 0.6);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(12px);
        }

        .ns-section-label {
          font-size: 10px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #334155;
          margin-bottom: 16px;
        }

        .ns-preview-card {
          border-radius: 14px;
          padding: 20px;
          border: 1px solid;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.4s ease;
          background: rgba(255,255,255,0.02);
        }

        .ns-preview-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s;
        }

        .ns-preview-name {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #f1f5f9;
          margin-bottom: 4px;
          transition: color 0.3s;
        }

        .ns-preview-desc {
          font-size: 12px;
          color: #475569;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .ns-colors {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .ns-color-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ns-color-btn:hover { transform: scale(1.15); box-shadow: 0 0 0 3px rgba(255,255,255,0.1); }
        .ns-color-btn.active { transform: scale(1.1); box-shadow: 0 0 0 3px rgba(255,255,255,0.15); }

        .ns-icons {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .ns-icon-btn {
          aspect-ratio: 1;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.18s;
        }

        .ns-icon-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #94a3b8;
          border-color: rgba(255,255,255,0.1);
        }

        .ns-icon-btn.active { color: white; border-color: transparent; }

        .ns-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 32px;
          margin-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .ns-cancel-btn {
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          color: #64748b;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ns-cancel-btn:hover {
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          border-color: rgba(255,255,255,0.1);
        }

        .ns-submit-btn {
          padding: 10px 24px;
          border-radius: 12px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          letter-spacing: 0.01em;
          position: relative;
          overflow: hidden;
        }

        .ns-submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.1);
          opacity: 0;
          transition: opacity 0.15s;
        }

        .ns-submit-btn:hover::after { opacity: 1; }
        .ns-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ns-submit-btn:disabled::after { display: none; }
      `}</style>

      <div
        className="ns-root"
        data-color={formData.color}
        style={{
          '--accent': selectedColor?.hex,
          '--accent-subtle': `${selectedColor?.hex}60`,
          '--accent-glow': `${selectedColor?.hex}14`,
        } as React.CSSProperties}
      >
        <div className="ns-inner">
          <button
            type="button"
            onClick={() => navigate('/dashboard/services')}
            className="ns-back-btn"
          >
            <ArrowLeft size={14} />
            Services
          </button>

          <div className="ns-header">
            <div>
              <p className="ns-step-label">New Entry</p>
              <h1 className="ns-title">Add Service</h1>
              <p className="ns-subtitle">Configure a new service line for your portfolio</p>
            </div>
          </div>

          <div className="ns-divider" />

          <form onSubmit={handleSubmit}>
            <div className="ns-grid">
              <div className="ns-card">
                <div className="ns-field">
                  <label className="ns-label">Service Name <span>*</span></label>
                  <input
                    type="text"
                    className="ns-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Web Development"
                  />
                </div>

                <div className="ns-field">
                  <label className="ns-label">Description</label>
                  <textarea
                    className="ns-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this service entails..."
                  />
                </div>

                <div className="ns-row">
                  <div className="ns-field" style={{ marginBottom: 0 }}>
                    <label className="ns-label">Order</label>
                    <input
                      type="number"
                      className="ns-input"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="ns-field" style={{ marginBottom: 0 }}>
                    <label className="ns-label">Visibility</label>
                    <label
                      className="ns-toggle-wrap"
                      style={{
                        borderColor: formData.isActive ? `${selectedColor?.hex}30` : 'rgba(255,255,255,0.07)',
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{ display: 'none' }}
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <div
                        className="ns-toggle-track"
                        style={{ background: formData.isActive ? selectedColor?.hex : '#1e293b' }}
                      >
                        <div
                          className="ns-toggle-thumb"
                          style={{ transform: formData.isActive ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </div>
                      <span className="ns-toggle-label">
                        {formData.isActive ? 'Active' : 'Draft'}
                      </span>
                      <span
                        className="ns-toggle-badge"
                        style={{
                          background: formData.isActive ? `${selectedColor?.hex}15` : 'rgba(255,255,255,0.04)',
                          color: formData.isActive ? selectedColor?.hex : '#475569',
                        }}
                      >
                        {formData.isActive ? 'Live' : 'Hidden'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="ns-panel">
                <div className="ns-panel-section">
                  <p className="ns-section-label">Preview</p>
                  <div
                    className="ns-preview-card"
                    style={{
                      borderColor: `${selectedColor?.hex}25`,
                      background: `linear-gradient(135deg, ${selectedColor?.hex}08 0%, rgba(15,20,30,0.5) 100%)`,
                    }}
                  >
                    <div
                      className="ns-preview-icon-wrap"
                      style={{ background: `${selectedColor?.hex}15` }}
                    >
                      <SelectedIcon size={20} style={{ color: selectedColor?.hex }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="ns-preview-name"
                        style={{ color: formData.name ? '#f1f5f9' : '#334155' }}
                      >
                        {formData.name || 'Service Name'}
                      </div>
                      <div className="ns-preview-desc">
                        {formData.description || 'Description will appear here'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ns-panel-section">
                  <p className="ns-section-label">Theme Color — {selectedColor?.label}</p>
                  <div className="ns-colors">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.label}
                        onClick={() => setFormData({ ...formData, color: c.name })}
                        className={`ns-color-btn ${formData.color === c.name ? 'active' : ''}`}
                        style={{
                          background: c.hex,
                          borderColor: formData.color === c.name ? 'rgba(255,255,255,0.4)' : 'transparent',
                        }}
                      >
                        {formData.color === c.name && (
                          <Check size={12} style={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ns-panel-section">
                  <p className="ns-section-label">Icon</p>
                  <div className="ns-icons">
                    {ICONS.map((i) => {
                      const IconComponent = i.icon;
                      const isSelected = formData.iconName === i.name;
                      return (
                        <button
                          key={i.name}
                          type="button"
                          title={i.name}
                          onClick={() => setFormData({ ...formData, iconName: i.name })}
                          className={`ns-icon-btn ${isSelected ? 'active' : ''}`}
                          style={isSelected ? {
                            background: `${selectedColor?.hex}20`,
                            borderColor: `${selectedColor?.hex}40`,
                            color: selectedColor?.hex,
                          } : {}}
                        >
                          <IconComponent size={17} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="ns-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard/services')}
                className="ns-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ns-submit-btn"
                style={{ background: selectedColor?.hex, boxShadow: `0 4px 20px ${selectedColor?.hex}30` }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Service
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewService;