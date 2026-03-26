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
    <div className="flex flex-col h-full text-slate-200 relative" style={{background: 'transparent'}}>
      {/* Tabs */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex p-1 rounded-xl gap-1" style={{background: 'rgba(255,255,255,0.05)'}}>
          <button onClick={() => setActiveTab('sources')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'sources' ? 'nav-active text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>{t('sm.sources', language)}</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'nav-active text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>{t('sm.history', language)}</button>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
        {activeTab === 'sources' && (
          <div className="space-y-3 animate-in">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('sm.searchPlaceholder', language)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all placeholder:text-slate-600 text-slate-200"
                style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'}}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="py-5 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-sky-400 transition-all group"
                style={{border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)'}}
              >
                <Upload size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('sm.upload', language)}</span>
              </button>
              <button 
                onClick={onOpenCamera} 
                className="py-5 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-sky-400 transition-all group"
                style={{border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)'}}
              >
                <Camera size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('sm.camera', language)}</span>
              </button>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => {
              if (e.target.files) Array.from(e.target.files).forEach(f => onAddSource(f));
              if (fileInputRef.current) fileInputRef.current.value = '';
            }} />

            {/* List */}
            <div className="space-y-2">
              {filteredSources.length === 0 && (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600" style={{background: 'rgba(255,255,255,0.04)'}}>
                    <FileIcon size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-600">{t('sm.noSources', language)}</p>
                </div>
              )}
              {filteredSources.map(source => (
                <div key={source.id} className={`group relative flex flex-col p-3 rounded-xl border transition-all ${source.active ? 'border-sky-500/30' : 'border-transparent opacity-60 hover:opacity-80'}`} style={{background: source.active ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.03)'}}>
                  <div className="flex items-start gap-2.5">
                    <button onClick={() => onToggleSource(source.id)} className={`mt-0.5 transition-colors ${source.active ? 'text-sky-400' : 'text-slate-600 hover:text-slate-400'}`}>
                      {source.active ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {editingSourceId === source.id ? (
                        <input autoFocus value={tempSourceName} onChange={(e) => setTempSourceName(e.target.value)} onBlur={() => handleSaveRename(source.id)} onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(source.id)} className="w-full text-xs font-bold rounded px-1 outline-none text-slate-200" style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(14,165,233,0.4)'}} />
                      ) : (
                        <p className="text-xs font-semibold text-slate-300 truncate">{source.name}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {getIconForType(source.type)}
                        <span className="text-[9px] font-mono text-slate-600 uppercase">{source.type.split('/')[1] || 'FILE'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-white/5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDownloadSource(source)} className="p-1.5 text-slate-600 hover:text-sky-400 rounded-lg transition-all"><Download size={12} /></button>
                    <button onClick={() => handleStartRename(source)} className="p-1.5 text-slate-600 hover:text-emerald-400 rounded-lg transition-all"><Edit2 size={12} /></button>
                    <button onClick={() => onRemoveSource(source.id)} className="p-1.5 text-slate-600 hover:text-red-400 rounded-lg transition-all"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3 animate-in">
            <button onClick={onNewChat} className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 text-white btn-glow" style={{background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'}}>
              <PlusCircle size={14} /> {t('sm.newChat', language)}
            </button>
            <div className="space-y-1.5">
              {conversations.length === 0 && (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600" style={{background: 'rgba(255,255,255,0.04)'}}>
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-600">{t('sm.noChats', language)}</p>
                </div>
              )}
              {conversations.slice().reverse().map(conv => (
                <button key={conv.id} onClick={() => onSelectConversation(conv.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${activeConversationId === conv.id ? 'border-sky-500/30 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`} style={{background: activeConversationId === conv.id ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.02)'}}>
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={14} className={activeConversationId === conv.id ? 'text-sky-400' : 'text-slate-600'} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold truncate">{conv.title}</h4>
                      <p className="text-[9px] text-slate-600 font-mono mt-0.5">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-4 absolute bottom-0 left-0 w-full border-t border-white/5" style={{background: 'rgba(13,17,23,0.9)'}}>
        <button onClick={onProfileClick} className="flex items-center gap-3 w-full p-2 rounded-xl transition-all hover:bg-white/5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white" style={{background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'}}>
            {userProfile.name[0]}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-slate-300 truncate">{userProfile.name}</p>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">MD Researcher</p>
          </div>
        </button>
      </div>
    </div>
  );
};