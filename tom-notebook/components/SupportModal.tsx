
import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Mail, Phone, Bot, Send, User, MessageSquare, ExternalLink, HelpCircle, Paperclip, FileText, Image as ImageIcon, File, Film, Volume2, Loader2 } from 'lucide-react';
// Fix: SupportAttachment is defined in types.ts, not geminiService.ts
import { generateSupportResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage, Language, SupportAttachment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';
import { t } from '../utils/translations';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, language }) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'ai'>('contact');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio State
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Attachment State
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: uuidv4(),
        role: 'model',
        text: "Hi! I'm the AI Support Agent. I can help you fix issues or draft a feature request for the developer. What's on your mind?",
        timestamp: Date.now()
      }]);
    }
    return () => stopAudio();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, attachments]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
        sourceNodeRef.current.onended = null;
        try { sourceNodeRef.current.stop(); } catch(e){}
        sourceNodeRef.current = null;
    }
    setPlayingMessageId(null);
  };

  const playMessageAudio = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
        stopAudio();
        return;
    }
    stopAudio();
    setAudioLoadingId(messageId);

    try {
       // Strip markdown for cleaner speech roughly
       const cleanText = text.replace(/[*#`]/g, '');
       const base64 = await generateSpeech(cleanText, 'Zephyr'); // Use default support voice
       
       const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
       const ctx = audioContextRef.current || new AudioContextClass({ sampleRate: 24000 });
       audioContextRef.current = ctx;

       const rawBytes = decodeBase64(base64);
       const buffer = await decodeAudioData(rawBytes, ctx, 24000, 1);
       
       const source = ctx.createBufferSource();
       source.buffer = buffer;
       source.connect(ctx.destination);
       source.start();
       sourceNodeRef.current = source;
       
       setPlayingMessageId(messageId);
       source.onended = () => {
           setPlayingMessageId(null);
           sourceNodeRef.current = null;
       };
    } catch (e) {
        console.error("TTS Error", e);
        alert("Failed to play audio.");
    } finally {
        setAudioLoadingId(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const newAttachments: SupportAttachment[] = [];
       // Explicitly cast to File[] to avoid 'unknown' type errors
       const files = Array.from(e.target.files) as File[];
       
       for (const file of files) {
          const isText = file.type.startsWith('text/') || 
                         file.type === 'application/json' || 
                         file.type.includes('xml') || 
                         file.name.endsWith('.txt') || 
                         file.name.endsWith('.md');
          
          let content = "";
          if (isText) {
             content = await file.text();
          } else {
             const base64Url = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
             });
             // Extract base64 part
             content = base64Url.split(',')[1];
          }

          newAttachments.push({
             name: file.name,
             type: file.type || 'application/octet-stream',
             data: content,
             isText
          });
       }
       setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    // Create user message. If attachments exist, mention them in the text for display purposes
    let displayUserText = inputValue;
    if (attachments.length > 0 && !displayUserText) {
        displayUserText = `Sent ${attachments.length} attachment(s)`;
    }

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: displayUserText,
      timestamp: Date.now()
    };
    
    // Store current attachments for API call
    const currentAttachments = [...attachments];
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setAttachments([]); // Clear UI attachments immediately
    setIsTyping(true);

    try {
      const responseText = await generateSupportResponse(messages, inputValue, currentAttachments);
      
      // Check for EMAIL_JSON block
      const jsonMatch = responseText.match(/:::EMAIL_JSON([\s\S]*?):::/);
      let displayText = responseText;
      let emailAction = null;

      if (jsonMatch) {
         try {
           emailAction = JSON.parse(jsonMatch[1]);
           // Remove the JSON block from display text
           displayText = responseText.replace(jsonMatch[0], '').trim();
         } catch (e) {
           console.error("Failed to parse email JSON", e);
         }
      }

      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'model',
        text: displayText,
        timestamp: Date.now()
      }]);

      if (emailAction) {
         window.open(`mailto:dheivarajan0@gmail.com?subject=${encodeURIComponent(emailAction.subject)}&body=${encodeURIComponent(emailAction.body)}`);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'model',
        text: "Sorry, I'm having trouble connecting. Please use the direct contact buttons.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getIconForType = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={14} className="text-purple-500" />;
    if (type.startsWith('video/')) return <Film size={14} className="text-red-500" />;
    if (type === 'application/pdf') return <FileText size={14} className="text-orange-500" />;
    return <File size={14} className="text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
             <HelpCircle className="text-blue-600" size={20} /> {t('support.title', language)}
           </h2>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
             <X size={20} />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
           <button 
             onClick={() => setActiveTab('contact')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'contact' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             {t('support.tab1', language)}
           </button>
           <button 
             onClick={() => setActiveTab('ai')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'ai' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             {t('support.tab2', language)}
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-white">
           
           {/* Tab 1: Contact Links */}
           {activeTab === 'contact' && (
              <div className="p-6 space-y-6 overflow-y-auto h-full">
                 <div className="text-center space-y-2 mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                       <HelpCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">How can we help?</h3>
                    <p className="text-sm text-gray-500">{t('support.desc', language)}</p>
                 </div>

                 <div className="grid gap-4">
                    <a 
                      href="https://wa.me/916383298378" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group"
                    >
                       <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 group-hover:scale-110 transition-transform">
                          <MessageCircle size={20} />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-green-900">WhatsApp</h4>
                          <p className="text-xs text-green-700">Chat directly (+91 6383298378)</p>
                       </div>
                       <ExternalLink size={16} className="text-green-600 opacity-50" />
                    </a>

                    <a 
                      href="mailto:dheivarajan0@gmail.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors group"
                    >
                       <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 group-hover:scale-110 transition-transform">
                          <Mail size={20} />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-red-900">Email</h4>
                          <p className="text-xs text-red-700">dheivarajan0@gmail.com</p>
                       </div>
                       <ExternalLink size={16} className="text-red-600 opacity-50" />
                    </a>

                    <a 
                      href="sms:+916383298378" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
                    >
                       <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
                          <Phone size={20} />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-blue-900">SMS</h4>
                          <p className="text-xs text-blue-700">Text message support</p>
                       </div>
                       <ExternalLink size={16} className="text-blue-600 opacity-50" />
                    </a>
                 </div>
              </div>
           )}

           {/* Tab 2: AI Chat */}
           {activeTab === 'ai' && (
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-purple-600'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                         </div>
                         <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm relative ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none pr-8'}`}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                            
                            {/* TTS Button for Bot in Support */}
                            {msg.role === 'model' && (
                              <button 
                                onClick={() => playMessageAudio(msg.id, msg.text)}
                                className="absolute -right-6 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                                title="Read Aloud"
                              >
                                {audioLoadingId === msg.id ? <Loader2 size={14} className="animate-spin" /> : 
                                 playingMessageId === msg.id ? <Volume2 size={14} className="text-purple-600 animate-pulse" /> : <Volume2 size={14} />}
                              </button>
                            )}
                         </div>
                      </div>
                    ))}
                    {isTyping && (
                       <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-purple-600 flex items-center justify-center">
                             <Bot size={14} />
                          </div>
                          <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                          </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>
                 
                 {/* Attachment List */}
                 {attachments.length > 0 && (
                    <div className="flex gap-2 px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto">
                       {attachments.map((att, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg pl-2 pr-1 py-1 flex-shrink-0 max-w-[150px]">
                             {getIconForType(att.type)}
                             <span className="text-xs truncate text-gray-600 flex-1">{att.name}</span>
                             <button onClick={() => removeAttachment(index)} className="p-0.5 hover:bg-gray-200 rounded-full text-gray-500">
                                <X size={12} />
                             </button>
                          </div>
                       ))}
                    </div>
                 )}

                 <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                    <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                       title="Attach file"
                    >
                       <Paperclip size={18} />
                    </button>
                    <input 
                       type="file" 
                       multiple 
                       ref={fileInputRef} 
                       className="hidden" 
                       onChange={handleFileSelect}
                    />

                    <input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={attachments.length > 0 ? "Add a message..." : "Describe your issue..."}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
                      className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                       <Send size={18} />
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
