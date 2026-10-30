import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class SwingingChairScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private frameId: number = 0;
  private isSoftwareGl: boolean = false;
  private isDisposed: boolean = false;

  // Root rigs
  private backgroundRig = new THREE.Group();
  private lampRig = new THREE.Group();
  private lampPivot = new THREE.Group(); // Pivot point at ceiling (y = 3.8)
  private shadowMesh!: THREE.Mesh;
  private lampLight!: THREE.PointLight;

  // Interaction & Physics
  private targetRotX = 0;
  private targetRotY = 0;
  private currentRotX = 0;
  private currentRotY = 0;
  private isInteracting = false;
  private startX = 0;
  private startY = 0;

  // Heavy pendulum kinematics (large mass, slow grand swing)
  private swingAngle = 0;
  private swingVelocity = 0;
  private pushForce = 0;

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
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    this.camera.position.set(0, 0, 7.8);

    // 4. Studio Environment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting
    this.setupLighting();

    // 6. Clock-Style "SOON" Typography in Background
    this.buildClockTypography();

    // 7. Heavy Sculptural Pendant Lamp in Foreground
    this.buildHeavyLamp();

    // 8. Soft Ground Contact Shadow
    this.buildContactShadow();

    // 9. Register Listeners & Loop
    this.registerEvents();
    this.tick();
  }

  private setupLighting() {
    // Warm gallery daylight
    const hemiLight = new THREE.HemisphereLight(0xfffdfa, 0xe2ded4, 0.95);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaea, 1.8);
    dirLight.position.set(5, 7, 5);
    if (!this.isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 20;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(dirLight);

    const softFill = new THREE.DirectionalLight(0xdcd5c9, 0.75);
    softFill.position.set(-5, 2, 3);
    this.scene.add(softFill);
  }

  private buildClockTypography() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 2048, 1024);

    // Warm architectural stone charcoal
    ctx.strokeStyle = '#2d2823';
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const letterW = 220;
    const letterH = 680;
    const spacing = 120;
    const totalW = letterW * 4 + spacing * 3;
    const startX = (2048 - totalW) / 2;
    const startY = (1024 - letterH) / 2 + 10;

    const drawS = (x: number, y: number) => {
      const r = letterW / 2;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, 0, Math.PI, true);
      ctx.lineTo(x, y + letterH / 2 - r / 2);
      ctx.bezierCurveTo(x, y + letterH / 2 + r, x + letterW, y + letterH / 2 - r, x + letterW, y + letterH / 2 + r / 2);
      ctx.lineTo(x + letterW, y + letterH - r);
      ctx.arc(x + r, y + letterH - r, r, 0, Math.PI, false);
      ctx.stroke();
    };

    const drawO = (x: number, y: number) => {
      const r = letterW / 2;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, Math.PI, 0, false);
      ctx.lineTo(x + letterW, y + letterH - r);
      ctx.arc(x + r, y + letterH - r, r, 0, Math.PI, false);
      ctx.lineTo(x, y + r);
      ctx.closePath();
      ctx.stroke();
    };

    const drawN = (x: number, y: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + letterH);
      ctx.lineTo(x, y);
      ctx.lineTo(x + letterW, y + letterH);
      ctx.lineTo(x + letterW, y);
      ctx.stroke();
    };

    drawS(startX, startY);
    drawO(startX + (letterW + spacing) * 1, startY);
    drawO(startX + (letterW + spacing) * 2, startY);
    drawN(startX + (letterW + spacing) * 3, startY);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const planeGeo = new THREE.PlaneGeometry(9.6, 4.8);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.position.set(0, 0.1, -1.2);
    this.backgroundRig.add(mesh);
    this.scene.add(this.backgroundRig);
  }

  private buildHeavyLamp() {
    // Pivot positioned at top ceiling (y = 3.8)
    this.lampPivot.position.set(0, 3.8, 0.35);

    // Materials for the heavy sculptural lamp
    const castIronMat = new THREE.MeshStandardMaterial({
      color: 0x1f1c19, // Deep heavy charcoal cast iron
      roughness: 0.45,
      metalness: 0.35,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc49b5c, // Brushed architectural brass
      roughness: 0.28,
      metalness: 0.85,
    });

    const warmInteriorMat = new THREE.MeshStandardMaterial({
      color: 0xffeed2,
      emissive: 0xffd28a,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });

    // 1. Solid Ceiling Canopy / Mount
    const canopyGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 32);
    const canopyMesh = new THREE.Mesh(canopyGeo, brassMat);
    canopyMesh.position.y = 0;
    this.lampPivot.add(canopyMesh);

    // 2. Heavy Braided Cord / Suspension Rod
    const cordLength = 3.6;
    const cordGeo = new THREE.CylinderGeometry(0.016, 0.016, cordLength, 16);
    const cordMesh = new THREE.Mesh(cordGeo, castIronMat);
    cordMesh.position.y = -cordLength / 2;
    this.lampPivot.add(cordMesh);

    // 3. Heavy Lamp Body Group (hanging at y = -3.6)
    const lampBody = new THREE.Group();
    lampBody.position.set(0, -cordLength, 0);

    // Solid turned brass neck & strain relief hardware
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.28, 24);
    const neckMesh = new THREE.Mesh(neckGeo, brassMat);
    neckMesh.position.y = 0.14;
    neckMesh.castShadow = true;
    lampBody.add(neckMesh);

    const brassRingGeo = new THREE.TorusGeometry(0.14, 0.025, 16, 32);
    const brassRingMesh = new THREE.Mesh(brassRingGeo, brassMat);
    brassRingMesh.rotation.x = Math.PI / 2;
    brassRingMesh.position.y = 0.02;
    lampBody.add(brassRingMesh);

    // Heavy Lathe Geometry for the Dome / Shade Profile
    // Solid thick walls to give that unmistakable weighty, monolithic feel
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0.1, 0.0), // Top inner collar
      new THREE.Vector2(0.3, -0.15),
      new THREE.Vector2(0.65, -0.4),
      new THREE.Vector2(1.0, -0.75),
      new THREE.Vector2(1.18, -1.05), // Outer rim edge
      new THREE.Vector2(1.15, -1.1),  // Heavy rounded lip
      new THREE.Vector2(1.1, -1.05),  // Inner wall starts
      new THREE.Vector2(0.92, -0.78),
      new THREE.Vector2(0.58, -0.45),
      new THREE.Vector2(0.25, -0.22),
      new THREE.Vector2(0.08, -0.1), // Inner top apex
    ];
    const shadeGeo = new THREE.LatheGeometry(points, 48);
    const shadeMesh = new THREE.Mesh(shadeGeo, castIronMat);
    shadeMesh.castShadow = true;
    shadeMesh.receiveShadow = true;
    lampBody.add(shadeMesh);

    // Heavy Brass Rim Band at the lower lip
    const rimBandGeo = new THREE.TorusGeometry(1.17, 0.038, 20, 48);
    const rimBandMesh = new THREE.Mesh(rimBandGeo, brassMat);
    rimBandMesh.rotation.x = Math.PI / 2;
    rimBandMesh.position.y = -1.06;
    rimBandMesh.castShadow = true;
    lampBody.add(rimBandMesh);

    // Warm Interior Diffuser Dome
    const diffuserGeo = new THREE.SphereGeometry(0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const diffuserMesh = new THREE.Mesh(diffuserGeo, warmInteriorMat);
    diffuserMesh.rotation.x = Math.PI;
    diffuserMesh.position.y = -0.3;
    lampBody.add(diffuserMesh);

    // Interior Warm Light Source
    this.lampLight = new THREE.PointLight(0xffdfa8, 1.4, 7);
    this.lampLight.position.set(0, -0.6, 0);
    lampBody.add(this.lampLight);

    this.lampPivot.add(lampBody);
    this.lampRig.add(this.lampPivot);
    this.scene.add(this.lampRig);
  }

  private buildContactShadow() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
    grad.addColorStop(0, 'rgba(38, 34, 30, 0.28)'); // Solid, heavy shadow
    grad.addColorStop(0.35, 'rgba(38, 34, 30, 0.16)');
    grad.addColorStop(0.7, 'rgba(38, 34, 30, 0.04)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, -2.45, 0.35);
    this.scene.add(this.shadowMesh);
  }

  public pushChair() {
    // Heavy mass takes small impulse and moves with high inertia
    this.swingVelocity += 0.04;
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
        const dx = (e.clientX - this.startX) * 0.0035;
        const dy = (e.clientY - this.startY) * 0.0035;
        this.targetRotY += dx;
        this.targetRotX = Math.max(-0.35, Math.min(0.35, this.targetRotX + dy));

        // User drag imparts heavy inertia swing momentum (slow, heavy mass)
        this.swingVelocity += dx * 0.08;
        this.startX = e.clientX;
        this.startY = e.clientY;
      } else {
        // Subtle ambient parallax
        this.targetRotY = normX * 0.2;
        this.targetRotX = -normY * 0.12;
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

    // Damped rotational physics for entire rig
    this.currentRotX = THREE.MathUtils.damp(this.currentRotX, this.targetRotX, 3.5, delta);
    this.currentRotY = THREE.MathUtils.damp(this.currentRotY, this.targetRotY, 3.5, delta);

    this.backgroundRig.rotation.y = this.currentRotY * 0.35;
    this.backgroundRig.rotation.x = this.currentRotX * 0.35;

    // Heavy Pendulum Kinematics:
    // Natural period: ~ 5.4 seconds (slow, heavy, majestic oscillation frequency omega = 1.15 rad/s)
    const naturalSwing = Math.sin(time * 1.15) * 0.065;

    // High inertia damping (heavy mass retains momentum longer and resists abrupt change)
    this.swingVelocity *= 0.985;
    this.pushForce += this.swingVelocity;
    this.pushForce *= 0.98;

    const totalZAngle = naturalSwing + this.pushForce;
    const totalXAngle = Math.cos(time * 0.9) * 0.02 + this.currentRotX * 0.35;

    this.lampPivot.rotation.z = totalZAngle;
    this.lampPivot.rotation.x = totalXAngle;
    this.lampPivot.rotation.y = this.currentRotY * 0.8;

    // Shadow moves synchronously with lamp base
    if (this.shadowMesh) {
      this.shadowMesh.position.x = -totalZAngle * 2.2;
      this.shadowMesh.position.z = 0.35 + totalXAngle * 1.8;
    }

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
