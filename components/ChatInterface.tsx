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
    <div className="flex flex-col h-full relative" style={{background:'rgba(13,17,23,0.6)'}}>
      <div className="flex-1 overflow-y-auto px-3 md:px-8 py-6 space-y-4 no-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-20 px-4">
             <div className="relative">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}></div>
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-sky-400" style={{background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.2)'}}>
                   <Bot size={32} />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-white" style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}>
                   <Zap size={11} fill="currentColor" />
                </div>
             </div>
             <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-200 tracking-tight">How can I help you research?</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs">Upload documents or start asking questions to generate insights.</p>
             </div>
             <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5" style={{background:'rgba(14,165,233,0.08)',border:'1px solid rgba(14,165,233,0.15)'}}>
                   <Sparkles size={10}/> Gemini AI
                </span>
                <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                   Secure Context
                </span>
             </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'text-white' : 'text-sky-400'}`}
                style={msg.role==='user'?{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}:{background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.2)'}}>
                {msg.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
              </div>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed group relative ${
                msg.role === 'user'
                  ? 'text-white rounded-tr-sm'
                  : 'text-slate-200 rounded-tl-sm'
              }`} style={msg.role==='user'
                ?{background:'linear-gradient(135deg,rgba(14,165,233,0.8),rgba(139,92,246,0.7))'}
                :{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <div className="prose prose-sm max-w-none prose-invert prose-p:text-inherit prose-headings:text-slate-200 prose-strong:text-sky-300">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {msg.role === 'model' && (
                  <button onClick={() => handleSpeech(msg.id, msg.text)} className="absolute -right-8 top-2 p-1.5 text-slate-600 hover:text-sky-400 transition-all opacity-0 group-hover:opacity-100 rounded-lg" style={{background:'rgba(255,255,255,0.05)'}}>
                    {loadingId === msg.id ? <Loader2 size={13} className="animate-spin"/> : <Volume2 size={13} className={isPlaying && playingId === msg.id ? 'text-sky-400 animate-pulse' : ''}/>}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sky-400" style={{background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.2)'}}><Bot size={14}/></div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="p-3 md:p-4 border-t z-10" style={{borderColor:'rgba(255,255,255,0.06)',background:'rgba(13,17,23,0.8)',backdropFilter:'blur(12px)'}}>
        <div className="relative flex items-center max-w-4xl mx-auto">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSendMessage())}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 rounded-2xl outline-none text-sm font-medium resize-none max-h-32 min-h-[48px] transition-all text-slate-200 placeholder:text-slate-600"
            style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}
            rows={1}
          />
          <button 
            onClick={onSendMessage} 
            disabled={!inputValue.trim() || isTyping} 
            className="absolute right-2 p-2.5 text-white rounded-xl transition-all active:scale-90 disabled:opacity-30"
            style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};