import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createSoonSculpture, SoonSculptureGroup } from './letterGeometries.ts';
import { createContactShadowTexture, generateArchitecturalDemoPair, generateCyberSphereDemoPair, DemoImagePair } from './proceduralAssets.ts';
import { createSpatial2Dto3DObject, Spatial2Dto3DObject, SpatialDisplayMode } from './spatial2Dto3D.ts';

export type FinishType = 'titanium' | 'chromatic' | 'glass' | 'obsidian';
export type ViewMode = 'hero' | 'converter';

// Pre-allocated math helpers for zero GC during render tick
const _vec3 = new THREE.Vector3();
const _targetEuler = new THREE.Euler();

export class SpatialScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private frameId: number = 0;
  private isSoftwareGl: boolean = false;
  private isDisposed: boolean = false;

  // Scene Objects
  private heroGroup = new THREE.Group();
  private converterGroup = new THREE.Group();
  private soonSculpture!: SoonSculptureGroup;
  private spatialConverter!: Spatial2Dto3DObject;
  private shadowPlane!: THREE.Mesh;
  private particlesMesh!: THREE.Points;
  private backgroundPlatesGroup = new THREE.Group();

  // Materials map
  private materials: Record<FinishType, THREE.Material> = {} as Record<FinishType, THREE.Material>;
  private innerMaterials: Record<FinishType, THREE.Material> = {} as Record<FinishType, THREE.Material>;
  private currentFinish: FinishType = 'titanium';
  private currentViewMode: ViewMode = 'hero';

  // Interactive interaction states
  private targetRotX = 0;
  private targetRotY = 0;
  private currentRotX = 0;
  private currentRotY = 0;
  private isUserInteracting = false;
  private pointerStartX = 0;
  private pointerStartY = 0;

  // Camera transition targets
  private targetCamZ = 9.8;
  private targetCamY = 0.2;

  // Callbacks
  private onReady?: () => void;

  constructor(container: HTMLElement, onReady?: () => void) {
    this.container = container;
    this.onReady = onReady;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Detect software WebGL as per guidelines
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
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 0.2, 9.8);

    // Horizon fog matching minimal dark background
    this.scene.fog = new THREE.Fog(0x050507, 14, 30);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Studio Lighting Rig
    this.setupLighting();

    // 6. Build Materials Library
    this.setupMaterials();

    // 7. Ground Contact Shadow
    this.setupGroundShadow();

    // 8. 3D "SOON" Sculpture (Hero Centerpiece)
    this.setupHeroSculpture();

    // 9. Floating 2D-to-3D Accent Plates in Hero Mode
    this.setupBackgroundAccentPlates();

    // 10. Spatial Coordinate Dust Particle Field
    this.setupParticleField();

    // 11. Interactive 2D-to-3D Conversion Demo Object
    this.setupConverterEngine();

    // 12. Register Listeners & Start Loop
    this.registerEvents();
    this.tick();

    if (this.onReady) {
      this.onReady();
    }
  }

  private setupLighting() {
    // Balanced warm/cool contrast
    const hemiLight = new THREE.HemisphereLight(0xced8ff, 0x050711, 0.9);
    this.scene.add(hemiLight);

    // Key directional light with soft shadow
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.4);
    keyLight.position.set(5, 7, 7);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -7;
      keyLight.shadow.camera.right = 7;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Rim/Back light (vibrant spatial cyan/magenta rim)
    const rimLight = new THREE.DirectionalLight(0x7000ff, 1.8);
    rimLight.position.set(-6, -2, -6);
    this.scene.add(rimLight);

    const rimLight2 = new THREE.DirectionalLight(0x00d2ff, 1.6);
    rimLight2.position.set(6, 4, -5);
    this.scene.add(rimLight2);
  }

  private setupMaterials() {
    // 1. Liquid Titanium (Apple style brushed chrome)
    this.materials.titanium = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.96,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.6,
    });
    this.innerMaterials.titanium = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.6,
    });

    // 2. Apple Glowtime / Chromatic Iridescence
    this.materials.chromatic = new THREE.MeshPhysicalMaterial({
      color: 0xd8b4fe,
      metalness: 0.35,
      roughness: 0.12,
      transmission: this.isSoftwareGl ? 0 : 0.72,
      transparent: true,
      opacity: this.isSoftwareGl ? 0.75 : 0.95,
      ior: 1.58,
      thickness: 1.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(0xf43f5e),
      attenuationDistance: 1.2,
      envMapIntensity: 1.8,
    });
    this.innerMaterials.chromatic = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.8,
    });

    // 3. Frosted Spatial Glass
    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0xe0e7ff,
      metalness: 0.08,
      roughness: 0.2,
      transmission: this.isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: this.isSoftwareGl ? 0.65 : 0.95,
      ior: 1.52,
      thickness: 2.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.4,
    });
    this.innerMaterials.glass = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
    });

    // 4. Midnight Obsidian & Gold
    this.materials.obsidian = new THREE.MeshPhysicalMaterial({
      color: 0x08090f,
      metalness: 0.4,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.5,
    });
    this.innerMaterials.obsidian = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.75,
    });
  }

  private setupGroundShadow() {
    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(16, 6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -2.35;
    this.scene.add(this.shadowPlane);
  }

  private setupHeroSculpture() {
    this.soonSculpture = createSoonSculpture(
      this.materials[this.currentFinish],
      this.innerMaterials[this.currentFinish]
    );
    this.heroGroup.add(this.soonSculpture.group);
    this.scene.add(this.heroGroup);
  }

  private setupBackgroundAccentPlates() {
    // 2.5D floating spatial plates behind the SOON word, representing 2D image slicing into 3D
    const archPair = generateArchitecturalDemoPair();
    const spherePair = generateCyberSphereDemoPair();

    const plateGeo = new THREE.PlaneGeometry(2.4, 1.8);
    const plateMat1 = new THREE.MeshStandardMaterial({
      map: archPair.colorTexture,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const plate1 = new THREE.Mesh(plateGeo, plateMat1);
    plate1.position.set(-5.5, 1.8, -2.5);
    plate1.rotation.set(0.1, 0.45, -0.05);

    const plateMat2 = new THREE.MeshStandardMaterial({
      map: spherePair.colorTexture,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const plate2 = new THREE.Mesh(plateGeo, plateMat2);
    plate2.position.set(5.5, 1.6, -2.8);
    plate2.rotation.set(-0.1, -0.4, 0.05);

    // Subtle floating depth wireframe behind them
    const wireGeo = new THREE.WireframeGeometry(plateGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 });
    const wire1 = new THREE.LineSegments(wireGeo, wireMat);
    wire1.position.copy(plate1.position);
    wire1.position.z -= 0.3;
    wire1.rotation.copy(plate1.rotation);

    const wire2 = new THREE.LineSegments(wireGeo, wireMat);
    wire2.position.copy(plate2.position);
    wire2.position.z -= 0.3;
    wire2.rotation.copy(plate2.rotation);

    this.backgroundPlatesGroup.add(plate1, plate2, wire1, wire2);
    this.heroGroup.add(this.backgroundPlatesGroup);
  }

  private setupParticleField() {
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x818cf8);
    const color2 = new THREE.Color(0xf472b6);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;

      const mixed = color1.clone().lerp(color2, Math.random());
      colors[i * 3 + 0] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    this.particlesMesh = new THREE.Points(geometry, material);
    this.scene.add(this.particlesMesh);
  }

  private setupConverterEngine() {
    const initialPair = generateArchitecturalDemoPair();
    this.spatialConverter = createSpatial2Dto3DObject(initialPair);
    this.converterGroup.add(this.spatialConverter.group);
    this.converterGroup.position.set(0, 0, 0);
    this.converterGroup.visible = false;
    this.scene.add(this.converterGroup);
  }

  public setFinish(finish: FinishType) {
    this.currentFinish = finish;
    const mat = this.materials[finish];
    const innerMat = this.innerMaterials[finish];

    this.soonSculpture.letterMeshes.forEach((mesh) => {
      mesh.material = mat;
    });
    this.soonSculpture.capsMeshes.forEach((mesh) => {
      mesh.material = mat;
    });
    this.soonSculpture.innerGlowMeshes.forEach((mesh) => {
      mesh.material = innerMat;
    });
  }

  public setViewMode(mode: ViewMode) {
    this.currentViewMode = mode;
    if (mode === 'hero') {
      this.heroGroup.visible = true;
      this.converterGroup.visible = false;
      this.targetCamZ = 9.8;
      this.targetCamY = 0.2;
    } else {
      this.heroGroup.visible = false;
      this.converterGroup.visible = true;
      this.targetCamZ = 9.2;
      this.targetCamY = 0.0;
    }
  }

  public setSpatialDepth(depth: number) {
    if (this.spatialConverter) {
      this.spatialConverter.setDepthAmount(depth);
    }
  }

  public setSpatialDisplayMode(mode: SpatialDisplayMode) {
    if (this.spatialConverter) {
      this.spatialConverter.setDisplayMode(mode);
    }
  }

  public loadSamplePreset(type: 'architecture' | 'cyber') {
    if (!this.spatialConverter) return;
    const pair = type === 'architecture' ? generateArchitecturalDemoPair() : generateCyberSphereDemoPair();
    this.spatialConverter.updateTexturePair(pair);
  }

  public loadUserImage(img: HTMLImageElement) {
    if (this.spatialConverter) {
      this.spatialConverter.updateCustomImage(img);
    }
  }

  public resetCamera() {
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

    // Pointer Parallax & Interaction
    const onPointerDown = (e: PointerEvent) => {
      this.isUserInteracting = true;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (this.isUserInteracting) {
        const deltaX = (e.clientX - this.pointerStartX) * 0.005;
        const deltaY = (e.clientY - this.pointerStartY) * 0.005;
        this.targetRotY += deltaX;
        this.targetRotX = Math.max(-0.6, Math.min(0.6, this.targetRotX + deltaY));
        this.pointerStartX = e.clientX;
        this.pointerStartY = e.clientY;
      } else {
        // Subtle ambient parallax
        this.targetRotY = normX * 0.35;
        this.targetRotX = -normY * 0.2;
      }
    };

    const onPointerUp = () => {
      this.isUserInteracting = false;
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
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth rotational damping
    this.currentRotX = THREE.MathUtils.damp(this.currentRotX, this.targetRotX, 4, delta);
    this.currentRotY = THREE.MathUtils.damp(this.currentRotY, this.targetRotY, 4, delta);

    if (this.currentViewMode === 'hero') {
      this.heroGroup.rotation.y = this.currentRotY;
      this.heroGroup.rotation.x = this.currentRotX;

      // Update sculptural letter wave levitation
      this.soonSculpture.update(elapsedTime);

      // Subtle float on background accent plates
      this.backgroundPlatesGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.15;
    } else {
      this.converterGroup.rotation.y = this.currentRotY;
      this.converterGroup.rotation.x = this.currentRotX;
    }

    // Camera smooth transition
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCamZ, 3, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCamY, 3, delta);

    // Particle field slow drift
    if (this.particlesMesh) {
      this.particlesMesh.rotation.y = elapsedTime * 0.02;
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);

    // Pace loop on software WebGL as mandated
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
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }

    if (this.spatialConverter) {
      this.spatialConverter.dispose();
    }
  }
}
