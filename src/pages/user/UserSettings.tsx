import React, { useState } from "react";
import { 
  User, Shield, Zap, CreditCard, History, Layout, 
  Terminal, Globe, ChevronRight, CheckCircle2, 
  AlertCircle, ArrowUpRight, Plus, Search, Settings2
} from "lucide-react";

// --- High-Performance Sub-Components ---

const StatusBadge = ({ type }: { type: 'healthy' | 'warning' | 'critical' }) => {
  const styles = {
    healthy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tight ${styles[type]}`}>
      <span className={`w-1 h-1 rounded-full animate-pulse ${type === 'healthy' ? 'bg-emerald-400' : 'bg-current'}`} />
      {type}
    </span>
  );
};

// --- Main Transformation ---

export default function ControlCenter() {
  const [activeSection, setActiveSection] = useState("intelligence");

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#ededed] font-sans overflow-hidden">
      
      {/* COLUMN 1: NAVIGATION (Thin, Minimal) */}
      <nav className="w-20 lg:w-64 border-r border-white/5 bg-[#080808] flex flex-col items-center lg:items-start transition-all">
        <div className="p-6 w-full flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm" />
          </div>
          <span className="hidden lg:block font-bold text-lg tracking-tighter">ELITEX OS</span>
        </div>

        <div className="flex-1 w-full px-3 space-y-1">
          {[
            { id: 'intelligence', label: 'AI Intelligence', icon: Zap },
            { id: 'security', label: 'Security Vault', icon: Shield },
            { id: 'billing', label: 'Capital & Usage', icon: CreditCard },
            { id: 'workspace', label: 'Interface', icon: Layout },
            { id: 'developer', label: 'API & Dev', icon: Terminal },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeSection === item.id ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <item.icon size={20} />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* COLUMN 2: CENTER WORKSPACE (Focused) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar border-r border-white/5">
        <header className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md px-10 py-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono text-gray-500 uppercase tracking-[0.2em]">System / {activeSection}</h2>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800" />)}
              </div>
              <button className="p-2 hover:bg-white/5 rounded-full" title="Add new item"><Plus size={18} /></button>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto py-12 px-10">
          {activeSection === 'intelligence' && <IntelligenceSection />}
          {activeSection === 'workspace' && <WorkspaceSection />}
        </div>
      </main>

      {/* COLUMN 3: CONTEXTUAL INFO (The "Brain") */}
      <aside className="hidden xl:flex w-80 bg-[#050505] flex-col p-6 space-y-8">
        <div>
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Health Monitor</h3>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">System API</span>
              <StatusBadge type="healthy" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Identity Provider</span>
              <StatusBadge type="healthy" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Database Cluster</span>
              <StatusBadge type="warning" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Live Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 items-start">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                <div>
                  <p className="text-xs font-medium text-gray-200">API Key "Prod-Main" created</p>
                  <p className="text-[10px] text-gray-500 font-mono">2 mins ago • 192.168.1.1</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

// --- Dynamic Sections ---

function IntelligenceSection() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Zap size={20} /></div>
          <h3 className="text-xl font-bold">Autopilot Capabilities</h3>
        </div>
        <div className="grid gap-4">
          <ToggleItem 
            title="Predictive Resource Scaling" 
            desc="AI automatically allocates cloud resources based on traffic patterns."
            active={true}
          />
          <ToggleItem 
            title="Semantic Anomaly Detection" 
            desc="Detects logic errors in code flow before they reach production."
            active={false}
          />
        </div>
      </section>

      <section className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20">
        <h4 className="font-bold flex items-center gap-2 mb-2">
          <ArrowUpRight size={16} className="text-blue-400" /> 
          Performance Boost Available
        </h4>
        <p className="text-sm text-gray-400 mb-4">We've noticed 14% latency in your US-East node. Switch to Edge Computing to resolve.</p>
        <button className="text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500">
          Optimize Now
        </button>
      </section>
    </div>
  );
}

function WorkspaceSection() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-bold mb-6">Interface Themes</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 rounded-xl bg-[#111] border-2 border-white/20 p-4 flex flex-col justify-between">
            <span className="text-xs font-bold tracking-tighter">Carbon (Standard)</span>
            <CheckCircle2 size={16} className="text-blue-500" />
          </div>
          <div className="h-32 rounded-xl bg-white p-4 flex flex-col justify-between border-2 border-transparent">
            <span className="text-xs font-bold tracking-tighter text-black">Paper (Light)</span>
          </div>
        </div>
      </div>
      <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
        <h4 className="text-sm font-bold mb-4">Density Level</h4>
        <label htmlFor="density-range" className="sr-only">Adjust Density Level</label>
        <input id="density-range" type="range" className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none" />
        <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono uppercase">
          <span>Comfortable</span>
          <span>Compact</span>
          <span>Scientific</span>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ title, desc, active }: { title: string, desc: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
      <div className="max-w-[80%]">
        <h5 className="text-sm font-bold group-hover:text-white transition-colors">{title}</h5>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-gray-800'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}