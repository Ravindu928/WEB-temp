import * as THREE from 'three';

export type ClockLayout = 'stacked' | 'horizontal';

/**
 * Creates procedural textures matching the iPhone lockscreen wallpaper in image_7903313d.png:
 * 1. Atmospheric hazy sky
 * 2. Jagged mountain ridge with alpha transparency
 * 3. Sweeping sand dune foreground with alpha transparency
 * 4. Apple lockscreen clock-style typography for "SOON"
 */

export function createSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 1600);
  grad.addColorStop(0, '#788c9f'); // Cool atmospheric sky
  grad.addColorStop(0.25, '#9aadb9');
  grad.addColorStop(0.55, '#c5b5a4'); // Warm golden morning haze
  grad.addColorStop(0.75, '#bbaaa0');
  grad.addColorStop(1, '#9f8f86');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1600);

  // Soft atmospheric noise / grain
  const imgData = ctx.getImageData(0, 0, 1024, 1600);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 6;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMountainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 1600);

  // Draw midground mountain ridge starting around y = 600 down to bottom
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 720);

  // Jagged mountain peaks silhouette
  const peaks = [
    [100, 680],
    [220, 620],
    [320, 670],
    [430, 580],
    [540, 640],
    [680, 590],
    [800, 650],
    [920, 610],
    [1024, 660],
  ];

  for (const [x, y] of peaks) {
    ctx.lineTo(x, y);
  }
  ctx.lineTo(1024, 1600);
  ctx.lineTo(0, 1600);
  ctx.closePath();

  // Mountain shading gradient
  const mGrad = ctx.createLinearGradient(0, 580, 0, 1400);
  mGrad.addColorStop(0, '#595b52'); // Misty top ridge
  mGrad.addColorStop(0.3, '#3c4038');
  mGrad.addColorStop(0.7, '#2f342d');
  mGrad.addColorStop(1, '#232722');
  ctx.fillStyle = mGrad;
  ctx.fill();

  // Subtle rocky texture & strata
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    const rx = Math.random() * 1024;
    const ry = 620 + Math.random() * 600;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 40 + Math.random() * 50, ry + 20 + Math.random() * 30);
    ctx.stroke();
  }

  // Atmospheric haze on the mountain ridge
  const haze = ctx.createLinearGradient(0, 580, 0, 900);
  haze.addColorStop(0, 'rgba(197, 181, 164, 0.45)');
  haze.addColorStop(1, 'rgba(197, 181, 164, 0)');
  ctx.fillStyle = haze;
  ctx.fill();

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDuneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 1600);

  // Foreground sweeping sand dune matching Image 1
  // Starts on left at y = 920, swoops down to bottom-right
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 940);
  ctx.bezierCurveTo(280, 1020, 620, 1180, 1024, 1340);
  ctx.lineTo(1024, 1600);
  ctx.lineTo(0, 1600);
  ctx.closePath();

  const duneGrad = ctx.createLinearGradient(0, 940, 600, 1600);
  duneGrad.addColorStop(0, '#baa797'); // Crest highlight
  duneGrad.addColorStop(0.4, '#998677');
  duneGrad.addColorStop(0.8, '#827163');
  duneGrad.addColorStop(1, '#66574c');
  ctx.fillStyle = duneGrad;
  ctx.fill();

  // Subtle sand ripple texture
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  for (let y = 1000; y < 1600; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(300, y + 60, 700, y + 120, 1024, y + 160);
    ctx.stroke();
  }

  // Soft crest light edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 940);
  ctx.bezierCurveTo(280, 1020, 620, 1180, 1024, 1340);
  ctx.stroke();

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Renders the clock-style text "SOON" in the signature iOS 16/17/18 lock screen typography.
 * Characterized by ultra-tall condensed proportions, uniform monoline stroke, and rounded terminals.
 */
export function createClockTypographyTexture(layout: ClockLayout = 'stacked'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 1600);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const strokeW = 28;
  ctx.lineWidth = strokeW;

  // Custom procedural glyph renderer for the ultra-tall condensed rounded Apple clock font
  // Height: ~280px, Width: ~140px

  const drawLetterS = (x: number, y: number, w: number, h: number) => {
    const r = w / 2;
    ctx.beginPath();
    // Top arc: start at (x + w, y + r), arc over to (x, y + r)
    ctx.arc(x + r, y + r, r, 0, Math.PI, true);
    // Down to middle
    ctx.lineTo(x, y + h / 2 - r / 2);
    // Middle curve to right
    ctx.bezierCurveTo(x, y + h / 2 + r, x + w, y + h / 2 - r, x + w, y + h / 2 + r / 2);
    // Down to bottom
    ctx.lineTo(x + w, y + h - r);
    // Bottom arc: to (x, y + h - r)
    ctx.arc(x + r, y + h - r, r, 0, Math.PI, false);
    ctx.stroke();
  };

  const drawLetterO = (x: number, y: number, w: number, h: number) => {
    const r = w / 2;
    ctx.beginPath();
    // Rounded pill / stadium shape
    ctx.arc(x + r, y + r, r, Math.PI, 0, false);
    ctx.lineTo(x + w, y + h - r);
    ctx.arc(x + r, y + h - r, r, 0, Math.PI, false);
    ctx.lineTo(x, y + r);
    ctx.closePath();
    ctx.stroke();
  };

  const drawLetterN = (x: number, y: number, w: number, h: number) => {
    ctx.beginPath();
    // Left vertical stem
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y);
    // Diagonal to bottom right
    ctx.lineTo(x + w, y + h);
    // Right vertical stem
    ctx.lineTo(x + w, y);
    ctx.stroke();
  };

  if (layout === 'stacked') {
    // 2-row layout like an Apple Watch / iOS lockscreen:
    // Row 1: S  O  (centered at y = 380)
    // Row 2: O  N  (centered at y = 730)
    const letterW = 160;
    const letterH = 310;
    const spacing = 80;

    const row1Y = 320;
    const row2Y = 660;

    const totalRowW = letterW * 2 + spacing;
    const startX = (1024 - totalRowW) / 2;

    // Soft outer glow behind letters
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 24;

    // Row 1: 'S', 'O'
    drawLetterS(startX, row1Y, letterW, letterH);
    drawLetterO(startX + letterW + spacing, row1Y, letterW, letterH);

    // Row 2: 'O', 'N'
    drawLetterO(startX, row2Y, letterW, letterH);
    drawLetterN(startX + letterW + spacing, row2Y, letterW, letterH);

    ctx.shadowBlur = 0;
  } else {
    // Horizontal row: S  O  O  N across the upper chest (y = 440)
    const letterW = 120;
    const letterH = 340;
    const spacing = 45;
    const totalW = letterW * 4 + spacing * 3;
    const startX = (1024 - totalW) / 2;
    const topY = 400;

    ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
    ctx.shadowBlur = 25;

    drawLetterS(startX, topY, letterW, letterH);
    drawLetterO(startX + (letterW + spacing) * 1, topY, letterW, letterH);
    drawLetterO(startX + (letterW + spacing) * 2, topY, letterW, letterH);
    drawLetterN(startX + (letterW + spacing) * 3, topY, letterW, letterH);

    ctx.shadowBlur = 0;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
