import React from 'react';
import { X, Brain, Mic, FileText, Search, MessageSquare, Zap, Bot, Sparkles, ChevronRight } from 'lucide-react';

interface AboutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const agents = [
  {
    icon: MessageSquare,
    color: '#0ea5e9',
    name: 'Chat Agent',
    tag: 'NLP · Context-Aware',
    desc: 'Reads your uploaded documents and answers questions with deep contextual understanding. Powered by Gemini Flash.',
  },
  {
    icon: Mic,
    color: '#a78bfa',
    name: 'Audio Agent',
    tag: 'TTS · Multi-Speaker',
    desc: 'Converts research into podcast-style audio with two AI speakers — MD & User — using Gemini TTS engine.',
  },
  {
    icon: FileText,
    color: '#34d399',
    name: 'Briefing Agent',
    tag: 'Summarization · Export',
    desc: 'Generates structured research briefing documents from your sources. Exports to PDF, DOCX, and PPTX.',
  },
  {
    icon: Search,
    color: '#fb923c',
    name: 'SEO Agent',
    tag: 'Audit · Analysis',
    desc: 'Performs deep technical SEO audits with Core Web Vitals, metadata analysis, and fix recommendations.',
  },
  {
    icon: Brain,
    color: '#f472b6',
    name: 'Research Agent',
    tag: 'Multi-Modal · Synthesis',
    desc: 'Synthesizes insights across text, images, PDFs, and audio sources into unified research intelligence.',
  },
];

export const AboutPanel: React.FC<AboutPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed left-0 top-0 h-full z-[170] w-[340px] flex flex-col overflow-hidden"
        style={{
          background: 'rgba(8,12,24,0.97)',
          borderRight: '1px solid rgba(14,165,233,0.2)',
          boxShadow: '4px 0 40px rgba(14,165,233,0.1)',
          animation: 'slideInLeft 0.3s cubic-bezier(0.34,1.2,0.64,1)'
        }}
      >
        {/* Top glow line */}
        <div className="h-px w-full" style={{background: 'linear-gradient(90deg, rgba(14,165,233,0.8), rgba(139,92,246,0.6), transparent)'}} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'}}>
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase" style={{
                background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>AI Agents</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">MD Researcher Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Intro */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="p-3 rounded-xl flex items-start gap-3" style={{background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)'}}>
            <Sparkles size={14} className="text-sky-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              MD Researcher uses specialized AI agents, each trained for a specific research task. Together they form a complete research intelligence system.
            </p>
          </div>
        </div>

        {/* Agents list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
          {agents.map((agent, i) => (
            <div
              key={i}
              className="p-4 rounded-xl transition-all group cursor-default"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${agent.color}40`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background: `${agent.color}18`, border: `1px solid ${agent.color}30`}}>
                  <agent.icon size={16} style={{color: agent.color}} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-200">{agent.name}</h3>
                    <ChevronRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{color: agent.color}}>{agent.tag}</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1.5">{agent.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-sky-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Powered by Google Gemini</span>
          </div>
        </div>

        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
};
