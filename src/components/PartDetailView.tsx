import React, { useState } from 'react';
import { Part } from '../types';
import { ModelViewer3D } from './ModelViewer3D';
import { ArrowLeft, ArrowRight, ShieldAlert, HelpCircle, CheckCircle2, XCircle, Sparkles, Layers } from 'lucide-react';

interface PartDetailViewProps {
  part: Part;
  onSelectPart: (partId: string) => void;
  onBackToParts: () => void;
}

export const PartDetailView: React.FC<PartDetailViewProps> = ({
  part,
  onSelectPart,
  onBackToParts
}) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuiz = part.quiz?.[0];

  const handleAnswerSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedAnswerIndex(index);
  };

  const handleSubmitQuiz = () => {
    if (selectedAnswerIndex === null) return;
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <button onClick={onBackToParts} className="hover:text-gray-900 transition">
          قطعات
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-blue-700 font-bold">{part.name}</span>
      </nav>

      {/* Main Detail Grid matching screenshot top-right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Interactive Model Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <ModelViewer3D
            modelSrc={part.model}
            altText={`مدل سه‌بعدی ${part.name}`}
            hotspots={part.hotspots}
            heightClass="h-[480px] sm:h-[540px] lg:h-[600px]"
            cameraOrbit="-20deg 75deg 105%"
            fieldOfView="30deg"
          />

          {/* Quick Helper Note */}
          <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-gray-500 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>برای مشاهده توضیحات اختصاصی، روی نشانگرهای نقاط حساس (Hotspot) کلیک کنید.</span>
            </div>
            <span className="font-mono text-gray-400 text-[11px] hidden sm:inline">3D INTERACTIVE</span>
          </div>
        </div>

        {/* Right Column: Part Specs, Notes, Reflection & Mini Quiz */}
        <div className="lg:col-span-5 space-y-5">
          {/* Header Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {part.category}
              </span>
              <span className="text-xs font-mono text-gray-400">{part.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {part.name}
            </h1>
            <h2 className="text-sm font-semibold text-blue-700 font-mono">
              {part.subtitle}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
              {part.description}
            </p>

            {/* Specifications Table matching screenshot */}
            <div className="pt-3 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>مشخصات فنی</span>
              </h3>

              <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
                <table className="w-full text-right divide-y divide-gray-100">
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {part.specs.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}>
                        <th className="py-2.5 px-3.5 font-medium text-gray-500 w-1/3">
                          {spec.key}
                        </th>
                        <td className="py-2.5 px-3.5 font-bold text-gray-900 font-mono">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* نکات مهم (Important Safety Note) */}
          {part.note && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-amber-900">نکات مهم</h4>
                <p className="text-amber-800 leading-relaxed">{part.note}</p>
              </div>
            </div>
          )}

          {/* فکر کنید (Reflection Question) */}
          {part.thinkAbout && (
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-blue-900">فکر کنید</h4>
                <p className="text-blue-800 leading-relaxed">{part.thinkAbout}</p>
              </div>
            </div>
          )}

          {/* آزمون کوتاه (Mini Quiz with Radio Checkboxes) */}
          {currentQuiz && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>آزمون کوتاه</span>
                </h4>
                <span className="text-[10px] font-mono text-gray-400">QUIZ 01</span>
              </div>

              <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                {currentQuiz.question}
              </p>

              <div className="space-y-2">
                {currentQuiz.answers.map((answer, index) => {
                  const isSelected = selectedAnswerIndex === index;
                  let itemStyle = "border-gray-200 hover:border-blue-300 bg-white";
                  if (isSelected && !isSubmitted) {
                    itemStyle = "border-blue-600 bg-blue-50/60 text-blue-950 font-bold ring-1 ring-blue-500";
                  } else if (isSubmitted) {
                    if (answer.correct) {
                      itemStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                    } else if (isSelected && !answer.correct) {
                      itemStyle = "border-red-400 bg-red-50 text-red-950";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-right p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${itemStyle}`}
                    >
                      <span>{answer.text}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback explanation if submitted */}
              {isSubmitted && selectedAnswerIndex !== null && (
                <div className={`p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2 ${
                  currentQuiz.answers[selectedAnswerIndex]?.correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}>
                  {currentQuiz.answers[selectedAnswerIndex]?.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{currentQuiz.answers[selectedAnswerIndex]?.explanation}</span>
                </div>
              )}

              {/* Submit Button */}
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswerIndex === null}
                  className="w-full py-2.5 rounded-xl bg-[#1d314b] hover:bg-[#263f60] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-sm"
                >
                  بررسی پاسخ
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedAnswerIndex(null);
                  }}
                  className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  پاسخ مجدد
                </button>
              )}
            </div>
          )}

          {/* Navigation to Next Part */}
          {part.nextPartId && (
            <button
              onClick={() => onSelectPart(part.nextPartId!)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1d314b] text-white font-bold text-xs flex items-center justify-between hover:bg-[#263f60] shadow-md transition group"
            >
              <span>قطعه بعدی</span>
              <div className="flex items-center gap-1 text-blue-200 group-hover:text-white">
                <span>ادامه مسیر</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
