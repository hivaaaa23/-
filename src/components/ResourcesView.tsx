import React, { useState } from 'react';
import { ResourceItem } from '../types';
import { BookOpen, Video, FileText, Clock, ArrowLeft, X, Sparkles } from 'lucide-react';

interface ResourcesViewProps {
  resources: ResourceItem[];
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ resources }) => {
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>کتابخانه و منابع دانشی</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          منابع آموزشی سخت‌افزار
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          مجموعه ویدیوها و راهنماهای گام‌به‌گام برای تعمیق مباحث کارگاهی
        </p>
      </div>

      {/* Resources Cards Grid matching screenshot bottom-right (bottom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {resources.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedResource(item)}
            className="group cursor-pointer bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Media Icon & Duration */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  {item.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{item.duration}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                {item.category}
              </span>

              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition mb-2">
                {item.title}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {item.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>مطالعه / مشاهده</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Sparkles className="w-4 h-4" />
              <span>مستند آموزشی تخصصی • {selectedResource.category}</span>
            </div>

            <h2 className="text-xl font-extrabold text-gray-900">
              {selectedResource.title}
            </h2>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 leading-relaxed">
              {selectedResource.summary}
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p>
                در این بخش سرفصل‌های مصوب آموزش و پرورش شامل استانداردهای ایمنی محیط کار، جلوگیری از آسیب الکترواستاتیک (ESD)، تکنیک‌های روان‌کاری فن و شناخت ساختار برد چندلایه به تفصیل بیان شده است.
              </p>
              <p>
                مدت زمان پیشنهادی برای تسلط بر این مبحث: <strong className="font-mono text-blue-900">{selectedResource.duration}</strong>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1d314b] text-white text-xs font-bold hover:bg-[#263f60] transition"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
