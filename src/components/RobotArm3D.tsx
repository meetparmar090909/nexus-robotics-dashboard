import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTelemetry } from '../context/TelemetryContext';

export const RobotArm3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { telemetry } = useTelemetry();
  const { manualRobotArmJoints, robotArmMode, robots } = telemetry;

  const jointsRef = useRef(manualRobotArmJoints);
  const modeRef = useRef(robotArmMode);

  useEffect(() => {
    jointsRef.current = manualRobotArmJoints;
    modeRef.current = robotArmMode;
  }, [manualRobotArmJoints, robotArmMode]);

  const kukaRobot = robots.find(r => r.id === 'R-01');
  const kukaJointsRef = useRef(kukaRobot?.joints || [0, 45, 90, 0, 45, 0]);
  useEffect(() => {
    if (kukaRobot) kukaJointsRef.current = kukaRobot.joints;
  }, [robots, kukaRobot]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 600;
    const height = currentMount.clientHeight || 380;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020810, 0.025);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
    camera.position.set(15, 12, 18);
    camera.lookAt(0, 4, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    currentMount.appendChild(renderer.domElement);

    // ── Lighting ──
    // Soft ambient
    scene.add(new THREE.AmbientLight(0x8899cc, 0.6));

    // Key light — bright white overhead
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(10, 20, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    scene.add(keyLight);

    // Rim light — subtle cyan tint for sci-fi feel
    const rimLight = new THREE.DirectionalLight(0x00ccff, 1.2);
    rimLight.position.set(-12, 8, -8);
    scene.add(rimLight);

    // Fill light — very soft warm
    const fillLight = new THREE.DirectionalLight(0xfff0dd, 0.5);
    fillLight.position.set(5, -2, 10);
    scene.add(fillLight);

    // Ground bounce
    const groundLight = new THREE.HemisphereLight(0x223344, 0x080c10, 0.4);
    scene.add(groundLight);

    // Gripper point light (green status)
    const gripperLight = new THREE.PointLight(0x00ff88, 1.5, 6);
    scene.add(gripperLight);

    // ── Floor ──
    const gridHelper = new THREE.GridHelper(40, 40, 0x00ccff, 0x0a1520);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const floorGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.08, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d1826,
      roughness: 0.3,
      metalness: 0.9,
      envMapIntensity: 0.5
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.04;
    floor.receiveShadow = true;
    scene.add(floor);

    // Concentric ring decal on floor
    const ringGeo = new THREE.RingGeometry(3.5, 3.7, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, opacity: 0.15, transparent: true, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.09;
    scene.add(ring);

    // ── Materials — White/Black industrial robot (ABB / FANUC style) ──
    // Primary white body
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xdde3eb,
      roughness: 0.12,
      metalness: 0.25,
    });

    // Secondary white (slightly warmer)
    const whiteAltMat = new THREE.MeshStandardMaterial({
      color: 0xc8d0d8,
      roughness: 0.18,
      metalness: 0.2,
    });

    // Black structural casings
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x0f1318,
      roughness: 0.22,
      metalness: 0.7,
    });

    // Dark charcoal joints
    const charcoalMat = new THREE.MeshStandardMaterial({
      color: 0x1c2230,
      roughness: 0.3,
      metalness: 0.65,
    });

    // Polished chrome shafts
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xbcc8d4,
      roughness: 0.04,
      metalness: 0.98,
    });

    // Grey rubber pads
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x222830,
      roughness: 0.85,
      metalness: 0.0,
    });

    // Emissive cyan accent strip
    const cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x003344,
      emissive: 0x00aaff,
      emissiveIntensity: 0.8,
      roughness: 0.5,
      metalness: 0.0,
    });

    // Green LED
    const ledGreenMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff44,
      emissiveIntensity: 2.0,
    });

    // Red warning LED
    const ledRedMat = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff1111,
      emissiveIntensity: 1.5,
    });

    // ── Helper to add bolt detail ──
    const addBolts = (group: THREE.Group, count: number, radius: number, y: number) => {
      const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const bolt = new THREE.Mesh(boltGeo, chromeMat);
        bolt.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        group.add(bolt);
      }
    };

    // ── SEGMENT 1: HEAVY BASE PEDESTAL ──
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // Bottom anchor plate
    const anchorGeo = new THREE.BoxGeometry(4.2, 0.12, 4.2);
    const anchor = new THREE.Mesh(anchorGeo, blackMat);
    anchor.position.y = 0.06;
    anchor.castShadow = true;
    anchor.receiveShadow = true;
    baseGroup.add(anchor);

    // Base lower cylinder
    const baseLowerGeo = new THREE.CylinderGeometry(2.0, 2.1, 0.45, 24);
    const baseLower = new THREE.Mesh(baseLowerGeo, blackMat);
    baseLower.position.y = 0.34;
    baseLower.castShadow = true;
    baseGroup.add(baseLower);

    // Base main body — wide white drum
    const baseBodyGeo = new THREE.CylinderGeometry(1.75, 2.0, 0.9, 24);
    const baseBody = new THREE.Mesh(baseBodyGeo, whiteMat);
    baseBody.position.y = 1.01;
    baseBody.castShadow = true;
    baseGroup.add(baseBody);

    // Black waist shroud
    const waistShroudGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.3, 24);
    const waistShroud = new THREE.Mesh(waistShroudGeo, blackMat);
    waistShroud.position.y = 1.6;
    baseGroup.add(waistShroud);

    // Cyan accent ring
    const accentRingGeo = new THREE.TorusGeometry(1.72, 0.035, 8, 48);
    const accentRing = new THREE.Mesh(accentRingGeo, cyanAccentMat);
    accentRing.position.y = 1.62;
    baseGroup.add(accentRing);

    addBolts(baseGroup, 8, 1.9, 0.18);

    // ── SEGMENT 2: TURRET (rotates on J1) ──
    const turretGroup = new THREE.Group();
    turretGroup.position.y = 1.75;
    baseGroup.add(turretGroup);

    // Bearing collar
    const bearingGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.22, 24);
    const bearing = new THREE.Mesh(bearingGeo, chromeMat);
    bearing.position.y = 0;
    turretGroup.add(bearing);

    // Turret housing — square-ish white
    const turretHouseGeo = new THREE.BoxGeometry(2.6, 0.95, 2.2);
    const turretHouse = new THREE.Mesh(turretHouseGeo, whiteMat);
    turretHouse.position.y = 0.6;
    turretHouse.castShadow = true;
    turretGroup.add(turretHouse);

    // Black side plates on turret
    const turretSideGeo = new THREE.BoxGeometry(0.12, 0.9, 2.2);
    [-1.25, 1.25].forEach(x => {
      const sideplate = new THREE.Mesh(turretSideGeo, blackMat);
      sideplate.position.set(x, 0.6, 0);
      turretGroup.add(sideplate);
    });

    // Shoulder pivot housing
    const shoulderHouseGeo = new THREE.CylinderGeometry(0.88, 0.88, 1.6, 20);
    shoulderHouseGeo.rotateX(Math.PI / 2);
    const shoulderHouse = new THREE.Mesh(shoulderHouseGeo, blackMat);
    shoulderHouse.position.y = 1.12;
    shoulderHouse.castShadow = true;
    turretGroup.add(shoulderHouse);

    // Shoulder chrome shaft
    const sShaftGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.65, 16);
    sShaftGeo.rotateX(Math.PI / 2);
    const sShaft = new THREE.Mesh(sShaftGeo, chromeMat);
    sShaft.position.y = 1.12;
    turretGroup.add(sShaft);

    // ── SEGMENT 3: LOWER ARM (J2 rotation) ──
    const lowerArmGroup = new THREE.Group();
    lowerArmGroup.position.set(0, 1.12, 0);
    turretGroup.add(lowerArmGroup);

    // Main lower arm beam — white structural
    const lArmBeamGeo = new THREE.BoxGeometry(0.7, 3.2, 0.65);
    const lArmBeam = new THREE.Mesh(lArmBeamGeo, whiteMat);
    lArmBeam.position.y = 1.6;
    lArmBeam.castShadow = true;
    lowerArmGroup.add(lArmBeam);

    // Ribbed black side cladding
    for (let i = 0; i < 5; i++) {
      const ribGeo = new THREE.BoxGeometry(0.74, 0.08, 0.62);
      const rib = new THREE.Mesh(ribGeo, blackMat);
      rib.position.set(0, 0.5 + i * 0.6, 0);
      lowerArmGroup.add(rib);
    }

    // Hydraulic piston assemblies (left + right)
    const pistonCylGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.4, 10);
    const pistonRodGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.6, 8);
    [-0.5, 0.5].forEach(x => {
      const cyl = new THREE.Mesh(pistonCylGeo, charcoalMat);
      cyl.position.set(x, 1.2, -0.38);
      lowerArmGroup.add(cyl);
      const rod = new THREE.Mesh(pistonRodGeo, chromeMat);
      rod.position.set(x, 2.1, -0.38);
      lowerArmGroup.add(rod);
    });

    // Cyan accent stripe on lower arm
    const lArmAccentGeo = new THREE.BoxGeometry(0.04, 2.8, 0.04);
    const lArmAccent = new THREE.Mesh(lArmAccentGeo, cyanAccentMat);
    lArmAccent.position.set(0.36, 1.6, 0.34);
    lowerArmGroup.add(lArmAccent);

    // ── SEGMENT 4: ELBOW JOINT (J3) ──
    const elbowGroup = new THREE.Group();
    elbowGroup.position.y = 3.3;
    lowerArmGroup.add(elbowGroup);

    // Elbow pivot cylinder
    const elbowPivGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 20);
    elbowPivGeo.rotateX(Math.PI / 2);
    const elbowPiv = new THREE.Mesh(elbowPivGeo, blackMat);
    elbowPiv.castShadow = true;
    elbowGroup.add(elbowPiv);

    // White side caps
    const elbowCapGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.18, 20);
    elbowCapGeo.rotateX(Math.PI / 2);
    [-0.62, 0.62].forEach(x => {
      const cap = new THREE.Mesh(elbowCapGeo, whiteMat);
      cap.position.x = x;
      elbowGroup.add(cap);
    });

    // Chrome center shaft
    const elbowShaftGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.45, 14);
    elbowShaftGeo.rotateX(Math.PI / 2);
    const elbowShaft = new THREE.Mesh(elbowShaftGeo, chromeMat);
    elbowGroup.add(elbowShaft);

    // ── SEGMENT 5: UPPER ARM (J3 rotates this) ──
    const upperArmGroup = new THREE.Group();
    upperArmGroup.position.y = 0.35;
    elbowGroup.add(upperArmGroup);

    // Main upper arm body
    const uArmGeo = new THREE.BoxGeometry(0.58, 2.5, 0.58);
    const uArmBody = new THREE.Mesh(uArmGeo, whiteMat);
    uArmBody.position.y = 1.25;
    uArmBody.castShadow = true;
    upperArmGroup.add(uArmBody);

    // Black side casings
    [-0.32, 0.32].forEach(x => {
      const sideGeo = new THREE.BoxGeometry(0.06, 2.3, 0.55);
      const side = new THREE.Mesh(sideGeo, blackMat);
      side.position.set(x, 1.25, 0);
      upperArmGroup.add(side);
    });

    // Internal chrome drive shaft
    const uShaftGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 10);
    const uShaft = new THREE.Mesh(uShaftGeo, chromeMat);
    uShaft.position.set(0, 1.25, 0.3);
    upperArmGroup.add(uShaft);

    // Cyan LED strip on upper arm
    const uArmLEDGeo = new THREE.BoxGeometry(0.03, 2.0, 0.03);
    const uArmLED = new THREE.Mesh(uArmLEDGeo, cyanAccentMat);
    uArmLED.position.set(-0.31, 1.25, 0.32);
    upperArmGroup.add(uArmLED);

    // ── SEGMENT 6: WRIST ASSEMBLY (J4, J5, J6) ──
    const wristGroup = new THREE.Group();
    wristGroup.position.y = 2.55;
    upperArmGroup.add(wristGroup);

    // Wrist housing sphere
    const wristSphereGeo = new THREE.SphereGeometry(0.5, 20, 20);
    const wristSphere = new THREE.Mesh(wristSphereGeo, blackMat);
    wristSphere.castShadow = true;
    wristGroup.add(wristSphere);

    // Wrist neck
    const wristNeckGeo = new THREE.CylinderGeometry(0.34, 0.38, 0.5, 14);
    const wristNeck = new THREE.Mesh(wristNeckGeo, whiteMat);
    wristNeck.position.y = 0.48;
    wristGroup.add(wristNeck);

    // Wrist flange
    const wristFlangeGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.15, 14);
    const wristFlange = new THREE.Mesh(wristFlangeGeo, charcoalMat);
    wristFlange.position.y = 0.78;
    wristGroup.add(wristFlange);

    // Chrome wrist rotate ring
    const wristRingGeo = new THREE.TorusGeometry(0.46, 0.04, 8, 28);
    const wristRing = new THREE.Mesh(wristRingGeo, chromeMat);
    wristRing.position.y = 0.78;
    wristGroup.add(wristRing);

    // ── SEGMENT 7: TOOL / END-EFFECTOR GRIPPER ──
    const handGroup = new THREE.Group();
    handGroup.position.y = 0.93;
    wristGroup.add(handGroup);

    // Tool adapter plate
    const adapterGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 16);
    const adapter = new THREE.Mesh(adapterGeo, blackMat);
    adapter.castShadow = true;
    handGroup.add(adapter);

    // Gripper body
    const gripBodyGeo = new THREE.BoxGeometry(0.7, 0.28, 0.72);
    const gripBody = new THREE.Mesh(gripBodyGeo, whiteAltMat);
    gripBody.position.y = 0.2;
    gripBody.castShadow = true;
    handGroup.add(gripBody);

    // Status LEDs on gripper body
    const statusLEDGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const ledGreen = new THREE.Mesh(statusLEDGeo, ledGreenMat);
    ledGreen.position.set(0, 0.35, 0.3);
    handGroup.add(ledGreen);

    const ledRed = new THREE.Mesh(statusLEDGeo, ledRedMat);
    ledRed.position.set(0.18, 0.35, 0.3);
    handGroup.add(ledRed);

    // Finger jaws (2 fingers)
    const fingerGeo = new THREE.BoxGeometry(0.14, 0.72, 0.2);
    const fingerL = new THREE.Mesh(fingerGeo, blackMat);
    fingerL.position.set(-0.22, 0.6, 0);
    fingerL.castShadow = true;
    handGroup.add(fingerL);

    const fingerR = new THREE.Mesh(fingerGeo, blackMat);
    fingerR.position.set(0.22, 0.6, 0);
    fingerR.castShadow = true;
    handGroup.add(fingerR);

    // Rubber pad inserts on fingers
    const padGeo = new THREE.BoxGeometry(0.055, 0.6, 0.185);
    const padL = new THREE.Mesh(padGeo, rubberMat);
    padL.position.set(-0.14, 0.6, 0);
    handGroup.add(padL);

    const padR = new THREE.Mesh(padGeo, rubberMat);
    padR.position.set(0.14, 0.6, 0);
    handGroup.add(padR);

    // Fingertip sensor bumps
    const tipGeo = new THREE.BoxGeometry(0.14, 0.08, 0.2);
    const tipL = new THREE.Mesh(tipGeo, cyanAccentMat);
    tipL.position.set(-0.22, 0.98, 0);
    handGroup.add(tipL);

    const tipR = new THREE.Mesh(tipGeo, cyanAccentMat);
    tipR.position.set(0.22, 0.98, 0);
    handGroup.add(tipR);

    // ── Drag to rotate ──
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const robotGroup = scene; // rotate on baseGroup

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      baseGroup.rotation.y += dx * 0.006;
      camera.position.y = Math.max(4, Math.min(22, camera.position.y - dy * 0.05));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation Loop ──
    let animId = 0;
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      // Slow auto-rotation if not dragging
      if (!isDragging) {
        baseGroup.rotation.y += 0.003;
      }

      // Resolve joint angles
      const angles = modeRef.current === 'manual'
        ? jointsRef.current
        : kukaJointsRef.current;

      // Joint kinematics
      turretGroup.rotation.y  = THREE.MathUtils.degToRad(angles[0]);
      lowerArmGroup.rotation.x = THREE.MathUtils.degToRad(angles[1]);
      elbowGroup.rotation.x   = THREE.MathUtils.degToRad(angles[2]);
      wristGroup.rotation.z   = THREE.MathUtils.degToRad(angles[3]);
      handGroup.rotation.x    = THREE.MathUtils.degToRad(angles[4]);
      handGroup.rotation.y    = THREE.MathUtils.degToRad(angles[5]);

      // Gripper clamp cycle
      const clamp = Math.sin(time * 0.0015) * 0.1;
      fingerL.position.x = -0.22 - clamp;
      padL.position.x    = -0.14 - clamp;
      tipL.position.x    = -0.22 - clamp;
      fingerR.position.x = 0.22 + clamp;
      padR.position.x    = 0.14 + clamp;
      tipR.position.x    = 0.22 + clamp;

      // Track gripper light
      const gPos = new THREE.Vector3();
      handGroup.getWorldPosition(gPos);
      gripperLight.position.copy(gPos);

      // LED pulse
      ledGreenMat.emissiveIntensity = 1.5 + Math.sin(time * 0.004) * 0.5;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 380;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const joints = telemetry.robotArmMode === 'manual'
    ? telemetry.manualRobotArmJoints
    : (kukaRobot?.joints || [0,0,0,0,0,0]);

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-cyan-500/20 neon-border-cyan" style={{ background: 'radial-gradient(ellipse at center, #0a1628 0%, #02040a 100%)' }}>
      {/* Grid background overlay */}
      <div className="absolute inset-0 matrix-bg opacity-10 pointer-events-none" />

      {/* Top HUD labels */}
      <div className="absolute top-3 left-4 pointer-events-none z-10 text-left">
        <span className="text-[9px] text-cyan-400 font-mono-tech tracking-widest uppercase block">INDUSTRIAL TWIN VIEWER</span>
        <span className="text-xs text-white font-orbitron font-bold tracking-wide">ABB IRB 6700 — DIGITAL REPLICA</span>
      </div>

      {/* Mode badge */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5 pointer-events-none z-10 bg-black/60 px-2.5 py-1 rounded-full border border-slate-700/50">
        <span className={`w-2 h-2 rounded-full ${telemetry.robotArmMode === 'auto' ? 'bg-emerald-400 animate-blink' : 'bg-amber-400 animate-blink-fast'}`} />
        <span className="text-[10px] text-slate-300 font-mono-tech uppercase tracking-wider">
          {telemetry.robotArmMode === 'auto' ? 'AUTO SYNC' : 'MANUAL OVERRIDE'}
        </span>
      </div>

      {/* Joint angle HUD — bottom left */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none bg-black/70 backdrop-blur-sm border border-cyan-500/15 rounded-lg p-2.5 grid grid-cols-3 gap-x-4 gap-y-1">
        {['J1','J2','J3','J4','J5','J6'].map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] font-mono-tech">
            <span className="text-slate-500">{label}</span>
            <span className="text-cyan-300 font-medium">{joints[i]?.toFixed(1) ?? '0.0'}°</span>
          </div>
        ))}
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-3 right-4 z-10 pointer-events-none">
        <span className="text-[9px] text-slate-600 font-mono-tech tracking-wide">DRAG TO ROTATE</span>
      </div>

      {/* Corner HUD decorations */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />

      {/* THREE.js Canvas mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
