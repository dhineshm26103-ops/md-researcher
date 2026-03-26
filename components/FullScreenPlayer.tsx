
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Headphones, Volume2, Zap, HelpCircle, ChevronDown, Download } from 'lucide-react';
import { ActiveAudio, AppSettings } from '../types';
import { decodeBase64, pcmToWav } from '../utils/audioUtils';

interface FullScreenPlayerProps {
  isOpen: boolean;
  activeAudio: ActiveAudio | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (percent: number) => void;
  onForward: () => void;
  onBackward: () => void;
  onClose: () => void;
  settings: AppSettings;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen, activeAudio, isPlaying, currentTime, duration, onTogglePlay, onSeek, onForward, onBackward, onClose, settings
}) => {
  if (!isOpen || !activeAudio) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getSourceIcon = () => {
    switch (activeAudio.source) {
      case 'podcast': return <Headphones size={48} />;
      case 'seo': return <Zap size={48} />;
      case 'support': return <HelpCircle size={48} />;
      default: return <Volume2 size={48} />;
    }
  };

  const getSourceColor = () => {
    switch (activeAudio.source) {
      case 'podcast': return 'from-blue-500 to-indigo-600 shadow-blue-500/20';
      case 'seo': return 'from-yellow-400 to-orange-500 shadow-orange-500/20';
      case 'support': return 'from-emerald-400 to-teal-600 shadow-emerald-500/20';
      default: return 'from-slate-500 to-slate-700 shadow-slate-500/20';
    }
  };

  const downloadAudio = () => {
    const rawBytes = decodeBase64(activeAudio.audioData);
    const wavBlob = pcmToWav(rawBytes);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = activeAudio.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `MDR_${activeAudio.source}_${safeTitle}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 blur-[120px] bg-gradient-to-br ${getSourceColor()}`}></div>

      {/* Top Bar */}
      <div className="w-full flex items-center justify-between relative z-10">
        <button onClick={onClose} className="p-3 text-slate-400 hover:text-white transition-all bg-white/5 rounded-full backdrop-blur-md">
          <ChevronDown size={24} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Now Playing</p>
          <div className="flex items-center gap-2 justify-center">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
             <p className="text-xs font-bold text-slate-300">{activeAudio.source.toUpperCase()}</p>
          </div>
        </div>
        <button onClick={downloadAudio} className="p-3 text-slate-400 hover:text-white transition-all bg-white/5 rounded-full backdrop-blur-md">
          <Download size={24} />
        </button>
      </div>

      {/* Album Art / Source Icon */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative z-10 gap-12">
        <div className={`w-64 h-64 md:w-80 md:h-80 rounded-[3rem] bg-gradient-to-br ${getSourceColor()} flex items-center justify-center text-white shadow-2xl relative group overflow-hidden`}>
           {getSourceIcon()}
           {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                 <div className="w-full h-full rounded-full border-2 border-white animate-ping"></div>
              </div>
           )}
           <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="text-center space-y-3 w-full">
           <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight px-4 line-clamp-2">
              {activeAudio.title}
           </h2>
           <p className="text-slate-400 font-medium md:text-lg">
              {activeAudio.source === 'podcast' ? `${settings.speaker1Name} & ${settings.speaker2Name}` : 'TomNoteBook Intelligence'}
           </p>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="w-full max-w-2xl space-y-10 relative z-10 mb-12">
        {/* Progress */}
        <div className="space-y-4">
           <div 
             className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               onSeek((e.clientX - rect.left) / rect.width);
             }}
           >
              <div className={`h-full bg-white transition-all duration-100 relative ${isPlaying ? 'shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`} style={{ width: `${progress}%` }}>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
           </div>
           <div className="flex justify-between text-xs font-mono text-slate-500 font-black">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
           </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-around md:justify-center md:gap-16">
           <button onClick={onBackward} className="p-4 text-slate-400 hover:text-white transition-all active:scale-90">
              <SkipBack size={32} fill="currentColor" />
           </button>
           
           <button 
             onClick={onTogglePlay} 
             className="w-24 h-24 bg-white text-slate-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
           >
              {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1.5" />}
           </button>

           <button onClick={onForward} className="p-4 text-slate-400 hover:text-white transition-all active:scale-90">
              <SkipForward size={32} fill="currentColor" />
           </button>
        </div>

        {/* Footer info */}
        <div className="flex justify-center gap-12">
           <div className="flex flex-col items-center gap-2 opacity-50">
              <Volume2 size={16} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase">Stereo</span>
           </div>
           <div className="flex flex-col items-center gap-2 opacity-50">
              <Headphones size={16} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase">Lossless</span>
           </div>
        </div>
      </div>
    </div>
  );
};
