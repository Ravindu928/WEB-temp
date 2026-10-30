import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  Upload,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sound } from '../audio/sound.ts';
import { FinishType, ViewMode } from '../three/SpatialScene.ts';
import { SpatialDisplayMode } from '../three/spatial2Dto3D.ts';

interface BottomDockProps {
  viewMode: ViewMode;
  finish: FinishType;
  onFinishChange: (finish: FinishType) => void;
  onResetCamera: () => void;
  spatialDepth: number;
  onSpatialDepthChange: (depth: number) => void;
  spatialMode: SpatialDisplayMode;
  onSpatialModeChange: (mode: SpatialDisplayMode) => void;
  onSelectPreset: (preset: 'architecture' | 'cyber') => void;
  onUploadImage: (img: HTMLImageElement) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  viewMode,
  finish,
  onFinishChange,
  onResetCamera,
  spatialDepth,
  onSpatialDepthChange,
  spatialMode,
  onSpatialModeChange,
  onSelectPreset,
  onUploadImage,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          sound.playChime();
          onUploadImage(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const finishes: { id: FinishType; label: string; color: string; desc: string }[] = [
    { id: 'titanium', label: 'Titanium', color: '#e2e8f0', desc: 'Liquid Chrome' },
    { id: 'chromatic', label: 'Glowtime', color: '#c084fc', desc: 'Iridescent Refraction' },
    { id: 'glass', label: 'Optical Glass', color: '#93c5fd', desc: 'Frosted Prism' },
    { id: 'obsidian', label: 'Obsidian Gold', color: '#f59e0b', desc: 'Midnight Ceramic' },
  ];

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-transform duration-500 ease-out select-none ${
        isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
      }`}
      style={{
        bottom: '20px',
        maxWidth: 'min(940px, 94vw)',
        width: '100%',
      }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => {
            sound.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="px-4 py-1 rounded-t-xl bg-[#11131c] border-t border-x border-white/10 text-[11px] font-mono tracking-wider text-neutral-400 hover:text-white flex items-center gap-1.5 shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main Solid Dock Surface (No backdrop-filter as mandated to preserve software WebGL performance) */}
      <div className="bg-[#11131c] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl">
        {viewMode === 'hero' ? (
          // --- HERO MODE CONTROLS ---
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Finish swatches */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mr-2 shrink-0">
                Finish:
              </span>
              {finishes.map((f) => {
                const isActive = finish === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      sound.playClick();
                      onFinishChange(f.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/30 shadow-md'
                        : 'bg-white/5 text-neutral-400 hover:text-neutral-200 border border-transparent'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: f.color }}
                    />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  onResetCamera();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                title="Reset 3D rotation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>
            </div>
          </div>
        ) : (
          // --- 2D TO 3D DEMO LAB CONTROLS ---
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Depth Slider */}
              <div className="flex items-center gap-3 w-full sm:w-80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 shrink-0 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Spatial Depth:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1.8"
                  step="0.05"
                  value={spatialDepth}
                  onChange={(e) => onSpatialDepthChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                />
                <span className="font-mono text-xs text-indigo-400 w-10 text-right tabular-nums">
                  {spatialDepth === 0 ? '2D Flat' : `${(spatialDepth * 100).toFixed(0)}%`}
                </span>
              </div>

              {/* Display Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
                <button
                  onClick={() => {
                    sound.playClick();
                    onSpatialModeChange('textured');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    spatialMode === 'textured'
                      ? 'bg-indigo-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Textured Relief
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSpatialModeChange('points');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    spatialMode === 'points'
                      ? 'bg-indigo-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Gaussian Points
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSpatialModeChange('wireframe');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    spatialMode === 'wireframe'
                      ? 'bg-indigo-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Wireframe Mesh
                </button>
              </div>

              {/* Reset rotation */}
              <button
                onClick={() => {
                  sound.playClick();
                  onResetCamera();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Presets and Upload */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-neutral-400">Sample Photos:</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectPreset('architecture');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-3 h-3 text-indigo-400" />
                  <span>Architecture</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectPreset('cyber');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>Chromatic Core</span>
                </button>
              </div>

              {/* Upload user image */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Any 2D Image</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
