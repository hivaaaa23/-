import React from 'react';
import { NavigationTab } from '../types';
import { Cpu, Search, Sparkles, BookOpen, Layers, Wrench, CheckSquare, HelpCircle, Compass } from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenSearch: () => void;
  progressPercent?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  progressPercent = 25
}) => {
  const navItems: { id: NavigationTab; label: string; icon: any }[] = [
    { id: 'home', label: 'خانه', icon: Compass },
    { id: 'parts', label: 'قطعات', icon: Layers },
    { id: 'workshop', label: 'کارگاه مونتاژ', icon: Wrench },
    { id: 'assembly', label: 'راهنمای کامل', icon: Layers },
    { id: 'troubleshooting', label: 'عیب‌یابی', icon: HelpCircle },
    { id: 'quizzes', label: 'آزمون‌ها', icon: CheckSquare },
    { id: 'resources', label: 'منابع', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f4f5f8]/90 backdrop-blur-md border-b border-[#d8dce4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo & Branding (Right side in RTL) */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d314b] to-[#2c4a6e] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
            <Cpu className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[#1a1d24] tracking-tight">آزمایشگاه سخت‌افزار</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">PRO</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">آموزش • تمرین • مهارت</p>
          </div>
        </div>

        {/* Navigation Tabs (Center) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === 'parts' && currentTab === 'part-detail');
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'text-blue-900 bg-white shadow-sm border border-blue-100 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-1 right-3.5 left-3.5 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Left Tools & Learning Progress */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            title="جست‌وجو در قطعات و آموزش‌ها"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-blue-300 shadow-sm transition text-xs"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="hidden sm:inline">جست‌وجوی سریع…</span>
            <kbd className="hidden sm:inline text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Ctrl+K</kbd>
          </button>

          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2.5 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-medium">پیشرفت دوره</span>
              <span className="text-xs font-bold text-blue-900 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-l from-blue-600 to-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Scrollable Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 overflow-x-auto border-t border-gray-200 bg-white/90 no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id || (item.id === 'parts' && currentTab === 'part-detail');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 bg-gray-50/70 border border-gray-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
