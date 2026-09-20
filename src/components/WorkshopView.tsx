import React, { useState, useEffect } from 'react';
import { Part, Hotspot } from '../types';
import { ModelViewer3D } from './ModelViewer3D';
import { InteractiveAssembly } from './InteractiveAssembly';
import { Wrench, CheckCircle2, AlertCircle, Sparkles, Layers, Info, ArrowLeft, ArrowRight, RotateCcw, MousePointer2 } from 'lucide-react';

interface WorkshopPartItem extends Part {
  installLocation?: {
    targetModel: string;
    socketName: string;
    label: string;
    position: string;
    normal?: string;
    description: string;
    leaderDirection?: 'left' | 'right' | 'top' | 'bottom';
    step?: string;
    cameraOrbit?: string;
    cameraTarget?: string;
    instructions?: string[];
    safetyWarning?: string;
  };
}

interface WorkshopViewProps {
  parts: Part[];
}

export const WorkshopView: React.FC<WorkshopViewProps> = ({ parts }) => {
  const [mode, setMode] = useState<'interactive' | 'guided'>('interactive');
  const [workshopParts, setWorkshopParts] = useState<WorkshopPartItem[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0); // 0 = cpu, 1 = ram, 2 = gpu
  const [phase, setPhase] = useState<'phase1' | 'phase2'>('phase1');
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Fetch workshop-parts.json or fallback to parts filtered by cpu, ram, gpu
  useEffect(() => {
    let isMounted = true;

    async function loadWorkshopParts() {
      try {
        let res = await fetch('/data/workshop-parts.json');
        if (!res.ok) {
          res = await fetch('/api/workshop-parts');
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.parts && data.parts.length > 0) {
          setWorkshopParts(data.parts);
          return;
        }
        fallbackParts();
      } catch (err) {
        if (isMounted) {
          fallbackParts();
        }
      }
    }

    function fallbackParts() {
      const filtered = ['cpu', 'ram', 'gpu']
        .map(id => parts.find(p => p.id === id))
        .filter(Boolean) as WorkshopPartItem[];
      setWorkshopParts(filtered);
    }

    loadWorkshopParts();
    return () => {
      isMounted = false;
    };
  }, [parts]);

  const currentPart: WorkshopPartItem | undefined = workshopParts[currentStepIndex];
  const motherboardPart = parts.find(p => p.id === 'motherboard') || parts[0];

  // Socket hotspot for Phase 2 pointing to motherboard
  const getPhase2Hotspot = (): Hotspot[] => {
    if (!currentPart) return [];
    const loc = currentPart.installLocation;
    if (loc) {
      return [{
        id: `install-${currentPart.id}`,
        label: loc.label,
        position: loc.position,
        normal: loc.normal || '0 1 0',
        description: loc.description,
        leaderDirection: loc.leaderDirection || 'left',
        step: loc.step
      }];
    }

    // Fallback coordinates on motherboard
    if (currentPart.id === 'cpu') {
      return [{
        id: 'install-cpu',
        label: 'محل نصب سوکت پردازنده',
        position: '-0.020 0.015 -0.035',
        normal: '0 1 0',
        description: 'سوکت LGA 1200 با اهرم ضامن فلزی جهت قرارگیری پردازنده',
        leaderDirection: 'left',
        step: 'گام ۱: نصب پردازنده'
      }];
    } else if (currentPart.id === 'ram') {
      return [{
        id: 'install-ram',
        label: 'محل نصب اسلات حافظه رم',
        position: '0.085 0.015 -0.025',
        normal: '0 1 0',
        description: 'شکاف‌های DDR4 دوکاناله با قفل‌های دوطرف',
        leaderDirection: 'right',
        step: 'گام ۲: نصب رم'
      }];
    } else {
      return [{
        id: 'install-gpu',
        label: 'محل نصب اسلات کارت گرافیک',
        position: '-0.025 0.015 0.060',
        normal: '0 1 0',
        description: 'شیار توسعه PCIe x16 با ضامن انتهایی',
        leaderDirection: 'left',
        step: 'گام ۳: نصب کارت گرافیک'
      }];
    }
  };

  const handleNextPhase = () => {
    setPhase('phase2');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleNextPart = () => {
    if (currentStepIndex < workshopParts.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setPhase('phase1');
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setPhase('phase1');
    setIsComplete(false);
  };

  if (!currentPart) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
        در حال بارگذاری کارگاه مونتاژ سخت‌افزار...
      </div>
    );
  }

  const cameraOrbit = phase === 'phase1' 
    ? "-20deg 75deg 105%"
    : currentPart.installLocation?.cameraOrbit || (
        currentPart.id === 'cpu' 
          ? "-15deg 65deg 55%" 
          : currentPart.id === 'ram' 
            ? "15deg 65deg 60%" 
            : "-20deg 65deg 70%"
      );

  return (
    <div className="space-y-6 pb-12">
      {/* Mode Switcher Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex items-center gap-2 shadow-sm">
        <button
          onClick={() => setMode('interactive')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 ${
            mode === 'interactive'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MousePointer2 className="w-4 h-4" />
          <span>شبیه‌ساز تعاملی اتصال قطعات (موس و لمس گوشی)</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded hidden sm:inline ${
            mode === 'interactive' ? 'bg-blue-700 text-blue-100' : 'bg-emerald-100 text-emerald-800'
          }`}>
            جدید
          </span>
        </button>

        <button
          onClick={() => setMode('guided')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 ${
            mode === 'guided'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>گردش‌کار مرحله‌ای ۳ قطعه بنیادین</span>
        </button>
      </div>

      {mode === 'interactive' ? (
        <InteractiveAssembly />
      ) : (
        <>
          {/* Workshop Stepper Header */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-1">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>کارگاه مونتاژ مرحله‌ای ۳ قطعه بنیادین</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  گردش‌کار مرحله‌ای: CPU ،RAM و GPU
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  phase === 'phase1' 
                    ? 'bg-blue-50 text-blue-800 border-blue-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {phase === 'phase1' ? 'PHASE 1 // LEARN' : 'PHASE 2 // INSTALL LOCATION'}
                </span>
                <button
                  onClick={handleRestart}
                  className="text-xs font-bold text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>شروع مجدد</span>
                </button>
              </div>
            </div>

        {/* 3-Step Indicator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {workshopParts.map((p, idx) => {
            const isActive = idx === currentStepIndex;
            const isPassed = idx < currentStepIndex || isComplete;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setPhase('phase1');
                  setIsComplete(false);
                }}
                className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                  isActive
                    ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30'
                    : isPassed
                      ? 'bg-emerald-50/50 border-emerald-200 text-gray-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">گام {idx + 1}</span>
                  <span className="text-xs font-bold block">{p.name}</span>
                </div>
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : isPassed 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {isPassed && !isActive ? '✓' : idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Phases Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPhase('phase1')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
            phase === 'phase1'
              ? 'bg-[#1d314b] text-white border-[#1d314b] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>فاز ۱: شناخت مشخصات و ساختار قطعه (Learn)</span>
        </button>

        <button
          onClick={() => setPhase('phase2')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
            phase === 'phase2'
              ? 'bg-[#1d314b] text-white border-[#1d314b] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>فاز ۲: جانمایی سوکت و نصب روی مادربرد (Install Location)</span>
        </button>
      </div>

      {/* Workshop Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 3D Model Stage (Left Column) */}
        <div className="lg:col-span-7 space-y-3">
          <ModelViewer3D
            modelSrc={phase === 'phase1' ? currentPart.model : 'motherboard.glb'}
            altText={phase === 'phase1' ? currentPart.name : 'مادربرد'}
            hotspots={phase === 'phase1' ? currentPart.hotspots : getPhase2Hotspot()}
            activeHotspotId={phase === 'phase2' ? `install-${currentPart.id}` : undefined}
            heightClass="h-[460px] sm:h-[540px]"
            cameraOrbit={cameraOrbit}
          />

          <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs text-gray-500 shadow-sm">
            <span>
              {phase === 'phase1' 
                ? '💡 مدل سه‌بعدی را آزادانه بچرخانید و ویژگی‌های فیزیکی قطعه را بررسی کنید.' 
                : '💡 خط راهنما و نشانگر، محل دقیق اتصال قطعه روی مادربرد را مشخص می‌کند.'}
            </span>
            <span className="font-mono text-gray-400 text-[10px]">3D INTERACTIVE</span>
          </div>
        </div>

        {/* Sidebar Info & Sequential Action Button (Right Column) */}
        <div className="lg:col-span-5 space-y-5">
          
          {phase === 'phase1' ? (
            /* Phase 1: Learn Info Card */
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[11px] font-bold text-blue-600 block mb-1">
                  فاز ۱: شناخت مهندسی و مشخصات
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  {currentPart.name}
                </h2>
                <h3 className="text-xs font-mono font-semibold text-blue-700 mt-0.5">
                  {currentPart.subtitle}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {currentPart.description}
              </p>

              {/* Specs Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900">مشخصات کلیدی:</h4>
                <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
                  <table className="w-full text-right divide-y divide-gray-100">
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(currentPart.specs || []).map((spec, i) => (
                        <tr key={spec.key} className={i % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}>
                          <th className="py-2 px-3 font-medium text-gray-500 w-2/5">{spec.key}</th>
                          <td className="py-2 px-3 font-bold text-gray-900 font-mono">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note */}
              {currentPart.note && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{currentPart.note}</span>
                </div>
              )}

              {/* Sequential Action Button: Go to Phase 2 (Next) */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={handleNextPhase}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-between shadow-md transition group"
                >
                  <span>مرحله بعد: مشاهده محل نصب روی مادربرد</span>
                  <span className="text-base group-hover:-translate-x-1 transition-transform">←</span>
                </button>
              </div>
            </div>
          ) : (
            /* Phase 2: Install Location Info Card */
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[11px] font-bold text-emerald-600 block mb-1">
                  فاز ۲: شناسایی محل سوکت و قفل‌گذاری
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  {currentPart.installLocation?.socketName || 'سوکت مادربرد'}
                </h2>
                <h3 className="text-xs font-mono font-semibold text-gray-500 mt-0.5">
                  {currentPart.installLocation?.label || 'محل نصب اختصاصی'}
                </h3>
              </div>

              {/* Installation Instructions */}
              <div className="space-y-2.5 text-xs text-gray-700">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>گام‌های عملیاتی نصب:</span>
                </h4>
                <div className="space-y-2">
                  {(currentPart.installLocation?.instructions || [
                    'ضامن‌های مکانیکی سوکت/شیار را باز کنید.',
                    'شیارهای راهنما را به طور کامل تطبیق دهید.',
                    'قطعه را با فشار یکنواخت فیکس کنید تا صدای کلیک قفل شدن به گوش برسد.'
                  ]).map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-200/80">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety warning */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>
                  {currentPart.installLocation?.safetyWarning || 'از اعمال فشار غیرضروری به قطعه و پین‌ها جداً خودداری فرمایید.'}
                </span>
              </div>

              {/* Sequential Action Button: Next Part OR Finish */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <button
                  onClick={handleNextPart}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-between shadow-md transition group"
                >
                  <span>
                    {currentStepIndex < workshopParts.length - 1
                      ? `قطعه بعدی: ${workshopParts[currentStepIndex + 1]?.name}`
                      : 'تکمیل کارگاه مونتاژ'}
                  </span>
                  <span className="text-base group-hover:-translate-x-1 transition-transform">←</span>
                </button>

                <button
                  onClick={() => setPhase('phase1')}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs transition"
                >
                  ← بازگشت به فاز ۱ (مشخصات قطعه)
                </button>
              </div>
            </div>
          )}

          {/* Completion Card */}
          {isComplete && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-6 shadow-xl space-y-4">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎉</div>
                <h3 className="text-xl font-extrabold">کارگاه مونتاژ با موفقیت به پایان رسید!</h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  شما جایگاه و شیوه نصب پردازنده، حافظه رم و کارت گرافیک را با موفقیت فرا گرفتید.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition"
                >
                  تکرار مجدد کارگاه
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </>
  )}
</div>
  );
};
