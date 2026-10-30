import * as THREE from 'three';

export interface SoonSculptureGroup {
  group: THREE.Group;
  letterMeshes: THREE.Mesh[];
  capsMeshes: THREE.Mesh[];
  innerGlowMeshes: THREE.Mesh[];
  update: (time: number) => void;
}

export function createSoonSculpture(material: THREE.Material, innerMaterial?: THREE.Material): SoonSculptureGroup {
  const group = new THREE.Group();
  group.name = 'SoonHeroSculpture';

  const letterMeshes: THREE.Mesh[] = [];
  const capsMeshes: THREE.Mesh[] = [];
  const innerGlowMeshes: THREE.Mesh[] = [];

  const tubeRadius = 0.32;
  const radialSegments = 28;
  const tubularSegments = 120;

  // Reusable cap geometry
  const capGeo = new THREE.SphereGeometry(tubeRadius, 24, 16);

  // Helper to add end caps
  const addEndCap = (pos: THREE.Vector3, parent: THREE.Group) => {
    const cap = new THREE.Mesh(capGeo, material);
    cap.position.copy(pos);
    cap.castShadow = true;
    cap.receiveShadow = true;
    parent.add(cap);
    capsMeshes.push(cap);
  };

  // --- LETTER 1: 'S' ---
  const sGroup = new THREE.Group();
  sGroup.position.set(-4.0, 0, 0);

  const sPoints = [
    new THREE.Vector3(0.9, 1.25, 0.16),
    new THREE.Vector3(0.3, 1.55, 0.24),
    new THREE.Vector3(-0.6, 1.35, 0.18),
    new THREE.Vector3(-0.95, 0.75, 0.1),
    new THREE.Vector3(-0.7, 0.2, 0.0),
    new THREE.Vector3(-0.05, -0.05, -0.1),
    new THREE.Vector3(0.65, -0.3, -0.14),
    new THREE.Vector3(0.95, -0.85, 0.0),
    new THREE.Vector3(0.7, -1.4, 0.15),
    new THREE.Vector3(-0.15, -1.6, 0.24),
    new THREE.Vector3(-0.9, -1.3, 0.18),
  ];
  const sCurve = new THREE.CatmullRomCurve3(sPoints, false, 'centripetal');
  const sGeo = new THREE.TubeGeometry(sCurve, tubularSegments, tubeRadius, radialSegments, false);
  const sMesh = new THREE.Mesh(sGeo, material);
  sMesh.castShadow = true;
  sMesh.receiveShadow = true;
  sGroup.add(sMesh);
  letterMeshes.push(sMesh);

  addEndCap(sPoints[0], sGroup);
  addEndCap(sPoints[sPoints.length - 1], sGroup);

  // Inner neon core for S
  if (innerMaterial) {
    const sInnerGeo = new THREE.TubeGeometry(sCurve, 64, tubeRadius * 0.35, 12, false);
    const sInnerMesh = new THREE.Mesh(sInnerGeo, innerMaterial);
    sGroup.add(sInnerMesh);
    innerGlowMeshes.push(sInnerMesh);
  }
  group.add(sGroup);

  // --- LETTER 2: 'O' (First O) ---
  const o1Group = new THREE.Group();
  o1Group.position.set(-1.35, 0, 0);

  const o1Segments = 40;
  const o1Points: THREE.Vector3[] = [];
  for (let i = 0; i < o1Segments; i++) {
    const theta = (i / o1Segments) * Math.PI * 2;
    const x = Math.sin(theta) * 0.95;
    const y = Math.cos(theta) * 1.52;
    const z = Math.sin(theta * 2) * 0.22;
    o1Points.push(new THREE.Vector3(x, y, z));
  }
  const o1Curve = new THREE.CatmullRomCurve3(o1Points, true, 'centripetal');
  const o1Geo = new THREE.TubeGeometry(o1Curve, tubularSegments, tubeRadius, radialSegments, true);
  const o1Mesh = new THREE.Mesh(o1Geo, material);
  o1Mesh.castShadow = true;
  o1Mesh.receiveShadow = true;
  o1Group.add(o1Mesh);
  letterMeshes.push(o1Mesh);

  if (innerMaterial) {
    const o1InnerGeo = new THREE.TubeGeometry(o1Curve, 64, tubeRadius * 0.35, 12, true);
    const o1InnerMesh = new THREE.Mesh(o1InnerGeo, innerMaterial);
    o1Group.add(o1InnerMesh);
    innerGlowMeshes.push(o1InnerMesh);
  }
  group.add(o1Group);

  // --- LETTER 3: 'O' (Second O) ---
  const o2Group = new THREE.Group();
  o2Group.position.set(1.35, 0, 0);

  const o2Points: THREE.Vector3[] = [];
  for (let i = 0; i < o1Segments; i++) {
    const theta = (i / o1Segments) * Math.PI * 2;
    const x = Math.sin(theta) * 0.95;
    const y = Math.cos(theta) * 1.52;
    const z = -Math.sin(theta * 2) * 0.22;
    o2Points.push(new THREE.Vector3(x, y, z));
  }
  const o2Curve = new THREE.CatmullRomCurve3(o2Points, true, 'centripetal');
  const o2Geo = new THREE.TubeGeometry(o2Curve, tubularSegments, tubeRadius, radialSegments, true);
  const o2Mesh = new THREE.Mesh(o2Geo, material);
  o2Mesh.castShadow = true;
  o2Mesh.receiveShadow = true;
  o2Group.add(o2Mesh);
  letterMeshes.push(o2Mesh);

  if (innerMaterial) {
    const o2InnerGeo = new THREE.TubeGeometry(o2Curve, 64, tubeRadius * 0.35, 12, true);
    const o2InnerMesh = new THREE.Mesh(o2InnerGeo, innerMaterial);
    o2Group.add(o2InnerMesh);
    innerGlowMeshes.push(o2InnerMesh);
  }
  group.add(o2Group);

  // --- LETTER 4: 'N' ---
  const nGroup = new THREE.Group();
  nGroup.position.set(4.0, 0, 0);

  const nPoints = [
    new THREE.Vector3(-0.95, -1.5, 0.18),
    new THREE.Vector3(-0.95, -0.2, 0.1),
    new THREE.Vector3(-0.95, 1.15, 0.1),
    new THREE.Vector3(-0.7, 1.55, 0.22),
    new THREE.Vector3(-0.1, 1.15, 0.05),
    new THREE.Vector3(0.0, 0.0, -0.06),
    new THREE.Vector3(0.65, -1.15, -0.1),
    new THREE.Vector3(0.95, -1.45, 0.05),
    new THREE.Vector3(0.95, -0.3, 0.12),
    new THREE.Vector3(0.95, 1.48, 0.2),
  ];
  const nCurve = new THREE.CatmullRomCurve3(nPoints, false, 'centripetal');
  const nGeo = new THREE.TubeGeometry(nCurve, tubularSegments, tubeRadius, radialSegments, false);
  const nMesh = new THREE.Mesh(nGeo, material);
  nMesh.castShadow = true;
  nMesh.receiveShadow = true;
  nGroup.add(nMesh);
  letterMeshes.push(nMesh);

  addEndCap(nPoints[0], nGroup);
  addEndCap(nPoints[nPoints.length - 1], nGroup);

  if (innerMaterial) {
    const nInnerGeo = new THREE.TubeGeometry(nCurve, 64, tubeRadius * 0.35, 12, false);
    const nInnerMesh = new THREE.Mesh(nInnerGeo, innerMaterial);
    nGroup.add(nInnerMesh);
    innerGlowMeshes.push(nInnerMesh);
  }
  group.add(nGroup);

  // Gentle floating animation update hook
  const update = (time: number) => {
    // Elegant organic wave motion across letters
    sGroup.position.y = Math.sin(time * 1.5 + 0.0) * 0.08;
    sGroup.rotation.z = Math.sin(time * 0.8 + 0.2) * 0.02;

    o1Group.position.y = Math.sin(time * 1.5 + 0.8) * 0.08;
    o1Group.rotation.y = Math.sin(time * 1.0) * 0.04;

    o2Group.position.y = Math.sin(time * 1.5 + 1.6) * 0.08;
    o2Group.rotation.y = -Math.sin(time * 1.0) * 0.04;

    nGroup.position.y = Math.sin(time * 1.5 + 2.4) * 0.08;
    nGroup.rotation.z = -Math.sin(time * 0.8 + 0.2) * 0.02;
  };

  return {
    group,
    letterMeshes,
    capsMeshes,
    innerGlowMeshes,
    update,
  };
}
