import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, SourceDocument, AppSettings, ActiveAudio } from '../types';
import { Send, Bot, User, Volume2, Loader2, MessageSquare, Zap, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateSpeech } from '../services/geminiService';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  sources: SourceDocument[];
  settings: AppSettings;
  onPlayVoice: (obj: ActiveAudio) => void;
  playingId: string | null;
  isPlaying: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages, inputValue, isTyping, onInputChange, onSendMessage, sources, settings, onPlayVoice, playingId, isPlaying
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSpeech = async (id: string, text: string) => {
    if (isPlaying && playingId === id) {
      onPlayVoice({ id, title: '', audioData: '', source: 'support' });
      return;
    }
    setLoadingId(id);
    try {
      const base64 = await generateSpeech(text, settings.applicationVoice);
      onPlayVoice({ id, title: text.slice(0, 30) + '...', audioData: base64, source: 'support' });
    } catch (e) { console.error(e); } finally { setLoadingId(null); }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto px-3 md:px-8 py-6 space-y-6 md:space-y-8 no-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 md:space-y-8 py-20 animate-in fade-in zoom-in duration-700 px-4">
             <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-brand-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-white to-surface-50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-brand-500 shadow-glass border border-white relative z-10">
                   <Bot size={40} className="md:w-11 md:h-11" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg z-20">
                   <Zap size={14} fill="currentColor" />
                </div>
             </div>
             <div className="space-y-3 max-w-xs md:max-w-sm mx-auto">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">How can I help you research?</h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                   Upload documents to the left or start asking questions to generate insights immediately.
                </p>
             </div>
             <div className="flex flex-wrap justify-center gap-3">
                <span className="px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                   <Sparkles size={12} className="text-brand-500"/> Gemini 3 Logic
                </span>
                <span className="px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                   Secure Context
                </span>
             </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-4 duration-500`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 border ${msg.role === 'user' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-brand-600'}`}>
                {msg.role === 'user' ? <User size={16} className="md:w-[18px]" /> : <Bot size={16} className="md:w-[18px]" />}
              </div>
              
              <div className={`max-w-[88%] md:max-w-[75%] px-4 md:px-6 py-3 md:py-5 rounded-3xl text-sm font-medium leading-relaxed md:leading-7 shadow-sm group relative ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-sm shadow-brand-500/20' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm'
              }`}>
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert prose-p:text-white' : 'prose-slate prose-headings:font-black prose-strong:text-brand-700'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                
                {msg.role === 'model' && (
                  <button onClick={() => handleSpeech(msg.id, msg.text)} className="absolute -right-8 md:-right-10 top-2 p-2 text-slate-300 hover:text-brand-600 transition-all opacity-0 group-hover:opacity-100 active:scale-90 bg-white rounded-full shadow-sm border border-slate-50">
                    {loadingId === msg.id ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} className={isPlaying && playingId === msg.id ? 'text-brand-500 animate-pulse' : ''} />}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex gap-3 md:gap-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-100 text-brand-500 rounded-2xl flex items-center justify-center"><Bot size={16} className="md:w-[18px]" /></div>
            <div className="px-5 py-4 bg-white border border-slate-100 rounded-3xl rounded-tl-sm flex gap-2 items-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="p-3 md:p-6 bg-white border-t border-slate-100 z-10 pb-6 md:pb-6">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <textarea 
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSendMessage())}
            placeholder="Ask a question..."
            className="w-full pl-5 pr-14 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-200 outline-none text-sm font-medium text-slate-900 resize-none max-h-32 min-h-[56px] transition-all shadow-inner placeholder:text-slate-400"
            rows={1}
          />
          <button 
            onClick={onSendMessage} 
            disabled={!inputValue.trim() || isTyping} 
            className="absolute right-2 p-2.5 md:p-3 bg-slate-900 text-white rounded-2xl hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-90 shadow-xl"
          >
            <Send size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};