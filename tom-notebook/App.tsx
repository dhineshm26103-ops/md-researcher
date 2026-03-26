import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SourceManager } from './components/SourceManager';
import { ChatInterface } from './components/ChatInterface';
import { AudioPlayer } from './components/AudioPlayer';
import { SettingsModal } from './components/SettingsModal';
import { BriefingDoc } from './components/BriefingDoc';
import { SEOAnalyzer } from './components/SEOAnalyzer';
import { GlobalMiniPlayer } from './components/GlobalMiniPlayer';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { UserProfileComponent } from './components/UserProfile';
import { AIAssistant } from './components/AIAssistant';
import { CameraCapture } from './components/CameraCapture';
import { VideoGenerator } from './components/VideoGenerator';
import { SourceDocument, ChatMessage, AudioStatus, AppSettings, Conversation, AudioEpisode, SEOStatus, SEOAnalysisResult, ActiveAudio, BriefingStatus, Language, UserProfile, VoiceName, VideoEpisode, VideoStatus, UsageStats } from './types';
import { generateChatResponse, generateBriefingContent, generateSEOAnalysis, generateSegmentedAudio, generateConversationTitle } from './services/geminiService';
import { decodeBase64, decodeAudioData } from './utils/audioUtils';
import { t } from './utils/translations';
import { MessageSquare, Mic, Settings as SettingsIcon, BarChart3, FileText, Menu, NotebookPen, User as UserIcon, X, PanelLeftClose, PanelLeft, Film, ExternalLink, ShieldCheck, AlertCircle, Activity, Zap, RefreshCw, LayoutGrid, Cpu, Gauge, Clock, Terminal } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]); 
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [usage, setUsage] = useState<UsageStats>({ text: 0, audio: 0, video: 0, total: 0 });
  const [quotaAlert, setQuotaAlert] = useState<{ show: boolean, type: 'success' | 'limit', message: string, retryAt?: string } | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    language: 'english', 
    chatLanguage: 'english',
    audioLanguage: 'english',
    briefingLanguage: 'english',
    seoLanguage: 'english',
    applicationVoice: 'Zephyr',
    audioDuration: 'auto',
    speaker1Name: 'Tom',
    speaker1Voice: 'Fenrir', 
    speaker1Style: 'Expert Analyst',
    speaker2Name: 'Jerry',
    speaker2Voice: 'Kore', 
    speaker2Style: 'Curious Investigator',
    seoFocusMode: false,
    header: { text: 'TomNoteBook Briefing', fontFamily: 'Inter', fontSize: 10, textColor: '#334155', backgroundColor: '#ffffff', alignment: 'right', isBold: true, isItalic: false, isUnderline: false },
    footer: { text: 'AI Research lab', fontFamily: 'Inter', fontSize: 8, textColor: '#94a3b8', backgroundColor: '#ffffff', alignment: 'center', isBold: false, isItalic: true, isUnderline: false }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Researcher',
    bio: 'Enterprise Research Lead',
    customVoices: []
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'audio' | 'seo'>('general');

  const [isOpsCenterOpen, setIsOpsCenterOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'audio' | 'briefing' | 'seo' | 'profile' | 'video'>('chat');
  
  // Responsive sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [videoEpisodes, setVideoEpisodes] = useState<VideoEpisode[]>([]);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('idle');
  const [hasVideoKey, setHasVideoKey] = useState(false);

  const [audioEpisodes, setAudioEpisodes] = useState<AudioEpisode[]>([]);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle');
  const [briefingContent, setBriefingContent] = useState<string | null>(null);
  const [briefingStatus, setBriefingStatus] = useState<BriefingStatus>('idle');
  const [seoResult, setSeoResult] = useState<SEOAnalysisResult | null>(null);
  const [seoStatus, setSeoStatus] = useState<SEOStatus>('idle');

  const [activeAudio, setActiveAudio] = useState<ActiveAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioFullScreen, setIsAudioFullScreen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Animation frame loop for precise time tracking
  useEffect(() => {
    const updateProgress = () => {
      if (isPlaying && audioContextRef.current && startTimeRef.current !== null) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(elapsed, duration));
        
        if (elapsed >= duration) {
          setIsPlaying(false);
          setCurrentTime(duration);
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, duration]);

  // INITIALIZATION: Create default chat if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewChat("Untitled Notebook");
    } else if (!activeConversationId) {
       // Restore last conversation
       const latest = conversations[conversations.length - 1];
       setActiveConversationId(latest.id);
       setMessages(latest.messages);
    }
  }, []);

  const createNewChat = (titleOverride?: string) => {
    const id = uuidv4();
    const title = titleOverride || t('sm.newChat', settings.language);
    const newConv: Conversation = { id, title, messages: [], updatedAt: Date.now() };
    setConversations(prev => [...prev, newConv]);
    setActiveConversationId(id);
    setMessages([]);
    setActiveTab('chat');
    if (window.innerWidth < 1024) setIsMobileDrawerOpen(false);
  };

  const handleAddSource = async (f: File) => {
    const isText = f.type.startsWith('text/') || f.type === 'application/json' || f.name.endsWith('.txt') || f.name.endsWith('.md');
    let content: string;
    if (isText) { content = await f.text(); } else {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => { const result = reader.result as string; resolve(result.includes(',') ? result.split(',')[1] : result); };
        reader.readAsDataURL(f);
      });
      content = await base64Promise;
    }
    setSources(prev => [...prev, { id: uuidv4(), name: f.name, content, type: f.type || 'application/octet-stream', active: true, createdAt: Date.now() }]);
  };

  const handleRemoveSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));
  const handleToggleSource = (id: string) => setSources(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  const handleRenameSource = (id: string, name: string) => setSources(prev => prev.map(s => s.id === id ? { ...s, name } : s));

  const trackAttempt = (modality: 'text' | 'audio' | 'video', isError = false, errorMsg = "") => {
    const now = Date.now();
    setUsage(prev => ({ ...prev, [modality]: prev[modality] + 1, total: prev.total + 1 }));
    if (isError && (errorMsg.includes('429') || errorMsg.includes('quota'))) {
      const retryDate = new Date(); retryDate.setSeconds(retryDate.getSeconds() + 60);
      setQuotaAlert({ show: true, type: 'limit', message: "Neural throughput saturated.", retryAt: retryDate.toLocaleTimeString() });
    } else if (!isError) {
      // Optional: Success toast
    }
  };

  const handleGenerateVideo = async (prompt: string): Promise<string> => {
    setVideoStatus('generating');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt: prompt || "Cinematic visualization", config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' } });
      while (!operation.done) { await new Promise(resolve => setTimeout(resolve, 10000)); operation = await ai.operations.getVideosOperation({ operation: operation }); }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No video generated");
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const videoUri = URL.createObjectURL(blob);
      setVideoEpisodes(prev => [...prev, { id: uuidv4(), title: prompt || "Visual Session", videoUri: videoUri, createdAt: Date.now() }]);
      setVideoStatus('ready');
      trackAttempt('video');
      return videoUri;
    } catch (e: any) { setVideoStatus('error'); trackAttempt('video', true, e.message); throw e; }
  };

  const playAudio = async (audio: ActiveAudio, startTime = 0) => {
    if (activeAudio?.id === audio.id && isPlaying && startTime === 0) {
      pauseAudio();
      return;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }

    setActiveAudio(audio);
    setIsPlaying(false);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioContextRef.current || new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const rawBytes = decodeBase64(audio.audioData);
      const buffer = await decodeAudioData(rawBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        if (sourceNodeRef.current === source) {
          setIsPlaying(false);
          setCurrentTime(buffer.duration);
        }
      };

      const validStartTime = Math.max(0, Math.min(startTime, buffer.duration - 0.1));
      
      source.start(0, validStartTime);
      sourceNodeRef.current = source;
      startTimeRef.current = ctx.currentTime - validStartTime;
      setDuration(buffer.duration);
      setCurrentTime(validStartTime);
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio engine failed", e);
    }
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const stopAudio = () => {
    pauseAudio();
    setActiveAudio(null);
    setCurrentTime(0);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else if (activeAudio) {
      playAudio(activeAudio, currentTime >= duration ? 0 : currentTime);
    }
  };

  const handleSeek = (percent: number) => {
    if (activeAudio) {
      const targetTime = percent * duration;
      playAudio(activeAudio, targetTime);
    }
  };

  const handleForward = () => {
    if (activeAudio) {
      const targetTime = Math.min(duration - 0.1, currentTime + 15);
      playAudio(activeAudio, targetTime);
    }
  };

  const handleBackward = () => {
    if (activeAudio) {
      const targetTime = Math.max(0, currentTime - 15);
      playAudio(activeAudio, targetTime);
    }
  };

  const openSettings = (tab: 'general' | 'audio' | 'seo' = 'general') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-50 text-slate-800 font-sans">
      {quotaAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-lg animate-in slide-in-from-top-4">
           <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-4 bg-gray-900 border-gray-800 text-white`}>
              <div className="p-2 rounded-xl bg-brand-500"><Zap size={20} /></div>
              <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wide">{quotaAlert.message}</p></div>
              <button onClick={() => setQuotaAlert(null)} className="p-2 hover:bg-white/10 rounded-xl"><X size={18}/></button>
           </div>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY */}
      <div 
        className={`fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileDrawerOpen(false)}
      />

      {/* SIDEBAR (Desktop & Mobile) */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-[150] w-[85%] max-w-[320px] lg:w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${!isSidebarOpen && 'lg:hidden'}`}
      >
        <SourceManager 
          sources={sources} onAddSource={handleAddSource} onRemoveSource={handleRemoveSource} onToggleSource={handleToggleSource} onRenameSource={handleRenameSource} 
          onDownloadSource={(s) => {}} onExplainSource={() => {}} conversations={conversations} activeConversationId={activeConversationId} 
          onSelectConversation={(id) => { setActiveConversationId(id); setMessages(conversations.find(c => c.id === id)?.messages || []); setActiveTab('chat'); setIsMobileDrawerOpen(false); }} 
          onNewChat={() => createNewChat()} 
          onDeleteConversation={(id) => {}} onRenameConversation={() => {}} language={settings.language} userProfile={userProfile} onProfileClick={() => { setActiveTab('profile'); setIsMobileDrawerOpen(false); }} onOpenCamera={() => setIsCameraOpen(true)}
          onClose={() => setIsMobileDrawerOpen(false)}
        />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* HEADER */}
        <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileDrawerOpen(true)} 
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-brand-600 transition-colors active:scale-95"
            >
              <Menu size={24} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="hidden lg:flex p-2 -ml-2 text-gray-400 hover:text-brand-600 transition-colors"
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                  <NotebookPen size={18} />
               </div>
               <h1 className="hidden md:block font-black text-lg tracking-tight text-gray-900 uppercase">TomNoteBook</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-gray-100/50 p-1 rounded-xl">
             {(['chat', 'audio', 'video', 'briefing', 'seo', 'profile'] as const).map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)} 
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {t(`nav.${tab}` as any, settings.language)}
               </button>
             ))}
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => setIsOpsCenterOpen(true)} className="p-2 text-gray-400 hover:text-brand-600 transition-colors">
               <Activity size={20} />
             </button>
             <button onClick={() => openSettings('general')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
               <SettingsIcon size={20} />
             </button>
             <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center border border-white shadow-sm font-bold text-xs">
               {userProfile.name.charAt(0)}
             </div>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="flex-1 overflow-hidden relative bg-surface-50">
          <div className="h-full w-full overflow-y-auto no-scrollbar">
            {activeTab === 'chat' && (
              <div className="h-full max-w-5xl mx-auto p-2 md:p-6 lg:p-8 flex flex-col">
                <div className="flex-1 bg-white md:rounded-[2rem] shadow-sm border-x md:border border-gray-100 overflow-hidden relative">
                   <ChatInterface 
                      messages={messages} inputValue={inputValue} isTyping={isTyping} onInputChange={setInputValue} 
                      onSendMessage={async () => {
                        if (!inputValue.trim() || !activeConversationId) return;
                        const userMsg: ChatMessage = { id: uuidv4(), role: 'user', text: inputValue, timestamp: Date.now() };
                        const updated = [...messages, userMsg]; setMessages(updated); setInputValue(''); setIsTyping(true);
                        try {
                          const response = await generateChatResponse(updated, sources, inputValue, settings.chatLanguage);
                          const botMsg: ChatMessage = { id: uuidv4(), role: 'model', text: response, timestamp: Date.now() };
                          setMessages([...updated, botMsg]); trackAttempt('text');
                        } catch (e: any) { trackAttempt('text', true, e.message); } finally { setIsTyping(false); }
                      }} 
                      sources={sources} settings={settings} onPlayVoice={(obj) => playAudio(obj)} playingId={activeAudio?.id || null} isPlaying={isPlaying} 
                    />
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
               <div className="h-full p-2 md:p-8">
                  <AudioPlayer 
                    episodes={audioEpisodes} currentEpisodeId={activeAudio?.source === 'podcast' ? activeAudio.id : null} 
                    onSelectEpisode={(id) => { const ep = audioEpisodes.find(e => e.id === id); if(ep) playAudio({id, title: ep.title, audioData: ep.audioData, source: 'podcast'}); }} 
                    onAddEpisode={(ep) => setAudioEpisodes(p => [...p, ep])} status={audioStatus} settings={settings} sources={sources} 
                    isPlaying={isPlaying && activeAudio?.source === 'podcast'} currentTime={currentTime} duration={duration} 
                    onTogglePlay={handleTogglePlay} onSeek={handleSeek} onIntervention={() => {}} 
                    onEditHost={(hostId) => openSettings('audio')}
                    onGenerate={async (title) => {
                      setAudioStatus('generating');
                      try {
                        const result = await generateSegmentedAudio(sources, settings, title, false);
                        const newEp: AudioEpisode = { id: uuidv4(), title: title, audioData: result.audio, createdAt: Date.now() };
                        setAudioEpisodes(prev => [...prev, newEp]); playAudio({ id: newEp.id, title: newEp.title, audioData: newEp.audioData, source: 'podcast' }); setAudioStatus('ready'); trackAttempt('audio');
                      } catch (e: any) { setAudioStatus('error'); trackAttempt('audio', true, e.message); }
                    }} 
                  />
               </div>
            )}
            
            {activeTab === 'video' && (<div className="h-full p-2 md:p-8">{!hasVideoKey ? (<div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in px-4"><div className="w-24 h-24 bg-purple-100 rounded-[2rem] flex items-center justify-center text-purple-600 shadow-xl"><ShieldCheck size={48} /></div><div className="space-y-2"><h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Secure Access Required</h3><p className="text-sm text-gray-500 font-medium">Video generation requires a validated API key.</p></div><button onClick={() => (window as any).aistudio.openSelectKey().then(() => setHasVideoKey(true))} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">Connect Google Cloud</button></div>) : (<VideoGenerator sources={sources} settings={settings} onUpdateLanguage={() => {}} onAddVideo={(v) => setVideoEpisodes(p => [...p, v])} videos={videoEpisodes} onUploadSource={handleAddSource} onGenerateVideo={handleGenerateVideo} />)}</div>)}
            {activeTab === 'briefing' && (<div className="h-full"><BriefingDoc sources={sources} status={briefingStatus} content={briefingContent} onGenerate={async (p, target) => { setBriefingStatus('generating'); try { const c = await generateBriefingContent(sources, p || '', settings); setBriefingContent(c); setBriefingStatus('ready'); trackAttempt('text'); } catch(e:any){ setBriefingStatus('error'); } }} settings={settings} /></div>)}
            {activeTab === 'seo' && (<div className="h-full"><SEOAnalyzer sources={sources} status={seoStatus} result={seoResult} history={[]} onAnalyze={(o) => {}} onSelectHistoryItem={()=>{}} onDeleteHistoryItem={()=>{}} onRenameHistoryItem={()=>{}} language={settings.language} settings={settings} onPlaySummary={(res)=>{}} isSummaryPlaying={false} audioStatus="idle" /></div>)}
            {activeTab === 'profile' && <div className="h-full"><UserProfileComponent profile={userProfile} onUpdateProfile={setUserProfile} /></div>}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden h-20 bg-white border-t border-gray-200 flex items-center justify-around px-2 pb-safe z-50">
           {(['chat', 'audio', 'video', 'briefing', 'seo'] as const).map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)} 
               className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors active:scale-95 ${activeTab === tab ? 'text-brand-600 bg-brand-50' : 'text-gray-400'}`}
             >
                {tab === 'chat' && <MessageSquare size={20} />}
                {tab === 'audio' && <Mic size={20} />}
                {tab === 'video' && <Film size={20} />}
                {tab === 'briefing' && <FileText size={20} />}
                {tab === 'seo' && <BarChart3 size={20} />}
             </button>
           ))}
           <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors active:scale-95 ${activeTab === 'profile' ? 'text-brand-600 bg-brand-50' : 'text-gray-400'}`}>
              <UserIcon size={20} />
           </button>
        </div>
      </div>

      {/* OVERLAYS & MODALS */}
      <AIAssistant isOpen={isOpsCenterOpen} onClose={() => setIsOpsCenterOpen(false)} language={settings.language} onUploadClick={() => setIsMobileDrawerOpen(true)} activeTab={activeTab} userProfile={userProfile} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={setSettings} userProfile={userProfile} initialTab={settingsInitialTab} />
      {isCameraOpen && <CameraCapture onCapture={(blob) => { const file = new File([blob], `Capture.jpg`, { type: 'image/jpeg' }); handleAddSource(file); }} onClose={() => setIsCameraOpen(false)} />}
      <GlobalMiniPlayer activeAudio={activeAudio} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onTogglePlay={handleTogglePlay} onSeek={handleSeek} onForward={handleForward} onBackward={handleBackward} onClose={stopAudio} onExpand={() => setIsAudioFullScreen(true)} isHidden={activeTab === 'audio' || isAudioFullScreen} />
      <FullScreenPlayer isOpen={isAudioFullScreen} activeAudio={activeAudio} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onTogglePlay={handleTogglePlay} onSeek={handleSeek} onForward={handleForward} onBackward={handleBackward} onClose={() => setIsAudioFullScreen(false)} settings={settings} />
    </div>
  );
};

export default App;