import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { SwingingChairScene } from '../three/SwingingChairScene.ts';

export interface ThreeCanvasHandle {
  pushChair: () => void;
  resetRotation: () => void;
}

export const ThreeCanvas = forwardRef<ThreeCanvasHandle>((_, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SwingingChairScene | null>(null);

  useImperativeHandle(ref, () => ({
    pushChair: () => sceneRef.current?.pushChair(),
    resetRotation: () => sceneRef.current?.resetRotation(),
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new SwingingChairScene(mountRef.current);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    />
  );
});

ThreeCanvas.displayName = 'ThreeCanvas';
