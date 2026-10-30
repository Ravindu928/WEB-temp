/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { ThreeCanvas, ThreeCanvasHandle } from './components/ThreeCanvas.tsx';
import { sound } from './audio/sound.ts';
import { Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<ThreeCanvasHandle>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f7f4ee] text-[#1c1917] selection:bg-[#2b2520] selection:text-[#f7f4ee] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between">
      {/* 3D WebGL Canvas Viewport (Clock-Style "SOON" + Heavy Swinging Lamp) */}
      <div className="absolute inset-0 z-0">
        <ThreeCanvas ref={canvasRef} />
      </div>

      {/* Top Quiet Minimal Bar */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-6 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-[#78716c] pointer-events-none select-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="font-semibold text-[#1c1917]">SPATIAL</span>
          <span className="text-[#a8a29e]">/</span>
          <span>FREE 2D TO 3D ENGINE</span>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={toggleSound}
            aria-label="Toggle sound"
            className="text-[#a8a29e] hover:text-[#1c1917] transition-colors p-1 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-40" />
            )}
          </button>
        </div>
      </header>

      {/* Bottom Minimal Operational Note */}
      <footer className="relative z-10 w-full px-6 sm:px-12 py-8 flex items-center justify-between pointer-events-none select-none">
        <div className="text-[11px] font-mono tracking-widest uppercase text-[#78716c]">
          <span>OPERATIONS COMMENCING SOON</span>
          <span className="mx-2 text-[#a8a29e]">·</span>
          <span>100% FREE</span>
        </div>

        <div className="text-[11px] font-mono tracking-widest uppercase text-[#a8a29e] hidden sm:block">
          <span>SPATIAL RECONSTRUCTION</span>
        </div>
      </footer>
    </div>
  );
}
