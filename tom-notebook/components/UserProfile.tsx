
import React, { useState, useRef } from 'react';
import { UserProfile, CustomVoice } from '../types';
import { User, Mic, Play, Square, Loader2, Trash2, Save, Plus, Upload, Music, Edit2 } from 'lucide-react';
import { analyzeVoiceStyle } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';

interface UserProfileProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export const UserProfileComponent: React.FC<UserProfileProps> = ({ profile, onUpdateProfile }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tempAudio, setTempAudio] = useState<{blob: Blob, url: string} | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setTempAudio({ blob, url });
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      console.error("Recording failed", e);
      alert("Microphone access needed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempAudio({ blob: file, url });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const playVoice = async (id: string, base64: string) => {
    if (playingId === id) {
       if (sourceNodeRef.current) {
           sourceNodeRef.current.onended = null;
           try { sourceNodeRef.current.stop(); } catch(e){}
           sourceNodeRef.current = null;
       }
       setPlayingId(null);
       return;
    }
    
    if (sourceNodeRef.current) {
        sourceNodeRef.current.onended = null;
        try { sourceNodeRef.current.stop(); } catch(e){}
        sourceNodeRef.current = null;
    }
    setPlayingId(id);

    try {
       const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
       const ctx = audioContextRef.current || new AudioContextClass();
       audioContextRef.current = ctx;

       const response = await fetch(`data:audio/webm;base64,${base64}`);
       const arrayBuffer = await response.arrayBuffer();
       const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
       
       const source = ctx.createBufferSource();
       source.buffer = audioBuffer;
       source.connect(ctx.destination);
       source.start();
       sourceNodeRef.current = source;
       
       source.onended = () => {
           setPlayingId(null);
           sourceNodeRef.current = null;
       };
    } catch (e) {
       console.error("Playback error", e);
       setPlayingId(null);
    }
  };

  const handleCreateVoice = async () => {
    if (!tempAudio || !voiceName.trim()) return;
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(tempAudio.blob);
      reader.onloadend = async () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        const styleDescription = await analyzeVoiceStyle(base64);
        const baseVoice = 'Zephyr';

        const newVoice: CustomVoice = {
          id: uuidv4(),
          name: voiceName,
          base64Audio: base64,
          styleDescription,
          baseVoice,
          createdAt: Date.now()
        };

        onUpdateProfile({
          ...profile,
          customVoices: [...profile.customVoices, newVoice]
        });

        setTempAudio(null);
        setVoiceName('');
        setIsAnalyzing(false);
      };
    } catch (e) {
      console.error("Voice creation failed", e);
      alert("Failed to create voice clone.");
      setIsAnalyzing(false);
    }
  };

  const deleteVoice = (id: string) => {
    onUpdateProfile({
      ...profile,
      customVoices: profile.customVoices.filter(v => v.id !== id)
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-full p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
         <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-sm overflow-hidden flex-shrink-0">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/> : (profile.name[0]?.toUpperCase() || 'U')}
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
               {isEditingName ? (
                 <input 
                   autoFocus
                   value={profile.name}
                   onChange={(e) => onUpdateProfile({...profile, name: e.target.value})}
                   onBlur={() => setIsEditingName(false)}
                   onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                   className="text-2xl font-bold text-gray-800 bg-white border-b-2 border-blue-500 focus:outline-none w-full max-w-md"
                 />
               ) : (
                 <h2 
                   onClick={() => setIsEditingName(true)} 
                   className="text-2xl font-bold text-gray-800 hover:bg-gray-50 px-1 rounded cursor-pointer transition-colors flex items-center gap-2 group"
                 >
                   {profile.name}
                   <Edit2 size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                 </h2>
               )}
            </div>
            <input 
              value={profile.bio}
              onChange={(e) => onUpdateProfile({...profile, bio: e.target.value})}
              className="text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none w-full mt-1 text-sm font-medium"
              placeholder="Add a bio..."
            />
         </div>
      </div>

      {/* Voice Library */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Creator Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
           <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 <Mic className="text-blue-500" /> Create Voice Clone
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Record a sample or upload an audio file. AI will analyze your tone and cadence.
              </p>
           </div>

           <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              {tempAudio ? (
                 <div className="text-center space-y-4">
                    <div className="text-sm font-medium text-emerald-600">Audio sample captured!</div>
                    <audio src={tempAudio.url} controls className="h-8 w-48" />
                    <button onClick={() => setTempAudio(null)} className="text-xs text-red-500 hover:underline">Discard & Retake</button>
                 </div>
              ) : (
                 <div className="flex gap-4">
                     <button 
                       onClick={isRecording ? stopRecording : startRecording}
                       className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                         isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100'
                       }`}
                       title="Record Microphone"
                     >
                       {isRecording ? <Square fill="currentColor" /> : <Mic size={24} />}
                     </button>

                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-16 h-16 rounded-full flex items-center justify-center transition-all bg-white text-purple-600 hover:bg-purple-50 border border-purple-100 shadow-md"
                       title="Upload Audio File"
                     >
                       <Upload size={24} />
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileUpload}
                     />
                 </div>
              )}
           </div>

           {tempAudio && (
             <div className="space-y-3">
               <input 
                 type="text" 
                 placeholder="Name your voice (e.g. My Professional Voice)"
                 value={voiceName}
                 onChange={(e) => setVoiceName(e.target.value)}
                 className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               />
               <button 
                 onClick={handleCreateVoice}
                 disabled={!voiceName.trim() || isAnalyzing}
                 className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isAnalyzing ? <><Loader2 className="animate-spin" /> Analyzing Voice Style...</> : <><Plus size={18} /> Save to Library</>}
               </button>
             </div>
           )}
        </div>

        {/* Library List */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Voice Library</h3>
           
           {profile.customVoices.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                 No custom voices yet. Create one to use in your podcasts!
              </div>
           )}

           {profile.customVoices.map(voice => (
             <div key={voice.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors shadow-sm flex items-start gap-4">
                <button 
                  onClick={() => playVoice(voice.id, voice.base64Audio!)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                     playingId === voice.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                   {playingId === voice.id ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
                
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 truncate">{voice.name}</h4>
                      <button onClick={() => deleteVoice(voice.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                   </div>
                   <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={voice.styleDescription}>
                     {voice.styleDescription}
                   </p>
                </div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};
