import React, { useState, useEffect } from 'react';
import { AssemblyStep } from '../types';
import { ModelViewer3D } from './ModelViewer3D';
import { CheckCircle2, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';

interface AssemblyGuideViewProps {
  steps: AssemblyStep[];
}

export const AssemblyGuideView: React.FC<AssemblyGuideViewProps> = ({ steps: initialSteps }) => {
  const [guideSteps, setGuideSteps] = useState<AssemblyStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [customCameraOrbit, setCustomCameraOrbit] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('completed_assembly_steps');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  // Fetch full assembly-steps.json if available
  useEffect(() => {
    let isMounted = true;
    
    async function loadSteps() {
      try {
        let res = await fetch('/data/assembly-steps.json');
        if (!res.ok) {
          res = await fetch('/api/assembly-steps');
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.steps && data.steps.length > 0) {
          const mapped: AssemblyStep[] = data.steps.map((st: any) => ({
            id: st.step || st.stepNumber || 1,
            step: st.step,
            stepNumber: st.stepNumber,
            title: st.title,
            component: st.component,
            description: st.description,
            warning: st.safetyWarning || st.warning || null,
            safetyWarning: st.safetyWarning || null,
            partId: st.partId || null,
            instructions: st.instructions || [],
            model: st.model || (st.partId ? `${st.partId}.glb` : 'case.glb'),
            status: 'pending'
          }));
          setGuideSteps(mapped);
        }
      } catch (err) {
        // Silently use bundled initialSteps on any network or parsing error
        console.info('Using bundled assembly steps fallback');
      }
    }

    loadSteps();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSteps = guideSteps.length || 15;
  const currentStep = guideSteps[currentStepIndex] || guideSteps[0];
  const currentStepNum = currentStep?.step || currentStep?.id || (currentStepIndex + 1);
  const progressPercent = Math.round((currentStepNum / totalSteps) * 100);

  const toggleStepCompleted = (stepId: number) => {
    let updated: number[];
    if (completedSteps.includes(stepId)) {
      updated = completedSteps.filter(id => id !== stepId);
    } else {
      updated = [...completedSteps, stepId];
    }
    setCompletedSteps(updated);
    try {
      localStorage.setItem('completed_assembly_steps', JSON.stringify(updated));
    } catch {}
  };

  const handleNext = () => {
    // Automatically mark current as done when clicking next
    if (!completedSteps.includes(currentStepNum)) {
      const updated = [...completedSteps, currentStepNum];
      setCompletedSteps(updated);
      try {
        localStorage.setItem('completed_assembly_steps', JSON.stringify(updated));
      } catch {}
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setCustomCameraOrbit(null);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setCustomCameraOrbit(null);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCustomCameraOrbit(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const partNamesMap: Record<string, string> = {
    case: 'کیس کامپیوتر',
    motherboard: 'مادربرد اصلی',
    cpu: 'پردازنده مرکزی (CPU)',
    cooling: 'خنک‌کننده پردازنده',
    ram: 'حافظه رم (RAM)',
    power_supply: 'منبع تغذیه (PSU)',
    storage: 'حافظه ذخیره‌سازی',
    gpu: 'کارت گرافیک (GPU)'
  };

  const safetyNote = currentStep.safetyWarning || currentStep.warning;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Horizontal Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                UNIT 1 // پودمان اول کتاب درسی
              </span>
              <span className="text-[11px] font-bold text-gray-500">
                کارگاه سخت‌افزار و شبکه
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              راهنمای مرحله‌به‌مرحله مونتاژ قطعات رایانه
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">موقعیت فعلی:</span>
              <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                گام {currentStepNum} از {totalSteps} ({progressPercent}٪)
              </span>
            </div>

            <button
              onClick={handleRestart}
              className="text-xs font-semibold text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              title="شروع مجدد از گام ۱"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی</span>
            </button>
          </div>
        </div>

        {/* Horizontal Continuous Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-gray-400">
            <span>شروع: آماده‌سازی شاسی</span>
            <span className="text-blue-600 font-bold">{progressPercent}٪ پیشرفت</span>
            <span>پایان: تست POST و بایوس</span>
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/80">
            <div
              className="h-full bg-gradient-to-l from-blue-700 via-indigo-600 to-blue-500 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* 15 Clickable Step Pointers Horizontal Rail */}
        <div className="pt-1 overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-[620px] gap-1.5">
            {guideSteps.map((st, idx) => {
              const stNum = st.step || st.id || idx + 1;
              const isCurrent = idx === currentStepIndex;
              const isDone = completedSteps.includes(stNum);

              return (
                <button
                  key={stNum}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`flex-1 min-w-[34px] py-1.5 px-1 rounded-xl text-center text-xs font-mono font-bold transition flex flex-col items-center justify-center gap-0.5 border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 shadow-sm'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                  title={`مرحله ${stNum}: ${st.title}`}
                >
                  <span className="text-[10px] leading-none">{isDone && !isCurrent ? '✓' : stNum}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCurrent ? 'bg-white' : isDone ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Active Step Work Area (One Step Shown at a Time) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 3D Visualization Model Viewer Stage */}
        <div className="lg:col-span-6 space-y-3">
          {(() => {
            const defaultOrbit = 
              currentStepNum === 10 || currentStep.partId === 'power_supply'
                ? "45deg 70deg 95%"
                : currentStepNum === 9 || currentStep.partId === 'gpu'
                  ? "-25deg 75deg 85%"
                  : currentStep.cameraOrbit || "-20deg 75deg 105%";
            
            const activeOrbit = customCameraOrbit || defaultOrbit;

            return (
              <>
                <ModelViewer3D
                  modelSrc={currentStep.model || `${currentStep.partId || 'case'}.glb`}
                  altText={currentStep.title}
                  heightClass="h-[420px] sm:h-[480px]"
                  cameraOrbit={activeOrbit}
                />

                {/* Quick Camera Angle Presets */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">زاویه‌های دید پیشنهادی:</span>
                    <span className="font-mono text-gray-400 text-[10px]">3D PERSPECTIVE</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentStepNum === 10 || currentStep.partId === 'power_supply' ? (
                      <>
                        <button
                          onClick={() => setCustomCameraOrbit("50deg 68deg 90%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          🎗️ نمای کابل‌های ۲۴ و ۸ پین
                        </button>
                        <button
                          onClick={() => setCustomCameraOrbit("-30deg 50deg 95%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          🌪️ فن و برچسب توان
                        </button>
                        <button
                          onClick={() => setCustomCameraOrbit("-120deg 75deg 95%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          🔌 سوکت ورودی برق و کلید
                        </button>
                      </>
                    ) : currentStepNum === 9 || currentStep.partId === 'gpu' ? (
                      <>
                        <button
                          onClick={() => setCustomCameraOrbit("-25deg 75deg 85%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          🌪️ فن‌های سه‌گانه و هیت‌پایپ
                        </button>
                        <button
                          onClick={() => setCustomCameraOrbit("-115deg 75deg 90%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          🖥️ براکت پشتی و خروجی HDMI
                        </button>
                        <button
                          onClick={() => setCustomCameraOrbit("0deg 110deg 85%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          🟡 رابط طلایی PCIe x16
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setCustomCameraOrbit("0deg 75deg 100%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          روبرو
                        </button>
                        <button
                          onClick={() => setCustomCameraOrbit("45deg 60deg 95%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          زاویه ۴۵ درجه
                        </button>
                        <button
                          onClick={() => setCustomCameraOrbit("0deg 10deg 90%")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                        >
                          دید از بالا
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setCustomCameraOrbit(defaultOrbit)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-800 transition mr-auto"
                    >
                      بازنشانی زاویه
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Step Information, Industrial Warning & Procedural Instructions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            
            {/* Step Header */}
            <div className="border-b border-gray-100 pb-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  مرحله {currentStepNum} از {totalSteps}
                </span>

                {currentStep.partId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700">
                    <span>قطعه مرتبط:</span>
                    <span className="text-blue-700 font-extrabold">{partNamesMap[currentStep.partId] || currentStep.partId}</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                {currentStep.title}
              </h2>

              <p className="text-xs font-semibold text-gray-500">
                قطعه هدف: {currentStep.component}
              </p>
            </div>

            {/* Small Industrial-Style Warning Strip (ONLY shown when safety note exists) */}
            {safetyNote && (
              <div className="rounded-xl overflow-hidden border border-amber-500/40 bg-[#121620] text-amber-200 shadow-md flex items-stretch">
                {/* Diagonal hazard stripe accent bar */}
                <div
                  className="w-2.5 flex-shrink-0"
                  style={{
                    background: 'repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 8px, #111827 8px, #111827 16px)'
                  }}
                />

                <div className="p-3.5 flex-1 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5 border border-amber-500/30">
                    ⚠
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-600/40 px-1.5 py-0.2 rounded">
                        CAUTION // ایمنی کارگاهی
                      </span>
                      <span className="font-bold text-amber-300">نکته ایمنی الزامی کتاب درسی:</span>
                    </div>
                    <p className="text-amber-100/90 leading-relaxed pt-0.5 font-medium">
                      {safetyNote}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Textbook Detailed Description */}
            {currentStep.description && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span>📖 شرح فنی مرحله:</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                  {currentStep.description}
                </p>
              </div>
            )}

            {/* Numbered Procedural Instructions */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span>⚡ مراحل اجرایی در کارگاه:</span>
              </h3>
              <div className="space-y-2">
                {currentStep.instructions.map((ins, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 text-xs sm:text-sm text-gray-700"
                  >
                    <span className="w-5 h-5 rounded-lg bg-[#1d314b] text-white flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Controls: Toggle Completed & Navigation Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleStepCompleted(currentStepNum)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                    completedSteps.includes(currentStepNum)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      completedSteps.includes(currentStepNum) ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
                  <span>
                    {completedSteps.includes(currentStepNum)
                      ? 'این مرحله انجام شده است'
                      : 'ثبت این گام به عنوان انجام شده'}
                  </span>
                </button>

                <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
                  گام {currentStepNum} / {totalSteps}
                </span>
              </div>

              {/* Previous and Next Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>← مرحله قبل</span>
                </button>

                <button
                  onClick={handleNext}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 group ${
                    currentStepIndex === totalSteps - 1
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#1d314b] hover:bg-[#253f60] text-white'
                  }`}
                >
                  <span>{currentStepIndex === totalSteps - 1 ? 'تکمیل و پایان مونتاژ 🎉' : 'مرحله بعد'}</span>
                  <span className="group-hover:-translate-x-1 transition-transform">→</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
