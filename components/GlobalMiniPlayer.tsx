
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Maximize2, Headphones } from 'lucide-react';
import { ActiveAudio } from '../types';

interface GlobalMiniPlayerProps {
  activeAudio: ActiveAudio | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (percent: number) => void;
  onForward: () => void;
  onBackward: () => void;
  onClose: () => void;
  onExpand: () => void;
  isHidden?: boolean;
}

export const GlobalMiniPlayer: React.FC<GlobalMiniPlayerProps> = ({
  activeAudio, isPlaying, currentTime, duration, onTogglePlay, onSeek, onForward, onBackward, onClose, onExpand, isHidden
}) => {
  if (!activeAudio || isHidden) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[92%] max-w-md bg-white/90 backdrop-blur-2xl border border-blue-100 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 hover:shadow-blue-200/50 transition-shadow">
      {/* Progress Line */}
      <div 
        className="absolute top-0 left-0 h-1 bg-blue-50 w-full cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek((e.clientX - rect.left) / rect.width);
        }}
      >
        <div className="h-full bg-blue-600 transition-all duration-100 shadow-[0_0_8px_rgba(37,99,235,0.5)]" style={{ width: `${progress}%` }}></div>
        <div className="absolute top-0 h-full w-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progress}%` }}></div>
      </div>

      <div className="p-3 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200 active:scale-95 transition-transform">
           <Headphones size={20} />
        </div>

        <div onClick={onExpand} className="cursor-pointer flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 truncate leading-tight">{activeAudio.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[9px] px-1 bg-blue-50 text-blue-600 rounded font-black uppercase tracking-tighter">{activeAudio.source}</span>
             <p className="text-[10px] text-gray-500 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onBackward} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors active:scale-90">
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button onClick={onTogglePlay} className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md active:scale-90">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={onForward} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors active:scale-90">
            <SkipForward size={16} fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-1 pl-2 border-l border-gray-100 ml-1">
           <button onClick={onExpand} className="p-2 text-gray-400 hover:text-blue-600 transition-colors active:scale-90" title="Expand">
              <Maximize2 size={16} />
           </button>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-600 transition-colors active:scale-90" title="Close">
              <X size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};
