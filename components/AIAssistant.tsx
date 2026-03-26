
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, MessageCircle, Mail, Sparkles, Mic, 
  ChevronRight, User as UserIcon, HeartHandshake, 
  Bug, ThumbsUp, Lightbulb, Smartphone, Info, Map, Maximize2, Minimize2,
  Activity, Shield, Terminal, Zap, Cpu, Search, ActivitySquare, AlertCircle,
  HelpCircle, Share2, BarChart3, Film, FileText
} from 'lucide-react';
import { generateSupportResponse } from '../services/geminiService';
import { ChatMessage, Language, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onUploadClick: () => void;
  activeTab: 'chat' | 'audio' | 'briefing' | 'seo' | 'profile' | 'video';
  userProfile: UserProfile;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, language, onUploadClick, activeTab, userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [assistantTab, setAssistantTab] = useState<'connect' | 'chat'>('chat');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: uuidv4(),
        role: 'model',
        text: `Command systems online. I am your **AI Lab Guide**, ${userProfile.name}. I can explain how to use the **${activeTab.toUpperCase()}** module or any other feature of MD Researcher. How can I help you today?`,
        timestamp: Date.now()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || inputValue;
    if (!messageToSend.trim()) return;

    if (assistantTab !== 'chat') setAssistantTab('chat');

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', text: messageToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const context = `User: ${userProfile.name}. Active Protocol: ${activeTab}. Signature: ${userProfile.name}. Language: ${language}. MISSION: You are the MD Researcher Guide. Explain app features clearly.`;
      const responseText = await generateSupportResponse(messages, `${messageToSend}\n\n[CONTEXT: ${context}]`, []);
      
      const jsonMatch = responseText.match(/:::EMAIL_JSON([\s\S]*?):::/);
      let displayText = responseText;
      let emailAction = null;

      if (jsonMatch) {
         try {
           emailAction = JSON.parse(jsonMatch[1]);
           displayText = responseText.replace(jsonMatch[0], '').trim();
         } catch (e) {}
      }

      setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text: displayText, timestamp: Date.now() }]);
      if (emailAction) window.open(`mailto:dheivarajan0@gmail.com?subject=${encodeURIComponent(emailAction.subject)}&body=${encodeURIComponent(emailAction.body)}`);
    } catch (e) {
      setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text: "Critical link failure. Please use direct contact channels in the Connect tab.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden h-[85vh] flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center flex-shrink-0 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-32 bg-primary-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
           <div className="relative z-10 flex items-center gap-5">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                 <Terminal size={24} className="text-primary-400" />
              </div>
              <div>
                 <h2 className="text-xl font-black uppercase tracking-tighter">Ops Center</h2>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Systems Operational
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors relative z-10"><X size={28} /></button>
        </div>

        {/* Unified Two-Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
           <button onClick={() => setAssistantTab('chat')} className={`flex-1 py-5 flex flex-col items-center gap-1 transition-all border-b-4 ${assistantTab === 'chat' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              <Bot size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Lab Guide</span>
           </button>
           <button onClick={() => setAssistantTab('connect')} className={`flex-1 py-5 flex flex-col items-center gap-1 transition-all border-b-4 ${assistantTab === 'connect' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              <Share2 size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Direct Connect</span>
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
           {assistantTab === 'connect' && (
              <div className="p-8 space-y-10 animate-in fade-in duration-500">
                 {/* Human Contact Section */}
                 <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 space-y-6">
                    <div>
                       <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                          <Smartphone size={16} className="text-emerald-600" /> Reach the Developer
                       </h3>
                       <p className="text-[11px] font-bold text-emerald-700/60 leading-relaxed uppercase tracking-tighter">Get human help via your preferred secure channel.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <a href="https://wa.me/916383298378" target="_blank" className="flex flex-col items-center gap-3 py-6 bg-white border border-emerald-200 rounded-2xl hover:shadow-xl hover:border-emerald-400 transition-all group">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><MessageCircle size={22} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">WhatsApp</span>
                       </a>
                       <a href="mailto:dheivarajan0@gmail.com" target="_blank" className="flex flex-col items-center gap-3 py-6 bg-white border border-emerald-200 rounded-2xl hover:shadow-xl hover:border-emerald-400 transition-all group">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Mail size={22} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Email</span>
                       </a>
                       <a href="sms:+916383298378" target="_blank" className="flex flex-col items-center gap-3 py-6 bg-white border border-emerald-200 rounded-2xl hover:shadow-xl hover:border-emerald-400 transition-all group">
                          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform"><Smartphone size={22} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">SMS</span>
                       </a>
                    </div>
                 </div>

                 {/* Feature/Issue Section */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-2">Submit Diagnostic</p>
                    <div className="grid grid-cols-1 gap-3">
                       {[
                         { icon: Bug, color: 'text-red-500', label: "I found a Bug", msg: "I found a bug in the application. Can you help me log it?" },
                         { icon: Lightbulb, color: 'text-primary-500', label: "I have a Feature Idea", msg: "I have an idea for a new feature to add to TomNoteBook." },
                         { icon: ThumbsUp, color: 'text-emerald-500', label: "I want to Send Praise", msg: "The app is working great! I want to send a positive message to the developer." }
                       ].map((item, i) => (
                         <button key={i} onClick={() => handleSendMessage(item.msg)} className="w-full p-6 bg-white border border-gray-100 rounded-[1.8rem] flex items-center justify-between hover:border-primary-500 hover:shadow-xl transition-all group shadow-sm">
                            <div className="flex items-center gap-5">
                               <div className={`p-4 bg-gray-50 ${item.color} rounded-2xl group-hover:scale-110 transition-transform shadow-inner`}><item.icon size={22}/></div>
                               <span className="text-xs font-black text-gray-800 uppercase tracking-widest">{item.label}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform"/>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           )}

           {assistantTab === 'chat' && (
              <div className="h-full flex flex-col">
                 <div className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar bg-gray-50/20">
                    {messages.map(msg => (
                       <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'user' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-primary-500'}`}>
                             {msg.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                          </div>
                          <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-sm font-bold leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                             <div className="prose prose-sm prose-slate font-bold">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                             </div>
                          </div>
                       </div>
                    ))}
                    
                    {messages.length === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 animate-in fade-in duration-1000">
                        {[
                          { title: "How do I start a podcast?", icon: Mic },
                          { title: "What is an SEO audit?", icon: BarChart3 },
                          { title: "Explain the Cinema module.", icon: Film },
                          { title: "How do I save reports?", icon: FileText }
                        ].map((q, i) => (
                          <button key={i} onClick={() => handleSendMessage(q.title)} className="p-4 bg-white border border-gray-100 rounded-2xl text-left hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center gap-3 shadow-sm group">
                            <div className="p-2 bg-gray-50 text-gray-400 group-hover:text-primary-500 rounded-lg transition-colors"><q.icon size={14}/></div>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-tight">{q.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {isTyping && (
                       <div className="flex gap-4">
                          <div className="w-10 h-10 bg-white border border-gray-100 text-primary-500 rounded-2xl flex items-center justify-center shadow-sm"><Bot size={18} /></div>
                          <div className="px-6 py-4 bg-white border border-gray-100 rounded-3xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                             <div className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce delay-100"></div>
                             <div className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce delay-200"></div>
                          </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>
                 
                 <div className="p-6 bg-white border-t border-gray-100">
                    <div className="relative flex items-center max-w-xl mx-auto">
                       <input 
                         value={inputValue}
                         onChange={(e) => setInputValue(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         placeholder="Ask me how MD Researcher works..."
                         className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none text-xs font-black text-gray-900 transition-all uppercase tracking-widest placeholder:text-gray-300 shadow-inner"
                       />
                       <button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isTyping} className="absolute right-2 p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-30 shadow-xl"><Send size={18} /></button>
                    </div>
                 </div>
              </div>
           )}
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-center flex-shrink-0">
           <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.8em] flex items-center gap-2">
              <Activity size={12} className="text-primary-500" /> Neural Ops Control v5.0
           </p>
        </div>
      </div>
    </div>
  );
};
