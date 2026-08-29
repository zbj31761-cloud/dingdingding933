import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  ZapOff, 
  Clock, 
  Settings, 
  RotateCw, 
  Sparkles, 
  ArrowLeft, 
  Sliders, 
  Check, 
  X,
  Scan,
  Video,
  Camera as CameraIcon
} from 'lucide-react';
import { PhotoItem, ScreenType } from '../types';

interface CameraScreenProps {
  onBack: () => void;
  onNavigateToAlbum: () => void;
  onCapturePhoto: (photo: PhotoItem) => void;
  latestPhotoUrl?: string;
}

type CameraMode = '扫描' | '照片' | '视频';

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onBack,
  onNavigateToAlbum,
  onCapturePhoto,
  latestPhotoUrl,
}) => {
  const [mode, setMode] = useState<CameraMode>('照片');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('auto');
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [isFacingUser, setIsFacingUser] = useState(false);
  const [useLiveStream, setUseLiveStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'none' | 'warm' | 'cool' | 'vintage' | 'vivid'>('none');
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: isFacingUser ? 'user' : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          if (!active) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setUseLiveStream(true);
          setCameraError(null);
        } else {
          setUseLiveStream(false);
        }
      } catch (err) {
        console.warn('Camera access unavailable, using high-fidelity artistic preview:', err);
        setUseLiveStream(false);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isFacingUser]);

  // Audio shutter sound synthesizer via Web Audio API
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // AudioContext might be blocked before user interaction
    }
  };

  const handleTriggerShutter = () => {
    if (countdown !== null || isCapturing) return;

    if (timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            executeCapture();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const executeCapture = () => {
    setIsCapturing(true);
    setFlashEffect(true);
    playShutterSound();

    setTimeout(() => {
      setFlashEffect(false);
      setIsCapturing(false);

      // Create new photo item
      let photoUrl = 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop';
      
      // If live video is active, grab screenshot from canvas
      if (videoRef.current && useLiveStream && videoRef.current.videoWidth > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            photoUrl = canvas.toDataURL('image/jpeg', 0.85);
          }
        } catch (e) {
          console.warn('Canvas export error:', e);
        }
      }

      const newPhoto: PhotoItem = {
        id: `snap-${Date.now()}`,
        url: photoUrl,
        caption: mode === '扫描' ? '文档扫描件' : '随手快拍记录',
        dateStr: '10月15日',
        category: mode === '扫描' ? '全部' : '自拍',
        aspect: '4/3',
        span: 2,
        takenAt: Date.now(),
      };

      onCapturePhoto(newPhoto);
    }, 200);
  };

  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'warm': return 'sepia(25%) saturate(140%) brightness(105%)';
      case 'cool': return 'hue-rotate(15deg) saturate(110%) brightness(102%)';
      case 'vintage': return 'contrast(115%) sepia(35%) brightness(95%)';
      case 'vivid': return 'saturate(160%) contrast(110%)';
      default: return 'none';
    }
  };

  return (
    <div className="relative h-screen w-full max-w-md mx-auto overflow-hidden bg-slate-900 flex flex-col justify-between select-none">
      {/* Viewfinder Background (Live Camera or Blurred aesthetic room backdrop matching Image 1) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {useLiveStream ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ filter: getFilterStyle() }}
            className={`w-full h-full object-cover ${isFacingUser ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000&auto=format&fit=crop')`,
              filter: `blur(8px) brightness(0.95) ${getFilterStyle()}`,
              transform: 'scale(1.08)',
            }}
          />
        )}

        {/* Scan reticle overlay if in Scan mode */}
        {mode === '扫描' && (
          <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
            <div className="w-full aspect-[3/4] border-2 border-white/70 rounded-3xl relative animate-pulse">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl -mb-1 -mr-1"></div>
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-sky-400/80 shadow-[0_0_12px_#38bdf8] animate-bounce"></div>
            </div>
          </div>
        )}

        {/* Flash overlay animation */}
        {flashEffect && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300"></div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/30 backdrop-blur-xs">
            <span className="text-8xl font-black text-white drop-shadow-2xl animate-ping">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Top Header HUD Bar matching Image 1 */}
      <header className="relative z-20 pt-10 px-6 flex justify-between items-center">
        {/* Back Button */}
        <button
          onClick={onBack}
          aria-label="返回"
          className="w-11 h-11 rounded-full glass-camera-hud flex items-center justify-center text-white/90 hover:text-white hover:bg-white/30 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Timer Button */}
        <button
          onClick={() => setTimer(timer === 0 ? 3 : timer === 3 ? 10 : 0)}
          aria-label="定时拍摄"
          className={`h-11 px-3.5 rounded-full glass-camera-hud flex items-center justify-center text-white/90 hover:text-white hover:bg-white/30 transition-all active:scale-95 text-xs font-bold gap-1 ${
            timer > 0 ? 'bg-amber-500/40 text-amber-200 border-amber-300/60' : ''
          }`}
        >
          <Clock className="w-5 h-5" />
          {timer > 0 && <span>{timer}s</span>}
        </button>

        {/* Flash Toggle Button */}
        <button
          onClick={() => setFlash(flash === 'auto' ? 'on' : flash === 'on' ? 'off' : 'auto')}
          aria-label="闪光灯"
          className={`w-11 h-11 rounded-full glass-camera-hud flex items-center justify-center text-white/90 hover:text-white hover:bg-white/30 transition-all active:scale-95 ${
            flash === 'on' ? 'bg-amber-400/40 text-amber-200 border-amber-300/60' : ''
          }`}
        >
          {flash === 'off' ? (
            <ZapOff className="w-5 h-5" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Zap className="w-5 h-5" />
              {flash === 'auto' && (
                <span className="absolute -bottom-1 -right-1 text-[8px] font-extrabold text-white bg-black/60 px-0.5 rounded">
                  A
                </span>
              )}
            </div>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          aria-label="设置"
          className="w-11 h-11 rounded-full glass-camera-hud flex items-center justify-center text-white/90 hover:text-white hover:bg-white/30 transition-all active:scale-95"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Filter Quick Selector (If settings opened) */}
      {showSettings && (
        <div className="relative z-30 mx-6 py-2 px-3 glass-modal rounded-2xl flex items-center justify-between text-xs text-slate-800 animate-in fade-in slide-in-from-top-2">
          <span className="font-bold text-slate-700">滤镜风格:</span>
          <div className="flex gap-1.5">
            {(['none', 'warm', 'cool', 'vintage', 'vivid'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all ${
                  activeFilter === f ? 'bg-slate-900 text-white' : 'bg-white/60 text-slate-700 hover:bg-white'
                }`}
              >
                {f === 'none' ? '原图' : f === 'warm' ? '暖阳' : f === 'cool' ? '清透' : f === 'vintage' ? '复古' : '鲜明'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls Area matching Image 1 */}
      <footer className="relative z-20 pb-10 pt-4 px-6 flex flex-col items-center gap-6">
        {/* Mode Selector Pill: 扫描 | 照片 | 视频 */}
        <div className="glass-camera-hud rounded-full p-1.5 flex items-center gap-1 shadow-xl border border-white/50">
          {(['扫描', '照片', '视频'] as CameraMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                mode === m
                  ? 'bg-white/90 text-slate-900 shadow-md scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Shutter Button & Gallery Thumbnail Row */}
        <div className="w-full flex items-center justify-between px-4">
          {/* Left: Thumbnail of last photo */}
          <button
            onClick={onNavigateToAlbum}
            aria-label="打开相册"
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/80 shadow-lg p-0.5 glass-camera-hud active:scale-95 transition-all group"
          >
            <img
              src={latestPhotoUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format&fit=crop'}
              alt="最新照片"
              className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Center: Luminous Shutter Button matching Image 1 */}
          <div className="relative flex items-center justify-center">
            {/* Outer halo ring */}
            <div className="w-22 h-22 rounded-full border-2 border-white/40 flex items-center justify-center transition-transform active:scale-90">
              {/* Inner capture button */}
              <button
                id="btn-camera-shutter"
                onClick={handleTriggerShutter}
                aria-label="拍摄快照"
                className="w-18 h-18 rounded-full glass-button-glow flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-2xl"
              >
                {mode === '视频' ? (
                  <div className="w-6 h-6 rounded-md bg-red-500 shadow-xs"></div>
                ) : mode === '扫描' ? (
                  <Scan className="w-7 h-7 text-slate-800" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-white to-slate-100 shadow-inner"></div>
                )}
              </button>
            </div>
          </div>

          {/* Right: Camera Flip Button */}
          <button
            onClick={() => setIsFacingUser(!isFacingUser)}
            aria-label="翻转镜头"
            className="w-14 h-14 rounded-full glass-camera-hud flex items-center justify-center text-white/90 hover:text-white hover:bg-white/30 transition-all active:scale-95"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};
