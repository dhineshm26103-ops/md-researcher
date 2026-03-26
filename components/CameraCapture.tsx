
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Zap, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    async function startCamera() {
      try {
        setIsInitializing(true);
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
          audio: false 
        });
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        setIsInitializing(false);
      } catch (err) {
        setError("Optical sensor access denied. Please verify hardware permissions.");
        setIsInitializing(false);
      }
    }
    startCamera();
    
    return () => {
      stopTracks();
    };
  }, []);

  const handleClose = () => {
    stopTracks();
    onClose();
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        handleClose();
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
      {error ? (
        <div className="text-white text-center p-10 space-y-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tighter">Sensor Error</h3>
            <p className="text-gray-400 text-sm max-w-xs">{error}</p>
          </div>
          <button onClick={handleClose} className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs">Close Interface</button>
        </div>
      ) : (
        <>
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <RefreshCw className="text-white animate-spin" size={32} />
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Viewfinder Overlays */}
          <div className="absolute inset-0 border-[2px] border-white/10 pointer-events-none">
            <div className="absolute top-10 left-10 w-10 h-10 border-t-2 border-l-2 border-primary-500"></div>
            <div className="absolute top-10 right-10 w-10 h-10 border-t-2 border-r-2 border-primary-500"></div>
            <div className="absolute bottom-10 left-10 w-10 h-10 border-b-2 border-l-2 border-primary-500"></div>
            <div className="absolute bottom-10 right-10 w-10 h-10 border-b-2 border-r-2 border-primary-500"></div>
          </div>

          <div className="absolute top-10 right-10 flex flex-col gap-4">
            <button onClick={handleClose} className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-black/60 transition-all">
              <X size={24} />
            </button>
          </div>
          
          <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-16">
            <div className="w-14 h-14" /> {/* Spacer */}
            <button 
              onClick={takePhoto}
              className="w-24 h-24 bg-white rounded-full p-2 shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-90 transition-transform group"
            >
              <div className="w-full h-full rounded-full border-[6px] border-black/5 flex items-center justify-center">
                 <div className="w-4 h-4 bg-primary-500 rounded-full group-hover:scale-150 transition-transform"></div>
              </div>
            </button>
            <button className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl text-white opacity-20 cursor-not-allowed">
              <RefreshCw size={24} />
            </button>
          </div>
          
          <div className="absolute top-10 left-10 pointer-events-none">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Optical Intelligence v2.1</p>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};
