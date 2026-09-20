import React, { useState, useEffect } from 'react';
import { TroubleshootingSymptom, BiosBeep, DiagnosisResult } from '../types';
import { 
  Power, 
  Snowflake, 
  Monitor, 
  Fan, 
  RotateCcw, 
  Volume2, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Wrench,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HardDrive,
  Cpu,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';

interface TroubleshootingViewProps {
  onNavigateToPart?: (partId: string) => void;
}

export const TroubleshootingView: React.FC<TroubleshootingViewProps> = ({ onNavigateToPart }) => {
  const [symptoms, setSymptoms] = useState<TroubleshootingSymptom[]>([]);
  const [beepCodes, setBeepCodes] = useState<BiosBeep[]>([]);
  const [loading, setLoading] = useState(true);

  // Active symptom & decision tree state
  const [selectedSymptomId, setSelectedSymptomId] = useState<string>('power_failure');
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('q1');
  const [history, setHistory] = useState<{ questionText: string; answer: boolean }[]>([]);
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosisResult | null>(null);
  const [playingBeepIndex, setPlayingBeepIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [troubleRes, beepRes] = await Promise.allSettled([
          fetch('/data/troubleshooting.json'),
          fetch('/data/beep-codes.json')
        ]);

        if (isMounted) {
          if (troubleRes.status === 'fulfilled' && troubleRes.value.ok) {
            const data = await troubleRes.value.json();
            if (data?.symptoms?.length) {
              setSymptoms(data.symptoms);
              setSelectedSymptomId(data.symptoms[0].id);
              setCurrentQuestionId(data.symptoms[0].rootQuestionId);
            }
          }
          if (beepRes.status === 'fulfilled' && beepRes.value.ok) {
            const bData = await beepRes.value.json();
            if (Array.isArray(bData) && bData.length) {
              setBeepCodes(bData);
            }
          }
        }
      } catch (err) {
        console.warn('Troubleshooting data fallback load:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentSymptom = symptoms.find(s => s.id === selectedSymptomId) || symptoms[0];

  const handleSelectSymptom = (symptomId: string) => {
    setSelectedSymptomId(symptomId);
    const target = symptoms.find(s => s.id === symptomId);
    if (target) {
      setCurrentQuestionId(target.rootQuestionId);
    } else {
      setCurrentQuestionId('q1');
    }
    setHistory([]);
    setActiveDiagnosis(null);
  };

  const handleAnswer = (answer: boolean) => {
    if (!currentSymptom) return;
    const currentQ = currentSymptom.questions[currentQuestionId];
    if (!currentQ) return;

    const nextStepId = answer ? currentQ.yesNext : currentQ.noNext;
    setHistory(prev => [...prev, { questionText: currentQ.text, answer }]);

    // Check if next step is a diagnosis
    if (currentSymptom.diagnoses[nextStepId]) {
      setActiveDiagnosis(currentSymptom.diagnoses[nextStepId]);
    } else if (currentSymptom.questions[nextStepId]) {
      setCurrentQuestionId(nextStepId);
    }
  };

  const handleResetDiagnostic = () => {
    if (currentSymptom) {
      setCurrentQuestionId(currentSymptom.rootQuestionId);
    }
    setHistory([]);
    setActiveDiagnosis(null);
  };

  // Web Audio API synthesizer for PC motherboard beep sound
  const playBeepSoundSequence = (beep: BiosBeep, index: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      setPlayingBeepIndex(index);
      const startTime = ctx.currentTime + 0.08;
      let currentOffset = 0;

      const sequence = beep.soundSequence || [1];

      sequence.forEach((count) => {
        for (let b = 0; b < count; b++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(950, startTime + currentOffset);

          gain.gain.setValueAtTime(0.18, startTime + currentOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + currentOffset + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime + currentOffset);
          osc.stop(startTime + currentOffset + 0.13);
          currentOffset += 0.22;
        }
        currentOffset += 0.32;
      });

      setTimeout(() => {
        setPlayingBeepIndex(null);
      }, (currentOffset + 0.2) * 1000);
    } catch (e) {
      console.warn("Audio playback not supported in environment:", e);
      setPlayingBeepIndex(null);
    }
  };

  const getSymptomIcon = (id: string) => {
    switch (id) {
      case 'power_failure':
      case 'sudden_shutdown':
        return Power;
      case 'freezing':
        return Snowflake;
      case 'no_display':
        return Monitor;
      case 'fan_noise':
        return Fan;
      case 'auto_restart':
        return RotateCcw;
      case 'windows_boot':
        return HardDrive;
      case 'system_slow':
        return Cpu;
      default:
        return AlertTriangle;
    }
  };

  const currentQ = currentSymptom?.questions[currentQuestionId];

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>مرکز عیب‌یابی و آزمایشگاه خطاها (پودمان ۲)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          درخت تصمیم تعاملی عیب‌یابی سخت‌افزار
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          انتخاب نشانه خرابی، پاسخ به پرسش‌های دوگزینه‌ای مرحله‌به‌مرحله و استخراج علت و راهکار استاندارد کتاب درسی
        </p>
      </div>

      {/* 1. Pick Symptom Section (Categorized / Grid Options) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>گام اول: نشانه یا خطای سیستم را انتخاب کنید:</span>
          </h2>
          <span className="text-[11px] font-mono text-gray-400">
            {symptoms.length} نشانه استاندارد
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {symptoms.map((item) => {
            const Icon = getSymptomIcon(item.id);
            const isSelected = selectedSymptomId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectSymptom(item.id)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#1d314b] text-white border-blue-900 shadow-md ring-2 ring-blue-400/40'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-gray-50/80'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? 'bg-white/10 text-blue-200' : 'bg-blue-50 text-blue-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm leading-snug truncate">{item.title}</h3>
                  <span className={`text-[10px] font-mono block truncate ${
                    isSelected ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {item.englishTitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Decision Tree Card (One Question at a Time) */}
      {currentSymptom && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Active Symptom Header */}
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold text-blue-700 font-mono">
                  ACTIVE FLOWCHART // نشانه فعال
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                {currentSymptom.title} ({currentSymptom.englishTitle})
              </h3>
              <p className="text-xs text-gray-500 max-w-2xl">
                {currentSymptom.symptomDescription}
              </p>
            </div>

            <button
              onClick={handleResetDiagnostic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>شروع مجدد درخت تصمیم</span>
            </button>
          </div>

          {/* Question Sequence Breadcrumbs (History of Answers) */}
          {history.length > 0 && (
            <div className="space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 text-xs">
              <span className="text-[11px] font-bold text-gray-500 block">
                مسیر پیموده شده در درخت تصمیم:
              </span>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {history.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                    <span className="font-mono text-gray-400 text-[10px]">Q{idx + 1}</span>
                    <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                      step.answer 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {step.answer ? 'بله' : 'خیر'}
                    </span>
                    {idx < history.length - 1 && <ChevronLeft className="w-3 h-3 text-gray-300" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If Diagnosis Not Reached: Display ONE Question at a time with Yes / No buttons */}
          {!activeDiagnosis && currentQ && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 border border-blue-100 shadow-sm space-y-4 text-center sm:text-right">
                <div className="flex items-center justify-between text-xs text-blue-800 font-bold">
                  <span className="font-mono bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                    پرسش تشخیصی گام {history.length + 1}
                  </span>
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                </div>

                <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                  {currentQ.text}
                </h4>

                {currentQ.hint && (
                  <div className="text-xs text-gray-500 bg-white/80 border border-gray-200/80 p-3 rounded-xl leading-relaxed text-right">
                    💡 <strong className="text-gray-700">راهنمای بررسی:</strong> {currentQ.hint}
                  </div>
                )}
              </div>

              {/* Yes / No Interactive Buttons */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={() => handleAnswer(true)}
                  className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
                >
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>بله (صحیح است)</span>
                </button>

                <button
                  onClick={() => handleAnswer(false)}
                  className="py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
                >
                  <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>خیر (اینگونه نیست)</span>
                </button>
              </div>
            </div>
          )}

          {/* If Diagnosis Reached: Show Final Diagnosis, Root Cause, and Fix Steps */}
          {activeDiagnosis && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/40 p-6 space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 tracking-wider">
                      DIAGNOSIS COMPLETE // نتیجه تشخیص
                    </span>
                    <h4 className="text-lg font-extrabold text-gray-900">
                      {activeDiagnosis.title}
                    </h4>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                  activeDiagnosis.severity === 'high'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : activeDiagnosis.severity === 'medium'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  سطح حساسیت: {activeDiagnosis.severity === 'high' ? 'بالا (نیازمند دقت زیاد)' : activeDiagnosis.severity === 'medium' ? 'متوسط' : 'عادی'}
                </span>
              </div>

              {/* Cause statement */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-gray-700 block">
                  🔍 علت ریشه‌ای مشکل طبق استاندارد کارگاه:
                </span>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                  {activeDiagnosis.cause}
                </p>
              </div>

              {/* Action Steps for Fix */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-emerald-700" />
                  <span>مراحل گام‌به‌گام رفع عیب:</span>
                </h5>
                <div className="space-y-2">
                  {activeDiagnosis.fixSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleResetDiagnostic}
                  className="px-4 py-2 rounded-xl bg-[#1d314b] text-white text-xs font-bold hover:bg-[#263f60] transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تست مجدد همین نشانه</span>
                </button>

                {activeDiagnosis.relatedPartId && onNavigateToPart && (
                  <button
                    onClick={() => onNavigateToPart(activeDiagnosis.relatedPartId!)}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-blue-700 text-xs font-bold hover:bg-blue-50 transition flex items-center gap-1.5"
                  >
                    <span>بررسی ساختار و سوکت قطعه مرتبط</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. BIOS Beep Codes Table (Separate Reference Table on the Same Page) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                جدول مرجع کدهای بوق بایوس (BIOS Beep Codes)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              سیگنال‌های صوتی بازر مادربرد برای شناسایی قطعه معیوب در صورت عدم نمایش تصویر در مرحله POST
            </p>
          </div>
          <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 self-start sm:self-auto">
            POST REFERENCE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold">
                <th className="py-3 px-4 w-32">الگوی بوق</th>
                <th className="py-3 px-4 w-48">معنی خطا</th>
                <th className="py-3 px-4">توضیحات و راهکار عیب‌یابی</th>
                <th className="py-3 px-4 w-28 text-center">شبیه‌ساز صدا</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {beepCodes.map((beep, index) => (
                <tr key={beep.pattern + index} className="hover:bg-blue-50/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900 dir-ltr text-left">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 text-xs">
                      {beep.pattern}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {beep.meaning}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 leading-relaxed">
                    <p className="font-medium text-gray-800">{beep.description}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      🔧 <strong className="text-gray-600">راهکار:</strong> {beep.solution}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => playBeepSoundSequence(beep, index)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                        playingBeepIndex === index
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-[#1d314b] text-white hover:bg-[#263f60]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{playingBeepIndex === index ? 'پخش…' : 'پخش'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
