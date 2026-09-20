import * as THREE from 'three';
import fs from 'fs';
import path from 'path';

// Polyfill FileReader for Node environment
if (typeof globalThis.FileReader === 'undefined') {
  class NodeFileReader {
    onload: any = null;
    onloadend: any = null;
    onerror: any = null;
    result: any = null;
    readAsArrayBuffer(blob: any) {
      blob.arrayBuffer().then((buf: ArrayBuffer) => {
        this.result = buf;
        if (typeof this.onload === 'function') {
          this.onload({ target: { result: buf } });
        }
        if (typeof this.onloadend === 'function') {
          this.onloadend({ target: { result: buf } });
        }
      }).catch((err: any) => {
        console.error("blob.arrayBuffer error:", err);
        if (typeof this.onerror === 'function') this.onerror(err);
      });
    }
  }
  (globalThis as any).FileReader = NodeFileReader;
}

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const outDir = path.resolve('public/3d-models');
const rootPublicDir = path.resolve('public');
fs.mkdirSync(outDir, { recursive: true });

async function exportScene(scene: THREE.Scene, filename: string) {
  const exporter = new GLTFExporter();
  return new Promise<void>((resolve, reject) => {
    try {
      exporter.parse(
        scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            const buf = Buffer.from(result);
            fs.writeFileSync(path.join(outDir, filename), buf);
            fs.writeFileSync(path.join(rootPublicDir, filename), buf);
            console.log(`Successfully generated ${filename}, size: ${(result.byteLength / 1024).toFixed(1)} KB`);
            resolve();
          } else {
            console.error(`Unexpected result format for ${filename}`);
            resolve();
          }
        },
        (error) => {
          console.error(`Error generating ${filename}:`, error);
          reject(error);
        },
        { binary: true }
      );
    } catch (err) {
      console.error(`Sync error in ${filename}:`, err);
      reject(err);
    }
  });
}

// -------------------------------------------------------------
// 1. HIGH-REALISM PC CASE (کیس کامپیوتر)
// -------------------------------------------------------------
function createRealisticCase(): THREE.Scene {
  const scene = new THREE.Scene();

  // Premium Lighter Modern Gunmetal & Titanium Materials (Fix: Case was too dark)
  const chassisSteelMat = new THREE.MeshStandardMaterial({
    color: 0x3b4758, // Lighter, high-end metallic slate gunmetal
    metalness: 0.85,
    roughness: 0.28
  });

  const darkInteriorMat = new THREE.MeshStandardMaterial({
    color: 0x243044, // Clear, visible dark slate interior
    metalness: 0.7,
    roughness: 0.35
  });

  const meshFrontMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Visible mesh front panel
    metalness: 0.55,
    roughness: 0.55
  });

  const silverAccentMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.12, // Crystal-clear tempered glass
    roughness: 0.05,
    metalness: 0.05,
    transmission: 0.96,
    ior: 1.52,
    reflectivity: 0.7
  });

  const chromeThumbScrewMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.95,
    roughness: 0.15
  });

  const rgbCyanMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  const rgbPurpleMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x9333ea,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  const fanBladeTranslucentMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    transparent: true,
    opacity: 0.88
  });

  const fanFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5
  });

  const brassStandoffMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.95,
    roughness: 0.15
  });

  // Dimensions: Width 0.215m, Height 0.46m, Depth 0.43m
  const W = 0.215;
  const H = 0.46;
  const D = 0.43;

  // Outer Steel Frame & Back Panel
  // Right side panel (solid steel)
  const rightPanelGeo = new THREE.BoxGeometry(0.003, H, D);
  const rightPanel = new THREE.Mesh(rightPanelGeo, chassisSteelMat);
  rightPanel.position.set(-W / 2 + 0.0015, 0, 0);
  scene.add(rightPanel);

  // Top panel with ventilation recess
  const topPanelGeo = new THREE.BoxGeometry(W, 0.004, D);
  const topPanel = new THREE.Mesh(topPanelGeo, chassisSteelMat);
  topPanel.position.set(0, H / 2 - 0.002, 0);
  scene.add(topPanel);

  // Top Magnetic Dust Filter mesh
  const topFilterGeo = new THREE.BoxGeometry(W * 0.75, 0.0015, D * 0.72);
  const topFilterMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85 });
  const topFilter = new THREE.Mesh(topFilterGeo, topFilterMat);
  topFilter.position.set(0.01, H / 2 + 0.001, -0.01);
  scene.add(topFilter);

  // Top I/O Panel Bar (Power button, USB ports, Audio)
  const ioBarGeo = new THREE.BoxGeometry(0.04, 0.002, 0.16);
  const ioBar = new THREE.Mesh(ioBarGeo, chassisSteelMat);
  ioBar.position.set(W / 2 - 0.03, H / 2 + 0.001, D / 2 - 0.10);
  scene.add(ioBar);

  // Power button (metallic with cyan ring)
  const pwrBtnGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.003, 24);
  const pwrBtn = new THREE.Mesh(pwrBtnGeo, chromeThumbScrewMat);
  pwrBtn.position.set(W / 2 - 0.03, H / 2 + 0.002, D / 2 - 0.04);
  scene.add(pwrBtn);

  const pwrRingGeo = new THREE.RingGeometry(0.0075, 0.009, 24);
  const pwrRing = new THREE.Mesh(pwrRingGeo, rgbCyanMat);
  pwrRing.rotation.x = -Math.PI / 2;
  pwrRing.position.set(W / 2 - 0.03, H / 2 + 0.0036, D / 2 - 0.04);
  scene.add(pwrRing);

  // USB 3.0 Ports (Blue plastic inserts)
  const usbBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  for (let u = 0; u < 2; u++) {
    const usbGeo = new THREE.BoxGeometry(0.012, 0.002, 0.005);
    const usb = new THREE.Mesh(usbGeo, usbBlueMat);
    usb.position.set(W / 2 - 0.03, H / 2 + 0.002, D / 2 - 0.07 - u * 0.016);
    scene.add(usb);
  }

  // Bottom base plate
  const bottomPanelGeo = new THREE.BoxGeometry(W, 0.004, D);
  const bottomPanel = new THREE.Mesh(bottomPanelGeo, chassisSteelMat);
  bottomPanel.position.set(0, -H / 2 + 0.002, 0);
  scene.add(bottomPanel);

  // 4 Case Feet with rubber pads and silver chamfered rings
  const footPositions = [
    [-W / 2 + 0.03, -H / 2 - 0.012, -D / 2 + 0.04],
    [W / 2 - 0.03, -H / 2 - 0.012, -D / 2 + 0.04],
    [-W / 2 + 0.03, -H / 2 - 0.012, D / 2 - 0.04],
    [W / 2 - 0.03, -H / 2 - 0.012, D / 2 - 0.04],
  ];

  footPositions.forEach(([fx, fy, fz]) => {
    // Silver ring
    const footRingGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.016, 24);
    const footRing = new THREE.Mesh(footRingGeo, chromeThumbScrewMat);
    footRing.position.set(fx, fy + 0.004, fz);
    scene.add(footRing);

    // Rubber pad
    const rubberGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.008, 24);
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const rubber = new THREE.Mesh(rubberGeo, rubberMat);
    rubber.position.set(fx, fy - 0.006, fz);
    scene.add(rubber);
  });

  // Motherboard Tray inside chassis
  const trayGeo = new THREE.BoxGeometry(0.003, H * 0.68, D * 0.70);
  const tray = new THREE.Mesh(trayGeo, darkInteriorMat);
  tray.position.set(-W / 2 + 0.045, 0.04, -0.02);
  scene.add(tray);

  // CPU Cooler Backplate access window cutout on the tray
  const cpuCutoutFrameGeo = new THREE.BoxGeometry(0.004, 0.12, 0.11);
  const cpuCutoutFrame = new THREE.Mesh(cpuCutoutFrameGeo, new THREE.MeshStandardMaterial({ color: 0x222938 }));
  cpuCutoutFrame.position.set(-W / 2 + 0.045, 0.10, -0.05);
  scene.add(cpuCutoutFrame);

  // Brass Standoff Screws on Motherboard Tray
  const standoffCoords = [
    [-0.04, 0.18, -0.14],
    [0.06, 0.18, -0.14],
    [-0.04, 0.18, 0.04],
    [0.06, 0.18, 0.04],
    [-0.04, -0.02, -0.14],
    [0.06, -0.02, -0.14],
    [-0.04, -0.02, 0.04],
    [0.06, -0.02, 0.04]
  ];
  standoffCoords.forEach(([sx, sy, sz]) => {
    const stGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.007, 12);
    const st = new THREE.Mesh(stGeo, brassStandoffMat);
    st.rotation.z = Math.PI / 2;
    st.position.set(-W / 2 + 0.048, sy, sz);
    scene.add(st);
  });

  // PSU Shroud / Basement Tunnel (Lower chamber)
  const shroudH = 0.11;
  const shroudGeo = new THREE.BoxGeometry(W - 0.01, shroudH, D - 0.01);
  const shroud = new THREE.Mesh(shroudGeo, darkInteriorMat);
  shroud.position.set(0, -H / 2 + shroudH / 2 + 0.004, 0);
  scene.add(shroud);

  // PSU viewing window cutout with backlit accent
  const psuWinGeo = new THREE.BoxGeometry(0.004, 0.045, 0.11);
  const psuWinMat = new THREE.MeshStandardMaterial({ color: 0x1f293d, metalness: 0.8 });
  const psuWin = new THREE.Mesh(psuWinGeo, psuWinMat);
  psuWin.position.set(W / 2 - 0.008, -H / 2 + 0.055, -0.08);
  scene.add(psuWin);

  // Rear Panel Details (PCIe expansion slots & I/O cutout)
  const rearPanelGeo = new THREE.BoxGeometry(W, H, 0.003);
  const rearPanel = new THREE.Mesh(rearPanelGeo, chassisSteelMat);
  rearPanel.position.set(0, 0, -D / 2 + 0.0015);
  scene.add(rearPanel);

  // 7 PCIe expansion slot covers (vented louvers)
  const pcieSlotMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
  for (let p = 0; p < 7; p++) {
    const slotGeo = new THREE.BoxGeometry(0.016, 0.011, 0.095);
    const slot = new THREE.Mesh(slotGeo, pcieSlotMat);
    slot.rotation.y = Math.PI / 2;
    slot.position.set(0.01, -0.08 + p * 0.018, -D / 2 + 0.005);
    scene.add(slot);
  }

  // Rear 120mm Exhaust Fan with RGB ring
  const rearFanGroup = createCaseFan(0.055, true, 0x06b6d4);
  rearFanGroup.rotation.y = 0;
  rearFanGroup.position.set(-0.02, 0.10, -D / 2 + 0.028);
  scene.add(rearFanGroup);

  // Front Panel Assembly with Geometric Airflow Mesh
  const frontMeshGeo = new THREE.BoxGeometry(W, H * 0.96, 0.015);
  const frontMesh = new THREE.Mesh(frontMeshGeo, meshFrontMat);
  frontMesh.position.set(0, 0, D / 2 - 0.008);
  scene.add(frontMesh);

  // 3x Front 120mm Addressable RGB Intake Fans
  for (let f = 0; f < 3; f++) {
    const fanColor = f % 2 === 0 ? 0x06b6d4 : 0xa855f7;
    const frontFan = createCaseFan(0.055, true, fanColor);
    frontFan.rotation.y = Math.PI;
    frontFan.position.set(0, -0.10 + f * 0.125, D / 2 - 0.035);
    scene.add(frontFan);
  }

  // Left Side Tempered Glass Panel with Dark Smoke Tint
  const glassGeo = new THREE.BoxGeometry(0.004, H * 0.94, D * 0.96);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(W / 2 - 0.002, 0, 0);
  scene.add(glass);

  // 4 Knurled Metallic Thumbscrews for Tempered Glass Mounting
  const screwOffsets = [
    [W / 2 + 0.004, H * 0.44, -D * 0.44],
    [W / 2 + 0.004, H * 0.44, D * 0.44],
    [W / 2 + 0.004, -H * 0.44, -D * 0.44],
    [W / 2 + 0.004, -H * 0.44, D * 0.44],
  ];

  screwOffsets.forEach(([sx, sy, sz]) => {
    const screwGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.008, 16);
    const screw = new THREE.Mesh(screwGeo, chromeThumbScrewMat);
    screw.rotation.z = Math.PI / 2;
    screw.position.set(sx, sy, sz);
    scene.add(screw);
  });

  // Internal Ceiling RGB ambient light strip
  const rgbStripGeo = new THREE.BoxGeometry(0.008, 0.003, D * 0.6);
  const rgbStrip = new THREE.Mesh(rgbStripGeo, rgbCyanMat);
  rgbStrip.position.set(0.02, H / 2 - 0.015, 0);
  scene.add(rgbStrip);

  return scene;
}

// Helper: Detailed 120mm Case Fan with blades and RGB Ring
function createCaseFan(radius: number, hasRgb: boolean, rgbColorHex = 0x06b6d4): THREE.Group {
  const group = new THREE.Group();

  // Outer square frame
  const frameGeo = new THREE.BoxGeometry(radius * 2.15, radius * 2.15, 0.024);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x090d14, roughness: 0.6 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  group.add(frame);

  // Corner anti-vibration silicone pads
  const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const cornerOffsets = [
    [-radius * 0.9, -radius * 0.9],
    [radius * 0.9, -radius * 0.9],
    [-radius * 0.9, radius * 0.9],
    [radius * 0.9, radius * 0.9],
  ];
  cornerOffsets.forEach(([cx, cy]) => {
    const padGeo = new THREE.BoxGeometry(0.018, 0.018, 0.026);
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(cx, cy, 0);
    group.add(pad);
  });

  // Center motor hub
  const hubGeo = new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, 0.018, 24);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7, roughness: 0.3 });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.rotation.x = Math.PI / 2;
  group.add(hub);

  // 9 Curved aerodynamic fan blades
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.25,
    transparent: true,
    opacity: 0.85
  });

  const bladeCount = 9;
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const bladeGeo = new THREE.BoxGeometry(radius * 0.65, 0.016, 0.002);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(Math.cos(angle) * radius * 0.52, Math.sin(angle) * radius * 0.52, 0);
    blade.rotation.z = angle + 0.45;
    blade.rotation.y = 0.55; // Pitch angle
    group.add(blade);
  }

  // RGB Halo Ring
  if (hasRgb) {
    const haloGeo = new THREE.TorusGeometry(radius * 0.95, 0.0035, 12, 32);
    const haloMat = new THREE.MeshStandardMaterial({
      color: rgbColorHex,
      emissive: rgbColorHex,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.z = 0.012;
    group.add(halo);
  }

  return group;
}

// -------------------------------------------------------------
// 2. HIGH-REALISM CPU COOLER (خنک‌کننده پردازنده - Tower Air Cooler)
// -------------------------------------------------------------
function createRealisticCooler(): THREE.Scene {
  const scene = new THREE.Scene();

  // Materials
  const nickelBaseMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1
  });

  const copperPipeMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Rich shiny copper
    metalness: 0.92,
    roughness: 0.2
  });

  const aluminumFinMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    metalness: 0.88,
    roughness: 0.18
  });

  const topBlackCapMat = new THREE.MeshStandardMaterial({
    color: 0x181e28,
    metalness: 0.65,
    roughness: 0.35
  });

  const springScrewMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.15
  });

  // Solid Copper / Nickel-plated Base Block
  const baseW = 0.052;
  const baseH = 0.014;
  const baseD = 0.050;
  const baseBlock = new THREE.Mesh(new THREE.BoxGeometry(baseW, baseH, baseD), nickelBaseMat);
  baseBlock.position.y = -0.075;
  scene.add(baseBlock);

  // Mounting Crossbar with spring-tensioned screws
  const barGeo = new THREE.BoxGeometry(0.090, 0.006, 0.014);
  const bar = new THREE.Mesh(barGeo, springScrewMat);
  bar.position.set(0, -0.065, 0);
  scene.add(bar);

  // Spring screws on ends of the crossbar
  [-0.040, 0.040].forEach((sx) => {
    const scrGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.016, 16);
    const scr = new THREE.Mesh(scrGeo, springScrewMat);
    scr.position.set(sx, -0.060, 0);
    scene.add(scr);

    // Spring coils representation
    const springGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.010, 16);
    const springMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const spring = new THREE.Mesh(springGeo, springMat);
    spring.position.set(sx, -0.066, 0);
    scene.add(spring);
  });

  // 6 Continuous Pure Copper Heatpipes
  // They emerge from the base block, curve up, and penetrate through the entire fin stack
  const pipeRadius = 0.0035;
  const pipeXOffsets = [-0.020, -0.012, -0.004, 0.004, 0.012, 0.020];

  pipeXOffsets.forEach((px, idx) => {
    // Vertical straight pipe through the fins
    const pipeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, 0.145, 16);
    const pipeZ = (idx % 2 === 0 ? -0.010 : 0.010);
    const pipe = new THREE.Mesh(pipeGeo, copperPipeMat);
    pipe.position.set(px, 0.00, pipeZ);
    scene.add(pipe);

    // Sealed rounded copper tips poking out through the top plate
    const tipGeo = new THREE.SphereGeometry(pipeRadius * 1.1, 16, 12);
    const tip = new THREE.Mesh(tipGeo, copperPipeMat);
    tip.position.set(px, 0.075, pipeZ);
    scene.add(tip);
  });

  // Dense Radiator Fin Stack: 42 Individual Aluminum Fins
  const finCount = 42;
  const finThickness = 0.0006;
  const finSpacing = 0.0030;
  const finW = 0.125;
  const finD = 0.052;

  for (let i = 0; i < finCount; i++) {
    const finY = -0.050 + i * finSpacing;
    const finGeo = new THREE.BoxGeometry(finW, finThickness, finD);
    const fin = new THREE.Mesh(finGeo, aluminumFinMat);
    fin.position.set(0, finY, 0);
    scene.add(fin);
  }

  // Top Decorative Shroud Plate with brushed dark gunmetal & logo grooves
  const topPlateGeo = new THREE.BoxGeometry(finW + 0.002, 0.006, finD + 0.002);
  const topPlate = new THREE.Mesh(topPlateGeo, topBlackCapMat);
  topPlate.position.set(0, 0.073, 0);
  scene.add(topPlate);

  // Geometric silver laser badge on top plate
  const badgeGeo = new THREE.BoxGeometry(0.045, 0.001, 0.025);
  const badgeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });
  const badge = new THREE.Mesh(badgeGeo, badgeMat);
  badge.position.set(0, 0.0765, 0);
  scene.add(badge);

  // 120mm PWM Cooling Fan attached to front of radiator
  const fanGroup = createCaseFan(0.060, true, 0x38bdf8);
  fanGroup.position.set(0, 0.008, finD / 2 + 0.016);
  scene.add(fanGroup);

  // Metallic Wire Retention Clips on sides of cooler
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
  [-finW / 2 - 0.002, finW / 2 + 0.002].forEach((wx) => {
    const wireGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.090, 8);
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(wx, 0.005, finD / 2 + 0.008);
    scene.add(wire);
  });

  return scene;
}

// -------------------------------------------------------------
// 3. HIGH-REALISM MOTHERBOARD (مادربرد اصلی)
// -------------------------------------------------------------
function createRealisticMotherboard(): THREE.Scene {
  const scene = new THREE.Scene();

  // Multi-layer deep black PCB
  const pcbGeo = new THREE.BoxGeometry(0.244, 0.0028, 0.244);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.65, metalness: 0.15 });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.0014;
  scene.add(pcb);

  // Printed circuit silk-screen lines (ASUS Prime white/grey pattern)
  const traceLineMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  for (let t = 0; t < 5; t++) {
    const traceGeo = new THREE.BoxGeometry(0.001, 0.0004, 0.08 + t * 0.015);
    const trace = new THREE.Mesh(traceGeo, traceLineMat);
    trace.position.set(0.01 + t * 0.008, 0.003, -0.04);
    trace.rotation.y = 0.45;
    scene.add(trace);
  }

  // LGA 1200 CPU Socket Assembly
  const socketBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.046, 0.004, 0.046),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 })
  );
  socketBase.position.set(-0.020, 0.005, -0.035);
  scene.add(socketBase);

  // Gold pin grid array inside socket cavity
  const pinGrid = new THREE.Mesh(
    new THREE.PlaneGeometry(0.036, 0.036),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2, side: THREE.DoubleSide })
  );
  pinGrid.rotation.x = Math.PI / 2;
  pinGrid.position.set(-0.020, 0.0071, -0.035);
  scene.add(pinGrid);

  // Socket Load Plate Lever & Chrome Bracket
  const leverGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.056, 12);
  const leverMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.1 });
  const lever = new THREE.Mesh(leverGeo, leverMat);
  lever.rotation.z = Math.PI / 2;
  lever.position.set(-0.020, 0.009, -0.062);
  scene.add(lever);

  // Massive Sculpted Aluminum VRM Heatsinks
  const heatsinkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.88,
    roughness: 0.22
  });

  // Top VRM Heatsink with stepped cooling fins
  const topVrm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.024, 0.022), heatsinkMat);
  topVrm.position.set(-0.020, 0.013, -0.088);
  scene.add(topVrm);

  // Left VRM Heatsink & I/O integrated cover
  const leftVrm = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.028, 0.110), heatsinkMat);
  leftVrm.position.set(-0.078, 0.015, -0.035);
  scene.add(leftVrm);

  // Rear I/O Port Stack
  const ioMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
  const ioBlock = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.025, 0.135), ioMat);
  ioBlock.position.set(-0.106, 0.014, -0.030);
  scene.add(ioBlock);

  // 4x DDR4 Dual-Channel RAM DIMM Slots
  const ramColors = [0x1e293b, 0x0f172a, 0x1e293b, 0x0f172a];
  for (let r = 0; r < 4; r++) {
    const rx = 0.062 + r * 0.014;
    const slotMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.009, 0.010, 0.138),
      new THREE.MeshStandardMaterial({ color: ramColors[r], roughness: 0.5 })
    );
    slotMesh.position.set(rx, 0.006, -0.020);
    scene.add(slotMesh);

    // End latches on both sides
    [-0.070, 0.070].forEach((lz) => {
      const latch = new THREE.Mesh(
        new THREE.BoxGeometry(0.011, 0.013, 0.006),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5 })
      );
      latch.position.set(rx, 0.008, -0.020 + lz);
      scene.add(latch);
    });
  }

  // Primary PCIe 4.0 x16 SafeSlot (Stainless Steel Armored)
  const pcieArmorMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 });
  const pcieSlot = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.011, 0.124), pcieArmorMat);
  pcieSlot.rotation.y = Math.PI / 2;
  pcieSlot.position.set(-0.025, 0.007, 0.055);
  scene.add(pcieSlot);

  // PCIe retention lock tab at the end of slot
  const pcieLock = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.014, 0.010),
    new THREE.MeshStandardMaterial({ color: 0x0284c7 })
  );
  pcieLock.position.set(0.042, 0.008, 0.055);
  scene.add(pcieLock);

  // Secondary PCIe x1 Slot
  const pcieX1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.010, 0.008, 0.036),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  pcieX1.rotation.y = Math.PI / 2;
  pcieX1.position.set(-0.025, 0.006, 0.095);
  scene.add(pcieX1);

  // M.2 NVMe SSD Slot with Aluminum Thermal Heatsink Cover
  const m2Shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.088, 0.006, 0.024),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 })
  );
  m2Shield.position.set(-0.025, 0.005, 0.020);
  scene.add(m2Shield);

  // Chipset Heatsink with faceted aluminum cover
  const chipHeatsink = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 0.012, 0.045),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
  );
  chipHeatsink.position.set(0.070, 0.008, 0.070);
  scene.add(chipHeatsink);

  // Audio Capacitor Bank (Japanese Nichicon Gold)
  const goldCapMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.85, roughness: 0.25 });
  for (let c = 0; c < 5; c++) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.011, 14), goldCapMat);
    cap.position.set(-0.088, 0.007, 0.070 + c * 0.011);
    scene.add(cap);
  }

  // Isolated Audio Trace with warm LED glow
  const audioGlowMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6
  });
  const audioTrace = new THREE.Mesh(new THREE.BoxGeometry(0.0015, 0.0005, 0.065), audioGlowMat);
  audioTrace.position.set(-0.076, 0.003, 0.085);
  scene.add(audioTrace);

  // 24-Pin ATX Power Connector Socket
  const atxSocket = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.013, 0.054),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.4 })
  );
  atxSocket.position.set(0.110, 0.008, 0.035);
  scene.add(atxSocket);

  // Shiny Chrome CR2032 3V CMOS Battery
  const cmos = new THREE.Mesh(
    new THREE.CylinderGeometry(0.010, 0.010, 0.0035, 20),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.08 })
  );
  cmos.position.set(0.015, 0.004, 0.025);
  scene.add(cmos);

  return scene;
}

// -------------------------------------------------------------
// 4. HIGH-REALISM GRAPHICS CARD (GPU) - Ultra Detailed Gaming Model
// -------------------------------------------------------------
function createRealisticGPU(): THREE.Scene {
  const scene = new THREE.Scene();

  // Dimensions: Length 0.28m, Height 0.052m, Depth 0.125m
  const L = 0.28;
  const H = 0.052;
  const D = 0.125;

  // Materials
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Gunmetal slate armor
    metalness: 0.85,
    roughness: 0.25
  });

  const silverBevelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Brushed aluminum silver bevels
    metalness: 0.95,
    roughness: 0.12
  });

  const copperPipeMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Polished copper heatpipes
    metalness: 0.95,
    roughness: 0.15
  });

  const aluminumFinMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc, // Aluminum radiator fins
    metalness: 0.9,
    roughness: 0.2
  });

  const rgbCyanMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  const rgbMagentaMat = new THREE.MeshStandardMaterial({
    color: 0xd946ef,
    emissive: 0xc026d3,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  // 1. Internal Dense Aluminum Fin Stack Heatsink (Visible through vents)
  const finBlock = new THREE.Mesh(
    new THREE.BoxGeometry(L * 0.92, H * 0.65, D * 0.88),
    aluminumFinMat
  );
  finBlock.position.set(0, 0, 0);
  scene.add(finBlock);

  // 2. Visible 4 Copper Heatpipes weaving through the radiator
  for (let p = 0; p < 4; p++) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0035, 0.0035, L * 0.94, 16),
      copperPipeMat
    );
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, -0.008 + (p % 2) * 0.016, -D * 0.3 + p * 0.020);
    scene.add(pipe);

    // Heatpipe curved loop tips emerging at the front end
    const tip = new THREE.Mesh(
      new THREE.TorusGeometry(0.008, 0.0035, 12, 16, Math.PI),
      copperPipeMat
    );
    tip.position.set(L / 2 - 0.005, -0.008 + (p % 2) * 0.016, -D * 0.3 + p * 0.020);
    tip.rotation.y = Math.PI / 2;
    scene.add(tip);
  }

  // 3. Sculpted Outer Shroud with 3 Recessed Circular Fan Wells
  const shroudBase = new THREE.Mesh(
    new THREE.BoxGeometry(L, H * 0.45, D),
    armorMat
  );
  shroudBase.position.set(0, H * 0.28, 0);
  scene.add(shroudBase);

  // Silver Chamfered Edges and Corner Bevels
  const bevelTop = new THREE.Mesh(
    new THREE.BoxGeometry(L + 0.002, 0.004, 0.012),
    silverBevelMat
  );
  bevelTop.position.set(0, H / 2 + 0.002, D / 2 - 0.006);
  scene.add(bevelTop);

  const bevelBottom = new THREE.Mesh(
    new THREE.BoxGeometry(L + 0.002, 0.004, 0.012),
    silverBevelMat
  );
  bevelBottom.position.set(0, H / 2 + 0.002, -D / 2 + 0.006);
  scene.add(bevelBottom);

  // 4. Three High-Tech Axial Fans with Recessed Metallic Bezels
  const fanRadius = 0.038;
  const fanXPositions = [-0.082, 0.000, 0.082];

  fanXPositions.forEach((fx, idx) => {
    // Chrome circular bezel ring around fan well
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(fanRadius * 1.05, 0.0025, 12, 32),
      silverBevelMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(fx, H / 2 + 0.003, 0);
    scene.add(ring);

    // Fan Unit with 11 curved aerodynamic blades
    const fan = createCaseFan(fanRadius, false);
    fan.rotation.x = Math.PI / 2;
    fan.position.set(fx, H / 2 + 0.001, 0);
    scene.add(fan);

    // Shiny Metallic Center Hub Emblem with Diamond-Cut Edge
    const emblem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.004, 24),
      silverBevelMat
    );
    emblem.position.set(fx, H / 2 + 0.012, 0);
    scene.add(emblem);

    // Center Badge Ring
    const badgeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.009, 0.012, 24),
      idx === 1 ? rgbMagentaMat : rgbCyanMat
    );
    badgeRing.rotation.x = -Math.PI / 2;
    badgeRing.position.set(fx, H / 2 + 0.0142, 0);
    scene.add(badgeRing);
  });

  // 5. Full-cover Rigid Brushed Metal Backplate with Flow-Through Vent Cutout
  const backplate = new THREE.Mesh(
    new THREE.BoxGeometry(L, 0.0035, D),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 })
  );
  backplate.position.y = -H / 2 - 0.0018;
  scene.add(backplate);

  // Backplate Flow-Through Airflow Window Cutout revealing copper heatpipes
  const ventCutout = new THREE.Mesh(
    new THREE.BoxGeometry(0.065, 0.004, D * 0.72),
    silverBevelMat
  );
  ventCutout.position.set(L / 2 - 0.048, -H / 2 - 0.0018, 0);
  scene.add(ventCutout);

  // 6. Illuminated Side ARGB "GEFORCE RTX" Logo Bar
  const rgbBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.012, 0.004),
    rgbCyanMat
  );
  rgbBar.position.set(0.01, 0.010, D / 2 + 0.002);
  scene.add(rgbBar);

  // Front Edge ARGB Chevron Accent Strips
  const chevron1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.003, 0.004),
    rgbMagentaMat
  );
  chevron1.position.set(-L / 2 + 0.025, H / 2 + 0.002, D / 2 - 0.025);
  scene.add(chevron1);

  // 7. Dual 8-Pin PCIe Power Header Sockets on top edge
  for (let pwr = 0; pwr < 2; pwr++) {
    const pcieSocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.014, 0.011),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    pcieSocket.position.set(L / 2 - 0.030 - pwr * 0.022, 0.012, D / 2 + 0.005);
    scene.add(pcieSocket);

    // Gold contact pins inside header
    const pins = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.008, 0.002),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95 })
    );
    pins.position.set(L / 2 - 0.030 - pwr * 0.022, 0.012, D / 2 + 0.009);
    scene.add(pins);
  }

  // 8. Stainless Steel Dual-Slot I/O Bracket
  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.0025, 0.105, D + 0.015),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 })
  );
  bracket.position.set(-L / 2 - 0.0015, 0.018, 0);
  scene.add(bracket);

  // Gold-Plated Video Outputs (3x DisplayPort, 1x HDMI)
  const goldPortMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.95 });
  for (let pt = 0; pt < 4; pt++) {
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.009, 0.016), goldPortMat);
    port.position.set(-L / 2 - 0.003, -0.010 + (pt % 2) * 0.024, -0.035 + Math.floor(pt / 2) * 0.035);
    scene.add(port);
  }

  // 9. PCIe 4.0 x16 Gold Contact Finger Connector
  const goldPins = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.010, 0.0026),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.15 })
  );
  goldPins.position.set(-0.045, -H / 2 - 0.0068, -D / 2 - 0.0013);
  scene.add(goldPins);

  return scene;
}

// -------------------------------------------------------------
// 5. HIGH-REALISM CPU (پردازنده مرکزی)
// -------------------------------------------------------------
function createRealisticCPU(): THREE.Scene {
  const scene = new THREE.Scene();

  // Multi-layer Green High-Density Fiberglass PCB
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.0032, 0.075), pcbMat);
  scene.add(pcb);

  // Golden Alignment Pin Triangle Notch in corner
  const triMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95 });
  const tri = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.0035, 0.004), triMat);
  tri.position.set(-0.034, 0.0002, -0.034);
  scene.add(tri);

  // Nickel-Plated Mirror Copper Integrated Heat Spreader (IHS)
  const ihsMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.95,
    roughness: 0.12
  });
  const ihs = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.0065, 0.062), ihsMat);
  ihs.position.y = 0.0045;
  scene.add(ihs);

  // Beveled perimeter step on the heatspreader
  const stepMat = new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.9 });
  const step = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.002, 0.068), stepMat);
  step.position.y = 0.0022;
  scene.add(step);

  // Underside: 1200 LGA Gold Contact Pads
  const goldPads = new THREE.Mesh(
    new THREE.PlaneGeometry(0.068, 0.068),
    new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.95, roughness: 0.25, side: THREE.DoubleSide })
  );
  goldPads.rotation.x = Math.PI / 2;
  goldPads.position.y = -0.0017;
  scene.add(goldPads);

  // Central cavity with ceramic bypass SMD capacitors
  const capMat = new THREE.MeshStandardMaterial({ color: 0xa16207, metalness: 0.4 });
  for (let cx = -2; cx <= 2; cx++) {
    for (let cz = -2; cz <= 2; cz++) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.0012, 0.0018), capMat);
      cap.position.set(cx * 0.004, -0.0022, cz * 0.004);
      scene.add(cap);
    }
  }

  return scene;
}

// -------------------------------------------------------------
// 6. HIGH-REALISM RAM (ماژول حافظه رم)
// -------------------------------------------------------------
function createRealisticRAM(): THREE.Scene {
  const scene = new THREE.Scene();

  // 10-Layer Matte Black PCB
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.133, 0.032, 0.002),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.6 })
  );
  scene.add(pcb);

  // Sculpted Aluminum Heat Spreader (Stealth Charcoal with Red Accents)
  const hsMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Crimson / Red
    metalness: 0.85,
    roughness: 0.25
  });

  const hs1 = new THREE.Mesh(new THREE.BoxGeometry(0.132, 0.034, 0.0035), hsMat);
  hs1.position.set(0, 0.004, 0.0025);
  scene.add(hs1);

  const hs2 = new THREE.Mesh(new THREE.BoxGeometry(0.132, 0.034, 0.0035), hsMat);
  hs2.position.set(0, 0.004, -0.0025);
  scene.add(hs2);

  // Top Frosted RGB Lightbar
  const rgbBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.134, 0.006, 0.008),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.95
    })
  );
  rgbBar.position.set(0, 0.022, 0);
  scene.add(rgbBar);

  // 288-Pin Gold Edge Connector with Curved JEDEC insertion profile
  const goldPins = new THREE.Mesh(
    new THREE.BoxGeometry(0.128, 0.006, 0.0024),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.15 })
  );
  goldPins.position.y = -0.018;
  scene.add(goldPins);

  // Center alignment notch
  const notch = new THREE.Mesh(
    new THREE.BoxGeometry(0.003, 0.007, 0.003),
    new THREE.MeshStandardMaterial({ color: 0x09090b })
  );
  notch.position.set(0.008, -0.018, 0);
  scene.add(notch);

  return scene;
}

// -------------------------------------------------------------
// 7. HIGH-REALISM POWER SUPPLY (منبع تغذیه PSU) - With Sleeved Cable Harness
// -------------------------------------------------------------
function createRealisticPSU(): THREE.Scene {
  const scene = new THREE.Scene();

  // Premium Gunmetal Textured Steel Casing (Fix: Not a flat dark cube!)
  const casingMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Clear metallic gunmetal slate
    metalness: 0.82,
    roughness: 0.32
  });
  const casing = new THREE.Mesh(new THREE.BoxGeometry(0.150, 0.086, 0.140), casingMat);
  scene.add(casing);

  // Beveled edge corner strips
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
  const topEdge1 = new THREE.Mesh(new THREE.BoxGeometry(0.152, 0.003, 0.006), edgeMat);
  topEdge1.position.set(0, 0.044, 0.068);
  scene.add(topEdge1);

  const topEdge2 = new THREE.Mesh(new THREE.BoxGeometry(0.152, 0.003, 0.006), edgeMat);
  topEdge2.position.set(0, 0.044, -0.068);
  scene.add(topEdge2);

  // High-Contrast Technical Specification & 80-Plus Gold Rating Plate on the Side
  const labelPlateMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Crisp light label plate
    metalness: 0.1,
    roughness: 0.4
  });
  const sideLabel = new THREE.Mesh(new THREE.BoxGeometry(0.120, 0.065, 0.002), labelPlateMat);
  sideLabel.position.set(0, 0, 0.071);
  scene.add(sideLabel);

  // 80 PLUS GOLD Badge Stripe on the label
  const goldStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.114, 0.012, 0.0025),
    new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 })
  );
  goldStripe.position.set(0, 0.022, 0.0715);
  scene.add(goldStripe);

  // DC Voltage Rail Indicator Bars on label (+12V Yellow, +5V Red, +3.3V Orange)
  const railColors = [0xfacc15, 0xef4444, 0xf97316, 0x3b82f6];
  railColors.forEach((col, idx) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.016, 0.0025),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
    );
    bar.position.set(-0.038 + idx * 0.025, -0.010, 0.0715);
    scene.add(bar);
  });

  // 120mm Bottom Intake Fan with Concentric Chrome Spiral Wire Grill
  const fanMesh = createCaseFan(0.058, false);
  fanMesh.rotation.x = Math.PI / 2;
  fanMesh.position.set(0, 0.044, 0);
  scene.add(fanMesh);

  // Chrome wire concentric rings over the fan
  const chromeGrillMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.12 });
  [0.022, 0.036, 0.048].forEach(r => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0018, 12, 32), chromeGrillMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.046, 0);
    scene.add(ring);
  });

  // Center Metallic 80 PLUS Gold Emblem Badge
  const badge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.004, 24),
    new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.95, roughness: 0.15 })
  );
  badge.position.set(0, 0.047, 0);
  scene.add(badge);

  // Rear AC Socket & Heavy-Duty Glowing Rocker Switch
  const acSocket = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.024, 0.034),
    new THREE.MeshStandardMaterial({ color: 0x09090b })
  );
  acSocket.position.set(-0.076, 0.010, 0.035);
  scene.add(acSocket);

  // 3 Brass Prongs inside AC Socket
  for (let pr = 0; pr < 3; pr++) {
    const prong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0015, 0.0015, 0.006, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 })
    );
    prong.rotation.z = Math.PI / 2;
    prong.position.set(-0.078, 0.006 + (pr === 2 ? 0.008 : 0), 0.028 + (pr % 2) * 0.014);
    scene.add(prong);
  }

  // Glowing Amber Rocker Power Switch with I/O Marking
  const rockerSwitch = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.018, 0.015),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.85 })
  );
  rockerSwitch.position.set(-0.076, 0.010, -0.015);
  scene.add(rockerSwitch);

  // Rear Honeycomb Exhaust Perforations panel
  const honeycomb = new THREE.Mesh(
    new THREE.BoxGeometry(0.002, 0.068, 0.068),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.7 })
  );
  honeycomb.position.set(-0.076, 0.005, -0.040);
  scene.add(honeycomb);

  // ==============================================================
  // REALISTIC SLEEVED POWER CABLE HARNESS (Essential for Step 10!)
  // ==============================================================
  const cableGrommet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.008, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  cableGrommet.rotation.z = Math.PI / 2;
  cableGrommet.position.set(0.076, -0.015, 0.010);
  scene.add(cableGrommet);

  // Braided Sleeved Mesh Material
  const braidedSleeveMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.2
  });

  // 1. MAIN 24-PIN ATX MOTHERBOARD CABLE
  // Main thick bundle curving outward
  const mainBundle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.10, 16),
    braidedSleeveMat
  );
  mainBundle.rotation.z = Math.PI / 2.3;
  mainBundle.position.set(0.12, -0.008, 0.025);
  scene.add(mainBundle);

  // Authentic 24-Pin Connector Block (Dual Row 12+12 pins)
  const atx24Connector = new THREE.Mesh(
    new THREE.BoxGeometry(0.052, 0.014, 0.022),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 })
  );
  atx24Connector.position.set(0.18, 0.010, 0.035);
  scene.add(atx24Connector);

  // Retention Latch on 24-pin connector
  const latch = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.005, 0.004),
    new THREE.MeshStandardMaterial({ color: 0x27272a })
  );
  latch.position.set(0.18, 0.019, 0.035);
  scene.add(latch);

  // Individual Colored Wire Leads into 24-pin connector (Yellow 12V, Red 5V, Orange 3.3V, Black GND)
  const wireCols = [0xfacc15, 0xef4444, 0xf97316, 0x18181b];
  for (let w = 0; w < 8; w++) {
    const wireLead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0018, 0.0018, 0.024, 8),
      new THREE.MeshStandardMaterial({ color: wireCols[w % wireCols.length] })
    );
    wireLead.rotation.z = Math.PI / 2;
    wireLead.position.set(0.155, 0.006 + (w % 2) * 0.008, 0.025 + Math.floor(w / 2) * 0.006);
    scene.add(wireLead);
  }

  // 2. 8-PIN EPS CPU POWER CABLE (Branching upward)
  const cpuCable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.09, 12),
    braidedSleeveMat
  );
  cpuCable.rotation.z = Math.PI / 3;
  cpuCable.position.set(0.11, 0.022, -0.025);
  scene.add(cpuCable);

  // 4+4 Pin Split CPU Power Connector Block
  const epsConnector = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.012, 0.018),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  epsConnector.position.set(0.15, 0.050, -0.035);
  scene.add(epsConnector);

  // 3. 6+2 PIN PCIE GRAPHICS CARD POWER CABLE
  const pcieCable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.08, 12),
    braidedSleeveMat
  );
  pcieCable.rotation.z = Math.PI / 2.6;
  pcieCable.position.set(0.11, -0.035, -0.015);
  scene.add(pcieCable);

  // PCIe 8-Pin (6+2) Connector with Red Accent Clip
  const pcieConnector = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.012, 0.018),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  pcieConnector.position.set(0.15, -0.050, -0.020);
  scene.add(pcieConnector);

  const redClip = new THREE.Mesh(
    new THREE.BoxGeometry(0.006, 0.004, 0.008),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  redClip.position.set(0.15, -0.042, -0.020);
  scene.add(redClip);

  return scene;
}

// -------------------------------------------------------------
// 8. HIGH-REALISM M.2 NVMe SSD (حافظه ذخیره‌سازی)
// -------------------------------------------------------------
function createRealisticStorage(): THREE.Scene {
  const scene = new THREE.Scene();

  // M.2 2280 PCB (22mm x 80mm x 1.2mm)
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.080, 0.0016, 0.022), pcbMat);
  scene.add(pcb);

  // Rear semicircular mounting screw notch
  const notch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.002, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95 })
  );
  notch.position.set(0.039, 0, 0);
  scene.add(notch);

  // High-End Multi-Core Controller Chip with Nickel Heatspreader
  const ctrl = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.0018, 0.014),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 })
  );
  ctrl.position.set(-0.016, 0.0015, 0);
  scene.add(ctrl);

  // 2x 3D TLC NAND Flash Memory Packages
  const nandMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });
  for (let n = 0; n < 2; n++) {
    const nand = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.0016, 0.015), nandMat);
    nand.position.set(0.012 + n * 0.022, 0.0015, 0);
    scene.add(nand);
  }

  // DRAM Cache Chip
  const dram = new THREE.Mesh(
    new THREE.BoxGeometry(0.009, 0.0014, 0.011),
    new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5 })
  );
  dram.position.set(-0.002, 0.0014, 0);
  scene.add(dram);

  // Precision Gold-Plated M-Key 75-Pin Connector
  const goldPins = new THREE.Mesh(
    new THREE.BoxGeometry(0.006, 0.002, 0.020),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.15 })
  );
  goldPins.position.set(-0.038, 0, 0);
  scene.add(goldPins);

  return scene;
}

// -------------------------------------------------------------
// MAIN BUILD EXECUTION
// -------------------------------------------------------------
async function main() {
  console.log("Generating high-realism 3D hardware models...");
  await exportScene(createRealisticMotherboard(), 'motherboard.glb');
  await exportScene(createRealisticCPU(), 'cpu.glb');
  await exportScene(createRealisticRAM(), 'ram.glb');
  await exportScene(createRealisticGPU(), 'gpu.glb');
  await exportScene(createRealisticPSU(), 'power_supply.glb');
  await exportScene(createRealisticStorage(), 'storage.glb');
  await exportScene(createRealisticCooler(), 'cooling.glb');
  await exportScene(createRealisticCase(), 'case.glb');
  console.log("All 8 realistic 3D hardware models generated successfully!");
}

main().catch(console.error);
