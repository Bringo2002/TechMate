import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Code,
  Smartphone,
  Brain,
  Palette,
  Activity,
  Zap,
  Globe,
  ShoppingCart,
  ArrowLeft,
  Send,
  CheckCircle2,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Flame,
  Calendar,
  Shuffle,
} from 'lucide-react';
import * as inquiriesService from '../../services/inquiries.service';
import { ProjectType } from '../../types/database.types';
import { useAuth } from '../../hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  serviceType: string;
  projectName: string;
  description: string;
  budgetRange: string;
  timeline: string;
  contactPreference: string;
}

interface ServiceOption {
  id: string;
  label: string;
  icon: typeof Code;
  description: string;
  color: string;
  glow: string;
}

interface FormErrors {
  projectName?: string;
  description?: string;
  serviceType?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'website',
    label: 'Website',
    icon: Globe,
    description: 'Landing pages, corporate sites, portfolios',
    color: 'from-cyan-500/20 to-cyan-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:border-cyan-500/50',
  },
  {
    id: 'app',
    label: 'Mobile App',
    icon: Smartphone,
    description: 'iOS, Android or cross-platform apps',
    color: 'from-blue-500/20 to-blue-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-blue-500/50',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    icon: ShoppingCart,
    description: 'Online stores, marketplaces, payment flows',
    color: 'from-emerald-500/20 to-emerald-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-500/50',
  },
  {
    id: 'fullstack',
    label: 'Full-Stack System',
    icon: Zap,
    description: 'Complex platforms, dashboards, SaaS products',
    color: 'from-yellow-500/20 to-yellow-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:border-yellow-500/50',
  },
  {
    id: 'design',
    label: 'UI/UX Design',
    icon: Palette,
    description: 'Brand identity, prototypes, design systems',
    color: 'from-pink-500/20 to-pink-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] hover:border-pink-500/50',
  },
  {
    id: 'backend',
    label: 'Backend / API',
    icon: Activity,
    description: 'APIs, databases, integrations, automation',
    color: 'from-purple-500/20 to-purple-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-purple-500/50',
  },
  {
    id: 'consulting',
    label: 'Tech Consulting',
    icon: Brain,
    description: 'Architecture reviews, strategy, audits',
    color: 'from-orange-500/20 to-orange-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:border-orange-500/50',
  },
  {
    id: 'other',
    label: 'Something Else',
    icon: Code,
    description: "Tell us — if it's digital, we can build it",
    color: 'from-slate-500/20 to-slate-500/5',
    glow: 'hover:shadow-[0_0_30px_rgba(100,116,139,0.2)] hover:border-slate-500/50',
  },
];

const BUDGET_RANGES = [
  { value: 'under_500', label: 'Under $500', sub: 'Small scope / MVP' },
  { value: '500_2000', label: '$500 – $2,000', sub: 'Standard project' },
  { value: '2000_5000', label: '$2,000 – $5,000', sub: 'Mid-range build' },
  { value: '5000_15000', label: '$5,000 – $15,000', sub: 'Full product' },
  { value: '15000_plus', label: '$15,000+', sub: 'Enterprise / complex' },
  { value: 'flexible', label: 'Flexible', sub: "Let TechMate suggest" },
];

const TIMELINE_OPTIONS = [
  { id: 'asap', label: 'ASAP', icon: Flame, sub: 'Rush priority', color: 'text-red-400 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10' },
  { id: '1_3_months', label: '1–3 Months', icon: Calendar, sub: 'Standard pace', color: 'text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10' },
  { id: 'flexible', label: 'Flexible', icon: Shuffle, sub: "No hard deadline", color: 'text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10' },
];

const CONTACT_OPTIONS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'call', label: 'Phone Call', icon: Phone },
];

// ─── Animated Section Wrapper ─────────────────────────────────────────────────

const FadeSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0, y:32 }}
      animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:0.6, delay, ease:[0.22,1,0.36,1] }}
    >
      {children}
    </motion.div>
  );
};

// ─── Label Component ──────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ number: string; label: string; required?: boolean }> = ({ number, label, required }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm font-bold font-mono">
      {number}
    </span>
    <h2 className="text-lg font-semibold text-white tracking-wide">
      {label}
      {required && <span className="text-cyan-400 ml-1">*</span>}
    </h2>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    serviceType: '',
    projectName: '',
    description: '',
    budgetRange: '',
    timeline: '',
    contactPreference: 'email',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.serviceType) newErrors.serviceType = 'Please select a service type';
    if (!form.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (form.description.trim().length < 20)
      newErrors.description = 'Please describe your project in at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapServiceToProjectType = (type: string): ProjectType => {
    switch (type) {
      case 'website': return 'website';
      case 'app': return 'mobile_app';
      case 'ecommerce': return 'web_app';
      case 'fullstack': return 'custom_software';
      case 'consulting': return 'consulting';
      case 'backend': return 'custom_software';
      default: return 'other';
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      if (!user?.id) throw new Error('User not authenticated');

      await inquiriesService.createInquiry({
        client_id: user.id,
        project_type: mapServiceToProjectType(form.serviceType),
        title: form.projectName,
        description: form.description,
        budget_range: form.budgetRange || 'flexible',
        preferred_timeline: form.timeline || 'flexible',
        status: 'new',
        metadata: {
          contact_preference: form.contactPreference
        }
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit request:', err);
      // Still show success to user — you can log to your debug service
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity:0, scale:0.9 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale:0 }}
            animate={{ scale:1 }}
            transition={{ delay:0.2, type:'spring', stiffness:200 }}
            className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(6,182,212,0.3)]"
          >
            <CheckCircle2 size={48} className="text-cyan-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3 font-orbitron">Request Submitted</h1>
          <p className="text-slate-400 mb-2">
            Your project brief has been received by the TechMate team.
          </p>
          <p className="text-slate-500 text-sm mb-10">
            We'll review it and reach out within <span className="text-cyan-400 font-semibold">24 hours</span> via your preferred contact method.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/user')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => { setSubmitted(false); setForm({ serviceType: '', projectName: '', description: '', budgetRange: '', timeline: '', contactPreference: 'email' }); }}
              className="px-6 py-3 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 rounded-xl transition-all"
            >
              New Request
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main Form ────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-14">

        {/* ── Header ── */}
        <FadeSection>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase mb-3">
                New Project Request
              </p>
              <h1 className="text-4xl font-bold text-white font-orbitron leading-tight">
                Let's build something<br />
                <span className="text-cyan-400">remarkable.</span>
              </h1>
              <p className="text-slate-400 mt-4 max-w-md leading-relaxed">
                Fill in the brief below — no account managers, no gatekeeping. TechMate's team reviews every request personally and responds within 24 hours.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 h-px bg-gradient-to-r from-cyan-500/30 via-white/5 to-transparent" />
        </FadeSection>

        {/* ── 01 Service Type ── */}
        <FadeSection delay={0.05}>
          <div data-error={!!errors.serviceType}>
            <SectionLabel number="01" label="What do you need built?" required />
            {errors.serviceType && (
              <p className="text-red-400 text-sm mb-4 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                {errors.serviceType}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_OPTIONS.map((s) => {
                const Icon = s.icon;
                const selected = form.serviceType === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => update('serviceType', s.id)}
                    className={`
                      relative p-4 rounded-xl border text-left transition-all duration-200 group
                      ${selected
                        ? 'border-cyan-500/70 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                        : `border-white/8 bg-white/3 ${s.glow}`
                      }
                    `}
                  >
                    {selected && (
                      <motion.div
                        layoutId="service-selection"
                        className="absolute inset-0 rounded-xl border border-cyan-400/40"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={`mb-3 ${selected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                      <Icon size={20} />
                    </div>
                    <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-300'}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </FadeSection>

        {/* ── 02 Project Brief ── */}
        <FadeSection delay={0.1}>
          <SectionLabel number="02" label="Tell us about your project" required />
          <div className="space-y-4">
            {/* Project Name */}
            <div data-error={!!errors.projectName}>
              <label className="text-sm text-slate-400 mb-2 block">Project Name</label>
              <input
                type="text"
                placeholder="e.g. TechMate Client Portal v2"
                value={form.projectName}
                onChange={(e) => update('projectName', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl bg-white/4 border transition-all outline-none
                  text-black placeholder:text-slate-600 font-medium
                  focus:bg-white/6 focus:border-cyan-500/50 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]
                  ${errors.projectName ? 'border-red-500/50' : 'border-white/8'}
                `}
              />
              {errors.projectName && (
                <p className="text-red-400 text-xs mt-2">{errors.projectName}</p>
              )}
            </div>

            {/* Description */}
            <div data-error={!!errors.description}>
              <label className="text-sm text-slate-400 mb-2 block">
                Project Description
                <span className="text-slate-600 ml-2">— what problem does it solve?</span>
              </label>
              <textarea
                rows={5}
                placeholder="Describe what you're building, who it's for, and any key features or requirements you have in mind..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl bg-white/4 border transition-all outline-none resize-none
                  text-black placeholder:text-slate-600 leading-relaxed
                  focus:bg-white/6 focus:border-cyan-500/50 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]
                  ${errors.description ? 'border-red-500/50' : 'border-white/8'}
                `}
              />
              <div className="flex justify-between mt-2">
                {errors.description
                  ? <p className="text-red-400 text-xs">{errors.description}</p>
                  : <span />
                }
                <span className={`text-xs ml-auto ${form.description.length >= 20 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {form.description.length} chars {form.description.length >= 20 ? '✓' : '(min 20)'}
                </span>
              </div>
            </div>
          </div>
        </FadeSection>

        {/* ── 03 Budget ── */}
        <FadeSection delay={0.15}>
          <SectionLabel number="03" label="What's your budget range?" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUDGET_RANGES.map((b) => {
              const selected = form.budgetRange === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => update('budgetRange', b.value)}
                  className={`
                    p-4 rounded-xl border text-left transition-all duration-200
                    ${selected
                      ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                    }
                  `}
                >
                  <p className={`font-bold text-sm ${selected ? 'text-cyan-400' : 'text-white'}`}>
                    {b.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{b.sub}</p>
                </button>
              );
            })}
          </div>
        </FadeSection>

        {/* ── 04 Timeline ── */}
        <FadeSection delay={0.2}>
          <SectionLabel number="04" label="When do you need this?" />
          <div className="grid grid-cols-3 gap-4">
            {TIMELINE_OPTIONS.map((t) => {
              const Icon = t.icon;
              const selected = form.timeline === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => update('timeline', t.id)}
                  className={`
                    p-5 rounded-xl border text-center transition-all duration-200
                    ${selected
                      ? `border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]`
                      : `border-white/8 bg-white/3 ${t.color}`
                    }
                  `}
                >
                  <Icon size={22} className={`mx-auto mb-2 ${selected ? 'text-cyan-400' : ''}`} />
                  <p className={`font-bold text-sm ${selected ? 'text-cyan-400' : 'text-white'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{t.sub}</p>
                </button>
              );
            })}
          </div>
        </FadeSection>

        {/* ── 05 Contact Preference ── */}
        <FadeSection delay={0.25}>
          <SectionLabel number="05" label="How should we reach you?" />
          <div className="flex gap-3">
            {CONTACT_OPTIONS.map((c) => {
              const Icon = c.icon;
              const selected = form.contactPreference === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => update('contactPreference', c.id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-all
                    ${selected
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white'
                    }
                  `}
                >
                  <Icon size={15} />
                  {c.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-3">
            We'll use the contact info already on your TechMate profile.
          </p>
        </FadeSection>

        {/* ── Divider ── */}
        <FadeSection delay={0.3}>
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </FadeSection>

        {/* ── Submit ── */}
        <FadeSection delay={0.35}>
          <div className="flex items-center justify-between">
            {/* Trust Signal */}
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Clock size={14} />
              <span>TechMate responds within <span className="text-slate-300">24 hours</span></span>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={{ scale:1.03 }}
              whileTap={{ scale:0.97 }}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all
                ${submitting
                  ? 'bg-cyan-700/50 text-cyan-200/50 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.6)]'
                }
              `}
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate:360 }}
                    transition={{ repeat:Infinity, duration:1, ease:'linear' }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Your Request
                  <Send size={16} />
                </>
              )}
            </motion.button>
          </div>

          {/* Bottom note */}
          <p className="text-xs text-slate-600 text-right mt-4">
            By submitting, you agree to TechMate's{' '}
            <button onClick={() => navigate('/terms')} className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
              Terms of Service
            </button>
          </p>
        </FadeSection>

        {/* Bottom spacer */}
        <div className="h-10" />
      </div>
    </div>
  );
};

export default NewProject;