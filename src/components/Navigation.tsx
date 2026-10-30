import React from 'react';
import { Sparkles, Volume2, VolumeX, Layers3, Bell } from 'lucide-react';
import { sound } from '../audio/sound.ts';
import { ViewMode } from '../three/SpatialScene.ts';

interface NavigationProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenNotify: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  viewMode,
  onViewModeChange,
  onOpenNotify,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-5 flex items-center justify-between pointer-events-none">
      {/* Brand */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#090a10] rounded-[11px] flex items-center justify-center">
            <Layers3 className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wider text-white">SPATIAL</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
              100% FREE
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono tracking-tight">2D → 3D ENGINE</span>
        </div>
      </div>

      {/* Center Switcher: Hero "SOON" vs "2D-to-3D Demo" */}
      <div className="hidden md:flex items-center p-1 rounded-full bg-[#12131c]/90 border border-white/10 shadow-2xl pointer-events-auto">
        <button
          onClick={() => {
            sound.playClick();
            onViewModeChange('hero');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
            viewMode === 'hero'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          3D Sculpture
        </button>
        <button
          onClick={() => {
            sound.playWhoosh();
            onViewModeChange('converter');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
            viewMode === 'converter'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers3 className="w-3.5 h-3.5" />
          2D → 3D Space Lab
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          className="w-9 h-9 rounded-full bg-[#12131c]/90 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
        </button>

        {/* Notify CTA */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenNotify();
          }}
          className="group relative px-4 sm:px-5 py-2 rounded-full bg-white text-black text-xs font-semibold tracking-wide transition-all duration-300 hover:bg-neutral-200 hover:shadow-lg hover:shadow-white/10 active:scale-95 flex items-center gap-1.5"
        >
          <Bell className="w-3.5 h-3.5 text-neutral-800 transition-transform group-hover:rotate-12" />
          <span>Notify Me</span>
        </button>
      </div>
    </header>
  );
};
