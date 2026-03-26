
import React, { useState, useMemo } from 'react';
import { FileText, Printer, RefreshCw, Wand2, Sparkles, Download, ArrowRight, Layout, BookOpen, Layers, CheckCircle2, Circle, Loader2, Check, FileDown, ChevronDown, NotebookPen, Target } from 'lucide-react';
import { SourceDocument, BriefingStatus, AppSettings } from '../types';
import ReactMarkdown from 'react-markdown';
import { t } from '../utils/translations';
import { triggerPDFExport } from '../utils/printUtils';
import { exportBriefingToDOCX } from '../utils/exportUtils';

interface BriefingDocProps {
  sources: SourceDocument[];
  status: BriefingStatus;
  content: string | null;
  onGenerate: (prompt?: string, targetContent?: string) => void;
  settings: AppSettings;
}

export const BriefingDoc: React.FC<BriefingDocProps> = ({ sources, status, content, onGenerate, settings }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [targetContent, setTargetContent] = useState('');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const activeSources = sources.filter(s => s.active);

  const pages = useMemo(() => {
    if (!content) return [];
    const sections = content.split(/(?=^#{1,2} )/m);
    const result: string[] = [];
    let current = "";
    sections.forEach(section => {
      if (current.length > 1800) {
        result.push(current);
        current = section;
      } else {
        current += section;
      }
    });
    if (current) result.push(current);
    return result;
  }, [content]);

  useMemo(() => {
    setSelectedPages(pages.map((_, i) => i));
  }, [pages]);

  const handleExportPDF = () => {
    if (!content) return;
    setShowExportMenu(false);
    triggerPDFExport("TOM_Intelligence_Briefing", "printing-briefing", () => setIsExporting(true), () => setIsExporting(false));
  };

  const handleExportWord = async () => {
    if (!content) return;
    setShowExportMenu(false);
    setIsExporting(true);
    try { await exportBriefingToDOCX(content, "TOM Research Briefing"); } finally { setIsExporting(false); }
  };

  const togglePageSelection = (idx: number) => {
    setSelectedPages(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 print:bg-white flex flex-col items-center no-scrollbar">
      <div className="max-w-4xl w-full p-4 md:p-10 space-y-6 flex-1">
        
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-8 print:hidden">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight uppercase">
                   <div className="p-2 bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-500/20"><FileText size={20} /></div>
                   Research Briefing
                 </h2>
                 <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Synthesize intelligence into professional reports.</p>
              </div>
              <div className="flex gap-2 relative">
                 {content && (
                    <>
                      <button onClick={() => setShowExportMenu(!showExportMenu)} disabled={isExporting} className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                         {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Export Report <ChevronDown size={14} />
                      </button>
                      {showExportMenu && (
                        <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-top-2">
                           <button onClick={handleExportPDF} className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50"><Printer size={16} className="text-red-500" /> Print to PDF</button>
                           <button onClick={handleExportWord} className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center gap-3"><FileDown size={16} className="text-blue-500" /> Download Word</button>
                        </div>
                      )}
                    </>
                 )}
              </div>
           </div>

           <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><Target size={12} className="text-primary-500" /> Target Content/Page</label>
                    <input 
                      type="text" 
                      value={targetContent}
                      onChange={(e) => setTargetContent(e.target.value)}
                      placeholder="e.g. Page 12, Introduction..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><NotebookPen size={12} className="text-primary-500" /> Specific Focus</label>
                    <input 
                      type="text" 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Summary focus..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                    />
                 </div>
              </div>
              <button 
                onClick={() => onGenerate(customPrompt, targetContent)}
                disabled={activeSources.length === 0 || status === 'generating'}
                className="w-full bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-2xl active:scale-95"
              >
                {status === 'generating' ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Generate Research Report
              </button>
           </div>
        </div>

        {content && (
           <div className="flex flex-wrap gap-2 print:hidden pb-2 px-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center px-1">Navigation Index:</span>
              {pages.map((_, i) => (
                 <button key={i} onClick={() => togglePageSelection(i)} className={`px-4 py-2 rounded-xl text-[9px] font-black border transition-all flex items-center gap-2 uppercase tracking-widest ${selectedPages.includes(i) ? 'bg-primary-50 border-primary-200 text-primary-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                    {selectedPages.includes(i) ? <Check size={10} /> : <Circle size={10} />} Page {i + 1}
                 </button>
              ))}
           </div>
        )}

        {content ? (
           <div className="space-y-12 pb-32">
              {pages.map((pageContent, idx) => (
                <div key={idx} className={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 min-h-[1050px] flex flex-col p-0 overflow-hidden rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-700 relative page-break-after-always ${!selectedPages.includes(idx) ? 'print:hidden' : ''}`}>
                  <div className="p-12 border-b border-slate-50" style={{ backgroundColor: settings.header.backgroundColor, textAlign: settings.header.alignment }}>
                    <div style={{ fontFamily: settings.header.fontFamily, fontSize: `${settings.header.fontSize * 1.5}px`, color: settings.header.textColor, fontWeight: settings.header.isBold ? 'bold' : 'normal' }}>{settings.header.text}</div>
                  </div>
                  <div className="p-12 md:p-20 flex-1">
                    <article className="prose prose-sm md:prose-base max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-900 prose-p:font-bold prose-p:leading-relaxed">
                        <div className="text-slate-900"><ReactMarkdown>{pageContent}</ReactMarkdown></div>
                    </article>
                  </div>
                  <div className="p-10 border-t border-slate-50 mt-auto bg-slate-50/30" style={{ backgroundColor: settings.footer.backgroundColor, textAlign: settings.footer.alignment }}>
                    <div className="flex items-center justify-between">
                       <div style={{ fontFamily: settings.footer.fontFamily, fontSize: `${settings.footer.fontSize * 1.2}px`, color: settings.footer.textColor }}>{settings.footer.text}</div>
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Section Index: {idx + 1}</div>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        ) : status === 'generating' ? (
           <div className="py-60 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-primary-500 animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-primary-500"><Layers size={32} /></div>
              </div>
              <div className="space-y-2">
                 <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">Synthesizing Document Architecture</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling source intelligence protocols...</p>
              </div>
           </div>
        ) : (
           <div className="py-60 flex flex-col items-center justify-center text-center opacity-20 group">
              <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <NotebookPen size={48} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Drafting Terminal Idle</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Initialize knowledge sources to build a blueprint.</p>
           </div>
        )}
      </div>
    </div>
  );
};
