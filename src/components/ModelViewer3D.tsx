import React, { useState, useRef, useEffect } from 'react';
import { Hotspot } from '../types';
import { 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  AlertCircle, 
  Play, 
  Pause, 
  Sun, 
  Ruler, 
  Activity, 
  Wrench, 
  Compass, 
  Zap, 
  Grid
} from 'lucide-react';

interface ModelViewer3DProps {
  modelSrc: string;
  altText: string;
  hotspots?: Hotspot[];
  activeHotspotId?: string;
  onHotspotClick?: (hotspot: Hotspot) => void;
  heightClass?: string;
  cameraOrbit?: string;
  fieldOfView?: string;
  showPresets?: boolean;
  className?: string;
}

const ModelViewerElement = 'model-viewer' as any;

type LabEnvironment = 'workbench' | 'cyber' | 'cleanroom';
type LightingMode = 'daylight' | 'focused' | 'rgb';

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  modelSrc,
  altText,
  hotspots = [],
  activeHotspotId,
  onHotspotClick,
  heightClass = "h-[450px] md:h-[520px]",
  cameraOrbit = "-20deg 75deg 105%",
  fieldOfView = "30deg",
  showPresets = true,
  className = ""
}) => {
  const viewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Lab & Realism States
  const [environment, setEnvironment] = useState<LabEnvironment>('workbench');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('daylight');
  const [showDimensions, setShowDimensions] = useState<boolean>(false);
  const [isPowerActive, setIsPowerActive] = useState<boolean>(false);
  const [showPedestal, setShowPedestal] = useState<boolean>(true);

  // Normalize model source path
  const resolvedModelSrc = React.useMemo(() => {
    if (!modelSrc) return '';
    if (modelSrc.startsWith('/3d-models/')) return modelSrc;
    if (modelSrc.startsWith('3d-models/')) return `/${modelSrc}`;
    const filename = modelSrc.replace(/^\//, '');
    return `/3d-models/${filename}`;
  }, [modelSrc]);

  // Model physical dimensions dictionary
  const modelSpecs = React.useMemo(() => {
    const filename = modelSrc.split('/').pop() || '';
    switch (filename) {
      case 'case.glb':
        return {
          title: 'کیس Mid-Tower Gaming',
          dimensions: '460 × 215 × 430 میلی‌متر',
          weight: '6.4 کیلوگرم',
          material: 'فولاد SPCC + شیشه نشکن 4mm',
          cooling: 'پشتیبانی از رادیاتور تا 360mm'
        };
      case 'cooling.glb':
        return {
          title: 'خنک‌کننده بادی پردازنده (Tower Cooler)',
          dimensions: '125 × 125 × 158 میلی‌متر',
          weight: '820 گرم',
          material: 'پایه نیکل‌اندود + ۶ لوله حرارتی مسی 6mm',
          cooling: 'توان دفع حرارت TDP تا 180 وات'
        };
      case 'motherboard.glb':
        return {
          title: 'مادربرد Micro-ATX',
          dimensions: '244 × 244 میلی‌متر',
          weight: '750 گرم',
          material: 'برد مدارچاپی ۱۰ لایه فایبرگلاس FR4',
          cooling: 'هیت‌سینک آلومینیومی دوبل VRM'
        };
      case 'gpu.glb':
        return {
          title: 'کارت گرافیک اختصاصی PCIe 4.0',
          dimensions: '270 × 120 × 48 میلی‌متر (۲ اسلات)',
          weight: '890 گرم',
          material: 'شیلد فلزی + بک‌پلیت آلومینیومی سخت',
          cooling: 'سیستم خنک‌سازی با فن‌های دوگانه/سه‌گانه'
        };
      case 'cpu.glb':
        return {
          title: 'پردازنده سوکت LGA 1200',
          dimensions: '37.5 × 37.5 × 4.4 میلی‌متر',
          weight: '30 گرم',
          material: 'محافظ حرارتی مسی نیکل‌اندود (IHS)',
          cooling: 'اتصال حرارتی با خمیر سیلیکون مرغوب'
        };
      case 'ram.glb':
        return {
          title: 'ماژول رم DDR4 288-Pin',
          dimensions: '133.35 × 31.25 × 7.2 میلی‌متر',
          weight: '45 گرم',
          material: 'هیت‌اسپریدر آلومینیومی آنودایز شده',
          cooling: 'خنک‌کننده پسیو با پد حرارتی سیلیکونی'
        };
      case 'power_supply.glb':
        return {
          title: 'پاور استاندارد ATX 12V',
          dimensions: '150 × 86 × 140 میلی‌متر',
          weight: '1.6 کیلوگرم',
          material: 'شاسی فولادی الکترواستاتیک با توری لانه زنبوری',
          cooling: 'فن ۱۲۰ میلی‌متری بی‌صدا Hydraulic Bearing'
        };
      case 'storage.glb':
        return {
          title: 'اس‌اس‌دی M.2 NVMe PCIe',
          dimensions: '80 × 22 × 2.2 میلی‌متر (M.2 2280)',
          weight: '8 گرم',
          material: 'کنترلر نیکلی + تراشه‌های 3D TLC NAND',
          cooling: 'برچسب حرارتی گرافنی دفع گرما'
        };
      default:
        return {
          title: 'قطعه سخت‌افزاری رایانه',
          dimensions: 'استاندارد کارگاهی کامپیوتر',
          weight: 'استاندارد',
          material: 'قطعات الکترونیکی استاندارد',
          cooling: 'سیستم خنک‌کاری استاندارد'
        };
    }
  }, [modelSrc]);

  // Sync activeHotspotId from prop if provided
  useEffect(() => {
    if (activeHotspotId) {
      const match = hotspots.find(h => h.id === activeHotspotId);
      if (match) {
        setSelectedHotspot(match);
      }
    }
  }, [activeHotspotId, hotspots]);

  // Handle camera view presets
  const handlePreset = (orbit: string, target?: string) => {
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = orbit;
      if (target) {
        viewerRef.current.cameraTarget = target;
      } else {
        viewerRef.current.cameraTarget = "auto auto auto";
      }
    }
  };

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = cameraOrbit;
      viewerRef.current.cameraTarget = "auto auto auto";
      viewerRef.current.fieldOfView = fieldOfView;
    }
    setSelectedHotspot(null);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Listen to model-viewer load / error events
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onLoad = () => {
      setIsLoading(false);
      setLoadError(false);
    };
    const onError = () => {
      setIsLoading(false);
      setLoadError(true);
    };

    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
    };
  }, [modelSrc]);

  // Compute exposure and lighting style
  const currentExposure = lightingMode === 'focused' ? '1.30' : lightingMode === 'daylight' ? '1.15' : '1.05';

  return (
    <div
      ref={containerRef}
      id="3d-stage-container"
      style={{ direction: 'ltr', textAlign: 'left' }}
      className={`relative w-full rounded-2xl overflow-hidden border border-[#2b3c56]/60 shadow-2xl transition-all duration-500 select-none ${heightClass} ${className} ${
        environment === 'workbench'
          ? 'bg-gradient-to-b from-[#0e1726] via-[#121c2e] to-[#0a101b]'
          : environment === 'cyber'
          ? 'bg-gradient-to-b from-[#060a12] via-[#0b1324] to-[#04070d]'
          : 'bg-gradient-to-b from-[#182333] via-[#1f2d40] to-[#121b27]'
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* REALISTIC 3D LABORATORY WORKBENCH / STAGE BACKGROUND LAYERS   */}
      {/* ------------------------------------------------------------- */}

      {/* Layer 1: Overhead Lab Task Lighting Spotlight Glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: lightingMode === 'focused'
            ? 'radial-gradient(circle at 50% 25%, rgba(254, 240, 138, 0.16) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 80%)'
            : lightingMode === 'rgb'
            ? 'radial-gradient(circle at 45% 25%, rgba(6, 182, 212, 0.18) 0%, rgba(168, 85, 247, 0.12) 45%, transparent 75%)'
            : 'radial-gradient(circle at 50% 20%, rgba(224, 242, 254, 0.14) 0%, rgba(30, 58, 138, 0.08) 55%, transparent 80%)'
        }}
      />

      {/* Layer 2: Workbench Anti-Static ESD Grid & Technical Marks */}
      {environment === 'workbench' && (
        <>
          {/* 10mm Micro-Grid Lines */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(rgba(59,130,246,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.18)_1px,transparent_1px)] bg-[size:28px_28px]"
          />
          
          {/* Workbench Technical Header Watermark */}
          <div className="absolute top-14 left-5 pointer-events-none opacity-30 text-[10px] font-mono text-blue-300 space-y-0.5">
            <div>HARDWARE LAB // WORKBENCH STATION #01</div>
            <div>ESD SURFACE RESISTANCE: 10^6 - 10^9 Ω // GROUNDED</div>
          </div>

          {/* Workbench Metric Ruler Marks along the Left Edge */}
          <div className="absolute top-16 bottom-16 left-3 w-3 pointer-events-none opacity-20 flex flex-col justify-between text-[8px] font-mono text-blue-200">
            {['300mm', '250mm', '200mm', '150mm', '100mm', '50mm', '0mm'].map((tick) => (
              <div key={tick} className="flex items-center gap-1">
                <span className="w-2 h-px bg-blue-400" />
                <span>{tick}</span>
              </div>
            ))}
          </div>

          {/* Anti-Static Grounding Snap Icon (Bottom-Left) */}
          <div className="absolute bottom-16 left-4 pointer-events-none z-10 flex items-center gap-2 bg-[#0a111e]/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-blue-500/20 text-[10px] font-mono text-blue-300/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>ESD GROUND TERMINAL [OK]</span>
          </div>

          {/* Diagnostic Multimeter Readout Badge (Bottom-Left above snap) */}
          <div className="absolute bottom-24 left-4 pointer-events-none z-10 hidden sm:flex items-center gap-2 bg-[#0c1524]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>5.02V DC // TESTBENCH STANDBY</span>
          </div>
        </>
      )}

      {/* Layer 2 (Cyber Theme): Concentric Holographic Laser Rings */}
      {environment === 'cyber' && (
        <>
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_75%,rgba(6,182,212,0.2)_0%,transparent_60%)]" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[340px] h-[160px] pointer-events-none border border-cyan-500/30 rounded-[100%] [transform:rotateX(68deg)] shadow-[0_0_30px_rgba(6,182,212,0.2)]" />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[240px] h-[110px] pointer-events-none border border-purple-500/30 rounded-[100%] [transform:rotateX(68deg)]" />
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(168,85,247,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.15)_1px,transparent_1px)] bg-[size:36px_36px]" />
        </>
      )}

      {/* Layer 2 (Cleanroom Theme): Sterile High-CRI Calibration Grid */}
      {environment === 'cleanroom' && (
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#e0f2fe_1px,transparent_1px)] bg-[size:24px_24px]" />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3D LABORATORY ROTATING TURNTABLE PEDESTAL BASE                */}
      {/* ------------------------------------------------------------- */}
      {showPedestal && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-all duration-300"
          style={{
            perspective: '600px',
            width: '320px',
            height: '90px'
          }}
        >
          {/* Turntable 3D Oval Stage */}
          <div 
            className="w-full h-full rounded-[100%] border border-blue-400/30 bg-gradient-to-b from-[#1e293b]/70 via-[#0f172a]/80 to-[#020617]/90 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center justify-center relative overflow-hidden [transform:rotateX(68deg)]"
          >
            {/* Center concentric turntable rings */}
            <div className="w-[82%] h-[82%] rounded-[100%] border border-blue-500/20 flex items-center justify-center">
              <div className="w-[60%] h-[60%] rounded-[100%] border border-cyan-400/20" />
            </div>

            {/* Glowing outer rim LED status */}
            <div className={`absolute inset-0 rounded-[100%] transition-opacity duration-500 ${
              isPowerActive 
                ? 'border-2 border-emerald-400/80 shadow-[0_0_20px_#10b981]' 
                : 'border border-blue-500/40'
            }`} />
          </div>

          {/* Pedestal Label */}
          <div className="text-center mt-[-10px] text-[9px] font-mono tracking-widest text-gray-400 opacity-60">
            360° PRECISION ROTATING TURNTABLE
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOP CONTROL BARS & LAB STATUS                                 */}
      {/* ------------------------------------------------------------- */}

      {/* Top-Left: Model Name, Live Lab Mode & Power Diagnostic Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-[#09111d]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-blue-200 shadow-lg">
          <span className={`w-2.5 h-2.5 rounded-full transition-all ${
            isPowerActive 
              ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]' 
              : 'bg-blue-400'
          }`} />
          <span className="font-bold">LAB // {modelSrc.split('/').pop()}</span>
        </div>

        {/* Active Power Test Indicator */}
        {isPowerActive && (
          <div className="animate-in fade-in zoom-in-95 duration-200 flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-emerald-300">
            <Zap className="w-3 h-3 text-emerald-400 animate-bounce" />
            <span>TEST RUNNING // ALL FANS ACTIVE</span>
          </div>
        )}
      </div>

      {/* Top-Right: Lab Utilities Bar (Environment, Lighting, Auto-Rotate, Fullscreen) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-[#09111d]/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
        
        {/* Environment Theme Switcher */}
        <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5 mr-1">
          <button
            onClick={() => setEnvironment('workbench')}
            title="محیط میز کار آزمایشگاه (ESD Workbench)"
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
              environment === 'workbench'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Wrench className="w-3 h-3" />
            <span className="hidden md:inline">میز کار</span>
          </button>

          <button
            onClick={() => setEnvironment('cyber')}
            title="محیط استودیو سایبر نئون (Cyber Studio)"
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
              environment === 'cyber'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span className="hidden md:inline">سایبر</span>
          </button>

          <button
            onClick={() => setEnvironment('cleanroom')}
            title="اتاق تمیز آزمایشگاهی (Cleanroom)"
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
              environment === 'cleanroom'
                ? 'bg-slate-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span className="hidden md:inline">اتاق تمیز</span>
          </button>
        </div>

        {/* Auto-Rotate 360° Toggle */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? "توقف چرخش خودکار" : "چرخش ۳۶۰ درجه خودکار"}
          className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
            isAutoRotating
              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[10px] hidden sm:inline">{isAutoRotating ? 'توقف' : 'چرخش ۳۶۰°'}</span>
        </button>

        {/* Lighting Selector Button */}
        <button
          onClick={() => {
            const nextMode: Record<LightingMode, LightingMode> = {
              daylight: 'focused',
              focused: 'rgb',
              rgb: 'daylight'
            };
            setLightingMode(nextMode[lightingMode]);
          }}
          title={`تغییر نورپردازی آزمایشگاه (فعلی: ${lightingMode})`}
          className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
        </button>

        {/* Physical Dimension Overlay Toggle */}
        <button
          onClick={() => setShowDimensions(!showDimensions)}
          title="نمایش ابعاد فیزیکی و مشخصات مقیاس"
          className={`p-1.5 rounded-lg transition ${
            showDimensions
              ? 'bg-emerald-600 text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Power Test Mode Toggle */}
        <button
          onClick={() => setIsPowerActive(!isPowerActive)}
          title="شبیه‌سازی تست جریان برق و فن‌ها"
          className={`p-1.5 rounded-lg transition ${
            isPowerActive
              ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-300'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera Orbit */}
        <button
          onClick={handleReset}
          title="بازنشانی زاویه دید دوربین"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "خروج از تمام‌صفحه" : "حالت تمام‌صفحه"}
          className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TECHNICAL PHYSICAL DIMENSIONS CARD OVERLAY                     */}
      {/* ------------------------------------------------------------- */}
      {showDimensions && (
        <div 
          style={{ direction: 'rtl' }}
          className="absolute top-16 left-4 z-30 max-w-xs bg-[#0b1422]/95 backdrop-blur-xl p-4 rounded-xl border border-blue-500/40 shadow-2xl text-right animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
              <Ruler className="w-3.5 h-3.5" />
              <span>مشخصات فیزیکی و ابعاد قطعه</span>
            </div>
            <button 
              onClick={() => setShowDimensions(false)}
              className="text-gray-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="text-gray-200 font-bold">{modelSpecs.title}</div>
            <div className="flex items-center justify-between text-gray-400 text-[11px] pt-1 border-t border-white/5">
              <span>ابعاد خارجی (H×W×D):</span>
              <span className="font-mono text-cyan-300 font-bold" style={{ direction: 'ltr' }}>{modelSpecs.dimensions}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400 text-[11px]">
              <span>وزن تقریبی:</span>
              <span className="text-white font-mono">{modelSpecs.weight}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400 text-[11px]">
              <span>جنس متریال:</span>
              <span className="text-gray-300">{modelSpecs.material}</span>
            </div>
            <div className="text-[10px] text-blue-300/80 pt-1">
              💡 {modelSpecs.cooling}
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#09101a]/80 backdrop-blur-sm text-gray-300">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-blue-200" style={{ direction: 'rtl' }}>
            در حال آماده‌سازی و بارگذاری مدل سه‌بعدی در آزمایشگاه…
          </span>
        </div>
      )}

      {/* Fallback Notice if GLB failed */}
      {loadError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#09101a]/95 text-amber-300" style={{ direction: 'rtl' }}>
          <AlertCircle className="w-10 h-10 mb-2 text-amber-400" />
          <p className="text-sm font-bold">مدل سه‌بعدی در مرورگر بارگذاری نشد.</p>
          <p className="text-xs text-gray-400 mt-1 font-mono" style={{ direction: 'ltr' }}>{modelSrc}</p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GOOGLE <model-viewer> 3D COMPONENT WITH PBR REALISM           */}
      {/* ------------------------------------------------------------- */}
      <ModelViewerElement
        ref={viewerRef}
        src={resolvedModelSrc}
        alt={altText}
        camera-controls
        touch-action="pan-y"
        environment-image="neutral"
        shadow-intensity="1.7"
        shadow-softness="0.45"
        exposure={currentExposure}
        tone-mapping="neutral"
        camera-orbit={cameraOrbit}
        field-of-view={fieldOfView}
        interaction-prompt="none"
        auto-rotate={isAutoRotating ? "true" : undefined}
        auto-rotate-delay="0"
        rotation-per-second="18deg"
        style={{
          width: '100%',
          height: '100%',
          direction: 'ltr',
          textAlign: 'left',
          outline: 'none',
          backgroundColor: 'transparent'
        }}
      >
        {/* Hotspots inside model-viewer slots */}
        {hotspots.map((h, index) => {
          const isSelected = selectedHotspot?.id === h.id;
          const offsetPresets = [
            { x: -12, y: -24 },
            { x: 14, y: -20 },
            { x: 18, y: 22 },
            { x: -16, y: 24 },
          ];
          const offset = offsetPresets[index % offsetPresets.length];
          const isLeft = h.leaderDirection === 'left' || offset.x < 0;

          return (
            <button
              key={h.id}
              slot={`hotspot-${h.id}`}
              data-position={h.position}
              data-normal={h.normal || "0 1 0"}
              onClick={() => {
                setSelectedHotspot(isSelected ? null : h);
                if (onHotspotClick) onHotspotClick(h);
              }}
              style={{
                direction: 'rtl',
                textAlign: 'right',
                pointerEvents: 'auto',
                outline: 'none',
                transform: `translate(${offset.x}px, ${offset.y}px)`
              }}
              className="group relative cursor-pointer select-none transition-all duration-200"
              aria-label={h.label}
            >
              {/* Leader-Line SVG */}
              <svg
                className="absolute pointer-events-none -z-10"
                style={{
                  width: '60px',
                  height: '40px',
                  top: offset.y < 0 ? '100%' : '-30px',
                  left: isLeft ? '80%' : '-40px'
                }}
              >
                <line
                  x1={isLeft ? "10" : "50"}
                  y1={offset.y < 0 ? "0" : "35"}
                  x2={isLeft ? "45" : "15"}
                  y2={offset.y < 0 ? "30" : "5"}
                  stroke="rgba(96, 165, 250, 0.8)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              </svg>

              {/* Hotspot Tag Pill Matching Image */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-400/50 scale-105' 
                  : 'bg-[#0f172a]/90 text-gray-100 border-white/20 hover:bg-[#1e293b] hover:border-blue-400/60'
              }`}>
                {/* Glowing Dot */}
                <span className={`w-2 h-2 rounded-full transition-colors ${
                  isSelected ? 'bg-white ring-2 ring-blue-300' : 'bg-blue-400 group-hover:bg-blue-300'
                }`} />
                <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap">
                  {h.label}
                </span>
              </div>
            </button>
          );
        })}
      </ModelViewerElement>

      {/* Selected Hotspot Description Tooltip Card */}
      {selectedHotspot && (
        <div 
          style={{ direction: 'rtl' }}
          className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-30 bg-[#0f172a]/95 backdrop-blur-xl p-3.5 rounded-xl border border-blue-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-right"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedHotspot.label}</span>
            </div>
            <button 
              onClick={() => setSelectedHotspot(null)}
              className="text-gray-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            {selectedHotspot.description}
          </p>
          {selectedHotspot.step && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-300">
              <span>مرتبط با مرحله:</span>
              <span className="font-medium text-white">{selectedHotspot.step}</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM CAMERA VIEW PRESETS BAR                                */}
      {/* ------------------------------------------------------------- */}
      {showPresets && (
        <div 
          style={{ direction: 'rtl' }}
          className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 z-20 flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#09111e]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-lg no-scrollbar"
        >
          <button
            onClick={() => handlePreset("-20deg 75deg 105%")}
            className="px-2.5 py-1 text-[11px] text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition whitespace-nowrap font-medium"
          >
            ایزومتریک
          </button>
          <button
            onClick={() => handlePreset("0deg 10deg 110%")}
            className="px-2.5 py-1 text-[11px] text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition whitespace-nowrap font-medium"
          >
            نمای بالا (Top)
          </button>
          <button
            onClick={() => handlePreset("0deg 90deg 120%")}
            className="px-2.5 py-1 text-[11px] text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition whitespace-nowrap font-medium"
          >
            نمای روبرو (Front)
          </button>
          <button
            onClick={() => handlePreset("-15deg 65deg 55%", "-0.020m 0.02m -0.035m")}
            className="px-2.5 py-1 text-[11px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition whitespace-nowrap font-medium"
          >
            زوم روی سوکت / جزئیات
          </button>
        </div>
      )}
    </div>
  );
};
