import React, { useState, useEffect } from 'react';
import { ArrowRight, Rotate3d, ShieldCheck, Sparkles, Cpu, Infinity } from 'lucide-react';
import { sound } from '../audio/sound.ts';
import { ViewMode } from '../three/SpatialScene.ts';

interface HeroOverlayProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenNotify: () => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  viewMode,
  onViewModeChange,
  onOpenNotify,
}) => {
  // Countdown to launch (simulated launch date: 4 days, 16 hours ahead)
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 16,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (viewMode !== 'hero') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top Section */}
      <div className="pt-16 sm:pt-20 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Apple-style status capsule */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12131c]/80 border border-white/10 text-[11px] font-mono tracking-widest text-neutral-300 uppercase shadow-xl mb-4 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Commencing Operations Soon</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-light tracking-tight text-neutral-300 max-w-xl">
          Convert flat 2D images into interactive{' '}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-indigo-300">
            3D spatial worlds
          </span>
          .
        </h1>

        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Infinity className="w-3.5 h-3.5 text-indigo-400" />
            100% Free Forever
          </span>
          <span className="w-1 h-1 rounded-full bg-neutral-600" />
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-pink-400" />
            Neural Depth Mesh
          </span>
          <span className="w-1 h-1 rounded-full bg-neutral-600" />
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            In-Browser
          </span>
        </div>
      </div>

      {/* Middle Center: The 3D "SOON" object sits right here in full grandeur */}
      <div className="flex-1 flex items-center justify-center">
        {/* Subtle helper pill on initial visit */}
        <div className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 tracking-wider">
          <Rotate3d className="w-3.5 h-3.5" />
          <span>DRAG TO ROTATE 3D OBJECT</span>
        </div>
      </div>

      {/* Bottom Floating Info & Countdown (above the collapsible dock) */}
      <div className="pb-24 sm:pb-28 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto w-full pointer-events-auto">
        {/* Launch Countdown */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0f1017]/85 border border-white/10 shadow-2xl">
          <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mr-2 border-r border-white/10 pr-3">
            Operational
            <br />
            Launch In
          </div>
          <div className="flex items-center gap-3 text-center">
            <div className="flex flex-col">
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-neutral-400 uppercase font-mono">Days</span>
            </div>
            <span className="text-neutral-500 font-mono text-xs">:</span>
            <div className="flex flex-col">
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-neutral-400 uppercase font-mono">Hrs</span>
            </div>
            <span className="text-neutral-500 font-mono text-xs">:</span>
            <div className="flex flex-col">
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-neutral-400 uppercase font-mono">Min</span>
            </div>
            <span className="text-neutral-500 font-mono text-xs">:</span>
            <div className="flex flex-col">
              <span className="font-mono text-sm sm:text-base font-bold text-indigo-400 tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-neutral-400 uppercase font-mono">Sec</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playWhoosh();
              onViewModeChange('converter');
            }}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-200 hover:text-white transition-all flex items-center gap-2 group shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive 2D → 3D Demo</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenNotify();
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-xs font-semibold text-white transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
          >
            <span>Early Access Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
