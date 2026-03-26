
import { Language } from '../types';

export type TranslationKey = 
  | 'appName' | 'developedBy'
  | 'nav.chat' | 'nav.audio' | 'nav.video' | 'nav.image' | 'nav.briefing' | 'nav.seo' | 'nav.profile'
  | 'sm.title' | 'sm.brand' | 'sm.sources' | 'sm.history' | 'sm.upload' | 'sm.camera' | 'sm.newChat' | 'sm.noSources' | 'sm.noChats' | 'sm.searchPlaceholder'
  | 'chat.title' | 'chat.subtitle' | 'chat.placeholder' | 'chat.empty' | 'chat.disclaimer'
  | 'audio.title' | 'audio.studio' | 'audio.subtitle' | 'audio.generate' | 'audio.generateConversations' | 'audio.focus' | 'audio.backlog' | 'audio.noEpisodes' | 'audio.idle'
  | 'seo.title' | 'seo.titleLong' | 'seo.enterprise' | 'seo.deterministic' | 'seo.audioBrief' | 'seo.export' | 'seo.initiate' | 'seo.analyzing' | 'seo.placeholder' | 'seo.history' | 'seo.overview' | 'seo.audit' | 'seo.technical' | 'seo.roadmap'
  | 'settings.title' | 'settings.save' | 'settings.cancel' | 'settings.lang' | 'settings.host' | 'settings.voiceUI' | 'settings.moduleLang' | 'settings.syncAll'
  | 'ic.title' | 'ic.mainframe' | 'ic.command' | 'ic.diagnostics' | 'ic.activeProtocol' | 'ic.execute' | 'ic.procedures' | 'ic.orientation' | 'ic.vocalGuide' | 'ic.directLink' | 'ic.logAnomaly' | 'ic.proposeUtility' | 'ic.commendation' | 'ic.neural' | 'ic.engine'
  | 'image.title' | 'image.subtitle' | 'image.ref' | 'image.clear' | 'image.add' | 'image.prompt' | 'image.generate' | 'video.generating'
  | 'support.title' | 'support.tab1' | 'support.tab2' | 'support.desc';

const en: Record<TranslationKey, string> = {
  'appName': 'TomNoteBook',
  'developedBy': 'Developed by Godking',
  'nav.chat': 'Chat', 'nav.audio': 'Audio Lab', 'nav.video': 'Cinema', 'nav.image': 'Studio', 'nav.briefing': 'Docs', 'nav.seo': 'SEO Scan', 'nav.profile': 'Profile',
  'sm.title': 'TOM', 'sm.brand': 'Tom Lab', 'sm.sources': 'Sources', 'sm.history': 'History', 'sm.upload': 'Upload', 'sm.camera': 'Camera', 'sm.newChat': 'New Session', 'sm.noSources': 'No sources yet.', 'sm.noChats': 'No conversations.', 'sm.searchPlaceholder': 'Search sources...',
  'chat.title': 'Chat with TOM', 'chat.subtitle': 'Research assistant & general AI', 'chat.placeholder': 'Ask anything...', 'chat.empty': 'Hello! I\'m TOM. Initialized and ready.', 'chat.disclaimer': 'TOM can make mistakes. Verify important info.',
  'audio.title': 'Audio Deep Dive', 'audio.studio': 'Audio Studio', 'audio.subtitle': 'Generate a podcast conversation.', 'audio.generate': 'Generate Podcast', 'audio.generateConversations': 'Generate AI Conversations', 'audio.focus': 'Podcast Focus / Theme', 'audio.backlog': 'Session Backlog', 'audio.noEpisodes': 'No episodes generated', 'audio.idle': 'Broadcasting Terminal Idle',
  'seo.title': 'SEO Scan', 'seo.titleLong': 'Technical Spectrum Audit', 'seo.enterprise': 'Enterprise v5.0', 'seo.deterministic': 'DETERMINISTIC SIMULATED CRAWL ENGINE', 'seo.audioBrief': 'Audio Brief', 'seo.export': 'Export Report', 'seo.initiate': 'Initiate Crawl', 'seo.analyzing': 'Simulating Deep Spectrum Crawl...', 'seo.placeholder': 'Enter target URL for simulated crawl...', 'seo.history': 'History', 'seo.overview': 'Overview', 'seo.audit': 'Audit', 'seo.technical': 'Technical', 'seo.roadmap': 'Roadmap',
  'settings.title': 'App Config', 'settings.save': 'Save Preferences', 'settings.cancel': 'Cancel', 'settings.lang': 'Application UI Language', 'settings.host': 'Speaker Profiles', 'settings.voiceUI': 'Application UI Voice', 'settings.moduleLang': 'Module Response Languages', 'settings.syncAll': 'Sync All to UI',
  'ic.title': 'Intelligence Control', 'ic.mainframe': 'Mainframe Link Stable', 'ic.command': 'Command Protocol', 'ic.diagnostics': 'Diagnostics', 'ic.activeProtocol': 'Active Protocol', 'ic.execute': 'Execute Orientation', 'ic.procedures': 'Standard Procedures', 'ic.orientation': 'Full Lab Orientation', 'ic.vocalGuide': 'Vocal Synthesis Guide', 'ic.directLink': 'Developer Direct-Link Channels', 'ic.logAnomaly': 'Log System Anomaly', 'ic.proposeUtility': 'Propose Laboratory Utility', 'ic.commendation': 'System Commendation', 'ic.neural': 'Secure Neural Transmission', 'ic.engine': 'Lab Commander Engine',
  'image.title': 'AI Image Studio', 'image.subtitle': 'Generate high-fidelity visuals.', 'image.ref': 'Reference Images', 'image.clear': 'Clear all', 'image.add': 'Add Ref', 'image.prompt': 'Visual Description', 'image.generate': 'Generate Image', 'video.generating': 'Generating...',
  'support.title': 'Support Center', 'support.tab1': 'Contact', 'support.tab2': 'AI Support', 'support.desc': 'Our team is here to help.'
};

const thanglish: Record<TranslationKey, string> = {
  'appName': 'TomNoteBook',
  'developedBy': 'Godking senjathu',
  'nav.chat': 'Chat pannu', 'nav.audio': 'Audio Lab', 'nav.video': 'Cinema', 'nav.image': 'Studio', 'nav.briefing': 'Docs', 'nav.seo': 'SEO Scan', 'nav.profile': 'Profile',
  'sm.title': 'TOM', 'sm.brand': 'Tom Lab', 'sm.sources': 'Sources', 'sm.history': 'History', 'sm.upload': 'Upload', 'sm.camera': 'Camera', 'sm.newChat': 'Pudhu Session', 'sm.noSources': 'Source ethum illa.', 'sm.noChats': 'Conversation illa.', 'sm.searchPlaceholder': 'Search pannunga...',
  'chat.title': 'TOM kooda pesunga', 'chat.subtitle': 'Ungal research assistant', 'chat.placeholder': 'Ethavathu kelunga...', 'chat.empty': 'Hi! Naan TOM. Ready-ah iruken.', 'chat.disclaimer': 'TOM thappa solla vaaipu iruku. Check pannikonga.',
  'audio.title': 'Audio Deep Dive', 'audio.studio': 'Audio Studio', 'audio.subtitle': 'Podcast maathiri pesalaam.', 'audio.generate': 'Podcast pannu', 'audio.generateConversations': 'AI Conversations pannunga', 'audio.focus': 'Podcast Focus / Theme', 'audio.backlog': 'Pala Episodes', 'audio.noEpisodes': 'Episod-ey illa', 'audio.idle': 'Radio ready-ah iruku',
  'seo.title': 'SEO Scan', 'seo.titleLong': 'Technical Spectrum Audit', 'seo.enterprise': 'Enterprise v5.0', 'seo.deterministic': 'DETERMINISTIC SIMULATED CRAWL ENGINE', 'seo.audioBrief': 'Audio Brief', 'seo.export': 'Report-u edu', 'seo.initiate': 'Check pannu', 'seo.analyzing': 'Full-ah check aaguthu...', 'seo.placeholder': 'URL-ah podunga...', 'seo.history': 'History', 'seo.overview': 'Overview', 'seo.audit': 'Audit', 'seo.technical': 'Technical', 'seo.roadmap': 'Roadmap',
  'settings.title': 'App Config', 'settings.save': 'Save pannu', 'settings.cancel': 'Venaam', 'settings.lang': 'Interface Language', 'settings.host': 'Speaker profiles', 'settings.voiceUI': 'Application UI Voice', 'settings.moduleLang': 'Module Response Languages', 'settings.syncAll': 'Ellathayum sync pannu',
  'ic.title': 'Intelligence Control', 'ic.mainframe': 'Mainframe Link Stable', 'ic.command': 'Command Protocol', 'ic.diagnostics': 'Diagnostics', 'ic.activeProtocol': 'Active Protocol', 'ic.execute': 'Execute Orientation', 'ic.procedures': 'Standard Procedures', 'ic.orientation': 'Full Lab Orientation', 'ic.vocalGuide': 'Vocal Synthesis Guide', 'ic.directLink': 'Developer Direct-Link Channels', 'ic.logAnomaly': 'Log System Anomaly', 'ic.proposeUtility': 'Propose Laboratory Utility', 'ic.commendation': 'System Commendation', 'ic.neural': 'Secure Neural Transmission', 'ic.engine': 'Lab Commander Engine',
  'image.title': 'AI Image Studio', 'image.subtitle': 'Pudhu image-ah uruvaaku.', 'image.ref': 'Reference Images', 'image.clear': 'Ellathayum edu', 'image.add': 'Ref sethuko', 'image.prompt': 'Visual Description', 'image.generate': 'Image pannu', 'video.generating': 'Uruvaaguthu...',
  'support.title': 'Support Center', 'support.tab1': 'Contact', 'support.tab2': 'AI Support', 'support.desc': 'Nanga ungaluku help panna ready.'
};

const ta: Record<TranslationKey, string> = {
  'appName': 'டாம் குறிப்பேடு',
  'developedBy': 'காட்கிங் உருவாக்கியது',
  'nav.chat': 'உரையாடல்', 'nav.audio': 'ஆடியோ ஆய்வு', 'nav.video': 'சினிமா', 'nav.image': 'ஸ்டுடியோ', 'nav.briefing': 'ஆவணங்கள்', 'nav.seo': 'SEO ஆய்வு', 'nav.profile': 'சுயவிவரம்',
  'sm.title': 'டாம்', 'sm.brand': 'டாம் ஆய்வகம்', 'sm.sources': 'ஆதாரங்கள்', 'sm.history': 'வரலாறு', 'sm.upload': 'பதிவேற்று', 'sm.camera': 'கேமரா', 'sm.newChat': 'புதிய உரையாடல்', 'sm.noSources': 'ஆதாரங்கள் எதுவும் இல்லை.', 'sm.noChats': 'உரையாடல்கள் இல்லை.', 'sm.searchPlaceholder': 'தேடுக...',
  'chat.title': 'டாமுடன் பேசுங்கள்', 'chat.subtitle': 'ஆய்வு உதவியாளர்', 'chat.placeholder': 'கேளுங்கள்...', 'chat.empty': 'வணக்கம்! நான் டாம். தயாராக உள்ளேன்.', 'chat.disclaimer': 'டாம் தவறுகள் செய்யலாம். சரிபார்க்கவும்.',
  'audio.title': 'ஆடியோ ஆய்வு', 'audio.studio': 'ஆடியோ ஸ்டுடியோ', 'audio.subtitle': 'பாட்காஸ்ட் உரையாடலை உருவாக்குங்கள்.', 'audio.generate': 'உருவாக்கு', 'audio.generateConversations': 'AI உரையாடல்கள்', 'audio.focus': 'மையக்கருத்து', 'audio.backlog': 'முந்தைய எபிசோடுகள்', 'audio.noEpisodes': 'எதுவும் இல்லை', 'audio.idle': 'ஒளிபரப்பு முனையம் தயார்',
  'seo.title': 'SEO ஆய்வு', 'seo.titleLong': 'தொழில்நுட்ப ஆய்வு', 'seo.enterprise': 'எண்டர்பிரைஸ் v5.0', 'seo.deterministic': 'தானியங்கி தேடல் இயந்திரம்', 'seo.audioBrief': 'ஆடியோ விளக்கம்', 'seo.export': 'அறிக்கை எடு', 'seo.initiate': 'ஆய்வைத் தொடங்கு', 'seo.analyzing': 'ஆய்வு செய்கிறது...', 'seo.placeholder': 'URL-ஐ உள்ளிடவும்...', 'seo.history': 'வரலாறு', 'seo.overview': 'மேலோட்டம்', 'seo.audit': 'ஆய்வு', 'seo.technical': 'தொழில்நுட்பம்', 'seo.roadmap': 'திட்டம்',
  'settings.title': 'அமைப்புகள்', 'settings.save': 'சேமிக்க', 'settings.cancel': 'ரத்து', 'settings.lang': 'செயலி மொழி', 'settings.host': 'தொகுப்பாளர்கள்', 'settings.voiceUI': 'பயன்பாட்டு குரல்', 'settings.moduleLang': 'பதிலளிப்பு மொழிகள்', 'settings.syncAll': 'அனைத்தையும் ஒரே மொழியில் மாற்று',
  'ic.title': 'நுண்ணறிவு கட்டுப்பாடு', 'ic.mainframe': 'இணைப்பு சீராக உள்ளது', 'ic.command': 'கட்டளை நெறிமுறை', 'ic.diagnostics': 'கண்டறிதல்', 'ic.activeProtocol': 'செயலில் உள்ள நெறிமுறை', 'ic.execute': 'விளக்கத்தை இயக்கு', 'ic.procedures': 'நிலையான நடைமுறைகள்', 'ic.orientation': 'ஆய்வக விளக்கம்', 'ic.vocalGuide': 'குரல் தொகுப்பு வழிகாட்டி', 'ic.directLink': 'டெவலப்பர் தொடர்பு', 'ic.logAnomaly': 'பிழையைப் பதிவு செய்', 'ic.proposeUtility': 'புதிய வசதியைப் பரிந்துரை', 'ic.commendation': 'பாராட்டுக்கள்', 'ic.neural': 'பாதுகாப்பான பரிமாற்றம்', 'ic.engine': 'ஆய்வக இயந்திரம்',
  'image.title': 'AI பட ஸ்டுடியோ', 'image.subtitle': 'உயர்தர படங்களை உருவாக்குங்கள்.', 'image.ref': 'குறிப்புப் படங்கள்', 'image.clear': 'அனைத்தையும் நீக்கு', 'image.add': 'குறிப்பைச் சேர்', 'image.prompt': 'காட்சி விளக்கம்', 'image.generate': 'படத்தை உருவாக்கு', 'video.generating': 'உருவாகிறது...',
  'support.title': 'உதவி மையம்', 'support.tab1': 'தொடர்பு', 'support.tab2': 'AI உதவி', 'support.desc': 'உங்களுக்கு உதவ நாங்கள் தயாராக உள்ளோம்.'
};

const dictionaries: Record<string, Record<TranslationKey, string>> = {
  'english': en,
  'thanglish': thanglish, 
  'tamil': ta
};

export const t = (key: TranslationKey, lang: Language): string => {
  const dict = dictionaries[lang] || dictionaries['english'];
  return dict[key] || en[key] || key;
};
