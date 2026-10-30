import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createSkyTexture,
  createMountainTexture,
  createDuneTexture,
  createClockTypographyTexture,
  ClockLayout,
} from './lockscreenLayers.ts';

export interface SceneControls {
  setExplodeAmount: (amount: number) => void;
  setClockLayout: (layout: ClockLayout) => void;
  setShowFrame: (show: boolean) => void;
  resetRotation: () => void;
}

const _vec3 = new THREE.Vector3();

export class MinimalSpatialScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private frameId: number = 0;
  private isSoftwareGl: boolean = false;
  private isDisposed: boolean = false;

  // Root Phone / Display Rig
  private rootRig = new THREE.Group();
  private phoneFrameGroup = new THREE.Group();
  private layersGroup = new THREE.Group();

  // Mesh Layers
  private skyMesh!: THREE.Mesh;
  private clockMesh!: THREE.Mesh;
  private mountainMesh!: THREE.Mesh;
  private duneMesh!: THREE.Mesh;

  // Textures cache for layout switching
  private clockStackedTex!: THREE.CanvasTexture;
  private clockHorizontalTex!: THREE.CanvasTexture;
  private clockMat!: THREE.MeshBasicMaterial;

  // Layer separation parameter (0.0 = aligned lockscreen, 1.0 = exploded 3D space)
  private explodeAmount = 0.0;
  private currentClockLayout: ClockLayout = 'stacked';
  private showFrame = true;

  // Parallax & Rotation
  private targetRotX = 0;
  private targetRotY = 0;
  private currentRotX = 0;
  private currentRotY = 0;
  private isInteracting = false;
  private startX = 0;
  private startY = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, 0, 7.8);

    // 4. Studio Environment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting
    this.setupLighting();

    // 6. Build Phone Frame & Depth Layers
    this.buildPhoneRig();

    // 7. Events & Render Loop
    this.registerEvents();
    this.tick();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd8d3c7, 0.95);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    dirLight.position.set(4, 6, 6);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xd9c5b2, 1.2);
    rimLight.position.set(-5, -2, -4);
    this.scene.add(rimLight);
  }

  private buildPhoneRig() {
    const planeW = 2.8;
    const planeH = planeW * (16 / 9) * 0.96; // ~4.6 height (matching iPhone aspect ratio)

    // Base geometry for layers
    const layerGeo = new THREE.PlaneGeometry(planeW, planeH);

    // 1. Sky Layer
    const skyTex = createSkyTexture();
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.DoubleSide,
    });
    this.skyMesh = new THREE.Mesh(layerGeo, skyMat);
    this.skyMesh.position.z = -0.4;
    this.layersGroup.add(this.skyMesh);

    // 2. Clock "SOON" Typography Layer
    this.clockStackedTex = createClockTypographyTexture('stacked');
    this.clockHorizontalTex = createClockTypographyTexture('horizontal');

    this.clockMat = new THREE.MeshBasicMaterial({
      map: this.clockStackedTex,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.clockMesh = new THREE.Mesh(layerGeo, this.clockMat);
    this.clockMesh.position.z = -0.05;
    this.layersGroup.add(this.clockMesh);

    // 3. Midground Mountains Layer
    const mountainTex = createMountainTexture();
    const mountainMat = new THREE.MeshBasicMaterial({
      map: mountainTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.mountainMesh = new THREE.Mesh(layerGeo, mountainMat);
    this.mountainMesh.position.z = 0.22;
    this.layersGroup.add(this.mountainMesh);

    // 4. Foreground Sand Dune Layer
    const duneTex = createDuneTexture();
    const duneMat = new THREE.MeshBasicMaterial({
      map: duneTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.duneMesh = new THREE.Mesh(layerGeo, duneMat);
    this.duneMesh.position.z = 0.48;
    this.layersGroup.add(this.duneMesh);

    this.rootRig.add(this.layersGroup);

    // 5. Minimalist Apple Titanium Phone Frame (matching Image 1)
    this.buildChassis(planeW, planeH);
    this.rootRig.add(this.phoneFrameGroup);

    // Soft drop shadow beneath phone
    this.buildDropShadow(planeW, planeH);

    this.scene.add(this.rootRig);
  }

  private buildChassis(width: number, height: number) {
    // Outer titanium chassis rim
    const outerW = width + 0.16;
    const outerH = height + 0.16;
    const cornerR = 0.42;

    const shape = new THREE.Shape();
    const x = -outerW / 2;
    const y = -outerH / 2;
    shape.moveTo(x + cornerR, y);
    shape.lineTo(x + outerW - cornerR, y);
    shape.quadraticCurveTo(x + outerW, y, x + outerW, y + cornerR);
    shape.lineTo(x + outerW, y + outerH - cornerR);
    shape.quadraticCurveTo(x + outerW, y + outerH, x + outerW - cornerR, y + outerH);
    shape.lineTo(x + cornerR, y + outerH);
    shape.quadraticCurveTo(x, y + outerH, x, y + outerH - cornerR);
    shape.lineTo(x, y + cornerR);
    shape.quadraticCurveTo(x, y, x + cornerR, y);

    // Hole for screen
    const hole = new THREE.Path();
    const sx = -width / 2;
    const sy = -height / 2;
    const sR = 0.35;
    hole.moveTo(sx + sR, sy);
    hole.lineTo(sx + width - sR, sy);
    hole.quadraticCurveTo(sx + width, sy, sx + width, sy + sR);
    hole.lineTo(sx + width, sy + height - sR);
    hole.quadraticCurveTo(sx + width, sy + height, sx + width - sR, sy + height);
    hole.lineTo(sx + sR, sy + height);
    hole.quadraticCurveTo(sx, sy + height, sx, sy + height - sR);
    hole.lineTo(sx, sy + sR);
    hole.quadraticCurveTo(sx, sy, sx + sR, sy);
    shape.holes.push(hole);

    const bezelGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });

    const bezelMat = new THREE.MeshPhysicalMaterial({
      color: 0xd8d3cb, // Natural Titanium finish
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.4,
    });

    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.z = 0.52;
    this.phoneFrameGroup.add(bezelMesh);

    // Dynamic Island pill
    const islandGeo = new THREE.CapsuleGeometry(0.09, 0.36, 12, 16);
    const islandMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.rotation.z = Math.PI / 2;
    islandMesh.position.set(0, height / 2 - 0.26, 0.56);
    this.phoneFrameGroup.add(islandMesh);
  }

  private buildDropShadow(w: number, h: number) {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 512;
    sCanvas.height = 512;
    const sCtx = sCanvas.getContext('2d')!;

    const grad = sCtx.createRadialGradient(256, 256, 10, 256, 256, 240);
    grad.addColorStop(0, 'rgba(35, 39, 36, 0.28)');
    grad.addColorStop(0.4, 'rgba(35, 39, 36, 0.12)');
    grad.addColorStop(0.8, 'rgba(35, 39, 36, 0.02)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 512, 512);

    const sTex = new THREE.CanvasTexture(sCanvas);
    const shadowGeo = new THREE.PlaneGeometry(w * 1.5, h * 1.3);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: sTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -0.2, -0.6);
    this.rootRig.add(shadowMesh);
  }

  public setExplodeAmount(amount: number) {
    this.explodeAmount = amount;

    // Animate layers along Z
    // Normal: sky = -0.4, clock = -0.05, mountain = 0.22, dune = 0.48
    // Exploded: spread apart by up to 1.8 units each
    this.skyMesh.position.z = -0.4 - amount * 1.2;
    this.clockMesh.position.z = -0.05 - amount * 0.4;
    this.mountainMesh.position.z = 0.22 + amount * 0.5;
    this.duneMesh.position.z = 0.48 + amount * 1.3;

    // When exploding, hide or fade phone bezel so the layers can be inspected in space
    this.phoneFrameGroup.visible = this.showFrame && amount < 0.65;
  }

  public setClockLayout(layout: ClockLayout) {
    this.currentClockLayout = layout;
    this.clockMat.map = layout === 'stacked' ? this.clockStackedTex : this.clockHorizontalTex;
    this.clockMat.needsUpdate = true;
  }

  public setShowFrame(show: boolean) {
    this.showFrame = show;
    this.phoneFrameGroup.visible = show && this.explodeAmount < 0.65;
  }

  public resetRotation() {
    this.targetRotX = 0;
    this.targetRotY = 0;
  }

  private registerEvents() {
    const onResize = () => {
      if (this.isDisposed) return;
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    const dom = this.renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      this.isInteracting = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (this.isInteracting) {
        const dx = (e.clientX - this.startX) * 0.005;
        const dy = (e.clientY - this.startY) * 0.005;
        this.targetRotY += dx;
        this.targetRotX = Math.max(-0.55, Math.min(0.55, this.targetRotX + dy));
        this.startX = e.clientX;
        this.startY = e.clientY;
      } else {
        // Subtle ambient parallax
        this.targetRotY = normX * 0.28;
        this.targetRotX = -normY * 0.2;
      }
    };

    const onPointerUp = () => {
      this.isInteracting = false;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    if (this.isDisposed) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Damped rotational physics
    this.currentRotX = THREE.MathUtils.damp(this.currentRotX, this.targetRotX, 4, delta);
    this.currentRotY = THREE.MathUtils.damp(this.currentRotY, this.targetRotY, 4, delta);

    this.rootRig.rotation.y = this.currentRotY;
    this.rootRig.rotation.x = this.currentRotX;

    // Gentle floating breathing
    this.rootRig.position.y = Math.sin(time * 1.2) * 0.04;

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement?.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
