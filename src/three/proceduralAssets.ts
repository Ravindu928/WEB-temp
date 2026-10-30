import * as THREE from 'three';

/**
 * Procedural texture and asset generator for high-fidelity rendering without 404 dependencies.
 */

// Procedural soft contact shadow texture
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.65)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.06)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural high-resolution demo images for 2D to 3D spatial conversion
export interface DemoImagePair {
  name: string;
  category: string;
  colorTexture: THREE.CanvasTexture;
  depthTexture: THREE.CanvasTexture;
  depthCanvas: HTMLCanvasElement;
}

export function generateArchitecturalDemoPair(): DemoImagePair {
  // 1. Color Canvas: Minimalist Bauhaus / Spatial Pavilion
  const cCanvas = document.createElement('canvas');
  cCanvas.width = 1024;
  cCanvas.height = 768;
  const cCtx = cCanvas.getContext('2d')!;

  // 2. Depth Canvas: Depth map (black = far, white = near)
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 512;
  dCanvas.height = 384;
  const dCtx = dCanvas.getContext('2d')!;

  // Background sky / horizon
  const skyGrad = cCtx.createLinearGradient(0, 0, 0, 768);
  skyGrad.addColorStop(0, '#0c0f1d');
  skyGrad.addColorStop(0.6, '#1e2238');
  skyGrad.addColorStop(1, '#ff6b4a');
  cCtx.fillStyle = skyGrad;
  cCtx.fillRect(0, 0, 1024, 768);

  dCtx.fillStyle = '#101010'; // Far background
  dCtx.fillRect(0, 0, 512, 384);

  // Distant glowing geometric sun
  cCtx.beginPath();
  cCtx.arc(512, 340, 140, 0, Math.PI * 2);
  cCtx.fillStyle = '#ffb370';
  cCtx.shadowColor = '#ff6b4a';
  cCtx.shadowBlur = 80;
  cCtx.fill();
  cCtx.shadowBlur = 0;

  dCtx.beginPath();
  dCtx.arc(256, 170, 70, 0, Math.PI * 2);
  dCtx.fillStyle = '#303030';
  dCtx.fill();

  // Floating midground sculptural monoliths
  cCtx.fillStyle = '#111422';
  cCtx.fillRect(360, 200, 304, 450);
  dCtx.fillStyle = '#909090'; // Midground
  dCtx.fillRect(180, 100, 152, 225);

  // High-contrast neon cutouts & architectural ribs
  cCtx.fillStyle = '#6366f1';
  cCtx.fillRect(400, 240, 224, 180);
  dCtx.fillStyle = '#bbbbbb';
  dCtx.fillRect(200, 120, 112, 90);

  // Foreground staircase / spatial pedestal
  const fgGrad = cCtx.createLinearGradient(0, 500, 0, 768);
  fgGrad.addColorStop(0, '#1d1e2c');
  fgGrad.addColorStop(1, '#08080c');
  cCtx.fillStyle = fgGrad;
  cCtx.beginPath();
  cCtx.moveTo(100, 768);
  cCtx.lineTo(924, 768);
  cCtx.lineTo(820, 520);
  cCtx.lineTo(204, 520);
  cCtx.closePath();
  cCtx.fill();

  const dFgGrad = dCtx.createLinearGradient(0, 250, 0, 384);
  dFgGrad.addColorStop(0, '#aaaaaa');
  dFgGrad.addColorStop(1, '#ffffff'); // Closest to camera
  dCtx.fillStyle = dFgGrad;
  dCtx.beginPath();
  dCtx.moveTo(50, 384);
  dCtx.lineTo(462, 384);
  dCtx.lineTo(410, 260);
  dCtx.lineTo(102, 260);
  dCtx.closePath();
  dCtx.fill();

  // Fine architectural perspective lines
  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  cCtx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    cCtx.beginPath();
    cCtx.moveTo(204 + i * 77, 520);
    cCtx.lineTo(100 + i * 103, 768);
    cCtx.stroke();
  }

  const cTexture = new THREE.CanvasTexture(cCanvas);
  cTexture.colorSpace = THREE.SRGBColorSpace;

  const dTexture = new THREE.CanvasTexture(dCanvas);
  dTexture.colorSpace = THREE.NoColorSpace;

  return {
    name: 'Spatial Architecture',
    category: 'Architecture',
    colorTexture: cTexture,
    depthTexture: dTexture,
    depthCanvas: dCanvas,
  };
}

export function generateCyberSphereDemoPair(): DemoImagePair {
  const cCanvas = document.createElement('canvas');
  cCanvas.width = 1024;
  cCanvas.height = 768;
  const cCtx = cCanvas.getContext('2d')!;

  const dCanvas = document.createElement('canvas');
  dCanvas.width = 512;
  dCanvas.height = 384;
  const dCtx = dCanvas.getContext('2d')!;

  // Deep dark gradient
  cCtx.fillStyle = '#06070d';
  cCtx.fillRect(0, 0, 1024, 768);
  dCtx.fillStyle = '#050505';
  dCtx.fillRect(0, 0, 512, 384);

  // Futuristic Iris / Sphere
  const cx = 512;
  const cy = 384;
  const radius = 220;

  // Outer chromatic glow
  const grad = cCtx.createRadialGradient(cx, cy, 50, cx, cy, radius);
  grad.addColorStop(0, '#f43f5e');
  grad.addColorStop(0.4, '#8b5cf6');
  grad.addColorStop(0.7, '#06b6d4');
  grad.addColorStop(1, '#0f172a');

  cCtx.beginPath();
  cCtx.arc(cx, cy, radius, 0, Math.PI * 2);
  cCtx.fillStyle = grad;
  cCtx.fill();

  // Depth for sphere (parabolic dome)
  const dGrad = dCtx.createRadialGradient(256, 192, 0, 256, 192, 110);
  dGrad.addColorStop(0, '#ffffff'); // Front apex of sphere
  dGrad.addColorStop(0.7, '#888888');
  dGrad.addColorStop(1, '#151515'); // Base

  dCtx.beginPath();
  dCtx.arc(256, 192, 110, 0, Math.PI * 2);
  dCtx.fillStyle = dGrad;
  dCtx.fill();

  // Concentric holographic rings
  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  cCtx.lineWidth = 3;
  for (let r = 60; r <= radius; r += 40) {
    cCtx.beginPath();
    cCtx.arc(cx, cy, r, 0, Math.PI * 2);
    cCtx.stroke();
  }

  const cTexture = new THREE.CanvasTexture(cCanvas);
  cTexture.colorSpace = THREE.SRGBColorSpace;

  const dTexture = new THREE.CanvasTexture(dCanvas);
  dTexture.colorSpace = THREE.NoColorSpace;

  return {
    name: 'Chromatic Core',
    category: 'Abstract 3D',
    colorTexture: cTexture,
    depthTexture: dTexture,
    depthCanvas: dCanvas,
  };
}
