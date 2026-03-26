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
import { LoginPage } from './components/LoginPage';
import { AboutPanel } from './components/AboutPanel';

import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInName, setLoggedInName] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'english', label: 'English', short: 'EN' },
    { code: 'tamil', label: 'தமிழ்', short: 'TA' },
    { code: 'thanglish', label: 'Thanglish', short: 'TG' },
    { code: 'hindi', label: 'हिंदी', short: 'HI' },
    { code: 'spanish', label: 'Español', short: 'ES' },
    { code: 'french', label: 'Français', short: 'FR' },
    { code: 'german', label: 'Deutsch', short: 'DE' },
    { code: 'japanese', label: '日本語', short: 'JA' },
    { code: 'chinese', label: '中文', short: 'ZH' },
    { code: 'telugu', label: 'తెలుగు', short: 'TE' },
    { code: 'kannada', label: 'ಕನ್ನಡ', short: 'KN' },
    { code: 'malayalam', label: 'മലയാളം', short: 'ML' },
    { code: 'marathi', label: 'मराठी', short: 'MR' },
    { code: 'bengali', label: 'বাংলা', short: 'BN' },
  ];
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
    chatLanguage: 'thanglish',
    audioLanguage: 'thanglish',
    briefingLanguage: 'english',
    seoLanguage: 'english',
    applicationVoice: 'Zephyr',
    audioDuration: 'auto',
    speaker1Name: 'MD',
    speaker1Voice: 'Fenrir', 
    speaker1Style: 'Expert Analyst',
    speaker2Name: 'User',
    speaker2Voice: 'Kore', 
    speaker2Style: 'Curious Investigator',
    seoFocusMode: false,
    header: { text: 'MD Researcher Briefing', fontFamily: 'Inter', fontSize: 10, textColor: '#334155', backgroundColor: '#ffffff', alignment: 'right', isBold: true, isItalic: false, isUnderline: false },
    footer: { text: 'AI Research lab', fontFamily: 'Inter', fontSize: 8, textColor: '#94a3b8', backgroundColor: '#ffffff', alignment: 'center', isBold: false, isItalic: true, isUnderline: false }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'MD Researcher',
    bio: 'MD Researcher',
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

  // Auto-login + load persisted data
  useEffect(() => {
    const session = localStorage.getItem('mdr_session');
    if (session) { 
      const { name } = JSON.parse(session); 
      setIsLoggedIn(true); 
      setLoggedInName(name);
      const savedConvs = localStorage.getItem(`mdr_conversations_${name}`);
      if (savedConvs) { const c = JSON.parse(savedConvs); setConversations(c); if (c.length > 0) { setActiveConversationId(c[c.length-1].id); setMessages(c[c.length-1].messages); } }
      const savedSources = localStorage.getItem(`mdr_sources_${name}`);
      if (savedSources) setSources(JSON.parse(savedSources));
    }
  }, []);

  // Persist conversations per user
  useEffect(() => {
    if (conversations.length > 0 && loggedInName) 
      localStorage.setItem(`mdr_conversations_${loggedInName}`, JSON.stringify(conversations));
  }, [conversations, loggedInName]);

  // Persist sources per user
  useEffect(() => {
    if (loggedInName) {
      const lite = sources.map(s => ({...s, content: s.type.startsWith('text') ? s.content : '[binary]'}));
      localStorage.setItem(`mdr_sources_${loggedInName}`, JSON.stringify(lite));
    }
  }, [sources, loggedInName]);

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
    <>
    {!isLoggedIn && <LoginPage onLogin={(name) => { 
      setIsLoggedIn(true); 
      setLoggedInName(name);
      localStorage.setItem('mdr_session', JSON.stringify({ name }));
      // Load this user's data
      const savedConvs = localStorage.getItem(`mdr_conversations_${name}`);
      if (savedConvs) { const c = JSON.parse(savedConvs); setConversations(c); if (c.length > 0) { setActiveConversationId(c[c.length-1].id); setMessages(c[c.length-1].messages); } }
      const savedSources = localStorage.getItem(`mdr_sources_${name}`);
      if (savedSources) setSources(JSON.parse(savedSources));
    }} />}
    {isLoggedIn && (
    <div className="flex h-screen w-screen overflow-hidden text-slate-100 font-sans relative" style={{background: 'linear-gradient(135deg, #0d1117 0%, #111520 50%, #0d1117 100%)'}}>

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:0}}>
        {/* Animated orbs */}
        <div style={{position:'absolute',top:'-10%',left:'-5%',width:'500px',height:'500px',background:'radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)',animation:'bgOrb1 12s ease-in-out infinite alternate'}}/>
        <div style={{position:'absolute',bottom:'-10%',right:'-5%',width:'450px',height:'450px',background:'radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)',animation:'bgOrb2 15s ease-in-out infinite alternate'}}/>
        <div style={{position:'absolute',top:'40%',left:'40%',width:'300px',height:'300px',background:'radial-gradient(circle,rgba(14,165,233,0.04) 0%,transparent 70%)',animation:'bgOrb3 10s ease-in-out infinite alternate'}}/>
        {/* Grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(14,165,233,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.03) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
        {/* Scan line */}
        <div style={{position:'absolute',left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.2),rgba(139,92,246,0.2),transparent)',animation:'homeScan 8s linear infinite'}}/>
        {/* Floating dots */}
        {[...Array(6)].map((_,i)=>(
          <div key={i} className="absolute rounded-full" style={{width:'3px',height:'3px',background:i%2===0?'rgba(56,189,248,0.5)':'rgba(167,139,250,0.5)',top:`${15+i*14}%`,left:`${8+i*15}%`,boxShadow:i%2===0?'0 0 6px rgba(56,189,248,0.6)':'0 0 6px rgba(167,139,250,0.6)',animation:`floatDot ${4+i}s ease-in-out infinite alternate`,animationDelay:`${i*0.5}s`}}/>
        ))}
      </div>

      <style>{`
        @keyframes bgOrb1{0%{transform:translate(0,0) scale(1)}100%{transform:translate(40px,30px) scale(1.15)}}
        @keyframes bgOrb2{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-40px,-30px) scale(1.1)}}
        @keyframes bgOrb3{0%{transform:translate(0,0) scale(0.9)}100%{transform:translate(20px,-20px) scale(1.1)}}
        @keyframes homeScan{0%{top:-1px}100%{top:100%}}
        @keyframes floatDot{0%{transform:translateY(0) scale(1);opacity:0.5}100%{transform:translateY(-16px) scale(1.3);opacity:1}}
      `}</style>      {quotaAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md animate-in">
           <div className="p-4 rounded-2xl flex items-center gap-3 glass-panel border border-red-500/20">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400"><Zap size={18} /></div>
              <p className="text-xs font-semibold text-slate-300 flex-1">{quotaAlert.message}</p>
              <button onClick={() => setQuotaAlert(null)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400"><X size={16}/></button>
           </div>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY */}
      <div 
        className={`fixed inset-0 z-[140] bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileDrawerOpen(false)}
      />

      {/* SIDEBAR */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-[150] w-[85%] max-w-[300px] lg:w-72 transform transition-transform duration-300 ease-in-out flex flex-col sidebar-border ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${!isSidebarOpen && 'lg:hidden'}`}
        style={{background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(24px)', position: 'relative', zIndex: 10}}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg btn-glow" style={{background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'}}>
              <NotebookPen size={16} />
            </div>
            <span className="font-black text-sm tracking-widest uppercase gradient-text">MD Researcher</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsAboutOpen(true)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-sky-400 transition-colors" title="About AI Agents">
              <NotebookPen size={15} />
            </button>
            <button onClick={() => setIsMobileDrawerOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        <SourceManager 
          sources={sources} onAddSource={handleAddSource} onRemoveSource={handleRemoveSource} onToggleSource={handleToggleSource} onRenameSource={handleRenameSource} 
          onDownloadSource={(s) => {}} onExplainSource={() => {}} conversations={conversations} activeConversationId={activeConversationId} 
          onSelectConversation={(id) => { setActiveConversationId(id); setMessages(conversations.find(c => c.id === id)?.messages || []); setActiveTab('chat'); setIsMobileDrawerOpen(false); }} 
          onNewChat={() => createNewChat()} 
          onDeleteConversation={(id) => {}} onRenameConversation={() => {}} language={settings.language} userProfile={userProfile} onProfileClick={() => { setActiveTab('profile'); setIsMobileDrawerOpen(false); }} onOpenCamera={() => setIsCameraOpen(true)}
          onClose={() => setIsMobileDrawerOpen(false)}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 z-40 sticky top-0 border-b border-white/5" style={{background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(20px)'}}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileDrawerOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-colors active:scale-95">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:flex p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-colors">
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
            {/* Logo - mobile only */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'}}>
                <NotebookPen size={14} />
              </div>
              <span className="font-black text-sm tracking-widest uppercase gradient-text">MD Researcher</span>
            </div>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex items-center tab-pill gap-1">
            {([
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'audio', icon: Mic, label: 'Audio' },
              { id: 'briefing', icon: FileText, label: 'Briefing' },
              { id: 'profile', icon: UserIcon, label: 'Profile' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 ${activeTab === id ? 'nav-active text-sky-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors" style={{border:'1px solid rgba(14,165,233,0.2)',background:'rgba(14,165,233,0.05)'}}>
                <span className="w-2 h-2 rounded-full bg-emerald-400" style={{boxShadow:'0 0 6px rgba(52,211,153,0.8)'}}/>
                <span className="text-xs font-black tracking-widest uppercase text-sky-400">{languages.find(l=>l.code===settings.language)?.short || 'EN'}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${isLangOpen?'rotate-180':''}`}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(56,189,248,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={()=>setIsLangOpen(false)}/>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-[100]" style={{background:'rgba(8,12,24,0.96)',border:'1px solid rgba(14,165,233,0.2)',backdropFilter:'blur(20px)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {languages.map(lang=>(
                        <button key={lang.code} onClick={()=>{
                          setSettings({...settings,
                            language: lang.code as any,
                            chatLanguage: lang.code as any,
                            audioLanguage: lang.code as any,
                            briefingLanguage: lang.code as any,
                            seoLanguage: lang.code as any,
                          });
                          setIsLangOpen(false);
                        }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold transition-colors flex items-center justify-between"
                          style={settings.language===lang.code?{background:'rgba(14,165,233,0.15)',color:'#38bdf8'}:{color:'rgba(148,163,184,0.7)'}}>
                          <span>{lang.label}</span>
                          <span className="text-[10px] font-black tracking-widest opacity-50">{lang.short}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setIsOpsCenterOpen(true)} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-sky-400 transition-colors">
              <Activity size={18} />
            </button>
            <button onClick={() => openSettings('general')} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors">
              <SettingsIcon size={18} />
            </button>
            <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'}}>
              {(loggedInName || userProfile.name).charAt(0).toUpperCase()}
            </button>
            <button onClick={() => { 
              localStorage.removeItem('mdr_session'); 
              setIsLoggedIn(false); 
              setLoggedInName('');
              setConversations([]);
              setMessages([]);
              setActiveConversationId(null);
              setSources([]);
            }} className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full w-full overflow-y-auto no-scrollbar">

            {activeTab === 'chat' && (
              <div className="h-full w-full max-w-4xl mx-auto p-0 md:p-6 flex flex-col">
                <div className="flex-1 overflow-hidden relative border-0 md:border border-white/5 md:rounded-2xl" style={{background: 'rgba(255,255,255,0.02)'}}>
                  <ChatInterface 
                    messages={messages} inputValue={inputValue} isTyping={isTyping} onInputChange={setInputValue} 
                    onSendMessage={async () => {
                      if (!inputValue.trim()) return;
                      // Auto-create chat if none exists
                      let convId = activeConversationId;
                      if (!convId) {
                        const id = uuidv4();
                        const newConv = { id, title: 'New Chat', messages: [], updatedAt: Date.now() };
                        setConversations(prev => [...prev, newConv]);
                        setActiveConversationId(id);
                        convId = id;
                      }
                      const userMsg: ChatMessage = { id: uuidv4(), role: 'user', text: inputValue, timestamp: Date.now() };
                      const updated = [...messages, userMsg]; setMessages(updated); setInputValue(''); setIsTyping(true);
                      try {
                        const response = await generateChatResponse(updated, sources, inputValue, settings.chatLanguage, loggedInName);
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
              <div className="h-full p-2 md:p-6">
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

            {activeTab === 'briefing' && (
              <div className="h-full">
                <BriefingDoc sources={sources} status={briefingStatus} content={briefingContent} onGenerate={async (p, target) => { setBriefingStatus('generating'); try { const c = await generateBriefingContent(sources, p || '', settings); setBriefingContent(c); setBriefingStatus('ready'); trackAttempt('text'); } catch(e:any){ setBriefingStatus('error'); } }} settings={settings} />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="h-full">
                <UserProfileComponent profile={userProfile} onUpdateProfile={setUserProfile} />
              </div>
            )}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden h-20 flex items-center justify-around px-4 pb-safe border-t border-white/5 z-50" style={{background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(20px)'}}>
          {([
            { id: 'chat', icon: MessageSquare },
            { id: 'audio', icon: Mic },
            { id: 'briefing', icon: FileText },
            { id: 'profile', icon: UserIcon },
          ] as const).map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-90 ${activeTab === id ? 'nav-active text-sky-400' : 'text-slate-500'}`}
            >
              <Icon size={20} />
            </button>
          ))}
          <button onClick={() => setIsMobileDrawerOpen(true)} className="flex flex-col items-center gap-1 p-3 rounded-2xl text-slate-500 active:scale-90">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* OVERLAYS */}
      <AboutPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <AIAssistant isOpen={isOpsCenterOpen} onClose={() => setIsOpsCenterOpen(false)} language={settings.language} onUploadClick={() => setIsMobileDrawerOpen(true)} activeTab={activeTab} userProfile={userProfile} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={setSettings} userProfile={userProfile} initialTab={settingsInitialTab} />
      {isCameraOpen && <CameraCapture onCapture={(blob) => { const file = new File([blob], `Capture.jpg`, { type: 'image/jpeg' }); handleAddSource(file); }} onClose={() => setIsCameraOpen(false)} />}
      <GlobalMiniPlayer activeAudio={activeAudio} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onTogglePlay={handleTogglePlay} onSeek={handleSeek} onForward={handleForward} onBackward={handleBackward} onClose={stopAudio} onExpand={() => setIsAudioFullScreen(true)} isHidden={activeTab === 'audio' || isAudioFullScreen} />
      <FullScreenPlayer isOpen={isAudioFullScreen} activeAudio={activeAudio} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onTogglePlay={handleTogglePlay} onSeek={handleSeek} onForward={handleForward} onBackward={handleBackward} onClose={() => setIsAudioFullScreen(false)} settings={settings} />
    </div>
    )}
    </>
  );
};

export default App;