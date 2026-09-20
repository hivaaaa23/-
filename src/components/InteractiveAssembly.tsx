import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Power, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  MousePointer2, 
  Touchpad, 
  Check, 
  Play, 
  Cpu, 
  Layers, 
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';

export interface ComponentItem {
  id: string;
  name: string;
  enName: string;
  targetSlotId: string;
  requires: string[];
  icon: string;
  category: string;
  description: string;
  wrongSlotMessages: Record<string, string>;
  modelUrl: string;
}

export interface SlotItem {
  id: string;
  title: string;
  enTitle: string;
  acceptedPartId: string;
  x: number; // percentage in visual board
  y: number;
  width: number;
  height: number;
  description: string;
}

const PC_PARTS: ComponentItem[] = [
  {
    id: 'motherboard',
    name: 'مادربرد اصلی',
    enName: 'Motherboard ATX',
    targetSlotId: 'slot_case_tray',
    requires: [],
    icon: '🎛️',
    category: 'بستر پایه',
    description: 'برد اصلی سیستم که روی پایه‌های برنجی سینی کیس نصب می‌شود.',
    wrongSlotMessages: {
      slot_cpu: 'مادربرد قطعه اصلی است و نمی‌تواند درون سوکت پردازنده قرار گیرد!',
      slot_ram: 'مادربرد کل سیستم را در بر می‌گیرد و در اسلات‌های رم جای نمی‌گیرد!',
      slot_pcie: 'شیار PCIe مخصوص کارت‌های توسعه مانند گرافیک است، نه مادربرد!'
    },
    modelUrl: '/3d-models/motherboard.glb'
  },
  {
    id: 'cpu',
    name: 'پردازنده مرکزی (CPU)',
    enName: 'Intel Core i5',
    targetSlotId: 'slot_cpu',
    requires: ['motherboard'],
    icon: '🔲',
    category: 'پردازشی',
    description: 'مغز متفکر رایانه که با رعایت مثلث طلایی راهنما درون سوکت مادربرد قرار می‌گیرد.',
    wrongSlotMessages: {
      slot_ram: 'پردازنده با شیارهای باریک رم همخوانی ندارد! اسلات رم مخصوص ماژول‌های مستطیلی حافظه است.',
      slot_pcie: 'شیار PCIe برای کارت گرافیک است. پردازنده باید در سوکت مربعی با اهرم فلزی بنشیند.',
      slot_case_tray: 'پردازنده نمی‌تواند مستقیماً روی سینی کیس پیچ شود؛ ابتدا باید مادربرد نصب شود.'
    },
    modelUrl: '/3d-models/cpu.glb'
  },
  {
    id: 'cooling',
    name: 'خنک‌کننده پردازنده',
    enName: 'Tower Air Cooler',
    targetSlotId: 'slot_cpu_cooler',
    requires: ['cpu'],
    icon: '❄️',
    category: 'خنک‌کاری',
    description: 'هیت‌سینک و فن خنک‌کننده که پس از خمیر سیلیکون دقیقاً روی پردازنده قفل می‌شود.',
    wrongSlotMessages: {
      slot_cpu: 'سوکت خالی است! ابتدا پردازنده را درون سوکت قرار دهید، سپس کولر را روی آن نصب کنید.',
      slot_ram: 'خنک‌کننده پردازنده باید روی CPU سوار شود، نه روی شکاف‌های رم!',
      slot_pcie: 'خنک‌کننده بر روی پردازنده قرار می‌گیرد، نه روی شیار کارت گرافیک!'
    },
    modelUrl: '/3d-models/cooling.glb'
  },
  {
    id: 'ram',
    name: 'ماژول‌های حافظه رم (RAM)',
    enName: '16GB DDR4 (2x8GB)',
    targetSlotId: 'slot_ram',
    requires: ['motherboard'],
    icon: '⚡',
    category: 'حافظه موقت',
    description: 'حافظه‌های پرسرعت با شکاف کلید Notch که در اسلات‌های دوکاناله DIMM جا می‌افتند.',
    wrongSlotMessages: {
      slot_pcie: 'کارت گرافیک در PCIe قرار می‌گیرد! اسلات‌های رم کوتاه‌تر و دارای دو گیره قفل در طرفین هستند.',
      slot_cpu: 'رم درون اسلات‌های DIMM عمودی می‌نشیند، نه در سوکت مربعی پردازنده!',
      slot_psu: 'رم قطعه حساسی است و در اسلات‌های روی مادربرد نصب می‌شود، نه در محفظه پاور!'
    },
    modelUrl: '/3d-models/ram.glb'
  },
  {
    id: 'storage',
    name: 'حافظه SSD M.2 NVMe',
    enName: 'M.2 NVMe SSD 500GB',
    targetSlotId: 'slot_m2',
    requires: ['motherboard'],
    icon: '💾',
    category: 'ذخیره‌سازی',
    description: 'درایو ذخیره‌سازی پرسرعت که به صورت زاویه‌دار وارد سوکت M.2 شده و با پیچ محکم می‌گردد.',
    wrongSlotMessages: {
      slot_ram: 'اسلات رم برای ماژول‌های رم است. SSD دارای شیار بسیار ظریف M.2 با پیچ انتهایی است.',
      slot_pcie: 'شکاف PCIe x16 برای کارت‌های بزرگ است؛ M.2 سوکت بسیار کوچک‌تری دارد.'
    },
    modelUrl: '/3d-models/storage.glb'
  },
  {
    id: 'gpu',
    name: 'کارت گرافیک (GPU)',
    enName: 'GeForce RTX Graphics Card',
    targetSlotId: 'slot_pcie',
    requires: ['motherboard'],
    icon: '🎮',
    category: 'پردازش تصویر',
    description: 'کارت گرافیک اختصاصی با ۳ فن که در شیار اول PCIe x16 قرار گرفته و با ضامن قفل می‌شود.',
    wrongSlotMessages: {
      slot_ram: 'کارت گرافیک در اسلات رم جا نمی‌شود! برای کارت گرافیک از شیار PCIe x16 همراه ضامن استفاده کنید.',
      slot_cpu: 'کارت گرافیک روی شیار توسعه نصب می‌شود، نه درون سوکت پردازنده!'
    },
    modelUrl: '/3d-models/gpu.glb'
  },
  {
    id: 'power_supply',
    name: 'منبع تغذیه (PSU)',
    enName: '650W Gold Power Supply',
    targetSlotId: 'slot_psu',
    requires: ['motherboard'],
    icon: '🔌',
    category: 'برق‌رسانی',
    description: 'تأمین‌کننده توان تمام قطعات که در محفظه زیرین کیس (PSU Shroud) پیچ می‌شود.',
    wrongSlotMessages: {
      slot_cpu_cooler: 'پاور ابعاد بزرگی دارد و باید در کف کیس قرار گیرد، نه روی مادربرد!',
      slot_case_tray: 'پاور در محفظه تونلی کف کیس پیچ می‌شود، نه روی سینی مادربرد!'
    },
    modelUrl: '/3d-models/power_supply.glb'
  },
  {
    id: 'cable_atx',
    name: 'کابل ۲۴ پین برق مادربرد',
    enName: '24-Pin ATX Power Cable',
    targetSlotId: 'slot_atx_cable',
    requires: ['motherboard', 'power_supply'],
    icon: '🎗️',
    category: 'کابل‌کشی',
    description: 'کابل اصلی تغذیه مدارات و چیپست مادربرد با ضامن قفل‌شونده در لبه راست برد.',
    wrongSlotMessages: {
      slot_cpu_power: 'این کابل ۲۴ پین است و برای هدر برق اصلی مادربرد است، نه هدر ۸ پین پردازنده!',
      slot_pcie: 'کابل ۲۴ پین به هدر کناری مادربرد متصل می‌شود، نه اسلات کارت گرافیک!'
    },
    modelUrl: '/3d-models/power_supply.glb'
  },
  {
    id: 'cable_eps',
    name: 'کابل ۸ پین برق پردازنده',
    enName: '8-Pin (4+4) EPS CPU Cable',
    targetSlotId: 'slot_cpu_power',
    requires: ['motherboard', 'cpu', 'power_supply'],
    icon: '⚡',
    category: 'کابل‌کشی',
    description: 'کابل تأمین انرژی اختصاصی مدارهای VRM پردازنده در گوشه سمت چپ بالای مادربرد.',
    wrongSlotMessages: {
      slot_atx_cable: 'این کابل ۸ پین است و در هدر ۲۴ پین جا نمی‌رود! آن را به هدر بالای CPU متصل کنید.',
      slot_pcie: 'کابل ۸ پین پردازنده نباید با پورت‌های دیگر اشتباه گرفته شود؛ جای آن در بالای سوکت پردازنده است.'
    },
    modelUrl: '/3d-models/power_supply.glb'
  }
];

const ASSEMBLY_SLOTS: SlotItem[] = [
  {
    id: 'slot_case_tray',
    title: 'سینی و پایه‌های کیس',
    enTitle: 'Chassis Motherboard Tray',
    acceptedPartId: 'motherboard',
    x: 18,
    y: 8,
    width: 64,
    height: 72,
    description: 'محل قرارگیری مادربرد روی ۹ پایه برنجی استاندارد کیس'
  },
  {
    id: 'slot_cpu',
    title: 'سوکت پردازنده (LGA Socket)',
    enTitle: 'CPU Socket LGA1700',
    acceptedPartId: 'cpu',
    x: 34,
    y: 20,
    width: 15,
    height: 15,
    description: 'سوکت اتصال هزاران پین طلایی با درپوش و اهرم قفل فلزی'
  },
  {
    id: 'slot_cpu_cooler',
    title: 'محل استقرار خنک‌کننده CPU',
    enTitle: 'CPU Cooler Mounting Bracket',
    acceptedPartId: 'cooling',
    x: 32,
    y: 18,
    width: 19,
    height: 19,
    description: 'چهار نقطه پیچ براکت دور پردازنده با خمیر حرارتی'
  },
  {
    id: 'slot_ram',
    title: 'اسلات‌های رم (DIMM Slots)',
    enTitle: 'Dual-Channel DDR4 DIMM',
    acceptedPartId: 'ram',
    x: 54,
    y: 17,
    width: 14,
    height: 22,
    description: 'شکاف‌های عمودی دوطرف قفل‌دار برای ماژول‌های رم'
  },
  {
    id: 'slot_m2',
    title: 'اسلات M.2 NVMe SSD',
    enTitle: 'PCIe Gen4 M.2 Socket',
    acceptedPartId: 'storage',
    x: 33,
    y: 43,
    width: 17,
    height: 6,
    description: 'شیار اتصال کارت باریک حافظه جامد با پیچ نگهدارنده'
  },
  {
    id: 'slot_pcie',
    title: 'شیار توسعه PCIe x16 گرافیک',
    enTitle: 'PCIe 4.0 x16 Primary Slot',
    acceptedPartId: 'gpu',
    x: 23,
    y: 53,
    width: 32,
    height: 12,
    description: 'شیار پهن با ضامن انتهایی برای اتصال کارت گرافیک'
  },
  {
    id: 'slot_psu',
    title: 'محفظه پاور (PSU Shroud)',
    enTitle: 'Lower Power Supply Chamber',
    acceptedPartId: 'power_supply',
    x: 18,
    y: 83,
    width: 44,
    height: 14,
    description: 'محفظه کف کیس برای قرارگیری و پیچ شدن منبع تغذیه'
  },
  {
    id: 'slot_atx_cable',
    title: 'هدر برق ۲۴ پین مادربرد',
    enTitle: '24-Pin ATX Power Header',
    acceptedPartId: 'cable_atx',
    x: 70,
    y: 28,
    width: 8,
    height: 14,
    description: 'سوکت ورودی برق اصلی مدار چاپی مادربرد'
  },
  {
    id: 'slot_cpu_power',
    title: 'هدر برق ۸ پین پردازنده (EPS)',
    enTitle: '8-Pin EPS 12V CPU Header',
    acceptedPartId: 'cable_eps',
    x: 22,
    y: 10,
    width: 9,
    height: 7,
    description: 'سوکت تامین ولتاژ رگولاتورهای VRM پردازنده'
  }
];

export const InteractiveAssembly: React.FC = () => {
  // Assembly State
  const [installedParts, setInstalledParts] = useState<string[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);
  
  // Feedback & Alert State
  const [alertMessage, setAlertMessage] = useState<{ title: string; text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Power & Boot State
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(false);
  const [bootPhase, setBootPhase] = useState<'idle' | 'starting' | 'post_beep' | 'fans_spin' | 'bios_screen'>('idle');
  const [biosTelemetry, setBiosTelemetry] = useState<{ cpuTemp: number; fanRpm: number; voltage12: number }>({
    cpuTemp: 32,
    fanRpm: 1250,
    voltage12: 12.08
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound Synthesizer via Web Audio API
  const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  };

  const playSuccessClick = () => {
    playTone(587.33, 0.08, 'triangle', 0.2); // D5
    setTimeout(() => playTone(880, 0.12, 'sine', 0.25), 60); // A5
  };

  const playErrorBuzz = () => {
    playTone(180, 0.18, 'sawtooth', 0.2);
    setTimeout(() => playTone(140, 0.22, 'sawtooth', 0.2), 100);
  };

  const playPostBeep = () => {
    // Official PC Motherboard POST 1-Beep: 1000Hz for 250ms
    playTone(1000, 0.25, 'sine', 0.35);
  };

  // Attempt to install a part into a slot
  const handleAttemptInstall = (partId: string, slotId: string) => {
    const part = PC_PARTS.find(p => p.id === partId);
    const slot = ASSEMBLY_SLOTS.find(s => s.id === slotId);

    if (!part || !slot) return;

    // Check if already installed
    if (installedParts.includes(partId)) {
      setAlertMessage({
        title: 'قطعه قبلاً نصب شده است',
        text: `قطعه «${part.name}» هم‌اکنون به درستی در جایگاه خود مستقر است.`,
        type: 'info'
      });
      return;
    }

    // Check prerequisites (e.g. CPU before Cooler, Motherboard before RAM/GPU)
    for (const reqId of part.requires) {
      if (!installedParts.includes(reqId)) {
        const reqPart = PC_PARTS.find(p => p.id === reqId);
        playErrorBuzz();
        setAlertMessage({
          title: 'اخطار پیش‌نیاز نصب قطعه',
          text: `برای نصب «${part.name}»، ابتدا باید قطعه «${reqPart?.name || reqId}» نصب شده باشد!`,
          type: 'error'
        });
        return;
      }
    }

    // Check if slot matches part
    if (part.targetSlotId !== slotId) {
      playErrorBuzz();
      const customMsg = part.wrongSlotMessages[slotId] || `جایگاه «${slot.title}» مخصوص این قطعه نیست! لطفاً جایگاه صحیح را انتخاب کنید.`;
      setAlertMessage({
        title: 'اخطار عدم تطابق جایگاه قطعه',
        text: customMsg,
        type: 'error'
      });
      return;
    }

    // Success! Install the part
    playSuccessClick();
    setInstalledParts(prev => [...prev, partId]);
    setSelectedPartId(null);
    setAlertMessage({
      title: 'اتصال موفقیت‌آمیز',
      text: `قطعه «${part.name}» با موفقیت درون ${slot.title} جا خورد و قفل شد.`,
      type: 'success'
    });
  };

  // Handle mobile / desktop slot click
  const handleSlotClick = (slotId: string) => {
    if (!selectedPartId) {
      const slot = ASSEMBLY_SLOTS.find(s => s.id === slotId);
      const isFilled = installedParts.includes(slot?.acceptedPartId || '');
      if (isFilled) {
        const part = PC_PARTS.find(p => p.id === slot?.acceptedPartId);
        setAlertMessage({
          title: slot?.title || 'جایگاه',
          text: `در این جایگاه، قطعه «${part?.name}» نصب شده و محکم است.`,
          type: 'info'
        });
      } else {
        setAlertMessage({
          title: slot?.title || 'جایگاه خالی',
          text: `ابتدا یک قطعه متناسب (مانند ${slot?.description}) را از سینی قطعات لمس یا انتخاب کنید، سپس اینجا را کلیک نمایید.`,
          type: 'info'
        });
      }
      return;
    }

    handleAttemptInstall(selectedPartId, slotId);
  };

  // Turn ON PC Sequence
  const handlePowerOn = () => {
    if (installedParts.length < PC_PARTS.length) {
      playErrorBuzz();
      setAlertMessage({
        title: 'اسمبل هنوز کامل نشده است!',
        text: `برای راه‌اندازی، تمام ۹ قطعه و کابل اصلی باید در جای خود متصل شوند (${installedParts.length} از ${PC_PARTS.length} قطعه نصب شده).`,
        type: 'error'
      });
      return;
    }

    setIsPoweredOn(true);
    setBootPhase('starting');

    // Sequence timing
    setTimeout(() => {
      setBootPhase('post_beep');
      playPostBeep();
    }, 900);

    setTimeout(() => {
      setBootPhase('fans_spin');
      playTone(220, 0.8, 'triangle', 0.1);
    }, 1800);

    setTimeout(() => {
      setBootPhase('bios_screen');
    }, 2800);
  };

  // Reset entire simulator
  const handleReset = () => {
    setInstalledParts([]);
    setSelectedPartId(null);
    setIsPoweredOn(false);
    setBootPhase('idle');
    setAlertMessage({
      title: 'میز کار ریست شد',
      text: 'تمام قطعات به سینی ابزار بازگشتند. می‌توانید فرایند اسمبل را از نو آغاز کنید.',
      type: 'info'
    });
  };

  const isAllAssembled = installedParts.length === PC_PARTS.length;
  const progressPercent = Math.round((installedParts.length / PC_PARTS.length) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Interactive Dashboard Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>INTERACTIVE PC LAB // شبیه‌ساز لمسی و ماوس</span>
              </span>
              <span className="text-[11px] font-bold text-gray-400 font-mono">
                HTML5 TOUCH & POINTER READY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              کارگاه تعاملی اتصال قطعات کامپیوتر (PC Assembly Simulator)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              با استفاده از لمس صفحه (گوشی و تبلت) یا کلیک و درگ ماوس (کامپیوتر)، قطعات را در جایگاه صحیح بنشانید. در صورت هرگونه اشتباه، هوش راهنما اخطار و دلیل فنی را به شما خواهد گفت!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                soundEnabled 
                  ? 'bg-blue-50 border-blue-200 text-blue-800' 
                  : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}
              title={soundEnabled ? 'صدا روشن است' : 'صدا خاموش است'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'صدا فعال' : 'بی‌صدا'}</span>
            </button>

            {/* Restart Button */}
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
              title="شروع مجدد اسمبل"
            >
              <RotateCcw className="w-4 h-4" />
              <span>بازنشانی</span>
            </button>

            {/* Turn ON Power Button */}
            <button
              onClick={handlePowerOn}
              disabled={isPoweredOn}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm ${
                isAllAssembled
                  ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white animate-pulse ring-4 ring-emerald-200 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Power className={`w-4 h-4 ${isPoweredOn ? 'text-emerald-300' : ''}`} />
              <span>{isPoweredOn ? 'سیستم روشن است' : isAllAssembled ? 'روشن کردن کامپیوتر (تست نهایی)' : 'تکمیل اسمبل برای روشن‌سازی'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Assembly Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-600">میزان پیشرفت اسمبل:</span>
            <div className="flex-1 sm:w-64 h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
              <div 
                className="h-full bg-gradient-to-l from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {installedParts.length} / {PC_PARTS.length} قطعه ({progressPercent}٪)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              <MousePointer2 className="w-3 h-3 text-blue-600" />
              <span>ماوس: کلیک برای انتخاب و کلیک روی سوکت</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              <Touchpad className="w-3 h-3 text-emerald-600" />
              <span>لمسی: لمس قطعه و سپس لمس جایگاه</span>
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Pedagogical Alert Banner */}
      {alertMessage && (
        <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3 shadow-sm ${
          alertMessage.type === 'error'
            ? 'bg-red-50/90 border-red-200 text-red-900'
            : alertMessage.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
              : 'bg-blue-50/90 border-blue-200 text-blue-900'
        }`}>
          {alertMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : alertMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h4 className="font-bold text-sm mb-0.5">{alertMessage.title}</h4>
            <p className="text-xs leading-relaxed opacity-90">{alertMessage.text}</p>
          </div>

          <button
            onClick={() => setAlertMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Assembly Workstation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side (in LTR) / Right (in RTL): Part Selection Inventory Tray */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-gray-900">سینی قطعات (جعبه ابزار)</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-400">
                {PC_PARTS.length - installedParts.length} قطعه مانده
              </span>
            </div>

            <p className="text-xs text-gray-500">
              یک قطعه را برای در دست گرفتن انتخاب کنید، سپس روی جایگاه مشخص‌شده آن در شاسی کامپیوتر کلیک یا لمس نمایید:
            </p>

            {/* List of 9 Parts */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {PC_PARTS.map((part) => {
                const isInstalled = installedParts.includes(part.id);
                const isSelected = selectedPartId === part.id;

                return (
                  <button
                    key={part.id}
                    onClick={() => {
                      if (!isInstalled) {
                        setSelectedPartId(isSelected ? null : part.id);
                      }
                    }}
                    disabled={isInstalled}
                    className={`w-full p-3 rounded-xl border text-right transition flex items-center justify-between gap-3 ${
                      isInstalled
                        ? 'bg-gray-50/80 border-gray-200 opacity-50 cursor-default'
                        : isSelected
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-sm scale-[1.01]'
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 rounded-lg bg-gray-100/70 border border-gray-200/60">
                        {part.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                            {part.name}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {part.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block truncate max-w-[180px]">
                          {part.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isInstalled ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      ) : isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold animate-pulse">
                          آماده نصب
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">
                          انتخاب
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center / Left: Interactive PC Chassis Visual Stage */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden select-none">
            
            {/* Background Studio Grid */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Stage Title Overlay */}
            <div className="flex items-center justify-between text-white/80 border-b border-white/10 pb-3 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-xs font-bold text-white tracking-wide">
                  فضای داخل کیس کامپیوتر (Computer Chassis Interior)
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                {selectedPartId 
                  ? `👉 در حال قرار دادن: ${PC_PARTS.find(p => p.id === selectedPartId)?.name}` 
                  : 'یک قطعه را انتخاب و روی جایگاه آن کلیک کنید'}
              </span>
            </div>

            {/* Interactive Motherboard & Case Blueprint Map */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0f172a] rounded-xl border-2 border-slate-700 overflow-hidden shadow-inner">
              
              {/* Chassis Outer Frame & Interior Tray */}
              <div className="absolute inset-3 border-2 border-dashed border-slate-600/60 rounded-lg pointer-events-none" />

              {/* Bottom PSU Shroud Tunnel Area */}
              <div className="absolute bottom-2 left-3 right-3 h-[18%] bg-slate-900/90 border-t border-slate-700 rounded-b-lg flex items-center justify-between px-4 text-xs font-mono text-slate-400 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>PSU CHAMBER // محفظه زیرین پاور</span>
                </span>
                <span className="text-[10px] text-slate-500">ISOLATED THERMAL ZONE</span>
              </div>

              {/* Motherboard PCB Outline (Rendered once Motherboard is installed) */}
              {installedParts.includes('motherboard') && (
                <div className="absolute top-[8%] left-[18%] w-[64%] h-[72%] bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-2 border-emerald-500/80 rounded-lg shadow-2xl transition-all duration-500 pointer-events-none">
                  {/* Printed Circuit Lines Texture */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="absolute top-2 right-2 text-[10px] font-mono font-bold text-emerald-400/80">
                    ATX MOTHERBOARD // PCB OK
                  </div>
                </div>
              )}

              {/* Animated Cooling & RGB Effects when PC is Turned ON */}
              {isPoweredOn && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  {/* Glowing ARGB Ambient Aura */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-emerald-500/10 animate-pulse" />
                  
                  {/* Case Fan Rotations */}
                  <div className="absolute top-8 right-5 w-16 h-16 rounded-full border-2 border-cyan-400/80 border-t-transparent animate-spin" />
                  <div className="absolute top-28 right-5 w-16 h-16 rounded-full border-2 border-purple-400/80 border-b-transparent animate-spin" />
                  
                  {/* CPU Fan Rotation */}
                  {installedParts.includes('cooling') && (
                    <div className="absolute top-[18%] left-[32%] w-[19%] h-[19%] rounded-full border-4 border-cyan-400 border-dashed animate-spin shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                  )}

                  {/* GPU Fans Rotations */}
                  {installedParts.includes('gpu') && (
                    <div className="absolute top-[53%] left-[23%] w-[32%] h-[12%] flex items-center justify-around px-2">
                      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-b-transparent animate-spin" />
                      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Sockets and Slots on the Board */}
              {ASSEMBLY_SLOTS.map((slot) => {
                const isFilled = installedParts.includes(slot.acceptedPartId);
                const isTargetForSelected = selectedPartId && PC_PARTS.find(p => p.id === selectedPartId)?.targetSlotId === slot.id;
                const part = PC_PARTS.find(p => p.id === slot.acceptedPartId);

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(slot.id)}
                    onMouseEnter={() => setHoveredSlotId(slot.id)}
                    onMouseLeave={() => setHoveredSlotId(null)}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`
                    }}
                    className={`absolute rounded-lg transition-all duration-300 flex flex-col items-center justify-center cursor-pointer p-1 text-center ${
                      isFilled
                        ? 'bg-slate-800/90 border-2 border-emerald-500 text-emerald-200 shadow-md'
                        : isTargetForSelected
                          ? 'bg-blue-600/30 border-2 border-blue-400 text-blue-200 animate-pulse ring-4 ring-blue-400/30 z-20'
                          : 'bg-slate-800/40 border border-slate-600/80 text-slate-400 hover:bg-slate-700/60 hover:border-slate-400'
                    }`}
                  >
                    {isFilled ? (
                      <div className="flex flex-col items-center justify-center scale-90 sm:scale-100">
                        <span className="text-base sm:text-xl">{part?.icon}</span>
                        <span className="text-[10px] font-bold text-white leading-tight">
                          {part?.name}
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400">INSTALLED ✓</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-0.5">
                        <span className="text-[9px] sm:text-[10px] font-bold leading-tight block">
                          {slot.title}
                        </span>
                        <span className="text-[8px] font-mono opacity-60 hidden sm:block">
                          {slot.enTitle}
                        </span>
                        {isTargetForSelected && (
                          <span className="text-[9px] font-bold text-blue-300 mt-0.5 animate-bounce">
                            کلیک یا لمس برای نصب 👇
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stage Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>سبز: قطعه نصب‌شده</span>
                <span className="w-2 h-2 rounded-full bg-blue-400 ml-2" />
                <span>آبی چشمک‌زن: جایگاه مقصد قطعه انتخابی</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                {isAllAssembled 
                  ? '🎉 تمام قطعات نصب شدند! کلید سبز پاور را فشار دهید.' 
                  : `⏳ ${PC_PARTS.length - installedParts.length} قطعه دیگر برای راه‌اندازی نیاز است`}
              </div>
            </div>

          </div>

          {/* Animated UEFI Bios Monitor (Appears when PC Boots Successfully) */}
          {isPoweredOn && (
            <div className="bg-black border-4 border-slate-700 rounded-2xl p-5 shadow-2xl font-mono text-emerald-400 space-y-3 relative overflow-hidden">
              {/* Scanline CRT monitor effect */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)'
                }}
              />

              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-white">HARDWARE LAB UEFI BIOS v2.4 (POST DIAGNOSTIC)</span>
                </div>
                <span className="text-emerald-500 text-[11px]">AMERICAN MEGATRENDS COMPATIBLE</span>
              </div>

              {bootPhase === 'starting' && (
                <div className="text-xs text-emerald-300 py-4 text-center animate-pulse">
                  در حال بررسی مدارات تغذیه و استارت اولیه جریان الکتریکی...
                </div>
              )}

              {bootPhase === 'post_beep' && (
                <div className="text-xs text-amber-300 py-4 flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>تک‌بوق سلامت بایوس شنیده شد (POST Short Beep: All Hardware Verified OK)</span>
                </div>
              )}

              {(bootPhase === 'fans_spin' || bootPhase === 'bios_screen') && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">پردازنده مرکزی (CPU):</span>
                      <span className="font-bold text-white">Intel Core i5-12400F @ 4.40GHz</span>
                      <span className="text-emerald-400 block text-[10px]">دمای پایدار: {biosTelemetry.cpuTemp}°C [خوب]</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">حافظه رم (Memory):</span>
                      <span className="font-bold text-white">16384 MB DDR4 Dual-Channel</span>
                      <span className="text-emerald-400 block text-[10px]">فرکانس: 3200MHz XMP 2.0 [فعال]</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">کارت گرافیک (GPU):</span>
                      <span className="font-bold text-white">NVIDIA GeForce RTX Series</span>
                      <span className="text-emerald-400 block text-[10px]">رابط PCIe 4.0 x16 [تایید شد]</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">حافظه ذخیره‌سازی (Storage):</span>
                      <span className="font-bold text-white">Samsung 980 NVMe SSD 500GB</span>
                      <span className="text-emerald-400 block text-[10px]">سلامت درایو: 100% SMART OK</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-300 pt-1">
                    <span>ولتاژ خط ۱۲+ ولت: {biosTelemetry.voltage12}V (استاندارد)</span>
                    <span>دور فن خنک‌کننده: {biosTelemetry.fanRpm} RPM</span>
                    <span className="text-emerald-400 font-bold bg-emerald-900/60 px-2 py-0.5 rounded">
                      وضعیت سیستم: آماده نصب سیستم‌عامل
                    </span>
                  </div>

                  <div className="bg-emerald-900/40 border border-emerald-700/80 p-3 rounded-xl text-center space-y-1 mt-3">
                    <h5 className="font-bold text-white text-sm">
                      🎉 تبریک! رایانه با موفقیت کامل اسمبل شد و روشن گردید.
                    </h5>
                    <p className="text-[11px] text-emerald-200">
                      شما تمام قطعات سخت‌افزاری و کابل‌های برق را طبق استانداردهای کتاب درسی بدون هیچ خطایی متصل نمودید.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
