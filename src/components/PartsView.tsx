import React, { useState } from 'react';
import { Part } from '../types';
import { Search, ArrowLeft, Layers, Cpu, Database, HardDrive, Zap, Wind, Box, Monitor } from 'lucide-react';

const ModelViewerElement = 'model-viewer' as any;

interface PartsViewProps {
  parts: Part[];
  onSelectPart: (partId: string) => void;
}

export const PartsView: React.FC<PartsViewProps> = ({ parts, onSelectPart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'همه قطعات' },
    { id: 'قطعات اصلی', label: 'مادربرد' },
    { id: 'پردازش', label: 'پردازنده' },
    { id: 'حافظه', label: 'رم (RAM)' },
    { id: 'گرافیک', label: 'کارت گرافیک' },
    { id: 'تغذیه', label: 'پاور' },
    { id: 'ذخیره‌سازی', label: 'حافظه SSD' },
    { id: 'خنک‌کاری', label: 'خنک‌کننده' },
    { id: 'بدنه', label: 'کیس' },
  ];

  const getPartIcon = (id: string) => {
    switch (id) {
      case 'motherboard': return Layers;
      case 'cpu': return Cpu;
      case 'ram': return Database;
      case 'gpu': return Monitor;
      case 'power_supply': return Zap;
      case 'storage': return HardDrive;
      case 'cooling': return Wind;
      case 'case': return Box;
      default: return Layers;
    }
  };

  const filteredParts = parts.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchQuery = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header section matching screenshot top-center */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          مرکز قطعات
        </h1>
        <p className="text-sm sm:text-base text-gray-500 font-medium">
          قطعات اصلی سخت‌افزار کامپیوتر را بشناسید
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جست‌وجوی قطعه…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-[#1d314b] text-white shadow-sm font-bold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Component Cards Grid matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredParts.map((part) => {
          const Icon = getPartIcon(part.id);
          return (
            <article
              key={part.id}
              onClick={() => onSelectPart(part.id)}
              className="group cursor-pointer bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* 3D Model Preview Canvas Box */}
              <div 
                style={{ direction: 'ltr' }}
                className="relative h-48 bg-gradient-to-br from-[#111927] via-[#1a2638] to-[#0f172a] flex items-center justify-center p-2 overflow-hidden border-b border-gray-100"
              >
                {/* Blueprint grid effect */}
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Technical Category Chip */}
                <span 
                  style={{ direction: 'rtl' }}
                  className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0d1624]/80 text-blue-300 backdrop-blur-md border border-white/10"
                >
                  {part.category}
                </span>

                <ModelViewerElement
                  src={(() => {
                    const clean = part.model.replace(/^\/+/, '').replace(/^3d-models\//, '');
                    const baseUrl = (import.meta.env.BASE_URL || './').replace(/\/+$/, '');
                    return `${baseUrl}/3d-models/${clean}`;
                  })()}
                  alt={part.name}
                  auto-rotate
                  rotation-per-second="25deg"
                  camera-controls
                  touch-action="pan-y"
                  interaction-prompt="none"
                  shadow-intensity="1"
                  exposure="0.95"
                  style={{
                    width: '100%',
                    height: '100%',
                    direction: 'ltr',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition leading-snug">
                        {part.name}
                      </h2>
                      <span className="text-[11px] text-gray-400 font-mono block">
                        {part.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-2">
                    {part.shortDescription || part.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">
                    {part.role}
                  </span>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-[-2px] transition-transform">
                    <span>بررسی</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredParts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-sm font-bold text-gray-700">هیچ قطعه‌ای مطابق با عبارت جست‌وجو پیدا نشد.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-3 text-xs text-blue-600 font-bold hover:underline"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}
    </div>
  );
};
