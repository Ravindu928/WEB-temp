import * as THREE from 'three';
import { DemoImagePair } from './proceduralAssets.ts';

export type SpatialDisplayMode = 'textured' | 'wireframe' | 'points';

export interface Spatial2Dto3DObject {
  group: THREE.Group;
  mesh: THREE.Mesh;
  wireframeMesh: THREE.Mesh;
  pointsMesh: THREE.Points;
  setDepthAmount: (amount: number) => void;
  setDisplayMode: (mode: SpatialDisplayMode) => void;
  updateTexturePair: (pair: DemoImagePair) => void;
  updateCustomImage: (imageElement: HTMLImageElement) => void;
  dispose: () => void;
}

export function createSpatial2Dto3DObject(initialPair: DemoImagePair): Spatial2Dto3DObject {
  const group = new THREE.Group();
  group.name = 'Spatial2Dto3DConversionEngine';

  const width = 7.6;
  const height = 5.2;
  const segX = 140;
  const segY = 100;

  // Base plane geometry
  const geometry = new THREE.PlaneGeometry(width, height, segX, segY);
  const posAttr = geometry.attributes.position;
  const vertexCount = posAttr.count;

  // Store original Z positions and computed depth displacement targets
  const basePositions = new Float32Array(posAttr.array);
  const targetZ = new Float32Array(vertexCount);

  // Compute depth Z targets from depth canvas
  const computeDepthTargetsFromCanvas = (dCanvas: HTMLCanvasElement) => {
    const ctx = dCanvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, dCanvas.width, dCanvas.height);
    const data = imgData.data;
    const cw = dCanvas.width;
    const ch = dCanvas.height;

    for (let i = 0; i < vertexCount; i++) {
      // Vertex UV coordinates from PlaneGeometry:
      // In PlaneGeometry, vertices are ordered top-to-bottom or bottom-to-top
      // x runs from -width/2 to width/2; y runs from height/2 to -height/2
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);

      const u = (vx + width / 2) / width;
      const v = 1 - (vy + height / 2) / height;

      const px = Math.min(Math.floor(u * cw), cw - 1);
      const py = Math.min(Math.floor(v * ch), ch - 1);
      const idx = (py * cw + px) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      // Curve brightness for dramatic spatial relief
      targetZ[i] = Math.pow(brightness, 1.2) * 1.8;
    }
  };

  computeDepthTargetsFromCanvas(initialPair.depthCanvas);

  // 1. Textured PBR Mesh
  const material = new THREE.MeshPhysicalMaterial({
    map: initialPair.colorTexture,
    roughness: 0.25,
    metalness: 0.1,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // 2. Wireframe spatial mesh
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
  });
  const wireframeMesh = new THREE.Mesh(geometry, wireMaterial);
  wireframeMesh.visible = false;
  group.add(wireframeMesh);

  // 3. Point Cloud Gaussian Splats
  const pointsMat = new THREE.PointsMaterial({
    size: 0.045,
    map: initialPair.colorTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });
  const pointsMesh = new THREE.Points(geometry, pointsMat);
  pointsMesh.visible = false;
  group.add(pointsMesh);

  // Elegant spatial bounding frame
  const frameGeo = new THREE.BoxGeometry(width + 0.3, height + 0.3, 0.05);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x181824,
    metalness: 0.8,
    roughness: 0.2,
  });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.z = -0.05;
  group.add(frameMesh);

  // Current depth slider value
  let currentDepth = 0;

  const setDepthAmount = (amount: number) => {
    currentDepth = amount;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < vertexCount; i++) {
      // Displace Z along normal
      array[i * 3 + 2] = targetZ[i] * currentDepth;
    }
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  };

  const setDisplayMode = (mode: SpatialDisplayMode) => {
    mesh.visible = mode === 'textured';
    wireframeMesh.visible = mode === 'wireframe';
    pointsMesh.visible = mode === 'points';
  };

  const updateTexturePair = (pair: DemoImagePair) => {
    material.map = pair.colorTexture;
    material.needsUpdate = true;
    pointsMat.map = pair.colorTexture;
    pointsMat.needsUpdate = true;
    computeDepthTargetsFromCanvas(pair.depthCanvas);
    setDepthAmount(currentDepth);
  };

  const updateCustomImage = (img: HTMLImageElement) => {
    // Generate color texture from uploaded image
    const cCanvas = document.createElement('canvas');
    cCanvas.width = 1024;
    cCanvas.height = 768;
    const cCtx = cCanvas.getContext('2d')!;
    cCtx.drawImage(img, 0, 0, 1024, 768);
    const colorTex = new THREE.CanvasTexture(cCanvas);
    colorTex.colorSpace = THREE.SRGBColorSpace;

    // Generate procedural depth map using edge detection & luminance gradient
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 512;
    dCanvas.height = 384;
    const dCtx = dCanvas.getContext('2d')!;
    dCtx.drawImage(img, 0, 0, 512, 384);

    const imgData = dCtx.getImageData(0, 0, 512, 384);
    const d = imgData.data;

    // Convert to grayscale depth with center radial depth bias (portraits / subjects usually in center)
    const cx = 256;
    const cy = 192;
    for (let y = 0; y < 384; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const lum = d[idx] * 0.299 + d[idx + 1] * 0.587 + d[idx + 2] * 0.114;
        const distFromCenter = Math.hypot(x - cx, y - cy) / 320;
        const depthWeight = Math.max(0, 1 - distFromCenter * 0.7);
        const finalVal = Math.min(255, lum * 0.7 + depthWeight * 255 * 0.3);

        d[idx] = finalVal;
        d[idx + 1] = finalVal;
        d[idx + 2] = finalVal;
      }
    }
    dCtx.putImageData(imgData, 0, 0);

    const depthTex = new THREE.CanvasTexture(dCanvas);
    depthTex.colorSpace = THREE.NoColorSpace;

    updateTexturePair({
      name: 'User Image',
      category: 'Custom',
      colorTexture: colorTex,
      depthTexture: depthTex,
      depthCanvas: dCanvas,
    });
  };

  const dispose = () => {
    geometry.dispose();
    material.dispose();
    wireMaterial.dispose();
    pointsMat.dispose();
    frameGeo.dispose();
    frameMat.dispose();
  };

  return {
    group,
    mesh,
    wireframeMesh,
    pointsMesh,
    setDepthAmount,
    setDisplayMode,
    updateTexturePair,
    updateCustomImage,
    dispose,
  };
}
