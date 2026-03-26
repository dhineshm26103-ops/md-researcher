
import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Languages, Play, Loader2, Save, Sparkles, Wand2, BarChart3, ToggleLeft, ToggleRight, Check, Headphones, User as UserIcon, Settings2, MessageSquare, FileText, RefreshCw, Edit3 } from 'lucide-react';
import { AppSettings, VoiceName, Language, UserProfile } from '../types';
import { generateVoicePreview, analyzeVoiceStyle } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';
import { t } from '../utils/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  userProfile: UserProfile; 
  initialTab?: 'general' | 'audio' | 'seo';
}

const VOICES: VoiceName[] = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
const VOICE_META: Record<string, string> = {
  'Puck': '(Male)', 'Charon': '(Male)', 'Kore': '(Female)', 'Fenrir': '(Deep Male)', 'Zephyr': '(Female)'
};

const LANGUAGES: {value: Language, label: string}[] = [
  { value: 'english', label: 'English' },
  { value: 'tamil', label: 'Tamil (தமிழ்)' },
  { value: 'thanglish', label: 'Thanglish' },
  { value: 'hindi', label: 'Hindi (हिंदी)' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, userProfile, initialTab = 'general' }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'seo'>(initialTab);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
    setActiveTab(initialTab);
    return () => stopAudio();
  }, [settings, isOpen, initialTab]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      try { sourceNodeRef.current.stop(); sourceNodeRef.current.disconnect(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    setPlayingVoice(null);
  };

  const playPreview = async (voice: string, style?: string) => {
    if (playingVoice === voice) { stopAudio(); return; }
    stopAudio();
    setLoadingVoice(voice);
    try {
      const base64 = await generateVoicePreview(voice, style);
      if (!base64) return;
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = ctx;
      const buffer = await decodeAudioData(decodeBase64(base64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      sourceNodeRef.current = source;
      setPlayingVoice(voice);
      source.onended = () => setPlayingVoice(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVoice(null);
    }
  };

  const syncAllLanguages = () => {
    setLocalSettings({
      ...localSettings,
      chatLanguage: localSettings.language,
      audioLanguage: localSettings.language,
      briefingLanguage: localSettings.language,
      seoLanguage: localSettings.language,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
       <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
             <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
                <div className="bg-primary-500 text-white p-2 rounded-xl"><Settings2 size={20} /></div>
                {t('settings.title', localSettings.language)}
             </h2>
             <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24} /></button>
          </div>

          <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10 flex-shrink-0">
             {[
               { id: 'general', label: 'General', icon: Languages },
               { id: 'audio', label: t('nav.audio', localSettings.language), icon: Headphones },
               { id: 'seo', label: t('nav.seo', localSettings.language), icon: BarChart3 },
             ].map(item => (
               <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === item.id ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  <item.icon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
             {activeTab === 'general' && (
               <div className="space-y-12 animate-in fade-in duration-500">
                  {/* UI Language Section */}
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">{t('settings.lang', localSettings.language)}</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {LANGUAGES.map((lang) => (
                          <button key={lang.value} onClick={() => setLocalSettings({...localSettings, language: lang.value})} className={`p-4 rounded-2xl text-[11px] font-black border transition-all text-left flex items-center justify-between ${localSettings.language === lang.value ? 'bg-primary-500 border-primary-500 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-primary-200'}`}>
                             {lang.label} {localSettings.language === lang.value && <Check size={14} />}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Discrete Module Languages Section */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">{t('settings.moduleLang', localSettings.language)}</h3>
                        <button onClick={syncAllLanguages} className="flex items-center gap-2 text-[9px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-600 transition-colors">
                           <RefreshCw size={12} /> {t('settings.syncAll', localSettings.language)}
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chat Lang */}
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                              <MessageSquare size={12} /> {t('nav.chat', localSettings.language)}
                           </label>
                           <select 
                              value={localSettings.chatLanguage}
                              onChange={(e) => setLocalSettings({...localSettings, chatLanguage: e.target.value as Language})}
                              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                           >
                              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                           </select>
                        </div>
                        {/* Audio Lang */}
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                              <Mic size={12} /> {t('nav.audio', localSettings.language)}
                           </label>
                           <select 
                              value={localSettings.audioLanguage}
                              onChange={(e) => setLocalSettings({...localSettings, audioLanguage: e.target.value as Language})}
                              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                           >
                              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                           </select>
                        </div>
                        {/* Briefing Lang */}
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                              <FileText size={12} /> {t('nav.briefing', localSettings.language)}
                           </label>
                           <select 
                              value={localSettings.briefingLanguage}
                              onChange={(e) => setLocalSettings({...localSettings, briefingLanguage: e.target.value as Language})}
                              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                           >
                              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                           </select>
                        </div>
                        {/* SEO Lang */}
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                              <BarChart3 size={12} /> {t('nav.seo', localSettings.language)}
                           </label>
                           <select 
                              value={localSettings.seoLanguage}
                              onChange={(e) => setLocalSettings({...localSettings, seoLanguage: e.target.value as Language})}
                              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                           >
                              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">{t('settings.voiceUI', localSettings.language)}</h3>
                     <p className="text-[10px] text-gray-400 font-medium italic">Used for Chat summaries, Support guidance, and SEO auditory reports.</p>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {VOICES.map(voice => (
                          <button key={voice} onClick={() => setLocalSettings({...localSettings, applicationVoice: voice})} className={`p-4 rounded-2xl text-[10px] font-black border transition-all text-left flex items-center justify-between ${localSettings.applicationVoice === voice ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'}`}>
                             <div className="flex items-center gap-2">
                                <span className="opacity-60">{voice}</span>
                                <span className="text-[8px] opacity-40">{VOICE_META[voice]}</span>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); playPreview(voice); }} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-primary-500">
                                {loadingVoice === voice ? <Loader2 size={12} className="animate-spin"/> : <Play size={12} fill="currentColor"/>}
                             </button>
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'audio' && (
               <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-4">
                     <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Headphones size={14}/> Podcast Studio Settings</h4>
                     <p className="text-[11px] text-blue-800 font-medium leading-relaxed">Customize your podcast hosts. Rename them and select their voice profiles.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">1</div>
                           <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Host 1 Configuration</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                               <div className="relative">
                                  <input 
                                    value={localSettings.speaker1Name}
                                    onChange={(e) => setLocalSettings({...localSettings, speaker1Name: e.target.value})}
                                    className="w-full p-3 pl-9 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 outline-none"
                                  />
                                  <Edit3 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                               </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Voice Profile</label>
                              <div className="flex gap-2">
                                 <select 
                                    value={localSettings.speaker1Voice}
                                    onChange={(e) => setLocalSettings({...localSettings, speaker1Voice: e.target.value as VoiceName})}
                                    className="flex-1 text-xs p-4 rounded-xl border border-gray-200 bg-white font-black text-slate-900 outline-none appearance-none cursor-pointer"
                                 >
                                    {VOICES.map(v => <option key={v} value={v}>{v} {VOICE_META[v]}</option>)}
                                 </select>
                                 <button onClick={() => playPreview(localSettings.speaker1Voice)} className="w-14 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    {loadingVoice === localSettings.speaker1Voice ? <Loader2 size={18} className="animate-spin"/> : <Play size={18} fill="currentColor"/>}
                                 </button>
                              </div>
                           </div>
                           <textarea 
                             value={localSettings.speaker1Style}
                             onChange={(e) => setLocalSettings({...localSettings, speaker1Style: e.target.value})}
                             placeholder="Personality style..."
                             className="w-full h-20 p-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 transition-all text-xs font-bold text-slate-900 outline-none"
                           />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center font-black">2</div>
                           <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Host 2 Configuration</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                               <div className="relative">
                                  <input 
                                    value={localSettings.speaker2Name}
                                    onChange={(e) => setLocalSettings({...localSettings, speaker2Name: e.target.value})}
                                    className="w-full p-3 pl-9 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 outline-none"
                                  />
                                  <Edit3 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                               </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Voice Profile</label>
                              <div className="flex gap-2">
                                 <select 
                                    value={localSettings.speaker2Voice}
                                    onChange={(e) => setLocalSettings({...localSettings, speaker2Voice: e.target.value as VoiceName})}
                                    className="flex-1 text-xs p-4 rounded-xl border border-gray-200 bg-white font-black text-slate-900 outline-none appearance-none cursor-pointer"
                                 >
                                    {VOICES.map(v => <option key={v} value={v}>{v} {VOICE_META[v]}</option>)}
                                 </select>
                                 <button onClick={() => playPreview(localSettings.speaker2Voice)} className="w-14 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    {loadingVoice === localSettings.speaker2Voice ? <Loader2 size={18} className="animate-spin"/> : <Play size={18} fill="currentColor"/>}
                                 </button>
                              </div>
                           </div>
                           <textarea 
                             value={localSettings.speaker2Style}
                             onChange={(e) => setLocalSettings({...localSettings, speaker2Style: e.target.value})}
                             placeholder="Personality style..."
                             className="w-full h-20 p-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 transition-all text-xs font-bold text-slate-900 outline-none"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="p-6 border border-emerald-100 bg-emerald-50/50 rounded-[2rem] flex items-center justify-between group">
                     <div>
                        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14}/> Custom Cloned Voices</h4>
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">Visit your Profile to clone your own voice for host use.</p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <Check size={18}/>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'seo' && (
               <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex items-center justify-between cursor-pointer" onClick={() => setLocalSettings({...localSettings, seoFocusMode: !localSettings.seoFocusMode})}>
                     <div className="absolute top-0 right-0 p-20 bg-primary-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                     <div className="relative z-10 space-y-2">
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">DEFAULT TO SEO AUDIT MODE</h4>
                        <p className="text-[11px] text-gray-400 font-medium max-w-sm leading-relaxed">Prioritize the spectrum audit workspace. SEO remains available at all times, but this toggle makes it the launch default.</p>
                     </div>
                     <div className="relative z-10">
                        {localSettings.seoFocusMode ? <ToggleRight size={44} className="text-primary-500" /> : <ToggleLeft size={44} className="text-gray-700" />}
                     </div>
                  </div>
               </div>
             )}
          </div>

          <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
             <button onClick={onClose} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 rounded-xl transition-colors">{t('settings.cancel', localSettings.language)}</button>
             <button onClick={() => { onSave(localSettings); onClose(); }} className="px-10 py-4 text-[10px] font-black text-white bg-gray-900 hover:bg-black rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all">
                <Save size={18} /> {t('settings.save', localSettings.language)}
             </button>
          </div>
       </div>
    </div>
  );
};
