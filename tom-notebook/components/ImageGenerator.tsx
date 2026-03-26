import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Download, Sparkles, Wand2, AlertTriangle, Plus, X, Upload, Trash2 } from 'lucide-react';
import { ImageSize, ImageStatus, Language } from '../types';
import { t } from '../utils/translations';

interface ImageGeneratorProps {
  prompt: string;
  onPromptChange: (s: string) => void;
  size: ImageSize;
  onSizeChange: (s: ImageSize) => void;
  status: ImageStatus;
  imageData: string | null;
  onGenerate: () => void;
  error?: string | null;
  referenceImages: string[];
  onReferenceImagesChange: (images: string[]) => void;
  language: Language;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  prompt, onPromptChange, size, onSizeChange, status, imageData, onGenerate, error,
  referenceImages, onReferenceImagesChange, language
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false);

  const handleDownload = () => {
    if (!imageData) return;
    const link = document.createElement('a');
    link.href = imageData; 
    link.download = `generated-image-${Date.now()}.png`;
    link.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsReadingFiles(true);
    
    const filePromises = Array.from(files).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
           if (event.target?.result) {
             resolve(event.target.result as string);
           } else {
             resolve("");
           }
        };
        reader.onerror = () => resolve(""); // Handle error by resolving empty string
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(filePromises);
      const validImages = results.filter(img => img.length > 0);
      
      if (validImages.length > 0) {
        onReferenceImagesChange([...referenceImages, ...validImages]);
      }
    } catch (err) {
      console.error("Error reading files:", err);
    } finally {
      setIsReadingFiles(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeReferenceImage = (index: number) => {
    const newImages = [...referenceImages];
    newImages.splice(index, 1);
    onReferenceImagesChange(newImages);
  };

  const handleImproveImage = () => {
    if (imageData) {
       onReferenceImagesChange([...referenceImages, imageData]);
       onPromptChange("Improve this image: " + prompt);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
       <div className="min-h-full p-4 md:p-8 flex flex-col items-center justify-center">
         <div className="max-w-3xl w-full space-y-8 my-auto">
            <div className="text-center space-y-2">
               <h2 className="text-2xl font-bold text-gray-800">{t('image.title', language)}</h2>
               <p className="text-gray-500">{t('image.subtitle', language)}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
               
               {/* Reference Images Section */}
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        {t('image.ref', language)}
                        {referenceImages.length > 0 && (
                          <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">{referenceImages.length}</span>
                        )}
                     </label>
                     <div className="flex gap-2">
                        {referenceImages.length > 0 && (
                          <button 
                            onClick={() => onReferenceImagesChange([])}
                            className="text-xs text-red-500 font-medium flex items-center gap-1 hover:underline"
                          >
                            <Trash2 size={12} /> {t('image.clear', language)}
                          </button>
                        )}
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} /> {t('image.add', language)}
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                     {/* Upload Button */}
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        title="Upload Face/Style Reference"
                     >
                        {isReadingFiles ? (
                           <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
                        ) : (
                           <>
                             <Upload size={20} className="mb-1" />
                             <span className="text-[10px] font-medium">{t('sm.upload', language)}</span>
                           </>
                        )}
                     </button>
                     <input 
                       type="file" 
                       multiple 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/png, image/jpeg, image/webp"
                       onChange={handleFileChange} 
                     />

                     {/* Thumbnails */}
                     {referenceImages.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 group">
                           <img src={img} alt={`Ref ${idx}`} className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm" />
                           <button 
                             onClick={() => removeReferenceImage(idx)}
                             className="absolute -top-2 -right-2 bg-white text-red-500 border border-gray-200 rounded-full p-1 opacity-100 shadow-sm hover:bg-red-50 transition-all"
                           >
                              <X size={12} />
                           </button>
                        </div>
                     ))}
                  </div>
                  {referenceImages.length > 0 && (
                     <p className="text-[10px] text-gray-400 italic">
                        Tip: To clone a face, upload 1-2 clear photos of the person and mention "this person" in your prompt.
                     </p>
                  )}
               </div>

               {/* Input Section */}
               <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t('image.prompt', language)}</label>
                     <textarea 
                       value={prompt}
                       onChange={(e) => onPromptChange(e.target.value)}
                       placeholder="A cyberpunk portrait of this person, neon lighting, cinematic..."
                       className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-28 text-sm"
                     />
                  </div>

                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Resolution</label>
                     <div className="flex gap-3">
                        {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                           <button
                             key={s}
                             onClick={() => onSizeChange(s)}
                             className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                               size === s 
                                 ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                 : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                             }`}
                           >
                              {s}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button 
                    onClick={onGenerate}
                    disabled={!prompt.trim() || status === 'generating'}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     {status === 'generating' ? (
                       <><Sparkles className="animate-spin" size={18}/> {t('video.generating', language)}...</>
                     ) : (
                       <><Wand2 size={18}/> {t('image.generate', language)}</>
                     )}
                  </button>
               </div>
            </div>

            {/* Result Section */}
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative group border border-gray-200 shadow-inner">
               {status === 'generating' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/10 backdrop-blur-sm z-10">
                     <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-blue-600 shadow-md"></div>
                     <p className="mt-4 text-sm font-bold text-white drop-shadow-md">{t('video.generating', language)}</p>
                  </div>
               )}

               {status === 'error' ? (
                  <div className="text-center p-8 max-w-sm">
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertTriangle size={32} />
                     </div>
                     <h3 className="text-gray-800 font-bold mb-2">Generation Failed</h3>
                     <p className="text-sm text-gray-500">{error || "Something went wrong. The model might have refused the prompt due to safety filters."}</p>
                  </div>
               ) : imageData ? (
                  <>
                     <img src={imageData} alt="Generated" className="w-full h-full object-contain" />
                     <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={handleDownload}
                          className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 text-xs"
                        >
                           <Download size={14} /> Download
                        </button>
                        <button 
                          onClick={handleImproveImage}
                          className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-purple-700 text-xs"
                        >
                           <Sparkles size={14} /> Refine / Edit
                        </button>
                     </div>
                  </>
               ) : (
                  <div className="text-center text-gray-400 p-8">
                     <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                     <p className="text-sm">Your generated image will appear here</p>
                  </div>
               )}
            </div>
         </div>
       </div>
    </div>
  );
};
