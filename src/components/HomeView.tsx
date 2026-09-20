import React from 'react';
import { NavigationTab, Part } from '../types';
import { ModelViewer3D } from './ModelViewer3D';
import { ArrowLeft, Layers, Wrench, AlertTriangle, CheckSquare, Sparkles, Cpu, ShieldCheck } from 'lucide-react';

interface HomeViewProps {
  onTabChange: (tab: NavigationTab) => void;
  onSelectPart: (partId: string) => void;
  motherboardPart: Part;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onTabChange,
  onSelectPart,
  motherboardPart
}) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        {/* Hero Text (Right side in RTL) */}
        <div className="lg:col-span-5 space-y-5 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>درس سخت‌افزار کامپیوتر • هنرستان فنی و حرفه‌ای</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight leading-[1.25]">
            سخت‌افزار را از نزدیک کشف کن
          </h1>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
            با قطعات کامپیوتر آشنا شو، آن‌ها را لمس کن، سرهم کن و عیب‌یابی را یاد بگیر. همه چیز برای ساختن مهارت‌های واقعی.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => {
                onSelectPart('motherboard');
                onTabChange('part-detail');
              }}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#1d314b] text-white font-bold text-sm shadow-xl shadow-blue-900/15 hover:bg-[#263f60] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
            >
              <span>شروع بررسی مادربرد</span>
              <ArrowLeft className="w-4 h-4 text-blue-300 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onTabChange('assembly')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition"
            >
              <Wrench className="w-4 h-4 text-gray-500" />
              <span>راهنمای گام‌به‌گام مونتاژ</span>
            </button>
          </div>

          {/* Key Facts Pills */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded-lg bg-white/60 border border-gray-200">
              <span className="block font-bold text-lg text-blue-900 font-mono">۸</span>
              <span className="text-[11px] text-gray-500">قطعه اصلی</span>
            </div>
            <div className="p-2 rounded-lg bg-white/60 border border-gray-200">
              <span className="block font-bold text-lg text-blue-900 font-mono">۱۵</span>
              <span className="text-[11px] text-gray-500">مرحله مونتاژ</span>
            </div>
            <div className="p-2 rounded-lg bg-white/60 border border-gray-200">
              <span className="block font-bold text-lg text-blue-900 font-mono">۴</span>
              <span className="text-[11px] text-gray-500">کد بوق بایوس</span>
            </div>
            <div className="p-2 rounded-lg bg-white/60 border border-gray-200">
              <span className="block font-bold text-lg text-blue-900 font-mono">۴</span>
              <span className="text-[11px] text-gray-500">آزمون استاندارد</span>
            </div>
          </div>
        </div>

        {/* 3D Interactive Stage (Left side in RTL) */}
        <div className="lg:col-span-7">
          <div className="relative">
            {/* 3D Viewer Container */}
            <ModelViewer3D
              modelSrc={motherboardPart.model}
              altText="مدل سه‌بعدی مادربرد ASUS Prime H510M-K"
              hotspots={motherboardPart.hotspots}
              onHotspotClick={(h) => {
                onSelectPart('motherboard');
              }}
              heightClass="h-[420px] sm:h-[480px] lg:h-[530px]"
              cameraOrbit="-20deg 75deg 105%"
              fieldOfView="30deg"
            />
          </div>
        </div>
      </section>

      {/* 4 Feature Cards Matching Bottom of Screenshot */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: قطعه‌شناسی */}
          <div
            onClick={() => onTabChange('parts')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-[#1d314b] via-[#243c5b] to-[#2c4a6e] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-blue-400/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-blue-200 group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1.5 flex items-center justify-between">
              <span>قطعه‌شناسی</span>
              <span className="text-xs text-blue-300 font-mono opacity-60">01</span>
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed mb-4">
              آشنایی با قطعات، مدل‌های سه‌بعدی، مشخصات فنی و استانداردهای سخت‌افزاری
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 group-hover:text-white transition">
              <span>مشاهده قطعات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: کارگاه مونتاژ */}
          <div
            onClick={() => onTabChange('workshop')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-[#1d314b] via-[#243c5b] to-[#2c4a6e] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-blue-400/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-blue-200 group-hover:scale-110 transition">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1.5 flex items-center justify-between">
              <span>کارگاه مونتاژ</span>
              <span className="text-xs text-blue-300 font-mono opacity-60">02</span>
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed mb-4">
              یادگیری نصب تعاملی قطعات روی سوکت‌ها و اسلات‌های مادربرد با راهنما
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 group-hover:text-white transition">
              <span>ورود به کارگاه</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: عیب‌یابی */}
          <div
            onClick={() => onTabChange('troubleshooting')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-[#1d314b] via-[#243c5b] to-[#2c4a6e] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-blue-400/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-blue-200 group-hover:scale-110 transition">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold mb-1.5 flex items-center justify-between">
              <span>عیب‌یابی</span>
              <span className="text-xs text-blue-300 font-mono opacity-60">03</span>
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed mb-4">
              شناسایی و رفع مشکلات، جدول کدهای بوق بایوس و عیب‌یابی عدم نمایش تصویر
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 group-hover:text-white transition">
              <span>بررسی خطاها</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: آزمون فنی */}
          <div
            onClick={() => onTabChange('quizzes')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-[#1d314b] via-[#243c5b] to-[#2c4a6e] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-blue-400/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-blue-200 group-hover:scale-110 transition">
              <CheckSquare className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="text-lg font-bold mb-1.5 flex items-center justify-between">
              <span>آزمون فنی</span>
              <span className="text-xs text-blue-300 font-mono opacity-60">04</span>
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed mb-4">
              تست دانش و مهارت‌ها با پرسش‌های تطبیقی استاندارد کتاب درسی هنرستان
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 group-hover:text-white transition">
              <span>شروع آزمون</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Progress Bar Footer Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-800">پیشرفت کل دوره‌ی آموزشی</span>
              <span className="text-[11px] text-gray-500 block">شامل بررسی قطعات، تمرین مونتاژ و آزمون‌ها</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-72">
            <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-l from-blue-600 to-indigo-600 h-full w-1/4 rounded-full" />
            </div>
            <span className="text-xs font-mono font-bold text-blue-900">۲۵٪</span>
          </div>
        </div>
      </section>
    </div>
  );
};
