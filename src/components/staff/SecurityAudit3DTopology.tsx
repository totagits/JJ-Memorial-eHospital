import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  FileSearch,
} from 'lucide-react';
import { AuditEvent } from '../../types/auth';

interface SecurityAudit3DTopologyProps {
  logs: AuditEvent[];
  onInspectEvent: (event: AuditEvent) => void;
}

interface HubDefinition {
  id: string;
  label: string;
  subtitle: string;
  angleRad: number;
  color: number;
  hex: string;
  matches: (ev: AuditEvent) => boolean;
}

const HUB_DEFINITIONS: HubDefinition[] = [
  {
    id: 'IDENTITY_GATE',
    label: 'OIDC Identity Gate',
    subtitle: 'Logins & MFA Sessions',
    angleRad: 0,
    color: 0x38bdf8,
    hex: '#38bdf8',
    matches: ev => ev.action === 'LOGIN' || ev.action === 'LOGOUT',
  },
  {
    id: 'CLINICAL_VAULT',
    label: 'Clinical EMR Vault',
    subtitle: 'OPD, Triage & Inpatient Reads',
    angleRad: Math.PI / 3,
    color: 0x14b8a6,
    hex: '#14b8a6',
    matches: ev =>
      ['OPD', 'TRIAGE', 'INPATIENT', 'PATIENT_INDEX'].includes(ev.module) &&
      ev.action !== 'BREAK_GLASS' &&
      ev.status !== 'DENIED',
  },
  {
    id: 'DIAGNOSTIC_LIS',
    label: 'Diagnostic Lab & PACS',
    subtitle: 'LIS Specimens & Imaging',
    angleRad: (2 * Math.PI) / 3,
    color: 0x22d3ee,
    hex: '#22d3ee',
    matches: ev => ['LAB', 'RADIOLOGY'].includes(ev.module) && ev.action !== 'BREAK_GLASS',
  },
  {
    id: 'BILLING_VAULT',
    label: 'Billing & GL Ledger',
    subtitle: 'POS & Reconciliations',
    angleRad: Math.PI,
    color: 0x10b981,
    hex: '#10b981',
    matches: ev => ['BILLING', 'GL'].includes(ev.module) && ev.action !== 'BREAK_GLASS',
  },
  {
    id: 'PHARMACY_STORES',
    label: 'Pharmacy & Central Stores',
    subtitle: 'Dispensing & Inventory',
    angleRad: (4 * Math.PI) / 3,
    color: 0xf59e0b,
    hex: '#f59e0b',
    matches: ev =>
      ['PHARMACY', 'INVENTORY', 'PROCUREMENT', 'HR', 'ASSETS'].includes(ev.module) &&
      ev.action !== 'BREAK_GLASS',
  },
  {
    id: 'BREAK_GLASS_BAY',
    label: 'Break-Glass & Alerts',
    subtitle: 'Emergency Overrides & Denied',
    angleRad: (5 * Math.PI) / 3,
    color: 0xf43f5e,
    hex: '#f43f5e',
    matches: ev =>
      ev.action === 'BREAK_GLASS' ||
      ev.action === 'DELETE_ATTEMPT' ||
      ev.status === 'FLAGGED' ||
      ev.status === 'DENIED',
  },
];

function createFloorGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#090f1d';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle concentric & Cartesian technical grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  const step = 32;
  for (let i = 0; i <= 512; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(20, 184, 166, 0.24)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.30)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function getEventColor(ev: AuditEvent): number {
  if (ev.action === 'BREAK_GLASS' || ev.action === 'DELETE_ATTEMPT' || ev.status === 'DENIED') {
    return 0xf43f5e;
  }
  if (ev.action === 'LOGIN' || ev.action === 'LOGOUT') return 0x38bdf8;
  if (ev.action === 'READ') return 0x14b8a6;
  if (ev.status === 'FLAGGED') return 0xf59e0b;
  return 0xa78bfa;
}

function getEventCategoryLabel(ev: AuditEvent): string {
  if (ev.action === 'BREAK_GLASS') return 'Break-Glass Override';
  if (ev.action === 'DELETE_ATTEMPT' || ev.status === 'DENIED') return 'Blocked Access';
  if (ev.action === 'LOGIN' || ev.action === 'LOGOUT') return 'Login / Session';
  if (ev.action === 'READ') return 'Record Access (READ)';
  if (ev.action === 'EXPORT') return 'Data Export';
  return 'Record Modification';
}

export const SecurityAudit3DTopology: React.FC<SecurityAudit3DTopologyProps> = ({
  logs,
  onInspectEvent,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(() => {
    const breakGlass = logs.find(l => l.action === 'BREAK_GLASS');
    return breakGlass || logs[0] || null;
  });
  const [selectedHubId, setSelectedHubId] = useState<string>('OVERVIEW');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const cameraPresetFnRef = useRef<((presetId: string) => void) | null>(null);

  // Sync initial selection if logs update and nothing is selected
  useEffect(() => {
    if (!selectedEvent && logs.length > 0) {
      setSelectedEvent(logs.find(l => l.action === 'BREAK_GLASS') || logs[0]);
    }
  }, [logs, selectedEvent]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        setWebglError('WebGL context unavailable in this browser.');
        return;
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererStr = debugInfo
        ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|Software Rasterizer|Microsoft Basic Render/i.test(
        rendererStr
      );

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = !isSoftwareGl;
      if (!isSoftwareGl) {
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 520;
      renderer.setSize(width, height);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#090f1d');
      scene.fog = new THREE.Fog('#090f1d', 18, 46);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      roomEnv.dispose();
      pmremGenerator.dispose();

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
      camera.position.set(11.5, 9.2, 13.5);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.minDistance = 4.5;
      controls.maxDistance = 28;
      controls.maxPolarAngle = Math.PI * 0.47;
      controls.target.set(0, 1.1, 0);
      controls.update();

      // Lighting rig: warm key + cool fill + rim
      const hemi = new THREE.HemisphereLight(0x88b4ff, 0x161d2f, 0.8);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.0);
      keyLight.position.set(10, 15, 9);
      if (!isSoftwareGl) {
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.camera.near = 2;
        keyLight.shadow.camera.far = 36;
        keyLight.shadow.camera.left = -12;
        keyLight.shadow.camera.right = 12;
        keyLight.shadow.camera.top = 12;
        keyLight.shadow.camera.bottom = -12;
        keyLight.shadow.bias = -0.0005;
      }
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
      rimLight.position.set(-10, 7, -11);
      scene.add(rimLight);

      // Floor + procedural technical grid + contact shadow texture
      const disposables: { dispose: () => void }[] = [envRT];
      const floorGridTex = createFloorGridTexture();
      const shadowTex = createContactShadowTexture();
      disposables.push(floorGridTex, shadowTex);

      const floorGeo = new THREE.CircleGeometry(24, 64);
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorGridTex,
        roughness: 0.78,
        metalness: 0.25,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.receiveShadow = !isSoftwareGl;
      scene.add(floorMesh);
      disposables.push(floorGeo, floorMat);

      // Shared materials
      const metalDarkMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.82,
      });
      const titaniumMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.28,
        metalness: 0.88,
      });
      const obsidianMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.22,
        metalness: 0.65,
      });
      const coreCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x2dd4bf,
        emissive: 0x0d9488,
        emissiveIntensity: 0.45,
        roughness: 0.14,
        metalness: 0.1,
        transmission: 0.35,
        transparent: true,
        opacity: 0.9,
      });
      const hmacRingMat = new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        emissive: 0x4f46e5,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      disposables.push(metalDarkMat, titaniumMat, obsidianMat, coreCrystalMat, hmacRingMat);

      // ================================================================
      // 1. CENTRAL AUDIT VAULT CORE (9-part composite THREE.Group, y = 0 grounded)
      // ================================================================
      const centralCore = new THREE.Group();
      centralCore.position.set(0, 0, 0);

      const coreShadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
      const coreShadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      });
      const coreShadow = new THREE.Mesh(coreShadowGeo, coreShadowMat);
      coreShadow.rotation.x = -Math.PI / 2;
      coreShadow.position.y = 0.015;
      centralCore.add(coreShadow);
      disposables.push(coreShadowGeo, coreShadowMat);

      // Lower octagonal plinth
      const plinthGeo = new THREE.CylinderGeometry(1.9, 2.2, 0.35, 8);
      const plinth = new THREE.Mesh(plinthGeo, metalDarkMat);
      plinth.position.y = 0.175;
      plinth.castShadow = !isSoftwareGl;
      plinth.receiveShadow = !isSoftwareGl;
      centralCore.add(plinth);
      disposables.push(plinthGeo);

      // Upper titanium step ring
      const stepGeo = new THREE.CylinderGeometry(1.45, 1.65, 0.25, 8);
      const step = new THREE.Mesh(stepGeo, titaniumMat);
      step.position.y = 0.475;
      step.castShadow = !isSoftwareGl;
      centralCore.add(step);
      disposables.push(stepGeo);

      // Central obsidian server column
      const colGeo = new THREE.CylinderGeometry(0.65, 0.78, 1.9, 12);
      const col = new THREE.Mesh(colGeo, obsidianMat);
      col.position.y = 1.55;
      col.castShadow = !isSoftwareGl;
      centralCore.add(col);
      disposables.push(colGeo);

      // 4 perimeter buttress pillars
      const buttressGeo = new THREE.BoxGeometry(0.24, 1.55, 0.34);
      disposables.push(buttressGeo);
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const buttress = new THREE.Mesh(buttressGeo, titaniumMat);
        buttress.position.set(Math.cos(angle) * 1.12, 1.25, Math.sin(angle) * 1.12);
        buttress.rotation.y = -angle;
        buttress.castShadow = !isSoftwareGl;
        centralCore.add(buttress);
      }

      // Translucent glowing HMAC crystal prism at apex
      const prismGeo = new THREE.OctahedronGeometry(0.62, 0);
      const prism = new THREE.Mesh(prismGeo, coreCrystalMat);
      prism.position.y = 2.95;
      centralCore.add(prism);
      disposables.push(prismGeo);

      // Two tilted counter-rotating HMAC verification rings
      const ring1Geo = new THREE.TorusGeometry(1.45, 0.045, 12, 48);
      const hmacRing1 = new THREE.Mesh(ring1Geo, hmacRingMat);
      hmacRing1.position.y = 2.35;
      hmacRing1.rotation.set(Math.PI * 0.36, 0.2, 0);
      centralCore.add(hmacRing1);

      const ring2Geo = new THREE.TorusGeometry(1.72, 0.035, 12, 48);
      const hmacRing2 = new THREE.Mesh(ring2Geo, hmacRingMat);
      hmacRing2.position.y = 2.35;
      hmacRing2.rotation.set(-Math.PI * 0.32, 0.5, 0.3);
      centralCore.add(hmacRing2);
      disposables.push(ring1Geo, ring2Geo);

      scene.add(centralCore);

      // ================================================================
      // 2. SIX DEPARTMENTAL SECURITY HUBS + FIBER CONDUITS + AUDIT BEACONS
      // ================================================================
      const hubRadius = 7.2;
      const interactiveBeacons: { mesh: THREE.Object3D; event: AuditEvent }[] = [];
      const hubPositions: Record<string, THREE.Vector3> = {};

      // Shared geometries for beacons
      const beaconStemGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.55, 8);
      const beaconHeadGeo = new THREE.OctahedronGeometry(0.18, 0);
      const beaconRingGeo = new THREE.TorusGeometry(0.22, 0.02, 8, 24);
      disposables.push(beaconStemGeo, beaconHeadGeo, beaconRingGeo);

      // Shared geometries for hubs
      const hubBaseGeo = new THREE.CylinderGeometry(1.05, 1.25, 0.22, 6);
      const hubPedestalGeo = new THREE.CylinderGeometry(0.52, 0.72, 0.75, 6);
      const hubMastGeo = new THREE.BoxGeometry(0.22, 1.0, 0.22);
      const hubVisorGeo = new THREE.BoxGeometry(0.95, 0.48, 0.08);
      const hubCapGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.16, 6);
      disposables.push(hubBaseGeo, hubPedestalGeo, hubMastGeo, hubVisorGeo, hubCapGeo);

      HUB_DEFINITIONS.forEach(hubDef => {
        const hx = Math.cos(hubDef.angleRad) * hubRadius;
        const hz = Math.sin(hubDef.angleRad) * hubRadius;
        const hubPos = new THREE.Vector3(hx, 0, hz);
        hubPositions[hubDef.id] = hubPos;

        const hubGroup = new THREE.Group();
        hubGroup.position.copy(hubPos);
        hubGroup.lookAt(0, 0, 0);

        const hubShadowGeo = new THREE.PlaneGeometry(3.1, 3.1);
        const hubShadowMat = new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
        });
        const hubShadow = new THREE.Mesh(hubShadowGeo, hubShadowMat);
        hubShadow.rotation.x = -Math.PI / 2;
        hubShadow.position.y = 0.014;
        hubGroup.add(hubShadow);
        disposables.push(hubShadowGeo, hubShadowMat);

        const hubBase = new THREE.Mesh(hubBaseGeo, metalDarkMat);
        hubBase.position.y = 0.11;
        hubBase.castShadow = !isSoftwareGl;
        hubBase.receiveShadow = !isSoftwareGl;
        hubGroup.add(hubBase);

        const hubPedestal = new THREE.Mesh(hubPedestalGeo, obsidianMat);
        hubPedestal.position.y = 0.595;
        hubPedestal.castShadow = !isSoftwareGl;
        hubGroup.add(hubPedestal);

        const hubMast = new THREE.Mesh(hubMastGeo, titaniumMat);
        hubMast.position.set(0, 1.38, -0.14);
        hubMast.castShadow = !isSoftwareGl;
        hubGroup.add(hubMast);

        const visorMat = new THREE.MeshStandardMaterial({
          color: hubDef.color,
          emissive: hubDef.color,
          emissiveIntensity: 0.72,
          roughness: 0.2,
          metalness: 0.4,
        });
        disposables.push(visorMat);

        const visor = new THREE.Mesh(hubVisorGeo, visorMat);
        visor.position.set(0, 1.48, 0.08);
        visor.rotation.x = -0.25;
        hubGroup.add(visor);

        const cap = new THREE.Mesh(hubCapGeo, visorMat);
        cap.position.set(0, 1.96, -0.14);
        hubGroup.add(cap);

        scene.add(hubGroup);

        // Curved glowing floor fiber conduit connecting Central Core to Hub
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(Math.cos(hubDef.angleRad) * 2.05, 0.09, Math.sin(hubDef.angleRad) * 2.05),
          new THREE.Vector3(Math.cos(hubDef.angleRad) * 4.5, 0.26, Math.sin(hubDef.angleRad) * 4.5),
          new THREE.Vector3(Math.cos(hubDef.angleRad) * (hubRadius - 1.15), 0.09, Math.sin(hubDef.angleRad) * (hubRadius - 1.15))
        );
        const conduitGeo = new THREE.TubeGeometry(curve, 24, 0.055, 8, false);
        const conduitMat = new THREE.MeshStandardMaterial({
          color: hubDef.color,
          emissive: hubDef.color,
          emissiveIntensity: 0.55,
          roughness: 0.3,
          metalness: 0.5,
        });
        const conduit = new THREE.Mesh(conduitGeo, conduitMat);
        scene.add(conduit);
        disposables.push(conduitGeo, conduitMat);

        // Plot up to 10 recent matching audit events as composite 3-part beacons around the hub
        const hubEvents = logs.filter(hubDef.matches).slice(0, 10);
        hubEvents.forEach((ev, idx) => {
          const arcSpan = Math.PI * 0.95;
          const stepAngle = hubEvents.length > 1 ? arcSpan / (hubEvents.length - 1) : 0;
          const localAngle = hubDef.angleRad - arcSpan / 2 + idx * stepAngle;
          const orbitDist = 1.65 + (idx % 2) * 0.45;
          const bx = hx + Math.cos(localAngle) * orbitDist;
          const bz = hz + Math.sin(localAngle) * orbitDist;

          const beaconGroup = new THREE.Group();
          beaconGroup.position.set(bx, 0, bz);

          const evColor = getEventColor(ev);
          const evMat = new THREE.MeshStandardMaterial({
            color: evColor,
            emissive: evColor,
            emissiveIntensity: ev.action === 'BREAK_GLASS' ? 1.15 : 0.7,
            roughness: 0.22,
            metalness: 0.35,
          });
          disposables.push(evMat);

          const stem = new THREE.Mesh(beaconStemGeo, titaniumMat);
          stem.position.y = 0.275;
          beaconGroup.add(stem);

          const head = new THREE.Mesh(beaconHeadGeo, evMat);
          head.position.y = ev.action === 'BREAK_GLASS' ? 0.88 : 0.72;
          head.scale.setScalar(ev.action === 'BREAK_GLASS' ? 1.35 : 1.0);
          head.userData = { auditEvent: ev };
          beaconGroup.add(head);

          const ring = new THREE.Mesh(beaconRingGeo, evMat);
          ring.position.y = 0.04;
          ring.rotation.x = Math.PI / 2;
          beaconGroup.add(ring);

          scene.add(beaconGroup);
          interactiveBeacons.push({ mesh: head, event: ev });
        });
      });

      // ================================================================
      // 3. INTERACTION: RAYCASTER CLICK + HOVER + SMOOTH CAMERA PRESETS
      // ================================================================
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let pointerDownPos = { x: 0, y: 0 };

      let animTargetPos: THREE.Vector3 | null = null;
      let animTargetLook: THREE.Vector3 | null = null;
      let needsRender = true;

      const requestRender = () => {
        needsRender = true;
      };

      controls.addEventListener('change', requestRender);

      cameraPresetFnRef.current = (presetId: string) => {
        setSelectedHubId(presetId);
        if (presetId === 'OVERVIEW') {
          animTargetPos = new THREE.Vector3(11.5, 9.2, 13.5);
          animTargetLook = new THREE.Vector3(0, 1.1, 0);
        } else if (hubPositions[presetId]) {
          const p = hubPositions[presetId];
          const dir = p.clone().normalize();
          animTargetPos = p.clone().addScaledVector(dir, 5.2).add(new THREE.Vector3(0, 3.8, 0));
          animTargetLook = p.clone().add(new THREE.Vector3(0, 1.1, 0));
        }
        requestRender();
      };

      const onPointerDown = (e: PointerEvent) => {
        pointerDownPos = { x: e.clientX, y: e.clientY };
      };

      const onPointerMove = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(
          interactiveBeacons.map(b => b.mesh),
          false
        );
        renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
      };

      const onPointerUp = (e: PointerEvent) => {
        const dx = e.clientX - pointerDownPos.x;
        const dy = e.clientY - pointerDownPos.y;
        if (Math.hypot(dx, dy) > 6) return; // Dragged camera, not a click

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const hits = raycaster.intersectObjects(
          interactiveBeacons.map(b => b.mesh),
          false
        );
        if (hits.length > 0) {
          const ev = hits[0].object.userData.auditEvent as AuditEvent | undefined;
          if (ev) {
            setSelectedEvent(ev);
          }
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || 800;
        const h = container.clientHeight || 520;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      };
      window.addEventListener('resize', handleResize);

      // Animation / Coalesced Render Loop
      let rafId = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);

        let moved = false;

        if (animTargetPos && animTargetLook) {
          const alpha = 1 - Math.exp(-5.5 * dt);
          camera.position.lerp(animTargetPos, alpha);
          controls.target.lerp(animTargetLook, alpha);
          moved = true;
          if (
            camera.position.distanceTo(animTargetPos) < 0.04 &&
            controls.target.distanceTo(animTargetLook) < 0.04
          ) {
            camera.position.copy(animTargetPos);
            controls.target.copy(animTargetLook);
            animTargetPos = null;
            animTargetLook = null;
          }
        }

        if (controls.update()) {
          moved = true;
        }

        // Subtle HMAC ring motion on hardware GPUs (skip idle spin on software GL to avoid CPU saturation)
        if (!isSoftwareGl) {
          hmacRing1.rotation.z += dt * 0.45;
          hmacRing2.rotation.z -= dt * 0.35;
          prism.rotation.y += dt * 0.4;
          moved = true;
        }

        if (moved || needsRender) {
          renderer.render(scene, camera);
          needsRender = false;
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        controls.removeEventListener('change', requestRender);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        controls.dispose();
        disposables.forEach(d => d.dispose());
        renderer.dispose();
      };
    } catch (err: any) {
      setWebglError(err?.message || 'Unable to initialize 3D Security Topology viewport.');
    }
  }, [logs]);

  const loginCount = logs.filter(l => l.action === 'LOGIN' || l.action === 'LOGOUT').length;
  const readCount = logs.filter(l => l.action === 'READ').length;
  const breakGlassCount = logs.filter(
    l => l.action === 'BREAK_GLASS' || l.status === 'FLAGGED' || l.status === 'DENIED'
  ).length;

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Header Strip */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>3D Tamper-Evident Security & Audit Topology</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Interactive spatial map of the central SHA-256 HMAC core, departmental vaults, login gates, record reads, and Break-Glass activations. Click any 3D beacon to inspect.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 rounded bg-sky-950 text-sky-300 border border-sky-700 inline-flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            Logins: <strong className="tabular-nums">{loginCount}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-teal-950 text-teal-300 border border-teal-700 inline-flex items-center gap-1">
            <FileSearch className="w-3 h-3" />
            Accesses: <strong className="tabular-nums">{readCount}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-700 inline-flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Flags/Break-Glass: <strong className="tabular-nums">{breakGlassCount}</strong>
          </span>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative w-full h-[520px] bg-[#090f1d]">
        {webglError ? (
          <div className="w-full h-full flex items-center justify-center p-6 text-center text-slate-300 text-xs">
            <div className="max-w-md space-y-2 bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="font-bold text-white">3D Topology Viewport Unavailable</p>
              <p className="text-slate-400">{webglError}</p>
            </div>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full" />
        )}

        {/* Top-Left Legend Strip (No backdrop-filter over WebGL) */}
        <div className="absolute top-3 left-3 z-10 bg-slate-950/90 border border-slate-700/80 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-200 space-y-1 pointer-events-none">
          <div className="font-bold text-white tracking-wider uppercase">Beacon Legend</div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block" />
              Login / Session
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-teal-400 inline-block" />
              Record Access (READ)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              Break-Glass / Denied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-400 inline-block" />
              Modification / Export
            </span>
          </div>
        </div>

        {/* Top-Right Selected Event Inspector Overlay */}
        {selectedEvent && (
          <div className="absolute top-3 right-3 z-10 w-72 sm:w-80 bg-slate-950/90 border border-slate-700/90 rounded-xl p-3.5 text-xs text-slate-100 shadow-xl space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-300">
                {getEventCategoryLabel(selectedEvent)}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  selectedEvent.status === 'SUCCESS'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border-rose-700'
                }`}
              >
                {selectedEvent.action}
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-white text-xs">{selectedEvent.userName}</div>
              <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                {new Date(selectedEvent.timestamp).toLocaleString()} • {selectedEvent.module}
                {selectedEvent.patientMrn ? ` • ${selectedEvent.patientMrn}` : ''}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                {selectedEvent.details}
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                {selectedEvent.ipAddress}
              </span>
              <button
                type="button"
                onClick={() => onInspectEvent(selectedEvent)}
                className="bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Eye className="w-3 h-3" />
                <span>Full Chain</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Bottom Control Dock (Camera Presets, No backdrop-filter) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDockCollapsed(prev => !prev)}
            className="bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold px-3 py-1 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{dockCollapsed ? 'Show Camera Presets' : 'Camera Controls'}</span>
          </button>

          {!dockCollapsed && (
            <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-1.5 flex flex-wrap items-center justify-center gap-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => cameraPresetFnRef.current?.('OVERVIEW')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  selectedHubId === 'OVERVIEW'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => cameraPresetFnRef.current?.('IDENTITY_GATE')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  selectedHubId === 'IDENTITY_GATE'
                    ? 'bg-sky-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Identity Gate
              </button>
              <button
                type="button"
                onClick={() => cameraPresetFnRef.current?.('CLINICAL_VAULT')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  selectedHubId === 'CLINICAL_VAULT'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Clinical Vault
              </button>
              <button
                type="button"
                onClick={() => cameraPresetFnRef.current?.('BILLING_VAULT')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  selectedHubId === 'BILLING_VAULT'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Billing Vault
              </button>
              <button
                type="button"
                onClick={() => cameraPresetFnRef.current?.('BREAK_GLASS_BAY')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  selectedHubId === 'BREAK_GLASS_BAY'
                    ? 'bg-rose-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Break-Glass Bay
              </button>
              <button
                type="button"
                onClick={() => cameraPresetFnRef.current?.('OVERVIEW')}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer border-l border-slate-800 pl-2.5"
                title="Reset camera view"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
