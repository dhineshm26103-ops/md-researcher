import React, { useEffect, useState } from 'react';
import { 
  Play, Pause, Headphones, Download, 
  Sparkles, Loader2, AlertCircle, 
  Radio, StepBack, Mic,
  Volume2, FastForward, Settings2, User as UserIcon
} from 'lucide-react';
import { decodeBase64, pcmToWav } from '../utils/audioUtils';
import { detectContentStructure, suggestAudioTopic } from '../services/geminiService';
import { SourceDocument, AppSettings, AudioEpisode, ContentStructure, AudioStatus } from '../types';

interface AudioPlayerProps {
  episodes: AudioEpisode[];
  currentEpisodeId: string | null;
  onSelectEpisode: (id: string) => void;
  status: AudioStatus;
  onAddEpisode: (ep: AudioEpisode) => void;
  settings: AppSettings;
  sources?: SourceDocument[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (percent: number) => void;
  onIntervention: (audio: string, text: string) => void;
  onGenerate: (title: string) => void;
  onEditHost?: (hostId: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  episodes, currentEpisodeId, onSelectEpisode, status, onAddEpisode, settings, sources = [], isPlaying, currentTime, duration, onTogglePlay, onSeek, onIntervention, onGenerate, onEditHost
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isUserModified, setIsUserModified] = useState(false);
  const [structure, setStructure] = useState<ContentStructure | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const activeSources = sources.filter(s => s.active);
  const hasActiveSources = activeSources.length > 0;
  const currentEpisode = episodes.find(e => e.id === currentEpisodeId);

  useEffect(() => {
    if (hasActiveSources) {
      detectContentStructure(sources).then(setStructure).catch(console.error);
      if (!isUserModified) {
        suggestAudioTopic(sources).then(topic => {
          if (!isUserModified) setCustomPrompt(topic);
        }).catch(console.error);
      }
    }
  }, [sources.filter(s => s.active).length]);

  const handleManualGenerate = () => {
    if (status === 'generating' || !hasActiveSources) return;
    onGenerate(customPrompt || "Deep Dive Research Session");
  };

  const formatTime = (s: number) => isFinite(s) ? `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}` : "0:00";
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-auto lg:h-full lg:min-h-[700px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl bg-white">
      
      {/* Sidebar: Studio Controls */}
      <div className="w-full lg:w-[320px] xl:w-[400px] border-b lg:border-b-0 lg:border-r border-slate-50 flex flex-col bg-slate-50/30 lg:order-1 order-2">
        <div className="p-6 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto no-scrollbar max-h-[400px] lg:max-h-none">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-900 rounded-2xl text-primary-400 shadow-lg">
                 <Radio size={24} />
              </div>
              <div>
                 <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter">Studio Control</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Broadcast Management</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synthesis Parameter</h4>
                 <Settings2 size={14} className="text-slate-300" />
              </div>
              <textarea 
                value={customPrompt}
                onChange={(e) => { setCustomPrompt(e.target.value); setIsUserModified(true); }}
                placeholder="Target theme for host discussion..."
                className="w-full h-24 md:h-32 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[1.8rem] p-5 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-200 transition-all resize-none shadow-inner placeholder:text-slate-300"
              />
              <button 
                onClick={handleManualGenerate}
                disabled={status === 'generating' || !hasActiveSources}
                className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] md:rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {status === 'generating' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Master Clip
              </button>
           </div>

           {errorMsg && (
             <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black flex items-center gap-2">
                <AlertCircle size={16} /> {errorMsg}
             </div>
           )}

           <div className="pt-4 md:pt-8 space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Broadcast Archive</h4>
              <div className="space-y-2">
                 {episodes.length === 0 ? (
                    <div className="text-center py-8 md:py-12 bg-white/50 rounded-[2rem] border border-dashed border-slate-200 text-[9px] text-slate-300 font-black uppercase tracking-widest">No previous transmissions</div>
                 ) : (
                    episodes.slice().reverse().map(ep => (
                       <button 
                         key={ep.id} 
                         onClick={() => onSelectEpisode(ep.id)}
                         className={`w-full text-left p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] border transition-all flex items-center gap-4 ${currentEpisodeId === ep.id ? 'bg-white border-primary-100 shadow-lg scale-[1.02]' : 'bg-transparent border-transparent hover:bg-white/40'}`}
                       >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentEpisodeId === ep.id ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                             <Volume2 size={14} />
                          </div>
                          <span className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-tight truncate flex-1">{ep.title}</span>
                       </button>
                    ))
                 )}
              </div>
           </div>
        </div>
        
        {/* Host Status (Bottom of Sidebar) */}
        <div className="p-6 md:p-8 bg-white border-t border-slate-50 grid grid-cols-2 gap-4">
           <button onClick={() => onEditHost?.('host1')} className="flex items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform">1</div>
              <div className="min-w-0">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">HOST 1</p>
                 <p className="text-[10px] font-black text-slate-800 leading-none truncate max-w-[80px]">{settings.speaker1Name}</p>
              </div>
           </button>
           <button onClick={() => onEditHost?.('host2')} className="flex items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform">2</div>
              <div className="min-w-0">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">HOST 2</p>
                 <p className="text-[10px] font-black text-slate-800 leading-none truncate max-w-[80px]">{settings.speaker2Name}</p>
              </div>
           </button>
        </div>
      </div>

      {/* Main Content: Broadcast Terminal */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col relative p-6 md:p-8 lg:p-16 min-h-[500px] lg:order-2 order-1">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.03),transparent)] pointer-events-none"></div>
         
         <div className="flex justify-between items-start relative z-10">
            <div className="min-w-0">
               <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-2 truncate">Live Transmission Signal</p>
               <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none truncate pr-4">
                  {currentEpisode?.title || "Master Audio Terminal"}
               </h3>
            </div>
            <div className="flex gap-2 flex-shrink-0">
               {['DUB', 'HQ', 'STEREO'].map(tag => (
                  <span key={tag} className="hidden md:inline-block px-2 py-1 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black tracking-widest border border-slate-100">{tag}</span>
               ))}
               <span className="md:hidden px-2 py-1 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black tracking-widest border border-slate-100">HQ</span>
            </div>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center my-8 lg:my-0">
            <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-[340px] xl:h-[340px] flex items-center justify-center">
               <div className={`w-[70%] h-[70%] bg-slate-900 rounded-full shadow-2xl flex flex-col items-center justify-center overflow-hidden relative group transition-all duration-700 ${isPlaying ? 'scale-110 shadow-primary-500/20' : 'scale-100'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-primary-600/40 to-transparent transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-40'}`}></div>
                  <Mic size={48} className={`text-primary-400 relative z-10 transition-all duration-1000 md:w-14 md:h-14 ${isPlaying ? 'scale-110 drop-shadow-[0_0_15px_rgba(56,128,255,0.6)]' : 'opacity-30'}`} />
                  {isPlaying && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full border border-primary-500/30 animate-ping"></div>
                     </div>
                  )}
               </div>
               
               {/* Progress Ring */}
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-100">
                  <circle cx="50%" cy="50%" r="44%" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50%" 
                    cy="50%" 
                    r="44%" 
                    stroke="rgba(56, 128, 255, 1)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - progressPercent} 
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-linear" 
                    pathLength="100" 
                  />
               </svg>
            </div>

            <div className="mt-8 lg:mt-16 text-center max-w-lg space-y-4">
               <div className="flex items-center justify-center gap-4 md:gap-6 text-[11px] font-mono font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className={isPlaying ? 'text-primary-500' : ''}>{formatTime(currentTime)}</span>
                  <div className="w-16 md:w-24 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                     <div className="absolute inset-0 bg-primary-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span>{formatTime(duration)}</span>
               </div>
            </div>
         </div>

         <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-6 lg:gap-8 relative z-10">
            <div className="hidden lg:flex gap-4">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                        <Headphones size={20} />
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase mt-2 tracking-widest">Output</span>
                </div>
            </div>

            <div className="flex items-center gap-6 md:gap-12">
               <button onClick={() => onSeek(Math.max(0, (currentTime - 15) / duration))} className="p-3 md:p-4 text-slate-300 hover:text-primary-500 transition-all active:scale-75"><StepBack size={24} className="md:w-7 md:h-7" /></button>
               <button onClick={onTogglePlay} disabled={!currentEpisode} className="w-16 h-16 md:w-28 md:h-28 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group disabled:opacity-20 border-4 md:border-8 border-slate-50">
                  {isPlaying ? <Pause size={28} className="md:w-9 md:h-9" /> : <Play size={28} className="ml-1 md:ml-2 md:w-9 md:h-9" />}
               </button>
               <button onClick={() => onSeek(Math.min(1, (currentTime + 15) / duration))} className="p-3 md:p-4 text-slate-300 hover:text-primary-500 transition-all active:scale-75"><FastForward size={24} className="md:w-7 md:h-7" /></button>
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
               <button 
                 onClick={() => {
                   if (!currentEpisode) return;
                   const rawBytes = decodeBase64(currentEpisode.audioData);
                   const blob = pcmToWav(rawBytes);
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = `${currentEpisode.title}.wav`;
                   a.click();
                 }} 
                 disabled={!currentEpisode}
                 className="flex-1 sm:flex-none p-3 md:p-4 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 group active:scale-95"
                 title="High-Fidelity Audio Download"
               >
                  <Download size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] hidden md:inline">Export WAV</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};