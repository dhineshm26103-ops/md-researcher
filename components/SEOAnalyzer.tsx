import React, { useState, useEffect } from 'react';
import { SourceDocument, SEOAnalysisResult, SEOStatus, Language, AppSettings, SEOIssue, AudioStatus, SEOHistoryItem } from '../types';
import { 
  BarChart3, RefreshCw, AlertTriangle, CheckCircle, Smartphone, Monitor, Layout, 
  Zap, Volume2, Pause, Loader2,
  Globe2, Sparkles, Download,
  Activity, Target, ShieldCheck, FileSearch, Eye, MousePointer2, Timer, FileBarChart, ArrowRight, FileText, FileCode, ChevronDown, Database, Search, TrendingUp, Shield, Lock, Wand2, Plus, Image as ImageIcon, History, Layers, Trash2, ExternalLink, Info, Code, Gauge, Edit2, Check, X
} from 'lucide-react';
import { suggestSEOPrompt } from '../services/geminiService';
import { triggerPDFExport } from '../utils/printUtils';
import { exportToPPTX, exportToDOCX } from '../utils/exportUtils';
import { t } from '../utils/translations';

interface SEOAnalyzerProps {
  sources: SourceDocument[];
  status: SEOStatus;
  result: SEOAnalysisResult | null;
  history: SEOHistoryItem[];
  onAnalyze: (options: {url?: string; customPrompt?: string}) => void;
  onSelectHistoryItem: (item: SEOHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onRenameHistoryItem: (id: string, name: string) => void;
  language: Language;
  settings: AppSettings;
  onPlaySummary: (result: SEOAnalysisResult) => void;
  isSummaryPlaying: boolean;
  audioStatus: AudioStatus;
}

const ScoreDial: React.FC<{ score: number, label: string, colorClass: string }> = ({ score, label, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-xl transition-all duration-500 card-to-print">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 group-hover:bg-blue-500 transition-colors"></div>
      <div className="relative w-24 h-24 mb-3">
         <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * score) / 100} className={`${colorClass} transition-all duration-1000 ease-out`} />
         </svg>
         <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black text-gray-900">{score}%</span>
         </div>
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export const SEOAnalyzer: React.FC<SEOAnalyzerProps> = ({ 
  sources, status, result, history, onAnalyze, onSelectHistoryItem, onDeleteHistoryItem, onRenameHistoryItem, language, settings, onPlaySummary, isSummaryPlaying, audioStatus
}) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'technical' | 'roadmap' | 'history'>('overview');
  const [isPreparingPDF, setIsPreparingPDF] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activeSources = sources.filter(s => s.active);
  const isUrlValid = targetUrl.trim().length > 0 && (targetUrl.startsWith('http') || targetUrl.includes('.'));

  const handleAnalyze = (overridePrompt?: string) => {
    if (!targetUrl.trim() && activeSources.length === 0) {
      alert("Please enter a URL or activate sources to begin.");
      return;
    }
    onAnalyze({ 
      url: isUrlValid ? targetUrl : undefined, 
      customPrompt: overridePrompt || customPrompt 
    });
    setActiveTab('overview');
  };

  const handleExportPDF = () => {
    if (!result) return;
    triggerPDFExport(
      `SEO_BLUEPRINT_${result.meta.title.replace(/\s+/g, '_')}`,
      'printing-seo',
      () => setIsPreparingPDF(true),
      () => setIsPreparingPDF(false)
    );
    setShowExportOptions(false);
  };

  const handleExportWord = async () => {
    if (!result) return;
    try { await exportToDOCX(result, targetUrl || 'INTERNAL ANALYSIS'); } catch (e) { console.error(e); }
    setShowExportOptions(false);
  };

  const handleExportPPT = async () => {
    if (!result) return;
    try { await exportToPPTX(result, targetUrl || 'INTERNAL ANALYSIS'); } catch (e) { console.error(e); }
    setShowExportOptions(false);
  };

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveRename = (id: string) => {
    if (editName.trim()) {
      onRenameHistoryItem(id, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] print:bg-white flex flex-col relative no-scrollbar printable-root" id="seo-analyzer-container">
      <div className="max-w-6xl mx-auto p-4 md:p-10 w-full flex-1">
        
        {/* Header Section */}
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl rotate-2 hover:rotate-0 transition-transform">
                <BarChart3 size={32} />
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">{t('seo.titleLong', language)}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest">{t('seo.enterprise', language)}</span>
                   <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">{t('seo.deterministic', language)}</p>
                </div>
              </div>
           </div>
           
           <div className="flex gap-3">
              {result && status !== 'generating' && (
                <>
                   <button 
                     onClick={() => onPlaySummary(result)}
                     disabled={audioStatus === 'generating'}
                     className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isSummaryPlaying ? 'bg-red-50 text-red-600 border border-red-100 shadow-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                   >
                      {audioStatus === 'generating' ? <Loader2 size={16} className="animate-spin" /> : isSummaryPlaying ? <Pause size={16}/> : <Volume2 size={16} />}
                      <span className="hidden md:inline">{t('seo.audioBrief', language)}</span>
                   </button>

                   <div className="relative">
                      <button 
                        onClick={() => setShowExportOptions(!showExportOptions)} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                      >
                         {isPreparingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} <span className="hidden md:inline">{t('seo.export', language)}</span>
                      </button>
                      {showExportOptions && (
                         <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl z-[100] py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <button onClick={handleExportPDF} className="w-full px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 transition-colors"><FileText size={18} className="text-red-500"/> PDF Report</button>
                            <button onClick={handleExportWord} className="w-full px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 transition-colors"><FileCode size={18} className="text-blue-500"/> DOCX Report</button>
                            <button onClick={handleExportPPT} className="w-full px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"><Layers size={18} className="text-orange-500"/> PPTX Report</button>
                         </div>
                      )}
                   </div>
                </>
              )}
           </div>
        </div>

        {/* Input Bar */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden mb-6 md:mb-10 print:hidden relative">
           <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
           <div className="p-6 md:p-10 space-y-6">
              <div className="flex flex-col md:flex-row gap-5">
                 <div className="flex-1 relative">
                    <Globe2 size={24} className="absolute left-6 top-6 text-blue-600" />
                    <input 
                      type="text" 
                      placeholder={t('seo.placeholder', language)} 
                      value={targetUrl} 
                      onChange={(e) => setTargetUrl(e.target.value)} 
                      className="w-full pl-16 pr-6 py-6 rounded-3xl border-2 border-gray-50 focus:border-blue-500 bg-gray-50/50 focus:bg-white outline-none font-black text-sm md:text-lg text-gray-800 transition-all"
                    />
                 </div>
                 <button 
                   onClick={() => handleAnalyze()} 
                   disabled={status === 'generating'} 
                   className="px-10 py-6 bg-gray-900 hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs md:text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                 >
                    {status === 'generating' ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />} 
                    {t('seo.initiate', language)}
                 </button>
              </div>
           </div>
        </div>

        {status === 'generating' ? (
           <div className="flex flex-col items-center justify-center py-20 md:py-48 gap-10 print:hidden">
              <div className="relative">
                 <div className="w-32 h-32 rounded-full border-2 border-gray-100 border-t-blue-600 animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                    <Search size={44} className="animate-pulse" />
                 </div>
              </div>
              <div className="text-center space-y-4">
                 <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter uppercase">{t('seo.analyzing', language)}</h3>
              </div>
           </div>
        ) : (
          <>
             {/* Navigation Tabs */}
             <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar print:hidden">
                {(['overview', 'audit', 'technical', 'roadmap', 'history'] as const).map(tab => (
                   <button 
                     key={tab} 
                     onClick={() => setActiveTab(tab)} 
                     className={`px-6 md:px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 border ${activeTab === tab ? 'bg-gray-900 text-white border-gray-900 shadow-2xl scale-105' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                   >
                     {t(`seo.${tab}` as any, language)}
                   </button>
                ))}
             </div>

             <div className="mt-6 print:block pb-20 lg:pb-0">
                {activeTab === 'history' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.length === 0 ? (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
                         <History size={48} className="mb-4" />
                         <p className="text-sm font-bold uppercase tracking-widest">{t('sm.noChats', language)}</p>
                      </div>
                    ) : (
                      history.slice().reverse().map(item => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col group hover:shadow-xl transition-all relative overflow-hidden">
                           <div className={`absolute top-0 right-0 p-12 rounded-full blur-[40px] opacity-10 pointer-events-none ${item.result.score.overall > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                           <div className="flex items-center justify-between mb-6">
                              <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black">
                                 {item.result.score.overall}%
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={(e) => { e.stopPropagation(); startRename(item.id, item.name); }} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"><Edit2 size={14}/></button>
                                 <button onClick={(e) => { e.stopPropagation(); onDeleteHistoryItem(item.id); }} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg"><Trash2 size={14}/></button>
                              </div>
                           </div>
                           
                           {editingId === item.id ? (
                             <div className="flex items-center gap-2 mb-2">
                                <input 
                                  autoFocus
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="flex-1 bg-gray-50 border border-blue-500 rounded-lg px-2 py-1 text-xs font-black outline-none"
                                />
                                <button onClick={() => saveRename(item.id)} className="text-emerald-500"><Check size={14}/></button>
                                <button onClick={() => setEditingId(null)} className="text-red-500"><X size={14}/></button>
                             </div>
                           ) : (
                             <h4 className="text-lg font-black text-gray-900 truncate mb-1">{item.name}</h4>
                           )}
                           
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{new Date(item.timestamp).toLocaleString()}</p>
                           <button 
                             onClick={() => { onSelectHistoryItem(item); setActiveTab('overview'); }}
                             className="mt-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                           >
                             View Audit <ArrowRight size={12} />
                           </button>
                        </div>
                      ))
                    )}
                  </div>
                ) : result ? (
                  <div className="space-y-12 printable-area">
                      {/* Dashboard Scores */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ScoreDial score={result.score.overall} label="Intelligence Index" colorClass="text-blue-600" />
                        <ScoreDial score={result.score.mobile} label="Mobile UX" colorClass="text-emerald-500" />
                        <ScoreDial score={result.score.desktop} label="Desktop Health" colorClass="text-indigo-600" />
                        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white text-center shadow-2xl flex flex-col items-center justify-center relative overflow-hidden card-to-print">
                            <div className="absolute top-0 right-0 p-20 bg-blue-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                            <TrendingUp size={24} className="text-blue-400 mb-2" />
                            <div className="text-xl font-black text-blue-400 tracking-tighter mb-1">{result.trafficInsights?.estimatedMonthly}</div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Potential Visibility</div>
                        </div>
                      </div>

                      {/* Summary Blocks */}
                      {(activeTab === 'overview' || isPreparingPDF) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 page-break-inside-avoid">
                            <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group card-to-print">
                              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                              <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                  <CheckCircle size={18} /> Optimization Strengths
                              </h3>
                              <ul className="space-y-6">
                                  {(result.strengths || []).map((s, i) => (
                                    <li key={i} className="flex items-start gap-4 text-sm font-bold text-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle size={14} className="text-emerald-500" /></div>
                                        <span className="leading-relaxed">{s}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                            <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group card-to-print">
                              <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                              <h3 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                  <AlertTriangle size={18} /> High-Risk Structural Failures
                              </h3>
                              <ul className="space-y-6">
                                  {(result.detailedAudit || []).flatMap(s => s.items || []).filter(i => i.status === 'Fail').slice(0, 6).map((issue, i) => (
                                    <li key={i} className="flex items-start gap-4 text-sm font-bold text-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5"><AlertTriangle size={14} className="text-red-500" /></div>
                                        <span className="leading-relaxed">{issue.label} ({issue.severity})</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                        </div>
                      )}

                      {/* Audit Log */}
                      {(activeTab === 'audit' || isPreparingPDF) && (
                        <div className="space-y-12">
                            {(result.detailedAudit || []).map((section, idx) => (
                              <div key={idx} className="space-y-8">
                                  <div className="flex items-center gap-4 px-4">
                                     <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                     <h3 className="font-black text-xs text-gray-400 uppercase tracking-[0.4em]">{section.section} Analysis</h3>
                                  </div>
                                  {(section.items || []).map((item, i) => (
                                    <div key={i} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-10 flex flex-col gap-10 hover:shadow-xl transition-all duration-500 page-break-inside-avoid group card-to-print">
                                       <div className="flex flex-col lg:flex-row gap-10">
                                          <div className="flex-1 space-y-5">
                                             <div className="flex flex-col md:flex-row items-start gap-6">
                                                <div className={`p-4 rounded-[1.5rem] shrink-0 shadow-sm ${item.status === 'Pass' ? 'bg-emerald-50 text-emerald-500' : (item.status === 'Warning' ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500')}`}>
                                                   {item.status === 'Pass' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                                                </div>
                                                <div className="space-y-2 flex-1">
                                                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                                                      <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{item.label}</h4>
                                                      <div className="flex gap-2">
                                                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getSeverityColor(item.severity)}`}>
                                                            {item.severity}
                                                         </span>
                                                         <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-900 text-white">
                                                            Impact: {item.score}
                                                         </span>
                                                      </div>
                                                   </div>
                                                   <p className="text-base text-gray-500 font-bold leading-relaxed max-w-xl">{item.description}</p>
                                                   
                                                   <div className="mt-6 space-y-4">
                                                      <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                                            <Code size={12} /> Deep Technical Explanation
                                                         </span>
                                                         <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.technicalExplanation}</p>
                                                         {item.lineInfo && (
                                                            <p className="mt-2 text-[10px] font-mono text-blue-400 font-bold uppercase">{item.lineInfo}</p>
                                                         )}
                                                      </div>

                                                      <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-inner">
                                                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                                            <Info size={12} /> Impact Analysis
                                                         </span>
                                                         <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{item.impact}"</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>

                                          <div className="w-full lg:w-[45%] bg-blue-50/40 p-8 rounded-[2rem] border border-blue-100 relative group-hover:bg-blue-50 transition-colors remediation-box">
                                             <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">
                                                <Sparkles size={16} /> ENGINEERING REMEDIATION
                                             </div>
                                             <p className="text-lg font-black text-gray-800 leading-tight mb-4">{item.fixInstruction}</p>
                                             <div className="p-4 bg-white/60 rounded-xl text-xs text-slate-600 font-medium leading-relaxed">
                                                {item.simpleExplanation}
                                             </div>
                                          </div>
                                       </div>

                                       {/* Code Comparison */}
                                       {item.codeSnippet && (
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10 border-t border-gray-50">
                                             <div className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">CRAWLED LEGACY PATTERN</span>
                                                   <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                                                </div>
                                                <div className="bg-[#0c111d] p-8 rounded-[2rem] border border-[#1d2939] shadow-2xl relative overflow-hidden min-h-[140px] flex items-center code-block-legacy">
                                                   <code className="text-xs font-mono text-gray-300 overflow-x-auto w-full leading-relaxed">{item.codeSnippet.current}</code>
                                                </div>
                                             </div>
                                             <div className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">OPTIMIZED INTEGRATION</span>
                                                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                                                </div>
                                                <div className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100 shadow-xl relative overflow-hidden min-h-[140px] flex items-center code-block-blueprint">
                                                   <code className="text-xs font-mono text-blue-700 overflow-x-auto w-full leading-relaxed">{item.codeSnippet.optimized}</code>
                                                </div>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                  ))}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Technical Details */}
                      {(activeTab === 'technical' || isPreparingPDF) && (
                        <div className="space-y-10 page-break-inside-avoid">
                            <div className="bg-gray-900 p-8 md:p-12 lg:p-20 rounded-[4rem] text-white shadow-3xl relative overflow-hidden card-to-print">
                              <div className="absolute top-0 right-0 p-80 bg-blue-600 rounded-full blur-[180px] opacity-10 pointer-events-none"></div>
                              <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                                <Gauge size={20} /> Velocity spectrum analysis
                              </h3>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                                  {Object.entries(result.performance).map(([key, val]) => (
                                    <div key={key} className="space-y-5">
                                       <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{key.toUpperCase()}</div>
                                       <div className="text-5xl font-black tracking-tighter leading-none">{val}</div>
                                       <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-3/4 rounded-full"></div>
                                       </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 md:py-60 text-center opacity-20 print:hidden">
                      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
                         <FileSearch size={64} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">Ready for Spectrum Audit</h3>
                      <p className="text-xs md:text-sm max-w-sm mx-auto mt-4 font-bold uppercase tracking-widest leading-relaxed">Enter a domain to initiate a deterministic simulated enterprise-grade scan.</p>
                  </div>
                )}
             </div>
          </>
        )}
      </div>
    </div>
  );
};