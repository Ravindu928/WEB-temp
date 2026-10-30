import React from 'react';
import { ArrowLeft, Box, Sparkles, Layers, Wand2 } from 'lucide-react';
import { sound } from '../audio/sound.ts';
import { ViewMode } from '../three/SpatialScene.ts';

interface ConverterHeaderProps {
  viewMode: ViewMode;
  onReturnToHero: () => void;
  onOpenNotify: () => void;
}

export const ConverterHeader: React.FC<ConverterHeaderProps> = ({
  viewMode,
  onReturnToHero,
  onOpenNotify,
}) => {
  if (viewMode !== 'converter') return null;

  return (
    <div className="absolute top-20 sm:top-24 left-0 right-0 z-20 pointer-events-none px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Back pill button */}
        <button
          onClick={() => {
            sound.playClick();
            onReturnToHero();
          }}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12131c] border border-white/10 text-xs font-medium text-neutral-300 hover:text-white transition-colors mb-4 shadow-xl cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to 3D "SOON" Artwork</span>
        </button>

        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
          Real-Time{' '}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            2D to 3D Space Extrusion
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mb-3">
          Our upcoming engine lifts flat RGB pixels into continuous depth topography. Adjust the depth slider below or drop your own image to test.
        </p>

        {/* Live spatial specs */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1 bg-[#12131c]/70 px-2.5 py-1 rounded-md border border-white/5">
            <Box className="w-3 h-3 text-indigo-400" />
            14,000 Vertices
          </span>
          <span className="flex items-center gap-1 bg-[#12131c]/70 px-2.5 py-1 rounded-md border border-white/5">
            <Layers className="w-3 h-3 text-purple-400" />
            Zero-Shot Monocular Depth
          </span>
          <span className="flex items-center gap-1 bg-[#12131c]/70 px-2.5 py-1 rounded-md border border-white/5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            100% Free Forever
          </span>
        </div>
      </div>
    </div>
  );
};
