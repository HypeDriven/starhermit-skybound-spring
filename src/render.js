/**
 * Skybound Spring — Three.js presentation layer.
 * Procedural meshes only; consumes immutable sim snapshots each frame.
 * Render layers: 0 environment, 1 gameplay, 2 selection/target, 3 effects.
 * Graphics quality (presets + per-effect overrides) comes from gfx.js.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { WORLD_WIDTH, PLAYER_RADIUS } from './rules.js';
import { CVD_PALETTES } from './content.js';
import { detectPreset, resolve, describe, SHADOW_MAP, BURST_CAP, CATEGORIES } from './gfx.js';

/** Exported framing constants (no magic offsets elsewhere). */
export const FRAMING = {
  FOV: 42,
  WORLD_WIDTH,
  VIEW_HEIGHT: 620,       // world units vertically visible at the play plane
  CAM_LOOK_AHEAD: 210,    // camera centers this far above the camera floor
  CAM_Z_BASE: 700,        // adjusted per aspect in resize()
  PLAYER_Z: 0,
  PAD_TILT: 0.5,          // pads lean toward the camera so their top surface reads
};

const LAYER_ENV = 0, LAYER_GAME = 1, LAYER_SELECT = 2, LAYER_FX = 3;

// Background density per detail tier (plain matches the original low tier).
const DETAIL = {
  plain: { clouds: 24, puffs: 1, cloudSubdiv: 1, stalks: 7, leaves: 0, pollen: 0 },
  detailed: { clouds: 40, puffs: 4, cloudSubdiv: 2, stalks: 8, leaves: 6, pollen: 70 },
};
const CLOUD_SPAN = 3400;   // vertical wrap span for parallax clouds
const LEAF_SPAN = 2600;    // vertical wrap span for stalk leaves

/* ---------- procedural textures ---------- */

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft round dot for particles, pollen and mote halos. */
function softDotTexture() {
  return canvasTex(64, 64, (g, w) => {
    const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, w);
  });
}

/** Leaf veins: near-white base (the palette colour stays dominant), a lighter midrib and darker veins. */
function leafVeinTexture() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#f2f2f2';
    g.fillRect(0, 0, w, h);
    // speckle for organic variation
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 900; i++) {
      const v = 225 + Math.floor(rnd() * 30);
      g.fillStyle = `rgba(${v},${v},${v},0.35)`;
      g.fillRect(rnd() * w, rnd() * h, 2, 2);
    }
    // edge darkening
    const edge = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.55);
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(40,40,40,0.28)');
    g.fillStyle = edge;
    g.fillRect(0, 0, w, h);
    // side veins
    g.strokeStyle = 'rgba(70,70,70,0.32)';
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
    // midrib
    g.strokeStyle = 'rgba(255,255,255,0.95)';
    g.lineWidth = 5;
    g.beginPath(); g.moveTo(8, h / 2); g.lineTo(w - 8, h / 2); g.stroke();
  });
}

/** Petal streaks for the brittle pads (reads as dry, papery). */
function petalTexture() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#f4f0ea';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,60,40,0.3)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 22; i++) {
      const y = (i + 0.5) * (h / 22);
      g.beginPath(); g.moveTo(0, h / 2); g.quadraticCurveTo(w / 2, y, w, h / 2 + (y - h / 2) * 0.2); g.stroke();
    }
    g.fillStyle = 'rgba(60,40,20,0.35)';
    for (let i = 0; i < 6; i++) g.fillRect(20 + i * 17, 30 + (i * 37) % 60, 3, 3);
  });
}

/* ---------- procedural geometry ---------- */

function planarUV(geo, w, d) {
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getZ(i) / d + 0.5;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function leafGeometry(w, d, thick) {
  // Lily-pad lens: flat top at the landing surface (y = 0), shallow belly below.
  const geo = new THREE.SphereGeometry(1, 28, 12);
  geo.scale(w / 2, thick, d / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    p.setY(i, y > 0 ? y * 0.25 : y);
  }
  geo.translate(0, -thick * 0.2, 0);
  geo.computeVertexNormals();
  return planarUV(geo, w, d);
}
function petalGeometry(w, h) {
  // Pointed petal silhouette for crumble pads.
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.quadraticCurveTo(-w / 4, h * 0.42, 0, h * 0.3);
  shape.quadraticCurveTo(w / 4, h * 0.42, w / 2, 0);
  shape.quadraticCurveTo(w / 4, -h * 0.42, 0, -h * 0.3);
  shape.quadraticCurveTo(-w / 4, -h * 0.42, -w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: true, bevelThickness: 2, bevelSize: 2, bevelSegments: 2 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -8, 0);
  return planarUV(geo, w, h * 0.7);
}
function blossomGeometry(r) {
  // Spring blossom: central dome + petal ring.
  const group = [];
  const dome = new THREE.SphereGeometry(r * 0.42, 16, 10);
  dome.translate(0, 6, 0);
  group.push(dome);
  for (let i = 0; i < 5; i++) {
    const petal = new THREE.SphereGeometry(r * 0.3, 12, 8);
    petal.scale(1.4, 0.35, 0.9);
    const a = (i / 5) * Math.PI * 2;
    petal.rotateY(-a);
    petal.translate(Math.cos(a) * r * 0.62, 2, Math.sin(a) * r * 0.62);
    group.push(petal);
  }
  return mergeGeos(group);
}
function thornGeometry(w) {
  // Spike cluster — unmistakable hazard silhouette.
  const parts = [];
  const base = new THREE.BoxGeometry(w, 5, 14);
  base.translate(0, -2, 0);
  parts.push(base);
  const n = Math.max(3, Math.floor(w / 16));
  for (let i = 0; i < n; i++) {
    const spike = new THREE.ConeGeometry(6, 22, 6);
    spike.translate(-w / 2 + (i + 0.5) * (w / n), 11, 0);
    parts.push(spike);
  }
  return mergeGeos(parts);
}
function mergeGeos(geos) {
  // minimal merge (positions/normals) — all BufferGeometry, non-indexed
  const nonIndexed = geos.map(g => g.index ? g.toNonIndexed() : g);
  let total = 0;
  for (const g of nonIndexed) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const norm = new Float32Array(total * 3);
  let off = 0;
  for (const g of nonIndexed) {
    pos.set(g.attributes.position.array, off * 3);
    norm.set(g.attributes.normal.array, off * 3);
    off += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  return out;
}

/** The sprout-hopper: an original little seedling hero. */
function makeHopperMesh(mat, leafMat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(PLAYER_RADIUS, 24, 18), mat);
  body.scale.set(1, 1.15, 0.9);
  g.add(body);
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(7, 16, 10), leafMat);
  leaf.position.set(0, PLAYER_RADIUS + 6, 0);
  leaf.rotation.z = 0.5;
  g.add(leaf);
  const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 10), leafMat);
  leaf2.position.set(-3, PLAYER_RADIUS + 4, 2);
  leaf2.rotation.z = -0.7;
  g.add(leaf2);
  // eyes with a catch-light
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a2030 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 8), eyeMat);
    eye.position.set(sx * 4.5, 3, PLAYER_RADIUS * 0.82);
    g.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 4), glintMat);
    glint.position.set(sx * 4.5 + 0.8, 3.9, PLAYER_RADIUS * 0.82 + 1.9);
    g.add(glint);
  }
  g.traverse(o => { o.layers.set(LAYER_GAME); if (o.isMesh) { o.castShadow = true; } });
  return g;
}

/* ---------- shaders ---------- */

// Sky dome: vertical gradient, sun glow, optional stars for night themes.
const SKY_VERT = `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const SKY_FRAG = `
  uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uSunColor; uniform vec3 uSunDir;
  uniform float uSun; uniform float uStars; uniform float uTime; uniform float uShift;
  varying vec3 vDir;
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  void main() {
    vec3 d = normalize(vDir);
    float t = smoothstep(-0.42 - uShift, 0.5 - uShift, d.y);
    vec3 col = mix(uBottom, uTop, t);
    // warm haze band just under the horizon line of the view
    col += uBottom * 0.12 * (1.0 - abs(t - 0.35) * 2.0) * uSun;
    float s = max(dot(d, uSunDir), 0.0);
    col += uSunColor * (pow(s, 8.0) * 0.22 + pow(s, 90.0) * 0.5 + pow(s, 900.0) * 1.6) * uSun;
    if (uStars > 0.0) {
      vec3 cell = floor(d * 260.0);
      float h = hash(cell);
      float r = length(fract(d * 260.0) - 0.5);
      float tw = 0.6 + 0.4 * sin(uTime * 2.0 + h * 40.0);
      col += vec3(step(0.996, h) * smoothstep(0.32, 0.05, r) * tw * uStars * smoothstep(-0.2, 0.3, d.y));
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

// Colour grade + vignette: gentle S-curve, a touch of saturation, warm highlights / cool shadows.
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uAmount: { value: 1.0 }, uVignette: { value: 0.2 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmount; uniform float uVignette;
    varying vec2 vUv;
    void main() {
      vec4 src = texture2D(tDiffuse, vUv);
      vec3 c = src.rgb;
      vec3 lc = clamp(c, 0.0, 1.0);
      vec3 s = mix(lc, lc * lc * (3.0 - 2.0 * lc), 0.18);
      float l = dot(s, vec3(0.299, 0.587, 0.114));
      s = mix(vec3(l), s, 1.1);
      s *= mix(vec3(0.97, 0.99, 1.04), vec3(1.03, 1.0, 0.97), smoothstep(0.2, 0.8, l));
      c = mix(c, s + max(c - 1.0, 0.0), uAmount);
      float d = length((vUv - 0.5) * vec2(1.0, 0.85));
      c *= 1.0 - uVignette * smoothstep(0.4, 0.9, d);
      gl_FragColor = vec4(c, src.a);
    }`,
};

function gpuName(gl) {
  try {
    const ctx = gl.getContext();
    // Firefox exposes the unmasked name via RENDERER and warns on the debug extension.
    if (/firefox/i.test(navigator.userAgent)) return String(ctx.getParameter(ctx.RENDERER) || '');
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    return String(ctx.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : ctx.RENDERER) || '');
  } catch {
    return '';
  }
}

function isMobileDevice() {
  const ua = navigator.userAgent || '';
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches;
  return coarse || /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

/* ---------- renderer ---------- */

export class GameRenderer {
  /**
   * container: HTMLElement. opts: { settings, onContextLost, onContextRestored }
   * settings.graphics holds the saved graphics object (see gfx.js).
   */
  constructor(container, opts = {}) {
    this.container = container;
    this.opts = opts;
    this.settings = opts.settings || { reducedMotion: false, cvdPalette: 'default', graphics: {} };
    this.theme = null;
    this.padViews = new Map();
    this.tokenViews = new Map();
    this.camY = 0;          // spring-smoothed camera floor
    this.camVel = 0;
    this.shake = 0;
    this.time = 0;
    this.playerSquash = 0;
    this.ok = false;
    this.adaptiveScale = 1;
    this._frames = [];
    this.fps = 0;
    this.pixelRatio = 1;
    this.size = [0, 0];
    this.postKey = null;
    this.composer = null;
    this.postFailed = false;

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      this.ok = false;
      return;
    }
    const canvas = this.renderer.domElement;
    this.domElement = canvas;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.gpu = gpuName(this.renderer);
    this.detected = detectPreset(this.gpu, isMobileDevice());
    this._reduceQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(FRAMING.FOV, 1, 10, 12000);
    this.camera.position.set(WORLD_WIDTH / 2, 300, FRAMING.CAM_Z_BASE);
    this.camera.lookAt(WORLD_WIDTH / 2, 300, 0);
    this.camZ = FRAMING.CAM_Z_BASE;

    // Layers: camera sees environment + gameplay + selection + effects.
    this.camera.layers.enable(LAYER_ENV);
    this.camera.layers.enable(LAYER_GAME);
    this.camera.layers.enable(LAYER_SELECT);
    this.camera.layers.enable(LAYER_FX);

    // Key light (sun) with a shadow box fitted to the visible play area each frame.
    this.keyDir = new THREE.Vector3(300, 800, 600).normalize();
    this.key = new THREE.DirectionalLight(0xffffff, 1.7);
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 1.2;
    this.key.shadow.radius = 3;
    this.scene.add(this.key, this.key.target);
    this.hemi = new THREE.HemisphereLight(0xbfd9ff, 0x8a9a6a, 0.95);
    this.scene.add(this.hemi);

    // Sky dome (procedural gradient shader, deterministic per theme).
    this.skyGeo = new THREE.SphereGeometry(6000, 32, 16);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() },
        uSunColor: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0.32, 0.3, -0.9).normalize() },
        uSun: { value: 1 }, uStars: { value: 0 }, uTime: { value: 0 }, uShift: { value: 0 },
      },
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(this.skyGeo, this.skyMat);
    this.sky.layers.set(LAYER_ENV);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -10;
    this.scene.add(this.sky);

    // Shared assets
    this.dotTex = softDotTexture();
    this.veinTex = leafVeinTexture();
    this.petalTex = petalTexture();
    this.geoToken = new THREE.OctahedronGeometry(9);
    this.geoStalk = new THREE.CylinderGeometry(0.42, 0.5, 1, 10, 1, true);
    this.geoLeaf = new THREE.SphereGeometry(1, 10, 6);
    this.geoParticle = new THREE.PlaneGeometry(7, 7);

    // Player
    this.playerMat = new THREE.MeshPhysicalMaterial({ color: 0x8ed06a, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color(0xeaffd0) });
    this.playerLeafMat = new THREE.MeshStandardMaterial({ color: 0x4f9e4f, roughness: 0.55 });
    this.player = makeHopperMesh(this.playerMat, this.playerLeafMat);
    this.scene.add(this.player);

    // Background materials (clouds, stalks, leaves, pollen)
    this.cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.12 });
    this.stalkMat = new THREE.MeshStandardMaterial({ color: 0x6a8a6a, roughness: 0.9 });
    this.leafMat = new THREE.MeshStandardMaterial({ color: 0x6a8a6a, roughness: 0.8 });
    this.pollenMat = new THREE.PointsMaterial({ color: 0xfff6d8, size: 7, map: this.dotTex, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true });
    this.clouds = null;
    this.stalks = null;
    this.leaves = null;
    this.pollen = null;

    // Pooled particles (event-tiered bursts)
    this.particlePool = [];
    this.particleMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0, map: this.dotTex, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide });
    this.particleGroup = new THREE.Group();
    this.particleGroup.traverse(o => o.layers.set(LAYER_FX));
    this.scene.add(this.particleGroup);

    // Ghost/selection marker layer (used for tutorial target hints)
    this.marker = new THREE.Mesh(
      new THREE.RingGeometry(14, 18, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.layers.set(LAYER_SELECT);
    this.marker.visible = false;
    this.scene.add(this.marker);

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.ok = false;
      if (this.opts.onContextLost) this.opts.onContextLost();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.ok = true;
      this.rebuildGpuResources();
      if (this.opts.onContextRestored) this.opts.onContextRestored();
    });

    container.appendChild(canvas);
    this.ok = true;
    this.setGraphics(this.settings.graphics);
    this.resize();
  }

  rebuildGpuResources() {
    // CPU descriptors are retained; three re-uploads on next render. Render
    // targets and the PMREM environment are rebuilt explicitly.
    this.postKey = null;
    if (this.envTex) { this.envTex.dispose(); this.envTex = null; }
    this.applyReflections();
    this.resize();
  }

  reducedMotion() {
    return !!this.settings.reducedMotion || !!(this._reduceQuery && this._reduceQuery.matches);
  }

  animated() {
    return this.q.background === 'animated' && !this.reducedMotion();
  }

  resize() {
    if (!this.ok) return;
    const w = this.container.clientWidth || 320;
    const h = this.container.clientHeight || 480;
    const aspect = w / h;
    this.camera.aspect = aspect;
    // Fit world width horizontally; camera distance derives from FOV+aspect.
    const halfH = (WORLD_WIDTH / 2) / aspect;
    const fitZ = halfH / Math.tan(THREE.MathUtils.degToRad(FRAMING.FOV / 2));
    this.camZ = Math.max(FRAMING.CAM_Z_BASE * 0.7, fitZ * 1.02);
    this.camera.updateProjectionMatrix();
    this.applyFog();
    this._applySize(true);
  }

  /** Pixel ratio = min(dpr, preset cap) × render scale × adaptive scale. */
  _applySize(force) {
    const w = this.container.clientWidth || 320;
    const h = this.container.clientHeight || 480;
    const ratio = Math.min(window.devicePixelRatio || 1, this.q.cap) * this.q.scale * this.adaptiveScale;
    if (force || w !== this.size[0] || h !== this.size[1] || ratio !== this.pixelRatio) {
      this.size = [w, h];
      this.pixelRatio = ratio;
      this.renderer.setPixelRatio(ratio);
      this.renderer.setSize(w, h, false);
    }
  }

  /* ---------- graphics settings ---------- */

  /** Apply saved graphics settings live (object from settings.graphics; {} = Auto). */
  setGraphics(saved) {
    if (!this.ok) return;
    const key = JSON.stringify(saved || {});
    if (key === this._gfxKey) return; // unrelated settings changed
    this._gfxKey = key;
    const prev = this.q;
    const g = resolve(saved || {}, this.detected);
    this.q = g;

    // Shadows: map size + enable; lit materials recompile for the new state.
    const size = SHADOW_MAP[g.shadows];
    const shadowsChanged = !prev || (SHADOW_MAP[prev.shadows] > 0) !== (size > 0);
    this.renderer.shadowMap.enabled = size > 0;
    this.key.castShadow = size > 0;
    if (size > 0 && this.key.shadow.mapSize.x !== size) {
      this.key.shadow.mapSize.set(size, size);
      if (this.key.shadow.map) { this.key.shadow.map.dispose(); this.key.shadow.map = null; }
    }
    if (shadowsChanged) this.scene.traverse(o => {
      if (!o.material) return;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.needsUpdate = true;
    });

    if (!prev || prev.detail !== g.detail) {
      // Surface detail swaps pad materials/geometry and background density.
      this._mats = {};
      this._geoCache = {};
      for (const v of this.padViews.values()) this.scene.remove(v);
      this.padViews.clear();
      this.playerMat.clearcoat = g.detail === 'detailed' ? 0.6 : 0;
      this.playerMat.sheen = g.detail === 'detailed' ? 0.4 : 0;
      this.playerMat.needsUpdate = true;
      for (const v of this.tokenViews.values()) this.scene.remove(v);
      this.tokenViews.clear();
      this.buildEnvironment();
    } else if (prev.particles !== g.particles || prev.background !== g.background) {
      this.buildEnvironment();
    }
    this.applyReflections();
    for (const [k, m] of Object.entries(this._mats)) {
      if (/^token:[^:]+$/.test(k)) m.emissiveIntensity = g.bloom === 'on' ? 3 : 1;
    }

    this.adaptiveScale = 1;
    this._frames = [];
    this.postKey = null; // rebuild the post chain on the next frame
    this.postFailed = false;
    this._fpsVisible(g.showFps);
    this._applySize(true);

    const canvas = this.renderer.domElement;
    canvas.dataset.gfxPreset = g.preset;
    document.body.dataset.gfxPreset = g.preset;
    document.body.dataset.gfxAuto = String(g.auto);
    for (const cat of Object.keys(CATEGORIES)) canvas.dataset['gfx' + cat[0].toUpperCase() + cat.slice(1)] = g[cat];
  }

  /** What the Settings panel shows: GPU, detected preset, resolved tiers, cost, frame rate. */
  graphicsInfo(labels) {
    const px = [Math.round(this.size[0] * this.pixelRatio), Math.round(this.size[1] * this.pixelRatio)];
    return {
      gpu: this.gpu || 'unknown GPU',
      detected: this.detected,
      resolved: this.q,
      summary: describe(this.q, px, labels),
      fps: Math.round(this.fps || 0),
      adaptiveScale: Math.round(this.adaptiveScale * 100) / 100,
      postFailed: !!this.postFailed,
    };
  }

  applyReflections() {
    const on = this.q && this.q.reflections === 'on';
    if (on && !this.envTex) {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      this.envTex = pmrem.fromScene(room, 0.04).texture;
      room.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      pmrem.dispose();
    }
    this.scene.environment = on ? this.envTex : null;
    this.scene.environmentIntensity = 0.35;
    this.hemi.intensity = on ? 0.8 : 0.95;
  }

  _fpsVisible(on) {
    let el = document.getElementById('fps-meter');
    if (on && !el) {
      el = document.createElement('div');
      el.id = 'fps-meter';
      el.className = 'fps-meter';
      el.setAttribute('aria-hidden', 'true');
      el.textContent = '… fps';
      this.container.append(el);
    }
    if (el) el.hidden = !on;
  }

  _postKey(w, h) {
    const g = this.q;
    return g.post && !this.postFailed ? [g.bloom, g.grade, g.antialias, w, h, this.pixelRatio].join('|') : 'none';
  }

  _buildPost(w, h) {
    const g = this.q;
    if (this.composer) {
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
      for (const p of this.composer.passes) p.dispose?.();
    }
    this.composer = null;
    if (!g.post || this.postFailed) return;
    try {
      const pw = Math.max(1, Math.round(w * this.pixelRatio)), ph = Math.max(1, Math.round(h * this.pixelRatio));
      const target = new THREE.WebGLRenderTarget(pw, ph, {
        type: THREE.HalfFloatType, samples: g.antialias === 'msaa' ? 4 : 0,
      });
      const composer = new EffectComposer(this.renderer, target);
      composer.setPixelRatio(this.pixelRatio);
      composer.setSize(w, h);
      composer.addPass(new RenderPass(this.scene, this.camera));
      if (g.bloom === 'on') {
        // High threshold: only emissive motes, sparkles and the sun core bloom.
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.6, 0.4, 1.4));
      }
      if (g.grade === 'on') composer.addPass(new ShaderPass(GradeShader));
      composer.addPass(new OutputPass());
      if (g.antialias === 'smaa') composer.addPass(new SMAAPass(pw, ph));
      if (g.antialias === 'fxaa') composer.addPass(new FXAAPass());
      this.composer = composer;
    } catch {
      // Post-processing is an enhancement: render directly if the chain cannot be built.
      this.postFailed = true;
      this.composer = null;
    }
  }

  // Adaptive resolution: step the render scale down when frames are slow, back up when fast.
  _adapt(ms) {
    const f = this._frames;
    f.push(ms);
    if (f.length < 90) return;
    const avg = f.reduce((a, b) => a + b, 0) / f.length;
    f.length = 0;
    this.fps = 1000 / avg;
    const el = document.getElementById('fps-meter');
    if (el && !el.hidden) el.textContent = `${Math.round(this.fps)} fps · ${Math.round(this.pixelRatio * 100) / 100}×`;
    if (!this.q.adaptive) return;
    if (avg > 26) this.adaptiveScale = Math.max(0.6, this.adaptiveScale - 0.1);
    else if (avg < 14 && this.adaptiveScale < 1) this.adaptiveScale = Math.min(1, this.adaptiveScale + 0.05);
  }

  /* ---------- theme + environment ---------- */

  applyFog() {
    if (!this.theme) return;
    // Gameplay pieces (at z = 0) are never fogged; only the distant garden fades.
    const near = this.camZ + 450;
    this.scene.fog = new THREE.Fog(this.theme.fog, near, near + Math.max(1800, this.theme.fogFar - this.theme.fogNear));
  }

  setTheme(theme) {
    this.theme = theme;
    const u = this.skyMat.uniforms;
    u.uTop.value.setHex(theme.skyTop);
    u.uBottom.value.setHex(theme.skyBottom);
    u.uSunColor.value.setHex(theme.keyLight);
    const top = new THREE.Color(theme.skyTop);
    const night = top.r + top.g + top.b < 0.12;
    u.uStars.value = night ? 0.9 : 0;
    u.uSun.value = night ? 0.35 : 1;
    this.applyFog();
    this.key.color.setHex(theme.keyLight);
    this.hemi.color.setHex(theme.hemiSky);
    this.hemi.groundColor.setHex(theme.hemiGround);
    this.cloudMat.color.setHex(theme.cloud);
    this.cloudMat.emissive.setHex(theme.cloud);
    // Distant stalks: theme foliage pulled toward the sky for atmospheric depth.
    const fogC = new THREE.Color(theme.fog);
    this.stalkMat.color.setHex(theme.pad).lerp(fogC, 0.45);
    this.leafMat.color.setHex(theme.padAlt).lerp(fogC, 0.3);
    this.pollenMat.color.setHex(theme.accent).lerp(new THREE.Color(0xffffff), 0.6);
    this.buildEnvironment();
  }

  palette() {
    return CVD_PALETTES[this.settings.cvdPalette] || CVD_PALETTES.default;
  }

  _removeEnv(key) {
    const o = this[key];
    if (!o) return;
    this.scene.remove(o);
    if (o.isInstancedMesh) o.dispose();
    else if (o.geometry) o.geometry.dispose();
    this[key] = null;
  }

  buildEnvironment() {
    if (!this.theme || !this.q) return;
    const D = DETAIL[this.q.detail];
    const rng = mulberry(0xc10d5);
    const m = new THREE.Matrix4();

    // Clouds: clusters of puffs, parallax-wrapped so the sky never runs out.
    this._removeEnv('clouds');
    this.geoCloud?.dispose();
    this.geoCloud = new THREE.IcosahedronGeometry(1, D.cloudSubdiv);
    this.cloudData = [];
    for (let i = 0; i < D.clouds; i++) {
      const d = {
        x: rng() * 1600 - 560, y: rng() * CLOUD_SPAN, z: -500 - rng() * 1800,
        s: 40 + rng() * 120, speed: 2 + rng() * 6, phase: rng() * Math.PI * 2, puffs: [],
      };
      for (let j = 0; j < D.puffs; j++) {
        d.puffs.push(j === 0 ? [0, 0, 0, 1] : [(rng() - 0.5) * 1.6, (rng() - 0.2) * 0.4, (rng() - 0.5) * 0.5, 0.45 + rng() * 0.35]);
      }
      this.cloudData.push(d);
    }
    this.clouds = new THREE.InstancedMesh(this.geoCloud, this.cloudMat, D.clouds * D.puffs);
    this.clouds.layers.set(LAYER_ENV);
    this.clouds.frustumCulled = false;
    this.scene.add(this.clouds);

    // Distant garden stalks: continuous vertical vines with leaf clusters that scroll by.
    this._removeEnv('stalks');
    this._removeEnv('leaves');
    this.stalkData = [];
    for (let i = 0; i < D.stalks; i++) {
      this.stalkData.push({ x: rng() * 1400 - 460, z: -1100 - rng() * 1600, r: 50 + rng() * 50, phase: rng() * 6.28 });
    }
    this.stalks = new THREE.InstancedMesh(this.geoStalk, this.stalkMat, D.stalks);
    this.stalks.layers.set(LAYER_ENV);
    this.stalks.frustumCulled = false;
    this.scene.add(this.stalks);
    this.leafData = [];
    if (D.leaves) {
      for (const st of this.stalkData) {
        for (let j = 0; j < D.leaves; j++) {
          this.leafData.push({ st, y: rng() * LEAF_SPAN, side: rng() < 0.5 ? -1 : 1, s: 40 + rng() * 45, tilt: (rng() - 0.5) * 0.6 });
        }
      }
      this.leaves = new THREE.InstancedMesh(this.geoLeaf, this.leafMat, this.leafData.length);
      this.leaves.layers.set(LAYER_ENV);
      this.leaves.frustumCulled = false;
      this.scene.add(this.leaves);
    }

    // Floating pollen (detailed + high particles only).
    this._removeEnv('pollen');
    const pollenCount = this.q.particles === 'high' ? D.pollen : 0;
    if (pollenCount) {
      const pos = new Float32Array(pollenCount * 3);
      this.pollenSeed = [];
      for (let i = 0; i < pollenCount; i++) {
        this.pollenSeed.push({ x: rng() * (WORLD_WIDTH + 200) - 100, y: rng() * 1400, z: -350 + rng() * 300, ph: rng() * 6.28, sp: 8 + rng() * 14 });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.pollen = new THREE.Points(geo, this.pollenMat);
      this.pollen.layers.set(LAYER_FX);
      this.pollen.frustumCulled = false;
      this.scene.add(this.pollen);
    }
    this._envY = null;
    this.updateEnvironment(true);
  }

  /** Parallax (camera-driven, always) plus drift/sway (animated background only). */
  updateEnvironment(force) {
    if (!this.clouds) return;
    const anim = this.animated();
    if (!force && !anim && this._envY !== null && Math.abs(this._envY - this.camY) < 0.5) return;
    this._envY = this.camY;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const t = this.time;
    const wrap = (y, span) => ((y % span) + span) % span - span / 2;
    let k = 0;
    for (const d of this.cloudData) {
      const drift = anim ? Math.sin(t * 0.05 * d.speed + d.phase) * 60 + t * d.speed * 0.8 : 0;
      const cx = ((d.x + drift + 700) % 1900 + 1900) % 1900 - 700;
      const cy = this.camY + wrap(d.y - this.camY * 0.15, CLOUD_SPAN);
      for (const p of d.puffs) {
        const s = d.s * p[3];
        m.makeScale(s, s * 0.5, s * 0.7);
        m.setPosition(cx + p[0] * d.s, cy + p[1] * d.s, d.z + p[2] * d.s);
        this.clouds.setMatrixAt(k++, m);
      }
    }
    this.clouds.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < this.stalkData.length; i++) {
      const st = this.stalkData[i];
      const sway = anim ? Math.sin(t * 0.4 + st.phase) * 0.012 : 0;
      q.setFromEuler(e.set(0, 0, sway));
      m.compose(v.set(st.x, this.camY, st.z), q, sc.set(st.r, 5200, st.r));
      this.stalks.setMatrixAt(i, m);
    }
    this.stalks.instanceMatrix.needsUpdate = true;
    if (this.leaves) {
      for (let i = 0; i < this.leafData.length; i++) {
        const l = this.leafData[i];
        const y = this.camY + wrap(l.y - this.camY * 0.25, LEAF_SPAN);
        const flutter = anim ? Math.sin(t * 0.9 + l.y) * 0.08 : 0;
        q.setFromEuler(e.set(0.3, l.side * 0.4, l.side * (0.5 + l.tilt + flutter)));
        m.compose(v.set(l.st.x + l.side * (l.st.r * 0.45 + l.s * 0.8), y, l.st.z), q, sc.set(l.s, l.s * 0.18, l.s * 0.55));
        this.leaves.setMatrixAt(i, m);
      }
      this.leaves.instanceMatrix.needsUpdate = true;
    }
    if (this.pollen) {
      const pos = this.pollen.geometry.attributes.position;
      for (let i = 0; i < this.pollenSeed.length; i++) {
        const p = this.pollenSeed[i];
        const rise = anim ? t * p.sp : 0;
        const y = this.camY + wrap(p.y + rise - this.camY * 0.1, 1400);
        const x = p.x + (anim ? Math.sin(t * 0.6 + p.ph) * 18 : 0);
        pos.setXYZ(i, x, y, p.z);
      }
      pos.needsUpdate = true;
    }
  }

  /* ---------- pad / token views ---------- */

  materialFor(type) {
    const pal = this.palette();
    const detailed = this.q.detail === 'detailed';
    const key = type + ':' + this.settings.cvdPalette;
    if (!this._mats[key]) {
      const opts = { color: pal[type] || pal.bud, roughness: 0.6 };
      if (type === 'wisp') { opts.transparent = true; opts.opacity = 0.7; }
      if (type === 'thorn') { opts.color = pal.thorn; opts.roughness = 0.35; }
      if (!detailed) {
        this._mats[key] = new THREE.MeshStandardMaterial(opts);
      } else {
        if (type === 'bud' || type === 'drift' || type === 'wisp') opts.map = this.veinTex;
        if (type === 'crumb') { opts.map = this.petalTex; opts.roughness = 0.85; }
        if (type === 'spring') { opts.emissive = pal.spring; opts.emissiveIntensity = 0.18; opts.sheen = 0.6; opts.sheenColor = new THREE.Color(0xffffff); }
        if (type !== 'crumb') { opts.clearcoat = type === 'thorn' ? 0.8 : 0.55; opts.clearcoatRoughness = 0.35; }
        this._mats[key] = new THREE.MeshPhysicalMaterial(opts);
      }
    }
    return this._mats[key];
  }

  /** Geometry cache: one geometry per (type, rounded width), shared by all
   * pad views — avoids per-pad allocation churn during long climbs. */
  padGeometry(type, w) {
    const key = type + ':' + Math.round(w / 4);
    if (!this._geoCache[key]) {
      const qw = Math.round(w / 4) * 4;
      if (type === 'crumb') {
        this._geoCache[key] = petalGeometry(qw, qw * 0.5);
      } else if (type === 'spring') {
        this._geoCache[key] = blossomGeometry(qw * 0.55);
      } else if (type === 'thorn') {
        this._geoCache[key] = thornGeometry(qw);
      } else {
        this._geoCache[key] = leafGeometry(qw, Math.min(46, qw * 0.5), 12);
      }
    }
    return this._geoCache[key];
  }

  makePadView(p) {
    const mesh = new THREE.Mesh(this.padGeometry(p.type, p.w), this.materialFor(p.type));
    if (p.type === 'wisp') mesh.scale.setScalar(0.92);
    if (p.type !== 'thorn') mesh.rotation.x = FRAMING.PAD_TILT;
    mesh.position.set(p.x, p.y, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.phase = (p.id * 1.7) % 6.28;
    mesh.traverse(o => o.layers.set(LAYER_GAME));
    return mesh;
  }

  tokenMaterial() {
    const pal = this.palette();
    const key = 'token:' + this.settings.cvdPalette;
    if (!this._mats[key]) {
      this._mats[key] = new THREE.MeshStandardMaterial({
        color: pal.token, emissive: pal.token, emissiveIntensity: this.q.bloom === 'on' ? 3 : 1,
        roughness: 0.25, metalness: 0.2,
      });
      this._mats[key + ':halo'] = new THREE.SpriteMaterial({ map: this.dotTex, color: pal.token, transparent: true, opacity: 0.55, depthWrite: false });
    }
    return this._mats[key];
  }

  makeTokenView() {
    const v = new THREE.Mesh(this.geoToken, this.tokenMaterial());
    if (this.q.detail === 'detailed') {
      const halo = new THREE.Sprite(this._mats['token:' + this.settings.cvdPalette + ':halo']);
      halo.scale.setScalar(38);
      halo.position.z = -4;
      v.add(halo);
    }
    v.traverse(o => o.layers.set(LAYER_GAME));
    return v;
  }

  syncViews(state) {
    const sway = this.animated();
    // Platforms: create new, update, remove dead/culled.
    const seen = new Set();
    for (const p of state.platforms) {
      if (!p.alive || p.y < state.camY - 120 || p.y > state.camY + FRAMING.VIEW_HEIGHT + 250) continue;
      seen.add(p.id);
      let v = this.padViews.get(p.id);
      if (!v) {
        v = this.makePadView(p);
        this.padViews.set(p.id, v);
        this.scene.add(v);
      }
      v.position.x = p.x;
      v.position.y = p.y;
      // Cosmetic only: a faint leaf sway (rotation about the pad centre, never its position).
      v.rotation.z = sway && p.type !== 'thorn' ? Math.sin(this.time * 1.3 + v.userData.phase) * 0.03 : 0;
    }
    for (const [id, v] of this.padViews) {
      if (!seen.has(id)) {
        this.scene.remove(v);
        this.padViews.delete(id);
      }
    }
    // Tokens
    const seenT = new Set();
    for (const k of state.tokens) {
      if (k.taken || k.y < state.camY - 60 || k.y > state.camY + FRAMING.VIEW_HEIGHT + 200) continue;
      seenT.add(k.id);
      let v = this.tokenViews.get(k.id);
      if (!v) {
        v = this.makeTokenView();
        this.tokenViews.set(k.id, v);
        this.scene.add(v);
      }
      v.position.set(k.x, k.y + Math.sin(this.time * 2 + k.id) * 4, 0);
      v.rotation.y = this.time * 2 + k.id;
    }
    for (const [id, v] of this.tokenViews) {
      if (!seenT.has(id)) {
        this.scene.remove(v);
        this.tokenViews.delete(id);
      }
    }
  }

  /* ---------- effects ---------- */

  burst(x, y, color, count, spread = 60) {
    if (this.settings.reducedMotion) return;
    const n = Math.min(count, BURST_CAP[this.q.particles]);
    const glow = this.q.bloom === 'on' ? 2.6 : 1; // sparkles bloom when bloom is on
    for (let i = 0; i < n; i++) {
      let pt = this.particlePool.find(p => !p.userData.active);
      if (!pt) {
        pt = new THREE.Mesh(this.geoParticle, this.particleMat.clone());
        pt.layers.set(LAYER_FX);
        this.particleGroup.add(pt);
        this.particlePool.push(pt);
      }
      pt.userData.active = true;
      pt.userData.vx = (Math.random() - 0.5) * spread * 2;
      pt.userData.vy = Math.random() * spread * 1.6;
      pt.userData.life = 0.5 + Math.random() * 0.3;
      pt.material.color.setHex(color).multiplyScalar(glow);
      pt.material.opacity = 0.95;
      pt.position.set(x, y, 10);
      pt.scale.setScalar(0.8 + Math.random() * 0.8);
      pt.visible = true;
    }
  }

  shakeCamera(amount) {
    if (this.settings.reducedMotion) return;
    this.shake = Math.max(this.shake, amount);
  }

  /** Event hierarchy: input ack < legal move < combo/goal < round completion. */
  handleEvents(events, state) {
    for (const e of events) {
      switch (e.type) {
        case 'land':
          this.playerSquash = 1;
          this.burst(state.player.x, e.y + 4, 0xdfffc8, 6, 40);
          if (e.chain >= 8) { this.burst(state.player.x, e.y + 10, 0xffe066, 16, 90); this.shakeCamera(3); }
          break;
        case 'spring':
          this.playerSquash = 1.4;
          this.burst(state.player.x, e.y + 6, 0xffc0dd, 18, 100);
          this.shakeCamera(2);
          break;
        case 'token':
          this.burst(state.player.x, state.player.y, 0xfff09a, 12, 70);
          break;
        case 'thorn':
          this.burst(state.player.x, state.player.y, 0xff6a6a, 24, 120);
          this.shakeCamera(8);
          break;
        case 'terminal':
          if (e.reason === 'goal-reached') this.burst(state.player.x, state.player.y, 0xa0ffd8, 40, 160);
          if (e.reason === 'fell') this.shakeCamera(5);
          break;
      }
    }
  }

  /** Keep the sun's shadow box fitted to the visible play area, snapped to whole texels. */
  _fitShadow() {
    if (!this.key.castShadow) return;
    const halfH = this.camZ * Math.tan(THREE.MathUtils.degToRad(FRAMING.FOV / 2));
    const ext = Math.max(WORLD_WIDTH / 2 + 40, halfH + 40);
    const sh = this.key.shadow;
    const cam = sh.camera;
    if (cam.right !== ext) {
      Object.assign(cam, { left: -ext, right: ext, top: ext, bottom: -ext, near: 200, far: 2600 });
      cam.updateProjectionMatrix();
    }
    const texel = (2 * ext) / sh.mapSize.x;
    const z = this.keyDir;
    const x = new THREE.Vector3(0, 1, 0).cross(z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x);
    const t = new THREE.Vector3(WORLD_WIDTH / 2, this.camY, 0);
    const a = Math.round(t.dot(x) / texel) * texel;
    const b = Math.round(t.dot(y) / texel) * texel;
    const c = t.dot(z);
    t.copy(x).multiplyScalar(a).addScaledVector(y, b).addScaledVector(z, c);
    this.key.target.position.copy(t);
    this.key.position.copy(t).addScaledVector(z, 1200);
  }

  /* ---------- per-frame render ---------- */

  render(state, dt, hidden) {
    if (!this.ok) return;
    if (hidden) return; // decorative animation paused while hidden
    this.time += dt;
    this._adapt(dt * 1000);

    // Player from sim state (120 Hz sim is fine without interpolation).
    if (state) {
      const px = state.player.x;
      this.player.position.set(px, state.player.y + PLAYER_RADIUS, FRAMING.PLAYER_Z);
      this.player.rotation.z = -state.player.vx * 0.0006;
      this.playerSquash = Math.max(0, this.playerSquash - dt * 6);
      const squash = this.settings.reducedMotion ? 0 : this.playerSquash;
      this.player.scale.set(1 + squash * 0.25, 1 - squash * 0.3, 1);
      this.syncViews(state);
    }

    // Particles
    for (const pt of this.particlePool) {
      if (!pt.userData.active) continue;
      pt.userData.life -= dt;
      if (pt.userData.life <= 0) { pt.userData.active = false; pt.visible = false; continue; }
      pt.position.x += pt.userData.vx * dt;
      pt.position.y += pt.userData.vy * dt;
      pt.userData.vy -= 300 * dt;
      pt.material.opacity = Math.min(0.95, pt.userData.life * 2);
    }

    // Camera: critically damped spring toward the sim's camera floor
    // (position+velocity state, never cumulative per-frame lerp).
    if (state) {
      const target = state.camY + FRAMING.CAM_LOOK_AHEAD;
      const omega = 6;
      this.camVel += (-omega * omega * (this.camY - target) - 2 * omega * this.camVel) * dt;
      this.camY += this.camVel * dt;
    }
    this.shake = Math.max(0, this.shake - dt * 26);
    const shakeX = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const shakeY = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    this.camera.position.set(WORLD_WIDTH / 2 + shakeX, this.camY + shakeY, this.camZ);
    this.camera.lookAt(WORLD_WIDTH / 2 + shakeX, this.camY + shakeY, 0);
    this.sky.position.set(WORLD_WIDTH / 2, this.camY, 0);
    if (this.animated()) this.skyMat.uniforms.uTime.value = this.time;
    // The sky deepens toward its top colour as the climb goes on.
    this.skyMat.uniforms.uShift.value = Math.min(0.25, Math.max(0, this.camY) / 20000);
    this.updateEnvironment(false);
    this._fitShadow();

    this._applySize(false);
    const [w, h] = this.size;
    const key = this._postKey(w, h);
    if (key !== this.postKey) {
      this.postKey = key;
      this._buildPost(w, h);
    }
    if (this.composer) {
      try {
        this.composer.render(dt);
        return;
      } catch {
        this.postFailed = true;
        this.postKey = null;
        this._buildPost(w, h);
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  /** Concise navigable text mirror of the board for screen readers. */
  static boardMirror(state) {
    if (!state) return '';
    if (state.terminal) return `Run over: ${state.terminal.reason}. Altitude ${state.score.altitude}.`;
    const above = state.platforms
      .filter(p => p.alive && p.y > state.player.y + 20 && p.y < state.player.y + 400)
      .sort((a, b) => a.y - b.y)
      .slice(0, 3)
      .map(p => {
        const side = p.x < state.player.x - 30 ? 'left' : p.x > state.player.x + 30 ? 'right' : 'above';
        const names = { bud: 'leaf pad', drift: 'moving leaf', crumb: 'brittle petal', spring: 'spring blossom', wisp: 'wisp pad', thorn: 'THORN hazard' };
        return `${names[p.type] || p.type} ${side}`;
      });
    return `Altitude ${state.score.altitude}, chain ${state.chain}. Next: ${above.join(', ') || 'none in range'}.`;
  }

  dispose() {
    if (!this.ok) return;
    this.ok = false;
    if (this.composer) {
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
      this.composer = null;
    }
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.map) m.map.dispose(); m.dispose(); }
      }
    });
    if (this.envTex) this.envTex.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
