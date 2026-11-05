/**
 * Modelos 3D procedurales de ElectronicShop (Three.js puro, sin React).
 *
 * Port del prototipo `concepto/electronicshop-concepto.html`: mismos materiales,
 * geometrías, texturas de canvas (serigrafía, etiqueta del capacitor, mancha de AO)
 * y puntos de interés. Los builders solo se llaman en el cliente; las texturas de
 * canvas se crean de forma perezosa y se cachean a nivel de módulo.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ModelId } from "@/lib/data/types";

export type { ModelId };

export interface Hotspot {
  /** Posición en el espacio local del modelo ya centrado en el origen */
  position: [number, number, number];
  label: string;
  /** Rotación preferida del pivote [rx, ry] al enfocar el punto */
  rotation: [number, number];
}

export interface ModelBounds {
  size: THREE.Vector3;
  center: THREE.Vector3;
  /** y mínima del modelo centrado (para apoyar la sombra) */
  bottom: number;
  /** Mitad de la dimensión mayor (sin margen) */
  radius: number;
}

export const MODEL_IDS: readonly ModelId[] = ["board", "resistor", "capacitor", "pir"];

/** Rotación inicial del pivote por modelo, como en las tarjetas del prototipo */
export const DEFAULT_ROTATION: Record<ModelId, [number, number]> = {
  board: [0.95, -0.55],
  resistor: [0.5, -0.55],
  capacitor: [0.2, 0.3],
  pir: [0.85, -0.7],
};

const isBrowser = typeof document !== "undefined";

/* ---------- materiales ---------- */
const std = (
  color: number,
  roughness: number,
  metalness: number,
  extra: THREE.MeshStandardMaterialParameters = {},
) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);

const M = {
  pcbSide: phys({ color: 0x1b6ba6, roughness: 0.6, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
  pcbGreen: phys({ color: 0x0c5a3c, roughness: 0.55, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
  black: std(0x121212, 0.38, 0.1),
  header: std(0x1b1b1b, 0.6, 0.05),
  hole: std(0x050505, 1, 0),
  dark: std(0x2a2a2a, 0.5, 0.1),
  gold: std(0xd8b25a, 0.28, 1),
  copper: std(0xb87333, 0.3, 1),
  steel: phys({ color: 0xd9dcdf, roughness: 0.22, metalness: 1 }),
  white: std(0xf4f2ee, 0.4, 0),
  blueBody: phys({ color: 0x4f8fcf, roughness: 0.45, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
  orange: phys({ color: 0xd9772b, roughness: 0.5, metalness: 0, clearcoat: 0.15 }),
  orangeDark: std(0xb95f1c, 0.6, 0),
  red: std(0xc0392b, 0.45, 0),
  ledOn: std(0xffc04d, 0.4, 0, { emissive: 0xff9a1f, emissiveIntensity: 2.2 }),
  ledOff: std(0x5f7f38, 0.45, 0),
  lens: phys({
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0,
    transmission: 0.25,
    thickness: 0.4,
    ior: 1.4,
    clearcoat: 0.2,
  }),
};

/* ---------- caché de geometrías ---------- */
const geoCache = new Map<string, THREE.BufferGeometry>();
function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined;
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}
const G = {
  box: (w: number, h: number, d: number) => cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)),
  rbox: (w: number, h: number, d: number, r: number) =>
    cached(`r${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 3, r)),
  cyl: (r: number, h: number, s = 32) => cached(`c${r},${h},${s}`, () => new THREE.CylinderGeometry(r, r, h, s)),
};

type Mat = THREE.Material | THREE.Material[];
function mesh(geo: THREE.BufferGeometry, mat: Mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const box = (w: number, h: number, d: number, mat: Mat, x: number, y: number, z: number) =>
  mesh(G.box(w, h, d), mat, x, y, z);
const rbox = (w: number, h: number, d: number, r: number, mat: Mat, x: number, y: number, z: number) =>
  mesh(G.rbox(w, h, d, r), mat, x, y, z);
function cylX(r: number, h: number, mat: Mat, x: number, y: number, z: number) {
  const m = mesh(G.cyl(r, h), mat, x, y, z);
  m.rotation.z = Math.PI / 2;
  return m;
}
function cylY(r: number, h: number, mat: Mat, x: number, y: number, z: number) {
  return mesh(G.cyl(r, h), mat, x, y, z);
}

/* ---------- texturas de canvas (solo en el navegador) ---------- */
function canvasTex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Familia monoespaciada real (next/font expone un nombre generado en --font-jetbrains) */
export function monoFontFamily(): string {
  const fallback = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
  if (!isBrowser) return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
  return v ? `${v}, ${fallback}` : fallback;
}

const BW = 2.74;
const BD = 2.14;

function silkscreen(): THREE.CanvasTexture | null {
  if (!isBrowser) return null;
  const S = 520;
  const c = document.createElement("canvas");
  c.width = Math.round(BW * S);
  c.height = Math.round(BD * S);
  const g = c.getContext("2d");
  if (!g) return null;
  const mono = monoFontFamily();
  g.fillStyle = "#1b6ba6";
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = "rgba(255,255,255,.08)";
  g.lineWidth = 5;
  g.lineCap = "round";
  const traces: [number, number][][] = [
    [[0.12, 0.42], [0.62, 0.42], [0.78, 0.58], [1.3, 0.58]],
    [[0.36, 1.02], [0.36, 1.5], [0.6, 1.76]],
    [[1.9, 0.32], [1.9, 0.9], [2.2, 1.2]],
    [[0.92, 1.3], [1.42, 1.3], [1.58, 1.46]],
    [[2.3, 0.22], [2.6, 0.22], [2.6, 0.72]],
    [[1.2, 0.3], [1.6, 0.3], [1.75, 0.45], [2.05, 0.45]],
  ];
  traces.forEach((p) => {
    g.beginPath();
    p.forEach(([x, y], i) => (i ? g.lineTo(x * S, y * S) : g.moveTo(x * S, y * S)));
    g.stroke();
  });
  const P = (x: number, z: number): [number, number] => [(x + BW / 2) * S, (z + BD / 2) * S];
  g.strokeStyle = "rgba(255,255,255,.9)";
  g.fillStyle = "rgba(255,255,255,.92)";
  g.lineWidth = 3;
  const rect = (x: number, z: number, w: number, d: number) => {
    const [px, py] = P(x - w / 2, z - d / 2);
    g.strokeRect(px, py, w * S, d * S);
  };
  rect(-0.55, -0.92, 1.06, 0.24);
  rect(0.55, -0.92, 0.86, 0.24);
  rect(-0.05, 0.92, 0.86, 0.24);
  rect(0.85, 0.92, 0.66, 0.24);
  rect(1.22, 0.05, 0.24, 0.32);
  const text = (t: string, x: number, z: number, size: number, o: { rot?: number; w?: number } = {}) => {
    const [px, py] = P(x, z);
    g.save();
    g.translate(px, py);
    if (o.rot) g.rotate(o.rot);
    g.font = `${o.w || 600} ${size}px ${mono}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(t, 0, 0);
    g.restore();
  };
  text("DIGITAL (PWM~)", 0, -0.7, 26);
  text("POWER", -0.05, 0.7, 24);
  text("ANALOG IN", 0.85, 0.7, 24);
  ["SCL", "SDA", "AREF", "GND", "13", "12", "~11", "~10", "~9", "8"].forEach((l, i) =>
    text(l, -1.0 + i * 0.1, -0.6, 15, { rot: -Math.PI / 2 }),
  );
  ["7", "~6", "~5", "4", "~3", "2", "TX1", "RX0"].forEach((l, i) =>
    text(l, 0.2 + i * 0.1, -0.6, 15, { rot: -Math.PI / 2 }),
  );
  ["", "IOREF", "RESET", "3.3V", "5V", "GND", "GND", "VIN"].forEach((l, i) =>
    text(l, -0.4 + i * 0.1, 0.6, 13, { rot: -Math.PI / 2 }),
  );
  ["A0", "A1", "A2", "A3", "A4", "A5"].forEach((l, i) => text(l, 0.6 + i * 0.1, 0.6, 15, { rot: -Math.PI / 2 }));
  text("UNO", -0.1, 0.05, 118, { w: 700 });
  text("R3", -0.1, 0.3, 38);
  text("ICSP", 1.22, -0.2, 15);
  text("RESET", -1.0, -0.58, 13);
  text("ON", -0.2, 0.2, 13);
  text("L", 0.15, -0.47, 13);
  text("TX", 0.28, -0.47, 13);
  text("RX", 0.41, -0.47, 13);
  text("ElectronicShop", 0.95, 0.38, 20, { w: 500 });
  return canvasTex(c);
}

function capLabel(): THREE.CanvasTexture | null {
  if (!isBrowser) return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  const mono = monoFontFamily();
  g.fillStyle = "#d9772b";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#3a2414";
  g.font = `700 74px ${mono}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("104", 128, 112);
  g.font = `500 34px ${mono}`;
  g.fillText("50V", 128, 176);
  return canvasTex(c);
}

function blobTex(): THREE.CanvasTexture | null {
  if (!isBrowser) return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  const r = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  r.addColorStop(0, "rgba(0,0,0,.42)");
  r.addColorStop(0.5, "rgba(0,0,0,.16)");
  r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

let silkTex: THREE.CanvasTexture | null = null;
let capTex: THREE.CanvasTexture | null = null;
let blob: THREE.CanvasTexture | null = null;

/** Textura de la serigrafía de la placa (cacheada) */
export function silkscreenTexture() {
  return (silkTex ??= silkscreen());
}
/** Textura de la etiqueta "104 50V" del capacitor (cacheada) */
export function capLabelTexture() {
  return (capTex ??= capLabel());
}
/** Mancha radial de oclusión ambiental para el suelo (cacheada) */
export function blobTexture() {
  return (blob ??= blobTex());
}

/* ---------- modelos procedurales ---------- */
function buildBoard() {
  const g = new THREE.Group();
  const T = 0.07;
  const top = T / 2;
  const topMat = phys({ map: silkscreenTexture(), roughness: 0.5, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.32 });
  const pcb = new THREE.Mesh(G.box(BW, T, BD), [M.pcbSide, M.pcbSide, topMat, M.pcbSide, M.pcbSide, M.pcbSide]);
  pcb.castShadow = true;
  pcb.receiveShadow = true;
  g.add(pcb);
  // tiras de pines con orificios dorados
  const strips: [number, number, number, number][] = [
    [-0.55, -0.92, 1.0, 10],
    [0.55, -0.92, 0.8, 8],
    [-0.05, 0.92, 0.8, 8],
    [0.85, 0.92, 0.6, 6],
  ];
  strips.forEach(([x, z, len, n]) => {
    g.add(rbox(len + 0.06, 0.24, 0.18, 0.015, M.header, x, top + 0.12, z));
    for (let i = 0; i < n; i++) {
      const px = x - len / 2 + 0.05 + i * 0.1;
      g.add(box(0.062, 0.006, 0.062, M.gold, px, top + 0.243, z));
      g.add(box(0.04, 0.006, 0.04, M.hole, px, top + 0.247, z));
    }
  });
  // ICSP 2x3
  g.add(rbox(0.2, 0.22, 0.3, 0.015, M.header, 1.22, top + 0.11, 0.05));
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const px = 1.22 - 0.05 + j * 0.1;
      const pz = 0.05 - 0.1 + i * 0.1;
      g.add(box(0.062, 0.006, 0.062, M.gold, px, top + 0.223, pz));
      g.add(box(0.04, 0.006, 0.04, M.hole, px, top + 0.227, pz));
    }
  // MCU a 45°
  const pads = box(0.64, 0.004, 0.64, M.gold, 0.55, top + 0.002, 0.05);
  pads.rotation.y = Math.PI / 4;
  g.add(pads);
  const mcu = rbox(0.5, 0.08, 0.5, 0.012, M.black, 0.55, top + 0.045, 0.05);
  mcu.rotation.y = Math.PI / 4;
  g.add(mcu);
  g.add(cylY(0.028, 0.004, M.white, 0.55 + 0.17, top + 0.087, 0.05 - 0.17));
  // USB-B con boca y jack con orificio
  g.add(rbox(0.44, 0.32, 0.46, 0.03, M.steel, -BW / 2 + 0.14, top + 0.16, -0.5));
  g.add(box(0.03, 0.19, 0.3, M.hole, -BW / 2 + 0.14 - 0.215, top + 0.17, -0.5));
  g.add(rbox(0.38, 0.28, 0.52, 0.02, M.black, -BW / 2 + 0.12, top + 0.14, 0.55));
  g.add(cylX(0.1, 0.03, M.hole, -BW / 2 + 0.12 - 0.19, top + 0.14, 0.55));
  // cristal, capacitores, regulador, botón de reset
  const xtal = mesh(new THREE.CapsuleGeometry(0.065, 0.26, 6, 20), M.steel, -0.5, top + 0.07, -0.33);
  xtal.rotation.z = Math.PI / 2;
  g.add(xtal);
  (
    [
      [-0.55, 0.45],
      [-0.33, 0.45],
    ] as [number, number][]
  ).forEach(([x, z]) => {
    g.add(cylY(0.09, 0.26, M.black, x, top + 0.13, z));
    g.add(cylY(0.088, 0.012, M.steel, x, top + 0.266, z));
    g.add(box(0.02, 0.22, 0.03, M.white, x - 0.08, top + 0.13, z));
  });
  g.add(rbox(0.14, 0.1, 0.22, 0.01, M.black, -0.8, top + 0.05, 0.72));
  g.add(box(0.02, 0.06, 0.22, M.steel, -0.73, top + 0.1, 0.72));
  g.add(rbox(0.18, 0.1, 0.18, 0.01, M.steel, -1.0, top + 0.05, -0.78));
  g.add(cylY(0.045, 0.07, M.red, -1.0, top + 0.13, -0.78));
  // SMD
  for (let i = 0; i < 26; i++) {
    const a = i * 1.7;
    const r = 0.5 + ((i * 37) % 10) / 11;
    const x = Math.cos(a) * r * 0.95;
    const z = Math.sin(a) * r * 0.62;
    if (Math.abs(x) > 1.05 || Math.abs(z) > 0.75) continue;
    g.add(rbox(0.07, 0.022, 0.04, 0.004, i % 3 ? M.dark : M.gold, x, top + 0.011, z));
  }
  // LEDs y orificios de montaje
  g.add(rbox(0.07, 0.03, 0.07, 0.006, M.ledOff, 0.15, top + 0.016, -0.36));
  g.add(rbox(0.07, 0.03, 0.07, 0.006, M.ledOn, 0.28, top + 0.016, -0.36));
  g.add(rbox(0.07, 0.03, 0.07, 0.006, M.ledOff, 0.41, top + 0.016, -0.36));
  g.add(rbox(0.07, 0.03, 0.07, 0.006, M.ledOn, -0.2, top + 0.016, 0.32));
  (
    [
      [-1.2, -0.85],
      [1.22, -0.95],
      [1.25, 0.9],
      [-1.0, 0.9],
    ] as [number, number][]
  ).forEach(([x, z]) => {
    g.add(cylY(0.085, 0.004, M.gold, x, top + 0.002, z));
    g.add(cylY(0.055, 0.09, M.hole, x, 0, z));
  });
  return g;
}

function buildResistor() {
  const g = new THREE.Group();
  g.add(cylX(0.18, 0.8, M.blueBody, 0, 0, 0));
  g.add(cylX(0.21, 0.17, M.blueBody, -0.31, 0, 0));
  g.add(cylX(0.21, 0.17, M.blueBody, 0.31, 0, 0));
  const brown = phys({ color: 0x6b3a1f, roughness: 0.5, clearcoat: 0.3 });
  const blk = phys({ color: 0x111111, roughness: 0.5, clearcoat: 0.3 });
  const bands: [number, THREE.Material][] = [
    [-0.22, brown],
    [-0.1, blk],
    [0.02, blk],
    [0.14, brown],
    [0.31, brown],
  ];
  bands.forEach(([x, mat]) => g.add(cylX(x === 0.31 ? 0.22 : 0.19, 0.055, mat, x, 0, 0)));
  g.add(cylX(0.024, 1.05, M.steel, -0.9, 0, 0));
  g.add(cylX(0.024, 1.05, M.steel, 0.9, 0, 0));
  return g;
}

function buildCapacitor() {
  const g = new THREE.Group();
  const face = phys({ map: capLabelTexture(), roughness: 0.5, metalness: 0, clearcoat: 0.15 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.15, 48), [M.orange, face, M.orange]);
  disc.rotation.x = Math.PI / 2;
  disc.position.y = 0.2;
  disc.castShadow = true;
  disc.receiveShadow = true;
  g.add(disc);
  const lip = mesh(G.cyl(0.355, 0.07, 48), M.orangeDark, 0, 0.2, 0);
  lip.rotation.x = Math.PI / 2;
  g.add(lip);
  g.add(cylY(0.022, 0.5, M.steel, -0.1, -0.3, 0));
  g.add(cylY(0.022, 0.5, M.steel, 0.1, -0.3, 0));
  g.add(cylY(0.06, 0.06, M.orangeDark, -0.1, -0.08, 0));
  g.add(cylY(0.06, 0.06, M.orangeDark, 0.1, -0.08, 0));
  return g;
}

function buildPIR() {
  const g = new THREE.Group();
  const top = 0.035;
  g.add(rbox(1.25, 0.07, 1.0, 0.01, M.pcbGreen, 0, 0, 0));
  (
    [
      [-0.4, -0.35, 0.4, 0.02],
      [0.45, -0.1, 0.02, 0.3],
      [-0.1, 0.3, 0.5, 0.02],
    ] as [number, number, number, number][]
  ).forEach(([x, z, w, d]) => g.add(box(w, 0.004, d, M.copper, x, top + 0.002, z)));
  g.add(cylY(0.47, 0.08, M.white, 0, top + 0.04, 0));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.43, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), M.lens);
  dome.position.y = top + 0.08;
  dome.castShadow = true;
  g.add(dome);
  for (let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43 * Math.sin((i + 1) * 0.26), 0.004, 8, 64), M.white);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = top + 0.08 + 0.43 * Math.cos((i + 1) * 0.26);
    g.add(ring);
  }
  g.add(rbox(0.32, 0.2, 0.13, 0.01, M.header, 0, top + 0.1, 0.44));
  for (let i = 0; i < 3; i++) g.add(cylY(0.016, 0.3, M.gold, -0.1 + i * 0.1, top + 0.3, 0.44));
  g.add(cylY(0.075, 0.1, M.orange, -0.48, top + 0.05, 0.34));
  g.add(box(0.09, 0.012, 0.02, M.white, -0.48, top + 0.105, 0.34));
  g.add(cylY(0.075, 0.1, M.orange, -0.48, top + 0.05, 0.1));
  g.add(box(0.09, 0.012, 0.02, M.white, -0.48, top + 0.105, 0.1));
  g.add(rbox(0.14, 0.05, 0.14, 0.006, M.black, 0.5, top + 0.025, 0.32));
  g.add(rbox(0.06, 0.1, 0.12, 0.006, M.dark, 0.52, top + 0.05, -0.3));
  return g;
}

const BUILDERS: Record<ModelId, () => THREE.Group> = {
  board: buildBoard,
  resistor: buildResistor,
  capacitor: buildCapacitor,
  pir: buildPIR,
};

/** Centro de la caja envolvente del modelo "crudo", cacheado por id */
const rawCenters = new Map<ModelId, THREE.Vector3>();

/**
 * Construye el modelo y lo centra en el origen (resta el centro de su caja
 * envolvente, como el `fit` del prototipo). Cada llamada devuelve un grupo nuevo;
 * materiales y texturas se comparten a nivel de módulo, no hay que disponerlos.
 */
export function buildModel(id: ModelId): THREE.Group {
  const g = BUILDERS[id]();
  const center = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
  g.position.sub(center);
  g.userData.modelId = id;
  g.userData.rawCenter = center.clone();
  rawCenters.set(id, center.clone());
  return g;
}

function rawCenter(id: ModelId): THREE.Vector3 {
  let c = rawCenters.get(id);
  if (!c) {
    buildModel(id);
    c = rawCenters.get(id) as THREE.Vector3;
  }
  return c;
}

/** Caja envolvente del grupo (ya centrado) para encuadre, suelo y hotspots */
export function modelBounds(group: THREE.Object3D): ModelBounds {
  const b = new THREE.Box3().setFromObject(group);
  const size = b.getSize(new THREE.Vector3());
  const center = b.getCenter(new THREE.Vector3());
  return { size, center, bottom: b.min.y, radius: Math.max(size.x, size.y, size.z) * 0.5 };
}

/** Mitad de la dimensión mayor del modelo (radio de encuadre sin margen) */
export function modelRadius(group: THREE.Object3D): number {
  return modelBounds(group).radius;
}

/** Distancia de cámara para encuadrar un radio dado con un FOV vertical en grados */
export function fitDistance(radius: number, fovDeg: number): number {
  return radius / Math.sin(THREE.MathUtils.degToRad(fovDeg) / 2);
}

/* ---------- puntos de interés (coordenadas del prototipo, sin centrar) ---------- */
const RAW_HOTSPOTS: Record<ModelId, Hotspot[]> = {
  board: [
    { position: [-1.23, 0.25, -0.5], label: "Puerto USB-B", rotation: [0.75, 0.95] },
    { position: [0.55, 0.12, 0.05], label: "ATmega328P", rotation: [1.05, -0.25] },
    { position: [-0.55, 0.3, -0.92], label: "Pines digitales 0–13", rotation: [1.15, 0.1] },
    { position: [0.85, 0.3, 0.92], label: "Entradas analógicas A0–A5", rotation: [1.2, -0.35] },
    { position: [-1.23, 0.2, 0.55], label: "Jack 7–12 V", rotation: [0.75, 1.0] },
  ],
  pir: [
    { position: [0, 0.55, 0], label: "Lente Fresnel · 7 m", rotation: [0.9, -0.4] },
    { position: [-0.48, 0.14, 0.34], label: "Sensibilidad", rotation: [1.1, 0.5] },
    { position: [-0.48, 0.14, 0.1], label: "Tiempo de retardo", rotation: [1.1, 0.5] },
    { position: [0, 0.35, 0.44], label: "VCC · OUT · GND", rotation: [0.6, 0] },
  ],
  resistor: [
    { position: [0, 0.2, 0], label: "Película metálica · 1 %", rotation: [0.4, -0.4] },
    { position: [-0.22, 0.21, 0], label: "Marrón · negro · negro · marrón", rotation: [0.6, 0.2] },
  ],
  capacitor: [
    { position: [0, 0.2, 0.09], label: "104 = 100 nF", rotation: [0.15, 0.3] },
    { position: [0.1, -0.45, 0], label: "Sin polaridad", rotation: [0.4, 0.5] },
  ],
};

const centeredHotspots = new Map<ModelId, Hotspot[]>();
function hotspotsFor(id: ModelId): Hotspot[] {
  let list = centeredHotspots.get(id);
  if (!list) {
    const c = rawCenter(id);
    list = RAW_HOTSPOTS[id].map((h) => ({
      ...h,
      position: [h.position[0] - c.x, h.position[1] - c.y, h.position[2] - c.z],
    }));
    centeredHotspots.set(id, list);
  }
  return list;
}

/**
 * Puntos de interés por modelo con posiciones relativas al modelo ya centrado.
 * Se resuelven de forma perezosa (la primera lectura construye el modelo una vez
 * para conocer su centro) y se cachean.
 */
export const HOTSPOTS: Record<ModelId, Hotspot[]> = {
  get board() {
    return hotspotsFor("board");
  },
  get resistor() {
    return hotspotsFor("resistor");
  },
  get capacitor() {
    return hotspotsFor("capacitor");
  },
  get pir() {
    return hotspotsFor("pir");
  },
};
