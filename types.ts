
export interface SourceDocument {
  id: string;
  name: string;
  content: string;
  type: string;
  active: boolean;
  createdAt: number;
}

export interface UsageStats {
  text: number;
  audio: number;
  video: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface AudioEpisode {
  id: string;
  title: string;
  audioData: string;
  transcript?: string;
  createdAt: number;
  duration?: number;
  unitIndex?: number;
}

export interface VideoEpisode {
  id: string;
  title: string;
  videoUri: string;
  createdAt: number;
}

export interface ActiveAudio {
  id: string;
  title: string;
  audioData: string;
  source: 'podcast' | 'seo' | 'support' | 'video_audio';
}

export interface ContentStructure {
  type: 'units' | 'pages' | 'generic';
  items: string[]; 
}

export type AudioStatus = 'idle' | 'generating' | 'ready' | 'error' | 'queued' | 'intervening';
export type ImageStatus = 'idle' | 'generating' | 'ready' | 'error';
export type BriefingStatus = 'idle' | 'generating' | 'ready' | 'error';
export type SEOStatus = 'idle' | 'generating' | 'ready' | 'error';
export type VideoStatus = 'idle' | 'generating' | 'ready' | 'error';

export type ImageSize = '1K' | '2K' | '4K';

export type Language = 'english' | 'tamil' | 'thanglish' | 'hindi' | 'spanish' | 'french' | 'german' | 'japanese' | 'chinese' | 'telugu' | 'kannada' | 'malayalam' | 'marathi' | 'bengali';

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface DocStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  alignment: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export interface AppSettings {
  language: Language; // Global UI Language
  chatLanguage: Language;
  audioLanguage: Language;
  briefingLanguage: Language;
  seoLanguage: Language;
  applicationVoice: VoiceName;
  audioDuration: 'auto' | 'short' | 'medium' | 'long';
  speaker1Name: string;
  speaker1Voice: VoiceName;
  speaker1Style: string;
  speaker2Name: string;
  speaker2Voice: VoiceName;
  speaker2Style: string;
  header: DocStyle;
  footer: DocStyle;
  seoFocusMode: boolean;
}

export interface SEOIssue {
  label: string;
  status: 'Pass' | 'Warning' | 'Fail';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  score: number;
  description: string;
  technicalExplanation: string;
  impact: string;
  fixInstruction: string;
  simpleExplanation: string;
  lineInfo?: string;
  codeSnippet?: {
    current: string;
    optimized: string;
  };
}

export interface SEOAnalysisResult {
  id?: string;
  score: { mobile: number; desktop: number; overall: number };
  meta: { title: string; description: string; keywords: string[]; canonical: string };
  detailedAudit: {
    section: string;
    items: SEOIssue[];
  }[];
  performance: { lcp: string; fid: string; cls: string; fcp: string };
  strengths: string[];
  issues: SEOIssue[];
  trafficInsights?: {
    estimatedMonthly: string;
    competitorGaps: string[];
  };
}

export interface SEOHistoryItem {
  id: string;
  timestamp: number;
  url?: string;
  name: string;
  result: SEOAnalysisResult;
}

export interface CustomVoice {
  id: string;
  name: string;
  base64Audio?: string;
  styleDescription: string;
  baseVoice: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl?: string;
  customVoices: CustomVoice[];
}

export interface SupportAttachment {
  name: string;
  type: string;
  data: string;
  isText: boolean;
}
