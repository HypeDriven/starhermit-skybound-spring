// The garden in the clouds on starhermit:scene, as the browser build's
// src/render.js drew it with three.js r185: the theme's sky dome (vertical
// gradient, warm haze, sun glow, twinkling stars for night themes; WGSL) and
// linear fog over the distant garden, parallax clouds (instanced icosphere
// puffs), the tall garden stalks with their leaves, floating pollen, the pads
// (lily-pad leaves for leaf, moving and wisp pads, pointed brittle petals,
// spring blossoms, thorn clusters) leaning toward the camera, the spinning
// glow motes with their halos, sparkle bursts per landing, spring, mote,
// thorn and goal, the sprout-hopper with its squash on landing, and the
// critically damped camera that only climbs, with its shake.
//
// From three.js r185: punctual light intensities are ÷ π (the engine's light
// units); the RoomEnvironment reflections (High, Ultra) are r185's (the
// renderer's room, moved down 3.5 as r183+ does) at the old
// environmentIntensity 0.35; the sky ShaderMaterial is WGSL; the post chain
// (UnrealBloomPass 0.6 / 0.4 / threshold 1.4, the grade shader, FXAA / SMAA /
// MSAA) is renderer.bloom / grade / antialias; the key light's fitted
// shadow box is the engine's view-fitted shadow (distance); the pooled burst
// planes are one instanced mesh whose opacity rides an instance slot. The
// old canvas between the rails is a view offset of the window. Cosmetic
// randomness never touches the rules.
import {
  ACESFilmicToneMapping, BackSide, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry,
  DirectionalLight, DoubleSide, DynamicDrawUsage, Euler, ExtrudeGeometry, Fog, Group, HemisphereLight, IcosahedronGeometry, InstancedMesh, Matrix4,
  Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial, OctahedronGeometry, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, Points, PointsMaterial, Quaternion, RoomEnvironment, Shape, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace,
  Vector3, Vector4, renderer, scene, type Object3D, type Texture,
} from "starhermit:scene";
import { OffscreenCanvas, type OffscreenCanvasRenderingContext2D } from "starhermit:canvas";
import { Content, Rules, type Palette, type Platform, type SimEvent, type State, type Theme } from "./game.ts";
import type { Look } from "./quality.ts";

const PI = Math.PI;
const { WORLD_WIDTH, PLAYER_RADIUS } = Rules;
/** render.js FRAMING. */
export const FRAMING = { FOV: 42, VIEW_HEIGHT: 620, CAM_LOOK_AHEAD: 210, CAM_Z_BASE: 700, PLAYER_Z: 0, PAD_TILT: 0.5 };
const DETAIL = {
  plain: { clouds: 24, puffs: 1, cloudSubdiv: 1, stalks: 7, leaves: 0, pollen: 0 },
  detailed: { clouds: 40, puffs: 4, cloudSubdiv: 2, stalks: 8, leaves: 6, pollen: 70 },
};
const CLOUD_SPAN = 3400;
const LEAF_SPAN = 2600;

// -- renderer, camera ---------------------------------------------------------------------------
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const camera = new PerspectiveCamera(FRAMING.FOV, 1, 10, 12000);
camera.position.set(WORLD_WIDTH / 2, 300, FRAMING.CAM_Z_BASE);
camera.lookAt(WORLD_WIDTH / 2, 300, 0);
renderer.camera = camera;
let camZ = FRAMING.CAM_Z_BASE;
let viewH = 1, windowH = 1;

// -- state --------------------------------------------------------------------------------------
let look: Look | null = null;
let reducedMotion = false;
let palette: Palette = "default";
let theme: Theme = Content.THEMES[0]!;
let time = 0;
let camY = 0, camVel = 0, shake = 0, playerSquash = 0;
let everRan = false;
const animated = (): boolean => !!look?.animated && !reducedMotion;
const pal = (): Record<string, number> => Content.CVD_PALETTES[palette] ?? Content.CVD_PALETTES.default;

// -- lights and sky -----------------------------------------------------------------------------------
const keyDir = new Vector3(300, 800, 600).normalize();
const key = new DirectionalLight(0xffffff, 1.7 / PI);
key.shadow.bias = -0.0004;
key.shadow.normalBias = 1.5;
key.shadow.radius = 3;
scene.add(key, key.target);
const hemi = new HemisphereLight(0xbfd9ff, 0x8a9a6a, 0.95 / PI);
scene.add(hemi);

// SKY_FRAG: vertical gradient, haze band, sun glow, hashed twinkling stars (night themes)
const SKY_FRAG = /* wgsl */ `
fn hash3(q: vec3f) -> f32 {
  var p = fract(q * 0.3183099 + vec3f(0.1));
  p = p * 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
fn fragment(f: Fragment) -> vec4f {
  let d = normalize(f.world - uniforms.uCenter);
  let t = smoothstep(-0.42 - uniforms.uShift, 0.5 - uniforms.uShift, d.y);
  var col = mix(uniforms.uBottom, uniforms.uTop, t);
  col = col + uniforms.uBottom * 0.12 * (1.0 - abs(t - 0.35) * 2.0) * uniforms.uSun;
  let s = max(dot(d, uniforms.uSunDir), 0.0);
  col = col + uniforms.uSunColor * (pow(s, 8.0) * 0.22 + pow(s, 90.0) * 0.5 + pow(s, 900.0) * 1.6) * uniforms.uSun;
  if (uniforms.uStars > 0.0) {
    let cell = floor(d * 260.0);
    let h = hash3(cell);
    let r = length(fract(d * 260.0) - vec3f(0.5));
    let tw = 0.6 + 0.4 * sin(uniforms.uTime * 2.0 + h * 40.0);
    col = col + vec3f(step(0.996, h) * (1.0 - smoothstep(0.05, 0.32, r)) * tw * uniforms.uStars * smoothstep(-0.2, 0.3, d.y));
  }
  return vec4f(col, 1.0);
}`;
const skyU = {
  uTop: { value: new Color() }, uBottom: { value: new Color() }, uSunColor: { value: new Color() },
  uSunDir: { value: new Vector3(0.32, 0.3, -0.9).normalize() }, uCenter: { value: new Vector3() },
  uSun: { value: 1 }, uStars: { value: 0 }, uTime: { value: 0 }, uShift: { value: 0 },
};
const sky = new Mesh(new SphereGeometry(6000, 32, 16), new ShaderMaterial({ uniforms: skyU, fragmentShader: SKY_FRAG, side: BackSide, depthWrite: false, fog: false }));
sky.frustumCulled = false;
sky.renderOrder = -10;
sky.noAO = true;
scene.add(sky);

// -- procedural textures (canvasTex: drawn for w×h, the canvas scaled by the budget) --------------------
function canvasTex(w: number, h: number, paint: (g: OffscreenCanvasRenderingContext2D, w: number, h: number) => void, k = 1): Texture {
  const c = new OffscreenCanvas(Math.round(w * k), Math.round(h * k));
  const g = c.getContext("2d")!;
  if (k !== 1) g.scale(k, k);
  paint(g, w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
function softDotTexture(): Texture {
  return canvasTex(64, 64, (g, w) => {
    const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.75)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, w);
  });
}
function leafVeinTexture(k: number): Texture {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = "#f2f2f2";
    g.fillRect(0, 0, w, h);
    let s = 7;
    const rnd = (): number => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 900; i++) {
      const v = 225 + Math.floor(rnd() * 30);
      g.fillStyle = `rgba(${v},${v},${v},0.35)`;
      g.fillRect(rnd() * w, rnd() * h, 2, 2);
    }
    const edge = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.55);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(40,40,40,0.28)");
    g.fillStyle = edge;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(70,70,70,0.32)";
    g.lineWidth = 2;
    for (let i = -5; i <= 5; i++) {
      if (!i) continue;
      const x0 = w / 2 + i * 20;
      for (const dir of [-1, 1]) {
        g.beginPath();
        g.moveTo(x0, h / 2);
        g.quadraticCurveTo(x0 + i * 6, h / 2 + dir * h * 0.25, x0 + i * 14, h / 2 + dir * h * 0.48);
        g.stroke();
      }
    }
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = 5;
    g.beginPath(); g.moveTo(8, h / 2); g.lineTo(w - 8, h / 2); g.stroke();
  }, k);
}
function petalTexture(k: number): Texture {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = "#f4f0ea";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(80,60,40,0.3)";
    g.lineWidth = 1.5;
    for (let i = 0; i < 22; i++) {
      const y = (i + 0.5) * (h / 22);
      g.beginPath(); g.moveTo(0, h / 2); g.quadraticCurveTo(w / 2, y, w, h / 2 + (y - h / 2) * 0.2); g.stroke();
    }
    g.fillStyle = "rgba(60,40,20,0.35)";
    for (let i = 0; i < 6; i++) g.fillRect(20 + i * 17, 30 + (i * 37) % 60, 3, 3);
  }, k);
}
let dotTex: Texture | null = null;
let veinTex: Texture | null = null, petalTex: Texture | null = null, texK = 0;

// -- procedural geometry --------------------------------------------------------------------------------
function planarUV(geo: BufferGeometry, w: number, d: number): BufferGeometry {
  const pos = geo.attributes.position!;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getZ(i) / d + 0.5;
  }
  geo.setAttribute("uv", new BufferAttribute(uv, 2));
  return geo;
}
const seg = (n: number, k: number, min: number): number => Math.max(min, Math.round(n * k));
function leafGeometry(w: number, d: number, thick: number, k: number): BufferGeometry {
  const geo = new SphereGeometry(1, seg(28, k, 20), seg(12, k, 6));
  geo.scale(w / 2, thick, d / 2);
  const p = geo.attributes.position!;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    p.setY(i, y > 0 ? y * 0.25 : y);
  }
  geo.translate(0, -thick * 0.2, 0);
  geo.computeVertexNormals();
  return planarUV(geo, w, d);
}
function petalGeometry(w: number, h: number): BufferGeometry {
  const shape = new Shape();
  shape.moveTo(-w / 2, 0);
  shape.quadraticCurveTo(-w / 4, h * 0.42, 0, h * 0.3);
  shape.quadraticCurveTo(w / 4, h * 0.42, w / 2, 0);
  shape.quadraticCurveTo(w / 4, -h * 0.42, 0, -h * 0.3);
  shape.quadraticCurveTo(-w / 4, -h * 0.42, -w / 2, 0);
  const geo = new ExtrudeGeometry(shape, { depth: 8, bevelEnabled: true, bevelThickness: 2, bevelSize: 2, bevelSegments: 2 });
  geo.rotateX(-PI / 2);
  geo.translate(0, -8, 0);
  return planarUV(geo, w, h * 0.7);
}
function mergeGeos(geos: BufferGeometry[]): BufferGeometry {
  const flat = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let total = 0;
  for (const g of flat) total += g.attributes.position!.count;
  const pos = new Float32Array(total * 3), norm = new Float32Array(total * 3);
  let off = 0;
  for (const g of flat) {
    pos.set(g.attributes.position!.array as Float32Array, off * 3);
    norm.set(g.attributes.normal!.array as Float32Array, off * 3);
    off += g.attributes.position!.count;
  }
  const out = new BufferGeometry();
  out.setAttribute("position", new BufferAttribute(pos, 3));
  out.setAttribute("normal", new BufferAttribute(norm, 3));
  return out;
}
function blossomGeometry(r: number, k: number): BufferGeometry {
  const group: BufferGeometry[] = [];
  const dome = new SphereGeometry(r * 0.42, seg(16, k, 8), seg(10, k, 5));
  dome.translate(0, 6, 0);
  group.push(dome);
  for (let i = 0; i < 5; i++) {
    const petal = new SphereGeometry(r * 0.3, seg(12, k, 6), seg(8, k, 4));
    petal.scale(1.4, 0.35, 0.9);
    const a = (i / 5) * PI * 2;
    petal.rotateY(-a);
    petal.translate(Math.cos(a) * r * 0.62, 2, Math.sin(a) * r * 0.62);
    group.push(petal);
  }
  return mergeGeos(group);
}
function thornGeometry(w: number): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const base = new BoxGeometry(w, 5, 14);
  base.translate(0, -2, 0);
  parts.push(base);
  const n = Math.max(3, Math.floor(w / 16));
  for (let i = 0; i < n; i++) {
    const spike = new ConeGeometry(6, 22, 6);
    spike.translate(-w / 2 + (i + 0.5) * (w / n), 11, 0);
    parts.push(spike);
  }
  return mergeGeos(parts);
}

// -- materials --------------------------------------------------------------------------------------------
type Lit = MeshLambertMaterial | MeshStandardMaterial | MeshPhysicalMaterial;
interface LitParams {
  color: number; map?: Texture | null; emissive?: number; emissiveIntensity?: number; roughness?: number; metalness?: number;
  clearcoat?: number; clearcoatRoughness?: number; sheen?: number; sheenColor?: number; transparent?: boolean; opacity?: number;
}
/** litMaterial(): Lambert on Low, standard on Balanced (clearcoat and sheen dropped), physical where asked on High / Ultra. */
function litMaterial(o: LitParams, physical = false): Lit {
  const { roughness, metalness, clearcoat, clearcoatRoughness, sheen, sheenColor, ...base } = o;
  const tier = look!.budget.material;
  if (tier === "lambert") return new MeshLambertMaterial(base);
  const std = { ...base, roughness: roughness ?? 1, metalness: metalness ?? 0 };
  if (physical && tier === "physical") {
    // the old sheen (hopper, spring blossoms) is not drawn by the engine: left out
    void sheen; void sheenColor;
    return new MeshPhysicalMaterial({ ...std, clearcoat: clearcoat ?? 0, clearcoatRoughness: clearcoatRoughness ?? 0 });
  }
  return new MeshStandardMaterial(std);
}
let mats: Record<string, Lit> = {};
let geoCache: Record<string, BufferGeometry> = {};
let playerMat: Lit | null = null, playerLeafMat: Lit | null = null;
let cloudMat: Lit | null = null, stalkMat: Lit | null = null, leafMat: Lit | null = null;
const pollenMat = new PointsMaterial({ color: 0xfff6d8, size: 7, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true });
let envTex: Texture | null = null;
function environment(): Texture | null {
  if (envTex) return envTex;
  try {
    const room = new RoomEnvironment(renderer);
    room.position.y = -3.5; // three r183+
    envTex = new PMREMGenerator(renderer).fromScene(room, 0.04).texture;
  } catch (e) { console.warn("environment:", e instanceof Error ? e.message : String(e)); envTex = null; }
  return envTex;
}

function disposeTree(root: Object3D): void {
  root.traverse((o) => {
    const m = o as Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}

// -- the hopper -------------------------------------------------------------------------------------------
let player: Group | null = null;
const eyeMat = new MeshBasicMaterial({ color: 0x1a2030 });
const glintMat = new MeshBasicMaterial({ color: 0xffffff });
function makeHopper(k: number): Group {
  const g = new Group();
  const body = new Mesh(new SphereGeometry(PLAYER_RADIUS, seg(24, k, 12), seg(18, k, 9)), playerMat!);
  body.scale.set(1, 1.15, 0.9);
  g.add(body);
  const leaf = new Mesh(new ConeGeometry(7, 16, 10), playerLeafMat!);
  leaf.position.set(0, PLAYER_RADIUS + 6, 0);
  leaf.rotation.z = 0.5;
  g.add(leaf);
  const leaf2 = new Mesh(new ConeGeometry(5, 12, 10), playerLeafMat!);
  leaf2.position.set(-3, PLAYER_RADIUS + 4, 2);
  leaf2.rotation.z = -0.7;
  g.add(leaf2);
  for (const sx of [-1, 1]) {
    const eye = new Mesh(new SphereGeometry(2.2, 10, 8), eyeMat);
    eye.position.set(sx * 4.5, 3, PLAYER_RADIUS * 0.82);
    g.add(eye);
    const glint = new Mesh(new SphereGeometry(0.7, 6, 4), glintMat);
    glint.position.set(sx * 4.5 + 0.8, 3.9, PLAYER_RADIUS * 0.82 + 1.9);
    g.add(glint);
  }
  g.traverse((o) => { if (o instanceof Mesh) o.castShadow = true; });
  return g;
}

/** _applyBudgetAssets: the hopper and the background materials at the budget, the surface textures. */
function applyBudgetAssets(): void {
  const b = look!.budget;
  const tk = b.texture / 256;
  if (texK !== tk) {
    veinTex?.dispose(); petalTex?.dispose();
    veinTex = leafVeinTexture(tk);
    petalTex = petalTexture(tk);
    texK = tk;
  }
  const pose = player ? { p: player.position.clone(), r: player.rotation.clone(), s: player.scale.clone() } : null;
  if (player) { scene.remove(player); disposeTree(player); }
  for (const m of [playerMat, playerLeafMat, cloudMat, stalkMat, leafMat]) m?.dispose();
  playerMat = litMaterial({ color: 0x8ed06a, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: 0xeaffd0 }, true);
  playerLeafMat = litMaterial({ color: 0x4f9e4f, roughness: 0.55 });
  player = makeHopper(b.segments);
  if (pose) { player.position.copy(pose.p); player.rotation.copy(pose.r); player.scale.copy(pose.s); }
  scene.add(player);
  cloudMat = litMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.12 });
  stalkMat = litMaterial({ color: 0x6a8a6a, roughness: 0.9 });
  leafMat = litMaterial({ color: 0x6a8a6a, roughness: 0.8 });
  tintEnv();
}

function tintEnv(): void {
  if (!cloudMat) return;
  cloudMat.color.setHex(theme.cloud);
  (cloudMat as MeshStandardMaterial).emissive.setHex(theme.cloud);
  const fogC = new Color(theme.fog);
  stalkMat!.color.setHex(theme.pad).lerp(fogC, 0.45);
  leafMat!.color.setHex(theme.padAlt).lerp(fogC, 0.3);
  pollenMat.color.setHex(theme.accent).lerp(new Color(0xffffff), 0.6);
}

// -- the post chain and the look --------------------------------------------------------------------------
function applyPost(): void {
  const q = look!;
  renderer.shadowMap.enabled = q.shadows > 0;
  key.castShadow = q.shadows > 0;
  if (q.shadows > 0) key.shadow.mapSize = q.shadows;
  // high threshold: only emissive motes, sparkles and the sun core bloom
  renderer.bloom = q.bloom ? { strength: 0.6, radius: 0.4, threshold: 1.4, resolution: q.budget.bloomRes } : null;
  // GradeShader before the OutputPass: a 0.18 S-curve, 1.1 saturation, cool shadows / warm highlights, the 0.2 vignette
  renderer.grade = q.grade ? {
    space: "linear", contrast: 0.18, saturation: 1.1, shadows: [0.97, 0.99, 1.04], highlights: [1.03, 1.0, 0.97], split: [0.2, 0.8],
    vignette: { amount: 0.2, inner: 0.4, outer: 0.9, scale: [1, 0.85] },
  } : null;
  renderer.antialias = q.antialias;
  scene.environment = q.reflections ? environment() : null;
  scene.environmentIntensity = 0.35;
  hemi.intensity = (q.reflections ? 0.8 : 0.95) / PI;
}

/** setGraphics: a new look (graphics level); pads, motes and the background are rebuilt when assets change. */
export function applyLook(next: Look): void {
  const prev = look;
  if (prev && JSON.stringify(prev) === JSON.stringify(next)) return;
  look = next;
  if (!dotTex) dotTex = softDotTexture();
  pollenMat.map = dotTex;
  sparkMat.map = dotTex;
  applyPost();
  const budgetChanged = !prev || prev.preset !== next.preset;
  if (budgetChanged) applyBudgetAssets();
  if (budgetChanged || prev!.detailed !== next.detailed) {
    clearViews();
    mats = {};
    geoCache = {};
  }
  buildEnvironment();
}
export function setReducedMotion(on: boolean): void { reducedMotion = on; }
export function setPalette(p: Palette): void {
  if (p === palette) return;
  palette = p;
  clearViews();
}

function applyFog(): void {
  // gameplay pieces (at z = 0) are never fogged; only the distant garden fades
  const near = camZ + 450;
  scene.fog = new Fog(theme.fog, near, near + Math.max(1800, theme.fogFar - theme.fogNear));
}
/** setTheme: the sky, fog, lights and background tint of a theme (by key). */
export function setTheme(keyName: string): void {
  const th = Content.THEMES.find((t) => t.key === keyName) ?? Content.THEMES[0]!;
  theme = th;
  skyU.uTop.value.setHex(th.skyTop);
  skyU.uBottom.value.setHex(th.skyBottom);
  skyU.uSunColor.value.setHex(th.keyLight);
  const top = new Color(th.skyTop);
  const night = top.r + top.g + top.b < 0.12;
  skyU.uStars.value = night ? 0.9 : 0;
  skyU.uSun.value = night ? 0.35 : 1;
  scene.background = new Color(th.skyBottom);
  applyFog();
  key.color.setHex(th.keyLight);
  hemi.color.setHex(th.hemiSky);
  hemi.groundColor.setHex(th.hemiGround);
  tintEnv();
  if (look) buildEnvironment();
}

// -- the background (clouds, stalks, leaves, pollen) -------------------------------------------------------
interface CloudData { x: number; y: number; z: number; s: number; speed: number; phase: number; puffs: number[][] }
let clouds: InstancedMesh | null = null, stalks: InstancedMesh | null = null, leaves: InstancedMesh | null = null, pollen: Points | null = null;
let cloudData: CloudData[] = [];
let stalkData: { x: number; z: number; r: number; phase: number }[] = [];
let leafData: { st: { x: number; z: number; r: number }; y: number; side: number; s: number; tilt: number }[] = [];
let pollenSeed: { x: number; y: number; z: number; ph: number; sp: number }[] = [];
let envY: number | null = null;
function mulberry(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function removeEnv(o: Object3D | null): void {
  if (!o) return;
  scene.remove(o);
  const m = o as Mesh;
  if (m.geometry) m.geometry.dispose();
}
function buildEnvironment(): void {
  if (!look) return;
  const q = look, b = q.budget;
  const D = { ...DETAIL[q.detailed ? "detailed" : "plain"] };
  if (q.detailed) D.clouds = b.clouds;
  const rng = mulberry(0xc10d5);
  removeEnv(clouds);
  cloudData = [];
  for (let i = 0; i < D.clouds; i++) {
    const d: CloudData = { x: rng() * 1600 - 560, y: rng() * CLOUD_SPAN, z: -500 - rng() * 1800, s: 40 + rng() * 120, speed: 2 + rng() * 6, phase: rng() * PI * 2, puffs: [] };
    for (let j = 0; j < D.puffs; j++) d.puffs.push(j === 0 ? [0, 0, 0, 1] : [(rng() - 0.5) * 1.6, (rng() - 0.2) * 0.4, (rng() - 0.5) * 0.5, 0.45 + rng() * 0.35]);
    cloudData.push(d);
  }
  clouds = new InstancedMesh(new IcosahedronGeometry(1, D.cloudSubdiv), cloudMat!, D.clouds * D.puffs);
  clouds.instanceMatrix.setUsage(DynamicDrawUsage);
  clouds.frustumCulled = false;
  scene.add(clouds);
  removeEnv(stalks);
  removeEnv(leaves);
  leaves = null;
  stalkData = [];
  for (let i = 0; i < D.stalks; i++) stalkData.push({ x: rng() * 1400 - 460, z: -1100 - rng() * 1600, r: 50 + rng() * 50, phase: rng() * 6.28 });
  stalks = new InstancedMesh(new CylinderGeometry(0.42, 0.5, 1, 10, 1, true), stalkMat!, D.stalks);
  stalks.instanceMatrix.setUsage(DynamicDrawUsage);
  stalks.frustumCulled = false;
  scene.add(stalks);
  leafData = [];
  if (D.leaves) {
    for (const st of stalkData) for (let j = 0; j < D.leaves; j++) leafData.push({ st, y: rng() * LEAF_SPAN, side: rng() < 0.5 ? -1 : 1, s: 40 + rng() * 45, tilt: (rng() - 0.5) * 0.6 });
    leaves = new InstancedMesh(new SphereGeometry(1, 10, 6), leafMat!, leafData.length);
    leaves.instanceMatrix.setUsage(DynamicDrawUsage);
    leaves.frustumCulled = false;
    scene.add(leaves);
  }
  removeEnv(pollen);
  pollen = null;
  const pollenCount = q.particles === "high" && D.pollen ? b.pollen : 0;
  if (pollenCount) {
    pollenSeed = [];
    for (let i = 0; i < pollenCount; i++) pollenSeed.push({ x: rng() * (WORLD_WIDTH + 200) - 100, y: rng() * 1400, z: -350 + rng() * 300, ph: rng() * 6.28, sp: 8 + rng() * 14 });
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(pollenCount * 3), 3));
    pollen = new Points(geo, pollenMat);
    pollen.frustumCulled = false;
    scene.add(pollen);
  }
  envY = null;
  updateEnvironment(true);
}
const m4 = new Matrix4(), q4 = new Quaternion(), e3 = new Euler(), v3 = new Vector3(), s3 = new Vector3();
/** Parallax (camera-driven, always) plus drift and sway (animated background only). */
function updateEnvironment(force: boolean): void {
  if (!clouds || !stalks) return;
  const anim = animated();
  if (!force && !anim && envY !== null && Math.abs(envY - camY) < 0.5) return;
  envY = camY;
  const t = time;
  const wrap = (y: number, span: number): number => ((y % span) + span) % span - span / 2;
  let k = 0;
  for (const d of cloudData) {
    const drift = anim ? Math.sin(t * 0.05 * d.speed + d.phase) * 60 + t * d.speed * 0.8 : 0;
    const cx = ((d.x + drift + 700) % 1900 + 1900) % 1900 - 700;
    const cy = camY + wrap(d.y - camY * 0.15, CLOUD_SPAN);
    for (const p of d.puffs) {
      const s = d.s * p[3]!;
      m4.makeScale(s, s * 0.5, s * 0.7);
      m4.setPosition(cx + p[0]! * d.s, cy + p[1]! * d.s, d.z + p[2]! * d.s);
      clouds.setMatrixAt(k++, m4);
    }
  }
  clouds.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < stalkData.length; i++) {
    const st = stalkData[i]!;
    const sway = anim ? Math.sin(t * 0.4 + st.phase) * 0.012 : 0;
    q4.setFromEuler(e3.set(0, 0, sway));
    m4.compose(v3.set(st.x, camY, st.z), q4, s3.set(st.r, 5200, st.r));
    stalks.setMatrixAt(i, m4);
  }
  stalks.instanceMatrix.needsUpdate = true;
  if (leaves) {
    for (let i = 0; i < leafData.length; i++) {
      const l = leafData[i]!;
      const y = camY + wrap(l.y - camY * 0.25, LEAF_SPAN);
      const flutter = anim ? Math.sin(t * 0.9 + l.y) * 0.08 : 0;
      q4.setFromEuler(e3.set(0.3, l.side * 0.4, l.side * (0.5 + l.tilt + flutter)));
      m4.compose(v3.set(l.st.x + l.side * (l.st.r * 0.45 + l.s * 0.8), y, l.st.z), q4, s3.set(l.s, l.s * 0.18, l.s * 0.55));
      leaves.setMatrixAt(i, m4);
    }
    leaves.instanceMatrix.needsUpdate = true;
  }
  if (pollen) {
    const pos = pollen.geometry.attributes.position!;
    for (let i = 0; i < pollenSeed.length; i++) {
      const p = pollenSeed[i]!;
      const rise = anim ? t * p.sp : 0;
      pos.setXYZ(i, p.x + (anim ? Math.sin(t * 0.6 + p.ph) * 18 : 0), camY + wrap(p.y + rise - camY * 0.1, 1400), p.z);
    }
    pos.needsUpdate = true;
  }
}

// -- pads and motes ----------------------------------------------------------------------------------------
const padViews = new Map<number, Mesh>();
const tokenViews = new Map<number, Mesh>();
function clearViews(): void {
  for (const v of padViews.values()) scene.remove(v);
  padViews.clear();
  for (const v of tokenViews.values()) scene.remove(v);
  tokenViews.clear();
}
function materialFor(type: string): Lit {
  const p = pal();
  const detailed = look!.detailed;
  const k = type + ":" + palette;
  let m = mats[k];
  if (!m) {
    const o: LitParams = { color: p[type] ?? p.bud!, roughness: 0.6 };
    if (type === "wisp") { o.transparent = true; o.opacity = 0.7; }
    if (type === "thorn") { o.color = p.thorn!; o.roughness = 0.35; }
    if (!detailed) m = litMaterial(o);
    else {
      if (type === "bud" || type === "drift" || type === "wisp") o.map = veinTex;
      if (type === "crumb") { o.map = petalTex; o.roughness = 0.85; }
      if (type === "spring") { o.emissive = p.spring!; o.emissiveIntensity = 0.18; o.sheen = 0.6; o.sheenColor = 0xffffff; }
      if (type !== "crumb") { o.clearcoat = type === "thorn" ? 0.8 : 0.55; o.clearcoatRoughness = 0.35; }
      m = litMaterial(o, true);
    }
    mats[k] = m;
  }
  return m;
}
function padGeometry(type: string, w: number): BufferGeometry {
  const k = type + ":" + Math.round(w / 4);
  let g = geoCache[k];
  if (!g) {
    const qw = Math.round(w / 4) * 4;
    const sk = look!.budget.segments;
    if (type === "crumb") g = petalGeometry(qw, qw * 0.5);
    else if (type === "spring") g = blossomGeometry(qw * 0.55, sk);
    else if (type === "thorn") g = thornGeometry(qw);
    else g = leafGeometry(qw, Math.min(46, qw * 0.5), 12, sk);
    geoCache[k] = g;
  }
  return g;
}
function makePadView(p: Platform): Mesh {
  const mesh = new Mesh(padGeometry(p.type, p.w), materialFor(p.type));
  if (p.type === "wisp") mesh.scale.setScalar(0.92);
  if (p.type !== "thorn") mesh.rotation.x = FRAMING.PAD_TILT;
  mesh.position.set(p.x, p.y, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.phase = (p.id * 1.7) % 6.28;
  return mesh;
}
const geoToken = new OctahedronGeometry(9);
let haloMat: SpriteMaterial | null = null;
function tokenMaterial(): Lit {
  const p = pal();
  const k = "token:" + palette;
  let m = mats[k];
  if (!m) {
    m = litMaterial({ color: p.token!, emissive: p.token!, emissiveIntensity: look!.bloom ? 3 : 1, roughness: 0.25, metalness: 0.2 });
    mats[k] = m;
    haloMat = new SpriteMaterial({ map: dotTex, color: p.token!, transparent: true, opacity: 0.55, depthWrite: false });
  }
  return m;
}
function makeTokenView(): Mesh {
  const v = new Mesh(geoToken, tokenMaterial());
  if (look!.detailed && haloMat) {
    const halo = new Sprite(haloMat);
    halo.scale.setScalar(38);
    halo.position.z = -4;
    v.add(halo);
  }
  return v;
}
function syncViews(state: State): void {
  const sway = animated();
  const seen = new Set<number>();
  for (const p of state.platforms) {
    if (!p.alive || p.y < state.camY - 120 || p.y > state.camY + FRAMING.VIEW_HEIGHT + 250) continue;
    seen.add(p.id);
    let v = padViews.get(p.id);
    if (!v) { v = makePadView(p); padViews.set(p.id, v); scene.add(v); }
    v.position.x = p.x;
    v.position.y = p.y;
    v.rotation.z = sway && p.type !== "thorn" ? Math.sin(time * 1.3 + (v.userData.phase as number)) * 0.03 : 0;
  }
  for (const [id, v] of padViews) if (!seen.has(id)) { scene.remove(v); padViews.delete(id); }
  const seenT = new Set<number>();
  for (const k of state.tokens) {
    if (k.taken || k.y < state.camY - 60 || k.y > state.camY + FRAMING.VIEW_HEIGHT + 200) continue;
    seenT.add(k.id);
    let v = tokenViews.get(k.id);
    if (!v) { v = makeTokenView(); tokenViews.set(k.id, v); scene.add(v); }
    v.position.set(k.x, k.y + Math.sin(time * 2 + k.id) * 4, 0);
    v.rotation.y = time * 2 + k.id;
  }
  for (const [id, v] of tokenViews) if (!seenT.has(id)) { scene.remove(v); tokenViews.delete(id); }
}

// -- sparkle bursts: the old pooled planes as one instanced mesh (opacity in instance slot 0) -------------------
const SPARK_MAX = 240;
const SPARK_VERT = /* wgsl */ `
fn vertex(v: Vertex) -> Vertex {
  var o = v;
  o.v0 = v.instance;
  return o;
}`;
const SPARK_SURF = /* wgsl */ `
fn surface(s: Surface) -> Surface {
  var o = s;
  o.base_color = vec4f(s.base_color.rgb, s.base_color.a * s.v0.x);
  return o;
}`;
const sparkMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false, side: DoubleSide });
sparkMat.hooks = { vertex: SPARK_VERT, surface: SPARK_SURF };
const sparks = new InstancedMesh(new PlaneGeometry(7, 7), sparkMat, SPARK_MAX);
sparks.customSlots = 1;
sparks.instanceMatrix.setUsage(DynamicDrawUsage);
sparks.frustumCulled = false;
sparks.noAO = true;
sparks.count = 0;
scene.add(sparks);
interface Spark { x: number; y: number; vx: number; vy: number; life: number; s: number; color: Color }
const live: Spark[] = [];
const cosmetic = mulberry(0x5a4e1);
function burst(x: number, y: number, color: number, count: number, spread = 60): void {
  if (reducedMotion || !look) return;
  const b = look.budget.burst;
  const n = Math.min(count, look.particles === "high" ? b : Math.round(b / 2));
  const glow = look.bloom ? 2.6 : 1;
  for (let i = 0; i < n && live.length < SPARK_MAX; i++) {
    live.push({
      x, y, vx: (cosmetic() - 0.5) * spread * 2, vy: cosmetic() * spread * 1.6, life: 0.5 + cosmetic() * 0.3, s: 0.8 + cosmetic() * 0.8,
      color: new Color(color).multiplyScalar(glow),
    });
  }
}
const v4 = new Vector4();
function updateSparks(dt: number): void {
  for (let i = live.length - 1; i >= 0; i--) {
    const p = live[i]!;
    p.life -= dt;
    if (p.life <= 0) { live.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy -= 300 * dt;
  }
  live.forEach((p, i) => {
    m4.makeScale(p.s, p.s, p.s);
    m4.setPosition(p.x, p.y, 10);
    sparks.setMatrixAt(i, m4);
    sparks.setColorAt(i, p.color);
    sparks.setCustomAt(i, v4.set(Math.min(0.95, p.life * 2), 0, 0, 0));
  });
  sparks.count = live.length;
  sparks.instanceMatrix.needsUpdate = true;
  if (sparks.instanceColor) sparks.instanceColor.needsUpdate = true;
}
function shakeCamera(amount: number): void { if (!reducedMotion) shake = Math.max(shake, amount); }

/** handleEvents: input ack < legal move < combo/goal < round completion. */
export function handleEvents(events: SimEvent[], state: State): void {
  for (const e of events) {
    switch (e.type) {
      case "land":
        playerSquash = 1;
        burst(state.player.x, e.y + 4, 0xdfffc8, 6, 40);
        if (e.chain >= 8) { burst(state.player.x, e.y + 10, 0xffe066, 16, 90); shakeCamera(3); }
        break;
      case "spring":
        playerSquash = 1.4;
        burst(state.player.x, e.y + 6, 0xffc0dd, 18, 100);
        shakeCamera(2);
        break;
      case "token": burst(state.player.x, state.player.y, 0xfff09a, 12, 70); break;
      case "thorn": burst(state.player.x, state.player.y, 0xff6a6a, 24, 120); shakeCamera(8); break;
      case "terminal":
        if (e.reason === "goal-reached") burst(state.player.x, state.player.y, 0xa0ffd8, 40, 160);
        if (e.reason === "fell") shakeCamera(5);
        break;
    }
  }
}

// -- view ----------------------------------------------------------------------------------------------------
/** The window rect the old canvas filled (between the rails, above the tray), in window pixels. */
export function setView(fullW: number, fullH: number, x: number, y: number, w: number, h: number): void {
  if (w < 2 || h < 2) return;
  camera.setViewOffset(w, h, -x, -y, fullW, fullH);
  const aspect = w / h;
  if (Math.abs(camera.aspect - aspect) > 1e-6) {
    camera.aspect = aspect;
    // fit the world width horizontally; the camera distance follows the FOV and aspect
    const halfH = WORLD_WIDTH / 2 / aspect;
    const fitZ = halfH / Math.tan(((FRAMING.FOV / 2) * PI) / 180);
    camZ = Math.max(FRAMING.CAM_Z_BASE * 0.7, fitZ * 1.02);
    camera.updateProjectionMatrix();
    applyFog();
  }
  viewH = h;
  windowH = fullH;
}

/** Resets the camera to a new run's start (the old renderer kept its spring state; a new run starts at its floor). */
export function resetRun(): void {
  camY = FRAMING.CAM_LOOK_AHEAD;
  camVel = 0;
  shake = 0;
  playerSquash = 0;
  live.length = 0;
  clearViews();
}

/** render(state, dt): the hopper and the pads from the rules state, the spring camera, the background, the shadow fit. */
export function draw(state: State | null, dt: number): void {
  if (!look || !player) return;
  if (!reducedMotion) time += dt;
  if (state) {
    everRan = true;
    player.visible = true;
    player.position.set(state.player.x, state.player.y + PLAYER_RADIUS, FRAMING.PLAYER_Z);
    player.rotation.z = -state.player.vx * 0.0006;
    playerSquash = Math.max(0, playerSquash - dt * 6);
    const squash = reducedMotion ? 0 : playerSquash;
    player.scale.set(1 + squash * 0.25, 1 - squash * 0.3, 1);
    syncViews(state);
    const target = state.camY + FRAMING.CAM_LOOK_AHEAD;
    const omega = 6;
    camVel += (-omega * omega * (camY - target) - 2 * omega * camVel) * dt;
    camY += camVel * dt;
  } else if (!everRan) {
    // before the first run the title shows the empty garden (the old page's hopper sat at the left edge: hidden)
    player.visible = false;
  }
  // back on the title the last run's pads and hopper stay where they were, as the old page left them
  updateSparks(dt);
  shake = Math.max(0, shake - dt * 26);
  const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  camera.position.set(WORLD_WIDTH / 2 + sx, camY + sy, camZ);
  camera.lookAt(WORLD_WIDTH / 2 + sx, camY + sy, 0);
  sky.position.set(WORLD_WIDTH / 2, camY, 0);
  skyU.uCenter.value.copy(sky.position);
  if (animated()) skyU.uTime.value = time;
  // the sky deepens toward its top colour as the climb goes on
  skyU.uShift.value = Math.min(0.25, Math.max(0, camY) / 20000);
  // attenuated points are sized by half the window's height (three parity); the old canvas was the view only
  pollenMat.size = (7 * viewH) / Math.max(1, windowH);
  updateEnvironment(false);
  fitShadow();
}

/** _fitShadow: the sun follows the visible play area, snapped to whole texels; the engine fits the map to the view. */
function fitShadow(): void {
  if (!key.castShadow) return;
  key.shadow.distance = camZ + 300;
  const t = new Vector3(WORLD_WIDTH / 2, camY, 0);
  key.target.position.copy(t);
  key.position.copy(t).addScaledVector(keyDir, 1200);
}
