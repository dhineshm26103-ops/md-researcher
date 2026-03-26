import React, { useRef, useState, useMemo } from 'react';
import { SourceDocument, Conversation, Language, UserProfile } from '../types';
import { CheckSquare, Square, Search, Upload, PlusCircle, MessageSquare, Edit2, Trash2, Download, Camera, File as FileIcon, FileText, Image, Film, Music, X } from 'lucide-react';
import { t } from '../utils/translations';

interface SourceManagerProps {
  sources: SourceDocument[];
  onAddSource: (file: File) => void;
  onRemoveSource: (id: string) => void;
  onToggleSource: (id: string) => void;
  onRenameSource: (id: string, name: string) => void;
  onDownloadSource: (source: SourceDocument) => void;
  onExplainSource: (source: SourceDocument) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  language: Language;
  userProfile: UserProfile;
  onProfileClick: () => void;
  onOpenCamera: () => void;
  onClose?: () => void; // Added for mobile close capability
}

export const SourceManager: React.FC<SourceManagerProps> = ({
  sources, onAddSource, onRemoveSource, onToggleSource, onRenameSource, onDownloadSource,
  conversations, activeConversationId, onSelectConversation, onNewChat, onDeleteConversation, onRenameConversation,
  language, userProfile, onProfileClick, onOpenCamera, onClose
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'history'>('sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [tempSourceName, setTempSourceName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSources = useMemo(() => {
    return sources.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sources, searchQuery]);

  const handleStartRename = (source: SourceDocument) => {
    setEditingSourceId(source.id);
    setTempSourceName(source.name);
  };

  const handleSaveRename = (id: string) => {
    if (tempSourceName.trim()) {
      onRenameSource(id, tempSourceName.trim());
    }
    setEditingSourceId(null);
  };

  const getIconForType = (type: string) => {
    if (type.startsWith('image')) return <Image size={16} className="text-purple-500" />;
    if (type.startsWith('video')) return <Film size={16} className="text-red-500" />;
    if (type.startsWith('audio')) return <Music size={16} className="text-pink-500" />;
    if (type.includes('pdf')) return <FileText size={16} className="text-orange-500" />;
    return <FileIcon size={16} className="text-blue-500" />;
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 relative">
      {/* Brand Header for Mobile/Sidebar */}
      <div className="p-6 pt-safe pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-brand-500/30">
              T
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">TOM LAB</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Research Suite</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-slate-100/80 rounded-xl">
           <button onClick={() => setActiveTab('sources')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'sources' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t('sm.sources', language)}</button>
           <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t('sm.history', language)}</button>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
        {activeTab === 'sources' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Search */}
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('sm.searchPlaceholder', language)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-200 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="py-6 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-500 hover:bg-brand-50/50 hover:text-brand-600 transition-all group"
              >
                 <div className="p-2 bg-slate-50 rounded-full group-hover:bg-white transition-colors">
                    <Upload size={18} />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest">{t('sm.upload', language)}</span>
              </button>
              <button 
                onClick={onOpenCamera} 
                className="py-6 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-500 hover:bg-brand-50/50 hover:text-brand-600 transition-all group"
              >
                 <div className="p-2 bg-slate-50 rounded-full group-hover:bg-white transition-colors">
                    <Camera size={18} />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest">{t('sm.camera', language)}</span>
              </button>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => {
              if (e.target.files) {
                Array.from(e.target.files).forEach(f => onAddSource(f));
              }
              if (fileInputRef.current) fileInputRef.current.value = '';
            }} />

            {/* List */}
            <div className="space-y-2.5">
              {filteredSources.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <FileIcon size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-400">{t('sm.noSources', language)}</p>
                </div>
              )}
              {filteredSources.map(source => (
                <div key={source.id} className={`group relative flex flex-col p-3.5 rounded-2xl border transition-all ${source.active ? 'bg-white border-brand-200 shadow-lg shadow-brand-100/50' : 'bg-slate-50 border-transparent opacity-80 hover:opacity-100'}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => onToggleSource(source.id)} className={`mt-0.5 transition-colors ${source.active ? 'text-brand-500' : 'text-slate-300 hover:text-slate-400'}`}>
                      {source.active ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      {editingSourceId === source.id ? (
                        <input 
                          autoFocus
                          value={tempSourceName}
                          onChange={(e) => setTempSourceName(e.target.value)}
                          onBlur={() => handleSaveRename(source.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(source.id)}
                          className="w-full text-xs font-black bg-white border border-brand-300 rounded px-1 outline-none"
                        />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 truncate">{source.name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {getIconForType(source.type)}
                        <span className="text-[9px] font-mono text-slate-400 uppercase">{source.type.split('/')[1] || 'FILE'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDownloadSource(source)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Download">
                      <Download size={14} />
                    </button>
                    <button onClick={() => handleStartRename(source)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Rename">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => onRemoveSource(source.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <button onClick={onNewChat} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
               <PlusCircle size={16} /> {t('sm.newChat', language)}
             </button>
             <div className="space-y-2">
               {conversations.length === 0 && (
                 <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <MessageSquare size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-400">{t('sm.noChats', language)}</p>
                 </div>
               )}
               {conversations.slice().reverse().map(conv => (
                 <button key={conv.id} onClick={() => onSelectConversation(conv.id)} className={`w-full text-left p-4 rounded-2xl border transition-all ${activeConversationId === conv.id ? 'bg-white border-brand-200 shadow-lg shadow-brand-100/50' : 'bg-transparent border-transparent hover:bg-slate-50'}`}>
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${activeConversationId === conv.id ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                        <MessageSquare size={16} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-black truncate ${activeConversationId === conv.id ? 'text-brand-900' : 'text-slate-700'}`}>{conv.title}</h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 bg-white absolute bottom-0 left-0 w-full">
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors"
        >
           <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-black text-xs border border-brand-200">
             {userProfile.name[0]}
           </div>
           <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black text-slate-800 truncate">{userProfile.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enterprise</p>
           </div>
        </button>
      </div>
    </div>
  );
};