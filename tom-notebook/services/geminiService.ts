
import { GoogleGenAI, Part, Modality, Type } from "@google/genai";
import { SourceDocument, AppSettings, ContentStructure, ChatMessage, SupportAttachment, SEOAnalysisResult } from "../types";

const getAiClient = async () => {
  // const apiKey = "AIzaSyD9J6131MazYOJjMlr2Px6bkUYr63jv26E";
  const apiKey = "AIzaSyAwp5aWZBWQnCJiYCkjQqtZt26FOCGctuU";
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const sourceToPart = (source: SourceDocument): Part => {
  const isText = source.type.startsWith('text/') || 
                 source.type === 'application/json' || 
                 source.type === 'application/javascript' ||
                 source.type.includes('markdown') ||
                 source.type === 'text/plain' ||
                 source.name.endsWith('.txt') ||
                 source.name.endsWith('.md');

  if (isText) {
    return { text: `--- SOURCE: ${source.name} ---\n${source.content}\n--- END SOURCE ---` };
  } else if (source.type.startsWith('image/') || 
             source.type.startsWith('video/') || 
             source.type.startsWith('audio/') || 
             source.type === 'application/pdf') {
    return { inlineData: { mimeType: source.type, data: source.content } };
  } else {
    return { text: `[Source Reference: ${source.name}]` };
  }
};

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Generate a very short, unique, and professional title (max 5 words) for a conversation that starts with this message: "${firstMessage}". Do not use quotes in the title. Return ONLY the title text.` }] }]
    });
    return response.text?.trim() || "New Discussion";
  } catch (e) {
    return "New Discussion";
  }
};

export const generateBriefingContent = async (sources: SourceDocument[], prompt: string, settings: AppSettings): Promise<string> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [...activeSources.map(sourceToPart), { text: `Create a professional research briefing document based on these sources. Focus: ${prompt || 'General summary'}. Use Markdown formatting with clear headings. Language: ${settings.language}` }] }]
  });
  return response.text || "Failed to generate briefing.";
};

export const generateSEOAnalysis = async (url: string | undefined, sources: SourceDocument[], customPrompt: string, settings: AppSettings): Promise<SEOAnalysisResult> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);
  const prompt = url ? `Analyze this URL for SEO performance: ${url}. ` : "Analyze the provided sources for SEO optimization. ";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [...activeSources.map(sourceToPart), { text: `${prompt} ${customPrompt}. Return a detailed SEO audit matching the specified JSON structure. Include mobile and desktop scores, metadata, Core Web Vitals (LCP, FID, CLS, FCP), and detailed audit items for performance, accessibility, best practices, and SEO. Language: ${settings.language}` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: {
            type: Type.OBJECT,
            properties: {
              mobile: { type: Type.NUMBER },
              desktop: { type: Type.NUMBER },
              overall: { type: Type.NUMBER }
            },
            required: ['mobile', 'desktop', 'overall']
          },
          meta: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              canonical: { type: Type.STRING }
            },
            required: ['title', 'description', 'keywords', 'canonical']
          },
          detailedAudit: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      status: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                      description: { type: Type.STRING },
                      technicalExplanation: { type: Type.STRING },
                      impact: { type: Type.STRING },
                      fixInstruction: { type: Type.STRING },
                      simpleExplanation: { type: Type.STRING },
                      codeSnippet: {
                        type: Type.OBJECT,
                        properties: {
                          current: { type: Type.STRING },
                          optimized: { type: Type.STRING }
                        }
                      }
                    },
                    required: ['label', 'status', 'severity', 'score', 'description', 'technicalExplanation', 'impact', 'fixInstruction', 'simpleExplanation']
                  }
                }
              },
              required: ['section', 'items']
            }
          },
          performance: {
            type: Type.OBJECT,
            properties: {
              lcp: { type: Type.STRING },
              fid: { type: Type.STRING },
              cls: { type: Type.STRING },
              fcp: { type: Type.STRING }
            },
            required: ['lcp', 'fid', 'cls', 'fcp']
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          trafficInsights: {
            type: Type.OBJECT,
            properties: {
              estimatedMonthly: { type: Type.STRING },
              competitorGaps: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        required: ['score', 'meta', 'detailedAudit', 'performance', 'strengths']
      }
    }
  });
  
  return JSON.parse(response.text || "{}");
};

export const generateChatResponse = async (messages: ChatMessage[], sources: SourceDocument[], query: string, language: string): Promise<string> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);
  const sourceParts = activeSources.map(sourceToPart);
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) throw new Error("No message to send");

  const hasSources = activeSources.length > 0;
  const systemInstruction = hasSources 
    ? `You are TOM, an intelligent research assistant. Use the provided sources to answer precisely. Language: ${language}.`
    : `You are TOM, a helpful AI. No sources provided, so help user with general queries. Language: ${language}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history,
      { 
        role: 'user', 
        parts: [...sourceParts, { text: lastMessage.text }] 
      }
    ],
    config: {
        systemInstruction: systemInstruction
    }
  });
  
  return response.text || "I'm sorry, I couldn't generate a response.";
};

export const detectContentStructure = async (sources: SourceDocument[]): Promise<ContentStructure> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);
  if (activeSources.length === 0) return { type: 'generic', items: ['Main Discussion'] };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [...activeSources.map(sourceToPart), { text: "Analyze the source structure. Return JSON: { type: 'units' | 'pages', items: string[] }" }] }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['type', 'items']
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const handleIntervention = async (sources: SourceDocument[], question: string, settings: AppSettings): Promise<{ audio: string; text: string }> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [
          ...activeSources.map(sourceToPart),
          { text: `A student just interrupted the podcast to ask: "${question}". As ${settings.speaker1Name}, acknowledge the interruption politely, explain the answer clearly using the source content, and then hand it back to ${settings.speaker2Name} to continue. Answer in ${settings.language}.` }
        ]
      }
    ]
  });

  const script = response.text || "Let me check that for you.";
  const audio = await generateSpeech(script, settings.speaker1Voice);

  return { audio, text: script };
};

export const generateSegmentedAudio = async (sources: SourceDocument[], settings: AppSettings, segmentTitle: string, isSequential: boolean): Promise<any> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);
  
  const instruction = isSequential 
    ? `Draft a podcast script for '${segmentTitle}'. Focus ONLY on this specific section. Language: ${settings.language}`
    : `Draft a deep-dive podcast script for '${segmentTitle}'. Language: ${settings.language}`;

  const scriptResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [...activeSources.map(sourceToPart), { text: `${instruction} Use only Speaker 1: ${settings.speaker1Name} and Speaker 2: ${settings.speaker2Name}. Ensure they address each other by name frequently.` }] }]
  });
  
  const rawScript = scriptResponse.text?.trim() || "";
  // Ensure we keep the colon and speaker names for the TTS model
  const cleanScript = rawScript.replace(/[*#_~`]/g, '').trim();

  if (!cleanScript) throw new Error("Script generation resulted in empty text.");

  const ttsPrompt = `TTS the following conversation between ${settings.speaker1Name} and ${settings.speaker2Name}:\n${cleanScript}`;

  const audioResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: ttsPrompt }] }],
    config: { 
      responseModalities: [Modality.AUDIO], 
      speechConfig: { 
        multiSpeakerVoiceConfig: { 
          speakerVoiceConfigs: [ 
            { speaker: settings.speaker1Name, voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.speaker1Voice } } }, 
            { speaker: settings.speaker2Name, voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.speaker2Voice } } } 
          ] 
        } 
      } 
    }
  });

  return { 
    audio: audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data, 
    transcript: rawScript 
  };
};

export const generateSpeech = async (text: string, voice: string): Promise<string> => {
  if (!text || !text.trim()) return "";
  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read the following text clearly: ${text.replace(/[*#_~`]/g, '')}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice as any },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const suggestAudioTopic = async (sources: SourceDocument[]): Promise<string> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [...activeSources.map(sourceToPart), { text: "Suggest a short podcast theme. Max 10 words." }] }]
  });
  return response.text?.trim() || "";
};

export const generateVoicePreview = async (voice: string, style?: string): Promise<string> => {
  const ai = await getAiClient();
  const prompt = style ? `Read clearly: "Hello, this is a preview of my ${style} voice."` : 'Read clearly: "Hello, this is a preview of my voice."';
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice as any },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const analyzeVoiceStyle = async (base64Audio: string): Promise<string> => {
  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
          { text: "Analyze this voice sample. Describe its tone, cadence, and personality in 1-2 sentences." }
        ]
      }
    ]
  });
  return response.text || "Professional and clear.";
};

export const generateSupportResponse = async (history: ChatMessage[], query: string, attachments: SupportAttachment[]): Promise<string> => {
  const ai = await getAiClient();
  
  const historyItems = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const attachmentParts: Part[] = attachments.map(a => {
    if (a.isText) return { text: `Attachment (${a.name}):\n${a.data}` };
    return { inlineData: { mimeType: a.type, data: a.data } };
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...historyItems,
      { role: 'user', parts: [...attachmentParts, { text: query }] }
    ],
    config: {
      systemInstruction: `You are an AI Support Agent for TomNoteBook. Assist users with technical issues or feature requests. 

If a user wants to contact the developer or sends positive feedback (PRAISE), a bug (BUG), or a feature request (FEATURE), you MUST generate a professional draft email. 

Use the following JSON format for emails:
:::EMAIL_JSON{"subject": "[TomNoteBook Feedback] Category: Brief Summary", "body": "Hi Team,\\n\\nI am writing to share feedback regarding TomNoteBook.\\n\\nCategory: {Category}\\nDetails: {User's specific details}\\n\\nBest regards,\\n{User Name}\\ Enterprise Researcher @ TomNoteBook"}:::

Replace {Category} with PRAISE, BUG, or FEATURE. Ensure the signature uses the user's name provided in context. The developer email is dheivarajan0@gmail.com.`
    }
  });

  return response.text || "";
};

export const suggestSEOPrompt = async (sources: SourceDocument[]): Promise<string> => {
  const ai = await getAiClient();
  const activeSources = sources.filter(s => s.active);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [...activeSources.map(sourceToPart), { text: "Suggest a primary focus for an SEO audit based on these documents. Max 15 words." }] }]
  });
  return response.text?.trim() || "Complete Technical SEO Audit";
};
