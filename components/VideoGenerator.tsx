import React, { useState, useRef } from 'react';
import { Film, Wand2, Loader2, Download, Globe, CheckCircle2, AlertCircle, Upload, Plus, Trash2, Zap, X } from 'lucide-react';
import { SourceDocument, AppSettings, VideoStatus, VideoEpisode, Language } from '../types';

interface VideoGeneratorProps {
  sources: SourceDocument[];
  settings: AppSettings;
  onUpdateLanguage: (l: Language) => void;
  onAddVideo: (v: VideoEpisode) => void;
  videos: VideoEpisode[];
  onUploadSource: (file: File) => void;
  onGenerateVideo: (prompt: string) => Promise<string>;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ sources, settings, onAddVideo, videos, onUploadSource, onGenerateVideo }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSources = sources.filter(s => s.active);
  const hasSources = activeSources.length > 0;

  const handleGenerate = async () => {
    if (!prompt.trim() && !hasSources) {
      alert("Please provide a prompt or upload sources to generate a video.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      await onGenerateVideo(prompt || "Cinematic synthesis of content");
      setIsGenerating(false);
      setPrompt('');
    } catch (e: any) {
      console.error("Video Gen Error:", e);
      setError(e.message || "Failed to generate video. The model may be at capacity.");
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadSource(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-full bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-2xl animate-in fade-in duration-700 overflow-hidden min-h-[calc(100vh-140px)] lg:min-h-0">
      <div className="flex-1 space-y-6 md:space-y-8 h-full overflow-y-auto pr-0 md:pr-4 no-scrollbar">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                 <div className="p-2 bg-purple-600 rounded-xl text-white">
                    <Film size={20} className="md:w-6 md:h-6" />
                 </div>
                 Visual Studio
              </h2>
              <div className="flex items-center gap-3 mt-1">
                 <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md border border-purple-100">
                    <Zap size={10} fill="currentColor" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Optimized Fast Model</span>
                 </div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden md:block">Cinema Grade Motion Engine</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4 flex flex-col shadow-inner">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Upload size={14} /> Knowledge Feed</h4>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-8 border-2 border-dashed border-gray-300 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-purple-400 hover:bg-purple-50 transition-all group">
                 <Plus size={32} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Add Sources</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center">{activeSources.length} Sources Active</div>
           </div>

           <div className="md:col-span-2 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4 shadow-inner">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Wand2 size={14} /> Director's Script</h4>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe cinematic visuals (e.g. A futuristic city in rain, neon glowing lights)..."
                className="w-full h-32 bg-white border border-gray-200 rounded-[1.5rem] p-4 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm font-medium"
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-5 bg-purple-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
                {isGenerating ? "Synthesizing Motion Frames..." : "Generate Cinematic Sequence"}
              </button>
           </div>
        </div>

        {error && (
          <div className="p-5 bg-red-900 text-white rounded-[1.8rem] border border-red-800 flex items-center gap-4 text-xs font-black uppercase shadow-xl animate-in shake duration-300">
             <div className="p-2 bg-red-600 rounded-lg"><AlertCircle size={20} /></div>
             <div className="flex-1">{error}</div>
             <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16}/></button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 lg:pb-0">
           {videos.length === 0 && !isGenerating && (
             <div className="col-span-full py-20 md:py-40 flex flex-col items-center justify-center opacity-20 text-slate-400 italic font-black uppercase tracking-widest text-[10px]">
                <Film size={64} className="mb-6" />
                Laboratory visual output idle
             </div>
           )}
           {videos.slice().reverse().map(vid => (
              <div key={vid.id} className="bg-gray-900 rounded-[2.5rem] overflow-hidden group relative shadow-2xl border border-gray-800">
                 <video src={vid.videoUri} controls className="w-full aspect-video object-cover" />
                 <div className="absolute top-4 right-4 z-20">
                    <a href={vid.videoUri} download={`${vid.title.slice(0,20)}.mp4`} className="p-3 bg-white text-gray-900 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center gap-2"><Download size={18} /></a>
                 </div>
                 <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{vid.title}</p>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};