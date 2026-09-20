import React, { useState, useEffect } from 'react';
import { Part, AssemblyStep, TroubleshootingScenario, BiosBeep } from '../types';
import { Search, X, Layers, Wrench, AlertTriangle, Volume2, ArrowLeft } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: Part[];
  steps: AssemblyStep[];
  scenarios: TroubleshootingScenario[];
  beepCodes: BiosBeep[];
  onNavigate: (tab: any, extraId?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  parts,
  steps,
  scenarios,
  beepCodes,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedParts = q ? parts.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.subtitle.toLowerCase().includes(q) || 
    p.description.toLowerCase().includes(q)
  ) : [];

  const matchedSteps = q ? steps.filter(s => 
    s.title.toLowerCase().includes(q) || 
    s.component.toLowerCase().includes(q) ||
    s.instructions.some(ins => ins.toLowerCase().includes(q))
  ) : [];

  const matchedScenarios = q ? scenarios.filter(sc => 
    sc.title.toLowerCase().includes(q) || 
    sc.symptom.toLowerCase().includes(q)
  ) : [];

  const matchedBeeps = q ? beepCodes.filter(b => 
    b.pattern.includes(q) || 
    b.meaning.toLowerCase().includes(q) || 
    b.description.toLowerCase().includes(q)
  ) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-20 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="جست‌وجو در قطعات، مراحل مونتاژ، کدهای بوق بایوس…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-10 text-gray-400 text-xs space-y-2">
              <p>کلمه مورد نظر خود را تایپ کنید (مثلاً: رم، مادربرد، بوق، سوکت)</p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {['DDR4', 'LGA 1200', '1-1-2-3', 'PCIe', 'پاور'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs hover:bg-blue-50 hover:text-blue-700"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parts Results */}
          {matchedParts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 block px-1">قطعات سخت‌افزاری</span>
              {matchedParts.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onNavigate('part-detail', p.id);
                    onClose();
                  }}
                  className="w-full text-right p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/40 text-xs flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-gray-900 block">{p.name}</span>
                      <span className="text-gray-400 text-[11px] font-mono">{p.subtitle}</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:-translate-x-1 transition" />
                </button>
              ))}
            </div>
          )}

          {/* Steps Results */}
          {matchedSteps.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 block px-1">مراحل مونتاژ</span>
              {matchedSteps.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    onNavigate('assembly');
                    onClose();
                  }}
                  className="w-full text-right p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/40 text-xs flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-gray-900 block">مرحله {s.id}: {s.title}</span>
                      <span className="text-gray-500 text-[11px]">{s.component}</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:-translate-x-1 transition" />
                </button>
              ))}
            </div>
          )}

          {/* BIOS Beep Codes Results */}
          {matchedBeeps.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 block px-1">کدهای بوق بایوس</span>
              {matchedBeeps.map(b => (
                <button
                  key={b.pattern}
                  onClick={() => {
                    onNavigate('troubleshooting');
                    onClose();
                  }}
                  className="w-full text-right p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/40 text-xs flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-gray-900 block font-mono dir-ltr text-right">{b.pattern} - {b.meaning}</span>
                      <span className="text-gray-500 text-[11px]">{b.description}</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:-translate-x-1 transition" />
                </button>
              ))}
            </div>
          )}

          {query && matchedParts.length === 0 && matchedSteps.length === 0 && matchedBeeps.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-xs">
              موردی مطابق با عبارت "{query}" یافت نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
